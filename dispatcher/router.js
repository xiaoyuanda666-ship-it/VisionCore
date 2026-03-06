class Router {
  constructor(connectionManager) {
    this.cm = connectionManager;
  }

  sendMessage(toId, message) {
    const conn = this.cm.getConnection(toId);
    if (conn && conn.ws.readyState === 1) {
      conn.ws.send(JSON.stringify(message));
    }
  }

  broadcast(message) {
    this.cm.getAllConnections().forEach(conn => {
      if (conn.ws.readyState === 1) {
        conn.ws.send(JSON.stringify(message));
      }
    });
  }
}

export default Router;