// __tests__/memoryManager.retrieve.test.js
import { MemoryManager } from "../agent/memoryManager.js"
import { jest } from "@jest/globals"
import { initEmbed } from "../ai/embed.js"
import fs from "fs"
import path from "path"

jest.setTimeout(60000) // embed 可能耗时

describe("MemoryManager.retrieve 测试", () => {
  let mm
  const dbPath = path.resolve("./lancedb_data")

  beforeAll(async () => {
    // 清空旧数据库目录
        if (fs.existsSync(dbPath)) {
          fs.rmSync(dbPath, { recursive: true, force: true })
        }
    mm = new MemoryManager("./lancedb_data") // 使用测试路径
    await mm.init()
    await initEmbed()
  })

  test("retrieve 返回最近添加的记忆", async () => {
    const text1 = "今天吃了苹果"
    const text2 = "昨天跑步了5公里"
    console.log("addMemory 开始")
    await mm.addMemory(text1, "recent")
    await mm.addMemory(text2, "recent")

    console.log("addMemory 完成")

    const results = await mm.retrieve("苹果", "recent")
    expect(results).toContain(text1)
    expect(results).not.toContain("不存在的文本")
  })

  test("retrieve 支持 taskId 过滤", async () => {
    const text3 = "完成项目A报告"
    const text4 = "完成项目B报告"

    await mm.addMemory(text3, "shortterm", { taskId: "taskA" })
    await mm.addMemory(text4, "shortterm", { taskId: "taskB" })

    const resultsA = await mm.retrieve("项目", "shortterm", { taskId: "taskA" })
    expect(resultsA).toContain(text3)
    expect(resultsA).not.toContain(text4)

    const resultsB = await mm.retrieve("项目", "shortterm", { taskId: "taskB" })
    expect(resultsB).toContain(text4)
    expect(resultsB).not.toContain(text3)
  })

  test("retrieve 不存在的类型报错", async () => {
    await expect(mm.retrieve("测试", "unknown")).rejects.toThrow("未知记忆类型")
  })
})