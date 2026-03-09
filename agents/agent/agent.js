import { HistoryManager } from "./utils/HistoryManager.js";
import { getSystemPrompt } from "./utils/systemPrompt.js";
import { MetaAbilityManager } from "./MetaAbilityManager.js";
import { loadAllClients } from '../../managers/apiKeyManager.js';

import { callLLM } from "../engine/llmClient.js";
import { runTool } from "../toolRouter.js";

let llmClient;

// 启动程序时加载所有 client，选择第一个可用
export async function initLLM() {
  const clients = await loadAllClients();
  const firstProvider = Object.keys(clients)[0];
  if (!firstProvider) throw new Error('No LLM clients available');
  llmClient = clients[firstProvider];
  console.log('Using LLM provider:', firstProvider);
}

// 统一调用接口
export async function callLLM(messages, options = {}) {
  if (!llmClient) throw new Error('LLM client not initialized');
  const res = await llmClient.send(messages, options);
  // 兼容旧接口
  return {
    content: res.text,           // 旧 callLLM content
    tool_calls: res.tool_calls,  // 工具调用保持一致
    raw: res.raw
  };
}


export class Agent {
  constructor() {
    this.historyManager = new HistoryManager({
      historyDir: "./conversation"
    });
    this.tickInterval = 20000; // 20s tick interval
    this.systemPrompt = getSystemPrompt() || "Default system prompt"; // 默认系统提示词，后续可从配置文件读取

    this.userQueue = []; // 用户消息队列
    this.processing = false; // 防止并发处理用户消息
    this.metaAbilityManager = new MetaAbilityManager(); // 元能力管理器
  }

  enqueueUser(text) {
    this.userQueue.push({ role: "user", content: text });
    this.triggerProcess();
  }

  enqueueTick(text) {
    this.userQueue.push({ role: "tick", content: text });
    this.triggerProcess();
  }

  triggerProcess() {
    if (!this.processing) this.process();
  }

  async process() {
    if (this.processing) return;
    this.processing = true;
    while (this.userQueue.length > 0) {
      const msg = this.userQueue.shift();
      if (msg.role === "tick") {
        this.historyManager.pushHistory({
          role: "system",
          content: msg.content
        });

        await this.metaAbilityManager.tickAll({
          agent: this,
          message: msg.content
        });
        continue;
      }
      await handleMessageGeneric(this, msg);
    }
    this.processing = false;
  }
}


// =============================
// 通用消息处理
// =============================

export async function handleMessageGeneric(agent, message) {
  // 写入用户消息
  agent.historyManager.pushHistory({
    role: "user",
    content: message.content
  });
  const MAX_HISTORY = 30;
  const recentHistory = getRecentLLMHistory(agent, MAX_HISTORY);
  // 第一次调用 LLM
  const response = await callLLM([
    {
      role: "system",
      content: agent.systemPrompt
    },
    ...recentHistory
  ]);

  console.log("response:", response.content)
  // console.log("LLM response:", response.tool_calls);
  // console.log(response.content);

  // =============================
  // 如果模型调用工具
  // =============================

  if (response.tool_calls?.length > 0) {
    agent.historyManager.pushHistory({
      role: "assistant",
      tool_calls: response.tool_calls
    });
    console.log("Tool calls name:", response.tool_calls.name, response.tool_calls.arguments);
    // 执行所有工具
    for (const call of response.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(call.function.arguments);
      } catch {
        args = {};
      }
      const result =
        (await runTool(call.function.name, args)) ??
        "[tool returned nothing]";

      // console.log("Tool result:", result);
      // 写入 tool 返回
      agent.historyManager.pushHistory({
        role: "tool",
        tool_call_id: call.id,
        content: result
      });
    }
    // 工具执行后再次调用 LLM
    const recentAfterTool = buildContextWindow(agent, MAX_HISTORY);
    // console.log("Recent after tool:", recentAfterTool);
    const second = await callLLM([
      {
        role: "system",
        content: agent.systemPrompt
      },
      ...recentAfterTool
    ]);

    // console.log("Second LLM response:", second);
    agent.historyManager.pushHistory({
      role: "assistant",
      content: String(second.content || "").trim()
    });
  } else {
    // 普通回答
    agent.historyManager.pushHistory({
      role: "assistant",
      content: String(response.content || "").trim()
    });
  }
}

// =============================
// 获取最近 LLM 上下文
// =============================

function getRecentLLMHistory(agent, max = 300) {
  return agent.historyManager
    .history
    .slice(-max)
    .map(msg => {

      if (msg.role === "system") {
        return { role: "system", content: msg.content };
      }

      if (msg.role === "tick") {
        return { role: "tick", content: msg.content };
      }


      if (msg.role === "user") {
        return { role: "user", content: msg.content };
      }

      if (msg.role === "assistant" && msg.tool_calls) {
        return {
          role: "assistant",
          content: String(msg.content || ""),
          tool_calls: msg.tool_calls
        };
      }

      if (msg.role === "assistant") {
        return {
          role: "assistant",
          content: msg.content || ""
        };
      }

      if (msg.role === "tool") {
        return {
          role: "tool",
          tool_call_id: msg.tool_call_id,
          content: String(msg.content || "")
        };
      }
      return null;
    })
    .filter(Boolean);
}

function buildContextWindow(agent, max = 40) {
  const history = agent.historyManager.history;
  const result = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];

    // tool 需要完整 transaction
    if (msg.role === "tool") {
      const prev = history[i - 1];

      if (prev && prev.role === "assistant" && prev.tool_calls) {
        result.unshift({
          role: "tool",
          tool_call_id: msg.tool_call_id,
          content: String(msg.content || "")
        });

        result.unshift({
          role: "assistant",
          content: String(prev.content || ""),
          tool_calls: prev.tool_calls
        });

        i--; // 跳过 assistant(tool_calls)
        continue;
      }

      // 非法 tool 直接丢
      continue;
    }

    if (msg.role === "assistant" && msg.tool_calls) {
      result.unshift({
        role: "assistant",
        content: String(msg.content || ""),
        tool_calls: msg.tool_calls
      });
      continue;
    }

    if (msg.role === "assistant") {
      result.unshift({
        role: "assistant",
        content: String(msg.content || "")
      });
      continue;
    }

    if (msg.role === "user") {
      result.unshift({
        role: "user",
        content: msg.content
      });
      continue;
    }

    if (msg.role === "tick") {
      result.unshift({
        role: "system",
        content: msg.content
      });
      continue;
    }

    if (msg.role === "system") {
      result.unshift({
        role: "system",
        content: msg.content
      });
      continue;
    }

    if (result.length >= max) break;
  }

  return result;
}


