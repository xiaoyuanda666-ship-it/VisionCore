import * as lancedb from "@lancedb/lancedb"

let table
export async function initVectorDB() {
  const db = await lancedb.connect("./data")
  try {
    table = await db.openTable("memory")
  } catch {
    // 用 record 初始化表，同时给字段默认值保证类型
    table = await db.createTable("memory", [
      {
        vector: Array(768).fill(0), // 768维向量
        text: "init",
        type: "init",
        timestamp: Date.now(),   // int64
        importance: 0,           // int32
        taskId: ""               // string，即使没任务也用空字符串
      }
    ])
  }

  console.log("vector db ready")
}

export async function initMemoryDB(basePath = "./data/memory") {
  const db = await lancedb.connect(basePath)

  for (const typeName of MEMORY_TYPES) {
    try {
      tables[typeName] = await db.openTable(typeName)
    } catch {
      tables[typeName] = await db.createTable(typeName, [
        {
          vector: Array(768).fill(0),
          text: "init",
          type: "init",
          timestamp: Date.now(),  // 对应 MemoryManager.timestamp
          importance: 0,          // 对应 MemoryManager.importance
          taskId: "string"             // 对应 MemoryManager.taskId   
        }
      ])
    }
  }

  console.log("Memory DB ready")
}

export function getTable() {
  return table
}