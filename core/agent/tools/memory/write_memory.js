// core/agent/tools/memory/write_memory.js

export async function writeMemory(args, { semanticMemory }) {
  try {
    const {
      text,
      type = "longterm",
      importance = 0.5,
      taskId = ""
    } = args || {}

    // text 必须存在
    if (!text || typeof text !== "string") {
      return {
        success: false,
        error: "memory text must be a non-empty string"
      }
    }

    // 只允许固定类型
    const allowedTypes = ["longterm", "shortterm", "recent", "self"]
    if (!allowedTypes.includes(type)) {
      return {
        success: false,
        error: "invalid memory type"
      }
    }

    // importance 修正
    let safeImportance = Number(importance)
    if (Number.isNaN(safeImportance)) safeImportance = 0.5

    if (safeImportance < 0) safeImportance = 0
    if (safeImportance > 1) safeImportance = 1

    // 写入记忆
    await semanticMemory.addMemory(text.trim(), type, {
      importance: safeImportance,
      taskId
    })

    return {
      success: true,
      message: "memory stored",
      memory: {
        text: text.trim(),
        type,
        importance: safeImportance
      }
    }

  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}