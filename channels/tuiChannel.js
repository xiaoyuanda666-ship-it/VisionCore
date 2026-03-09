// tuiChannel.js
import readline from "readline";
import Channel  from "./channel.js";

export class TUIChannel extends Channel {
  constructor(name = "TUI") {
    super(name);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> "
    });

    this.rl.prompt();

    // 用户输入的消息
    this.rl.on("line", (line) => {
      const msg = {
        from: "tui_user",
        to: null,        // Dispatcher 可以处理 broadcast 或指定 ID
        type: "text",
        content: line.trim()
      };
      this._receive(msg); // 回调 Dispatcher/Router
      this.rl.prompt();
    });
  }

  async send(message) {
    console.log(`[TUI] ${message.from}: ${message.content}`);
  }
}