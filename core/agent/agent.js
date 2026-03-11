// core/agent/agent.js
import { HistoryManager } from "../../utils/HistoryManager.js";
import { getSystemPrompt } from "../../utils/systemPrompt.js";
import { MetaAbilityManager } from "./MetaAbilityManager.js";
import { LLMManager } from "../ai/LLMManager.js";
import { runTool } from "../agent/tools/toolRouter.js";
import { buildMessages } from "../memory/buildMessages.js";
import { MemoryManager } from "../memory/MemoryManager.js";
import { initEmbed } from "../ai/embed.js";

export class Agent {
  constructor() {
    this.historyManager = new HistoryManager({ historyDir: "./conversation" });
    this.systemPrompt = getSystemPrompt() || "Default system prompt";
    this.metaAbilityManager = new MetaAbilityManager();

    this.queue = []; // 统一事件队列
    this.processing = false;
    this.processingPromise = null;

    this.memoryManager = new MemoryManager();   // ← 加这一行

    this.llm = new LLMManager(); // LLM 管理器
  }

  async init() {
    await initEmbed(); 
    await this.memoryManager.init(); // 初始化记忆管理器
    await this.llm.init();
  }

  enqueueEvent(event) {
    this.queue.push(event);
    this.triggerProcess();
  }

  triggerProcess() {
    if (!this.processing) this.processingPromise = this.process();
    return this.processingPromise;
  }

  async process() {
    if (this.processing) return this.processingPromise;
    this.processing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();

      if (event.type === "tick") {
        // this.historyManager.pushHistory({ role: "system", content: event.time });
        await handleMessageGeneric(this, event.content);
        await this.metaAbilityManager.tickAll({ agent: this, message: event.time });
        continue;
      }

      if (event.type === "message") {
        await handleMessageGeneric(this, event.content);
      }
    }

    this.processing = false;
  }
}

// =============================
// 通用消息处理
// =============================
export async function handleMessageGeneric(agent, message) {
  // 解析输入
  let msgObj;
  // try {
  //   msgObj = JSON.parse(message);
  // } catch {
  //   msgObj = { role: "user", content: message };
  // }

  try {
    msgObj = JSON.parse(message);
  } catch {
    // 如果内容是系统 Tick，就特殊处理 role
    if (typeof message === "string" && message.startsWith("[系统Tick]")) {
      msgObj = { role: "system", content: message };
    } else {
      msgObj = { role: "user", content: message };
    }
  }

  // 安全处理 content
  msgObj.content = msgObj.content != null ? String(msgObj.content) : "";
  
  agent.historyManager.pushHistory({ role: msgObj.role || "user", content: msgObj.content });

  // ===== RAG：检索记忆 =====
  const messages = await buildMessages(
    agent.memoryManager,
    msgObj.content,
    msgObj.content,
    ["recent","longterm"]
  );

  // console.log(messages);

  const MAX_HISTORY = 30;
  const context = buildContext(agent, MAX_HISTORY);

  console.log("================================");
  const response = await agent.llm.call("deepseek-chat", [
    { role: "system", content: messages },
    ...context
  ]);

  console.log("[Agent-001]" , response.content || "No response");

  // ===== 模型调用工具处理 =====
  if (response.tool_calls?.length > 0) {
    agent.historyManager.pushHistory({ role: "tool", content: String(response.content || ""), tool_calls: response.tool_calls });

    for (const call of response.tool_calls) {
      let args = {};
      try { args = JSON.parse(call.function.arguments); } catch {}
      const result = (await runTool(call.function.name, args, {
        memoryManager: agent.memoryManager
      })) ?? "[tool returned nothing]";
      agent.historyManager.pushHistory({ 
        role: "assistant", 
        tool_call_id: call.id, 
        content: typeof result === "string" ? result : JSON.stringify(result) 
      });
    }

    // 工具执行后再次调用 LLM
    const contextAfterTool = buildContext(agent, MAX_HISTORY);
    const second = await agent.llm.call("deepseek-chat", [
      { role: "system", content: agent.systemPrompt },
      ...contextAfterTool
    ]);
    console.log(second.content);

    agent.historyManager.pushHistory({ role: "assistant", content: String(second.content || "").trim() });
  } else {
    agent.historyManager.pushHistory({ role: "assistant", content: String(response.content || "").trim() });
  }
}

// =============================
// 历史上下文构建（兼容工具调用）
// =============================
function buildContext(agent, max = 40) {
  const history = agent.historyManager.history;
  const context = [];

  for (let i = history.length - 1; i >= 0 && context.length < max; i--) {
    const msg = history[i];

    // 只保留 system/user/assistant 消息，assistant 消息可携带 tool_calls
    if (["assistant", "user", "system"].includes(msg.role)) {
      const entry = { role: msg.role, content: msg.content || "" };
      if (msg.tool_calls) entry.tool_calls = msg.tool_calls;
      context.unshift(entry);
    }
  }

  return context;
}