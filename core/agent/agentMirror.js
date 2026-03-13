// core/agent/agent.js
import { HistoryManager } from "../../utils/HistoryManager.js";
import { getSystemPrompt } from "../../utils/systemPrompt.js";
import { MetaAbilityManager } from "./MetaAbilityManager.js";
import { LLMManager } from "../ai/LLMManager.js";
import { runTool } from "./tools/toolRouter.js";
import { buildMessages } from "../memory/buildMessages.js";
import { MemoryManager } from "../memory/MemoryManager.js";
import { initEmbed } from "../ai/embed.js";
import WebSocket from "ws";
import { OutputQueue } from "./outputQueue.js"
// import { nowString } from "../../utils/time.js"

export class Agent {
  constructor() {
    this.historyManager = new HistoryManager({ historyDir: "./conversation" });
    this.systemPrompt = getSystemPrompt() || "Default system prompt";
    this.metaAbilityManager = new MetaAbilityManager();
    this.wsID = null;
    this.queue = [];
    this.processing = false;
    this.processingPromise = null;

    this.memoryManager = new MemoryManager();

    this.llm = new LLMManager();
    this.ws = new WebSocket("ws://localhost:8080");
  }

  async init() {
    await initEmbed(); 
    await this.memoryManager.init();
    await this.llm.init();
    this.ws.on("open", () => {
      console.log("Connected to dispatcher")
    })
    this.ws.on("close", () => {
      console.log("DisConnected to dispatcher")
    })
    this.ws.on("message",async  (data) => {
      const d = JSON.parse(data.toString());
      console.log(d);
      if (d.type === "welcome") {
        this.WebSocketID = d.id
        console.log(`client ID is: ${this.WebSocketID}`)
        return
      }
      if (!d.content) {
        return;
      }
        this.enqueueEvent({ type: "message", content: d.content });
      });
    }

  enqueueEvent(event) {
    if (event.type === "message") {
    this.queue.unshift(event)
    } else {
      this.queue.push(event)
    }
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

const output = new OutputQueue()

// =============================
// 通用消息处理
// =============================
export async function handleMessageGeneric(agent, message) {
  output.push(message.content, 2000)
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
      msgObj = { role: "assistant", content: message };
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

  const MAX_HISTORY = 10;
  const context = buildContext(agent, MAX_HISTORY);
  const response = await agent.llm.call("deepseek-chat", [
    { role: "system", content: messages },
    ...context
  ]);

  console.log("[Agent-001]:");
  output.push(response.content, 2000)
  agent.enqueueEvent(response.content)
  // const messageToWebSocket = {
  //   from: agent.WebSocketID,
  //   content: response
  // }

  // agent.WebSocket.send(JSON.stringify(messageToWebSocket))

  // ===== 模型调用工具处理 =====
  if (response.tool_calls?.length > 0) {
    // return
    agent.historyManager.pushHistory({ role: "tool", content: String(response.content || ""), tool_calls: response.tool_calls });

    for (const call of response.tool_calls) {
      let args = {};
      try { args = JSON.parse(call.function.arguments); } catch {}
      const result = (await runTool(call.function.name, args, {
        memoryManager: agent.memoryManager,
        ws: agent.ws,
        wsID: agent.wsID
      })) ?? "[tool returned nothing]";
      agent.historyManager.pushHistory({ 
        role: "assistant", 
        tool_call_id: call.id, 
        content: typeof result === "string" ? result : JSON.stringify(result) 
      });
    }

    // 工具执行后再次调用 LLM
    const contextAfterTool = buildContext(agent, MAX_HISTORY);
    // output.push(contextAfterTool, 3000)
    const second = await agent.llm.call("deepseek-chat", [
      { role: "system", content: agent.systemPrompt },
      ...contextAfterTool
    ]);
    // output.push(second.content, 2000)
    
    agent.historyManager.pushHistory({ role: "assistant", content: String(second.content || "").trim() });
  } else {
    agent.historyManager.pushHistory({ role: "assistant", content: String(response.content || "").trim() });
  }
}

// =============================
// 历史上下文构建（兼容工具调用）
// =============================
function buildContext(agent, max =30) {
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

let printing = false;

async function animateText(text, totalTime = 5000) {
  if (printing) return;
  printing = true;

  const lines = text.split("\n");
  const interval = totalTime / lines.length;

  for (const line of lines) {
    process.stdout.write(line + "\n");
    await new Promise(r => setTimeout(r, interval));
  }

  printing = false;
}