const WebSocket = require('ws');
const ConnectionManager = require('./connectionManager');
const Router = require('./router');

class Dispatcher {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.cm = new ConnectionManager();
    this.router = new Router(this.cm);

    this.wss.on('connection', (ws) => {
      const id = Math.random().toString(36).substring(2, 10);
      this.cm.addConnection(id, ws, 'user');

      ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.to) this.router.sendMessage(data.to, data);
        else this.router.broadcast(data);
      });

      ws.on('close', () => {
        this.cm.removeConnection(id);
      });
    });

    console.log(`Dispatcher running on ws://localhost:${port}`);
  }
}

module.exports = Dispatcher;