import { embed } from "../ai/embed.js"
import lancedb from "@lancedb/lancedb"

export class MemoryManager {
  constructor(basePath = "./lancedb_data") {
    this.dbPromise = lancedb.connect(basePath) // 返回 Promise
    this.recentQueue = []
    this.recentLimit = 500
    this.tables = {}
  }

  async init() {
  const db = await this.dbPromise
  const types = ["longterm", "recent", "shortterm", "self"]
  for (const type of types) {
    this.tables[type] = await this._getOrCreateTable(db, type)
  }
}

  async _getOrCreateTable(db, name) {
  try {
    return await db.openTable(name)
  } catch {
    await db.createTable(name, [
      {
        vector: Array(768).fill(0),
        text: "init",
        type: "init",
        timestamp: Date.now(),
        importance: 0,
        taskId: "string"
      }
    ])
    return await db.openTable(name)
  }
}

  async addMemory(text, type, options = {}) {
    const vec = await embed(text)
    const table = this.tables[type]

    if (!table) throw new Error("未知记忆类型")

    // 检查重复
    // 检查重复
    const existing = await table
      .search(vec)
      .distanceType("cosine")  // 必须加
      .limit(5)
      .toArray()

    if (existing.some(r => r.text === text)) return

    const record = { vector: vec, text, timestamp: Date.now(), importance: options.importance || 0, taskId: options.taskId || "" }
    await table.add([record]) 

    if (type === "recent") {
      this.recentQueue.push({ text: record.text, timestamp: record.timestamp })
      while (this.recentQueue.length > this.recentLimit) {
        const old = this.recentQueue.shift()
        // delete 支持 SQL 条件字符串
        await table.delete(`text = "${old.text}" AND timestamp = ${old.timestamp}`)
      }
    }
  }

  async retrieve(queryText, type, filter = {}) {
    const vec = await embed(queryText)
    const table = this.tables[type]
    // console.log(table)
    if (!table) throw new Error("未知记忆类型")

    let result = await table.search(vec).limit(10).toArray()
    if (filter.taskId) {
      result = result.filter(r => r.taskId === filter.taskId)
    }
    return result.map(r => r.text)
  }
}