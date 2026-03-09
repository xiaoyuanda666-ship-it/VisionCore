import { Agent, handleMessageGeneric } from "./core/agent/agent.js";
import { nowString } from "./utils/time.js";

// 创建 Agent 实例
const agent = new Agent();

async function runTest() {
  console.log("=== Agent 测试开始 ===");

  // 初始化 LLM
  await agent.init();

  // 模拟消息
  agent.enqueueEvent({ type: "message", content: JSON.stringify({ role: "user", content: "Hello Agent!" }) });

  // 模拟 tick
  agent.enqueueEvent({ type: "tick", time: nowString() });

  // 再发一个消息
  agent.enqueueEvent({ type: "message", content: "This is a raw string message." });

  // 等待队列处理完
  while (agent.processing || agent.queue.length > 0) {
    await new Promise((res) => setTimeout(res, 100));
  }

  console.log("=== Agent 测试结束 ===");
  console.log("历史记录:", agent.historyManager.history);
}

// 执行
runTest();