// utils/sendMessage.js
import { nowString } from "../utils/time.js";

export async function sendMessage(agent, text) {
  const nowStr = nowString();
  const msgObj = `[ID:986000] ${nowStr} ${text}`
  agent.enqueueUser(msgObj);
}

export async function sendTickMessage(agent) {
  const nowStr = nowString();
  const msgObj = `[系统Tick] ${nowStr}`
  agent.enqueueTick(msgObj);
}