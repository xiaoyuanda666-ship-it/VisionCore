class ConnectionManager {
  constructor() {
    this.connections = new Map(); // key: id, value: { ws, type }
  }

  addConnection(id, ws, type) {
    this.connections.set(id, { ws, type });
  }

  removeConnection(id) {
    this.connections.delete(id);
  }

  getConnection(id) {
    return this.connections.get(id);
  }

  getAllConnections() {
    return Array.from(this.connections.values());
  }
}

export default ConnectionManager;