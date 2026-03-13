import { nowString } from "../../utils/time.js";
import { Agent } from "../agent/agent.js";

const agentName = process.argv[2];
console.log("Agent starting:", agentName);

const agent = new Agent(agentName);
const TICK_INTERVAL = Number(process.env.AGENT_TICK_INTERVAL) || 5000;

async function start() {
  console.log("Genesis runtime starting...");
  await agent.init();
  console.log("LLM initialized, ready to receive events");

  // ---------- Tick ----------
  function tick() {
    agent.enqueueEvent({ type: "tick", content: `[系统Tick] ${nowString()}` });
  }

  setInterval(tick, TICK_INTERVAL);
}
start();