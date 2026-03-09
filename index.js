import Dispatcher from './dispatcher/dispatcher.js'
import { TUIChannel } from "./channels/tuiChannel.js";

const dispatcher = new Dispatcher(8080);

const tui = new TUIChannel();
dispatcher.registerChannel("tui", tui);

// 模拟 Agent 发消息给 TUI
// setInterval(() => {
//   dispatcher.sendToChannel("tui", { from: "agent1", content: "你好，TUI 用户" });
// }, 5000);