import Database from "better-sqlite3";

export class AgentState {
  constructor(dbPath = "./agent_state.db") {
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS identity (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // KV STATE
  set(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key)
      DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP
    `);

    stmt.run(key, JSON.stringify(value));
  }

  get(key) {
    const row = this.db
      .prepare(`SELECT value FROM kv_store WHERE key=?`)
      .get(key);

    if (!row) return null;
    return JSON.parse(row.value);
  }

  delete(key) {
    this.db.prepare(`DELETE FROM kv_store WHERE key=?`).run(key);
  }

  // IDENTITY
  setIdentity(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO identity (key,value)
      VALUES (?,?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);

    stmt.run(key, JSON.stringify(value));
  }

  getIdentity(key) {
    const row = this.db
      .prepare(`SELECT value FROM identity WHERE key=?`)
      .get(key);

    if (!row) return null;
    return JSON.parse(row.value);
  }

  getAllIdentity() {
    const rows = this.db.prepare(`SELECT key,value FROM identity`).all();

    const result = {};
    for (const r of rows) {
      result[r.key] = JSON.parse(r.value);
    }

    return result;
  }

  // EVENTS
  addEvent(type, content) {
    this.db.prepare(`
      INSERT INTO events (type,content)
      VALUES (?,?)
    `).run(type, content);
  }

  getRecentEvents(limit = 20) {
    return this.db
      .prepare(`
        SELECT * FROM events
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(limit);
  }

  clearEvents() {
    this.db.prepare(`DELETE FROM events`).run();
  }
}