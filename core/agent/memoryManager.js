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
    const tableNames = ["longterm","recent","shortterm","self"]

    // 删除旧表
    for (const name of tableNames) {
      try { await db.deleteTable(name) } catch {}
    }

    // 创建表（空表还不能 build 向量列）
    await db.createTable("longterm",  [
        {
          vector: Array(768).fill(0),
          text: "init",
          type: "init",
          timestamp: Date.now(),  // 对应 MemoryManager.timestamp
          importance: 0,          // 对应 MemoryManager.importance
          taskId: "string"             // 对应 MemoryManager.taskId   
        }
      ])
    await db.createTable("recent",  [
        {
          vector: Array(768).fill(0),
          text: "init",
          type: "init",
          timestamp: Date.now(),  // 对应 MemoryManager.timestamp
          importance: 0,          // 对应 MemoryManager.importance
          taskId: "string"             // 对应 MemoryManager.taskId   
        }
      ])

    await db.createTable("shortterm",  [
        {
          vector: Array(768).fill(0),
          text: "init",
          type: "init",
          timestamp: Date.now(),  // 对应 MemoryManager.timestamp
          importance: 0,          // 对应 MemoryManager.importance
          taskId: "string"             // 对应 MemoryManager.taskId   
        }
      ])
    // await db.createTable("self", [])

    // 打开各表
    try {
      this.tables.recent = await db.openTable("recent")
    } catch {
      // 如果表不存在，就创建
      this.tables.recent = await db.createTable("recent", [
        { name: "vector", type: "vector", dims: 768 },
        { name: "text", type: "string" },
        { name: "timestamp", type: "int64" },
        { name: "importance", type: "float" },
        { name: "taskId", type: "string" }
      ])
    }

    // 打开各表
    try {
      this.tables.shortterm = await db.openTable("shortterm")
    } catch {
      // 如果表不存在，就创建
      this.tables.shortterm = await db.createTable("shortterm", [
        { name: "vector", type: "vector", dims: 768 },
        { name: "text", type: "string" },
        { name: "timestamp", type: "int64" },
        { name: "importance", type: "float" },
        { name: "taskId", type: "string" }
      ])
    }

    // 打开各表
    try {
      this.tables.longterm = await db.openTable("longterm")
    } catch {
      // 如果表不存在，就创建
      this.tables.longterm = await db.createTable("longterm", [
        { name: "vector", type: "vector", dims: 768 },
        { name: "text", type: "string" },
        { name: "timestamp", type: "int64" },
        { name: "importance", type: "float" },
        { name: "taskId", type: "string" }
      ])
    }
    // this.tables.recent = db.table("recent")
    // this.tables.shortterm = db.table("shortterm")
    // this.tables.self = db.table("self")
  }

async _getOrCreateTable(db, name) {
  const sampleVec = await embed("init")
  const dims = sampleVec.length

  try {
    return await db.openTable(name)  // 表存在就直接打开
  } catch {
    // 表不存在，先创建
    await db.createTable(name, [
      { name: "vector", type: "vector", dims },
      { name: "text", type: "string" },
      { name: "timestamp", type: "int64" },
      { name: "importance", type: "float" },
      { name: "taskId", type: "string" }
    ])
    // 再打开，保证返回 Table 实例
    return await db.openTable(name)
  }
}

  async addMemory(text, type, options = {}) {
    const vec = await embed(text)
    // console.log(vec.length, vec) 768, [-0.0012, 0.0034...]
    const table = this.tables[type]
    console.log("table:", table, "type:", type) // table: NativeTable(recent, uri=./lancedb_data\recent.lance, read_consistency_interval=None) type: recent

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
    const vec = new Float32Array(await embed(queryText))
    const table = this.tables[type]
    if (!table) throw new Error("未知记忆类型")

    let result = await table.search(vec).limit(10).toArray()
    if (filter.taskId) {
      result = result.filter(r => r.taskId === filter.taskId)
    }
    return result.map(r => r.text)
  }
}