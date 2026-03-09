import { nowString } from "../../utils/time.js";
import { Agent } from "../agent/agent.js";
import WebSocket from "ws";

const agentId = process.argv[2];
console.log("Agent starting:", agentId);

const agent = new Agent();
const TICK_INTERVAL = Number(process.env.AGENT_TICK_INTERVAL) || 20000;

async function start() {
  console.log("Genesis runtime starting...");
  await agent.init(); // 等 LLM 初始化完成
  console.log("LLM initialized, ready to receive events");

  // ---------- WebSocket ----------
  const ws = new WebSocket("ws://localhost:8080");
  ws.on("open", () => console.log("[Dispatcher] connected"));
  ws.on("close", () => console.log("[Dispatcher] disconnected"));
  ws.on("message", (data) => {
    const d = JSON.parse(data);
    const msg = `[ID:986000] ${nowString()} ${d.content}`
    console.log(msg);
    agent.enqueueEvent({ type: "message", content: msg });
  });

  // ---------- Tick ----------
  function tick() {
    agent.enqueueEvent({ type: "message", content: `[系统Tick] ${nowString()}` });
  }

  setInterval(tick, TICK_INTERVAL);
}

// 启动
start();