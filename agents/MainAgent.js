import { nowString } from "../utils/time.js";
import { sendMessage } from "../utils/sendMessage.js";
import { Agent } from "./agent/agent.js";
import WebSocket from "ws";
const ws = new WebSocket("ws://localhost:8080"); // 持有一个 WebSocket 连接，用于接收外部事件

const agentId = process.argv[2]; // 获取作为命令行参数里的AgentId
console.log("Agent starting:", agentId);

const agent = new Agent(); // 创建 Agent 实例

/* ---------- Event Queue ---------- */
const queue = []; // 事件队列，用于存放外部发来的消息和 tick 事件
let running = false; // 防止并发执行
function enqueue(event) {
  queue.push(event);
  run();
}

async function run() {
  if (running) return;
  running = true;

  try {
    while (queue.length > 0) {
      const event = queue.shift();

      if (event.type === "tick") {
        // 如果队列里还有 message，tick 让路
        if (queue.some(e => e.type === "message")) {
          continue;
        }
        agent.enqueueTick(event.time);
      }

      if (event.type === "message") {
        await sendMessage(agent, event.content);
      }

      await agent.process();
    }
  } catch (err) {
    console.error("Agent runtime error:", err);
  } finally {
    running = false;
  }

  // 如果 run 结束时队列又被塞进事件，继续跑
  if (queue.length > 0) run();
}

/* ---------- WebSocket ---------- */
ws.on("open", () => {
  console.log("[Dispatcher] connected");
});
ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data.toString());

    if (msg?.content) {
      enqueue({
        type: "message",
        content: msg.content
      });
    }
  } catch (err) {
    console.error("Invalid message:", err);
  }
});
ws.on("close", () => {
  console.log("[Dispatcher] disconnected");
});

/* ---------- Tick ---------- */
const TICK_INTERVAL = Number(process.env.AGENT_TICK_INTERVAL) || 20000;
function tick() {
  // 队列里最多允许一个 tick
  if (queue.some(e => e.type === "tick")) return;
  enqueue({
    type: "tick",
    time: nowString()
  });
}
/* ---------- Runtime ---------- */
export function startRuntime() {
  console.log("Genesis runtime starting...");
  setInterval(tick, TICK_INTERVAL);
}