import { WebSocketServer } from "ws"
import ConnectionManager from "./connectionManager.js"
import Router from "./router.js"

export default class Dispatcher {
  constructor(port = 8080) {
    this.wss = new WebSocketServer({ port })
    this.cm = new ConnectionManager()
    this.router = new Router(this.cm)

    this.channels = new Map() // key: channelName, value: channel实例

    this.wss.on("connection", (ws) => {
      const id = Math.random().toString(36).substring(2, 10)
      this.cm.addConnection(id, ws, "user")

      // 发送 ID 给客户端
      ws.send(JSON.stringify({
        type: "welcome",
        id
      }))

      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString())
        if (data.to) this.router.sendMessage(data.to, data)
        else this.router.broadcast(data)
      })

      ws.on("close", () => {
        this.cm.removeConnection(id)
      })
    })

    console.log(`Dispatcher running on ws://localhost:${port}`)
  }

  // 注册渠道
  registerChannel(name, channel) {
    this.channels.set(name, channel);

    // 接收渠道消息回调 → 通过 Router 分发
    channel.onReceive((msg) => {
      if (msg.to) this.router.sendMessage(msg.to, msg);
      else this.router.broadcast(msg);
    });
  }

  // 给渠道发消息
  sendToChannel(channelName, msg) {
    const channel = this.channels.get(channelName);
    if (channel) channel.send(msg);
  }
}