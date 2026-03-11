// core/__test__/memoryManager.addMemory.test.js
import fs from "fs"
import path from "path"
import { initEmbed } from "../ai/embed.js"
import { MemoryManager } from "../memory/memoryManager.js"
import { jest } from "@jest/globals"

jest.setTimeout(60000)

describe("MemoryManager addMemory 测试", () => {
  let mm
  const dbPath = path.resolve("./lancedb_data")

  beforeAll(async () => {
    // 清空旧数据库目录
    // if (fs.existsSync(dbPath)) {
    //   fs.rmSync(dbPath, { recursive: true, force: true })
    // }

    // 初始化 embedding
    await initEmbed()

    // 初始化 MemoryManager 干净表
    mm = new MemoryManager()
    await mm.init()
  })

  test("添加长期记忆并检索", async () => {
    const text = "这是一个长期记忆测试"
    await mm.addMemory(text, "longterm")
    const results = await mm.retrieve("长期记忆", "longterm")

    expect(results).toContain(text)
  })

  test("添加近期记忆，超过限制会删除最早记录", async () => {
    mm.recentLimit = 3 // 小限额方便测试
    const texts = ["r1", "r2", "r3", "r4"]

    for (const t of texts) {
      await mm.addMemory(t, "recent")
    }

    const results = await mm.retrieve("r", "recent")
    // 最新三个应该保留
    expect(results).toContain("r2")
    expect(results).toContain("r3")
    expect(results).toContain("r4")
    // 最早的 r1 被删除
    expect(results).not.toContain("r1")
  })

  test("重复文本不会再次插入", async () => {
    const text = "重复记忆测试"
    await mm.addMemory(text, "shortterm")
    await mm.addMemory(text, "shortterm") // 再加一次

    const results = await mm.retrieve("重复记忆", "shortterm")
    // 只会有一个
    const count = results.filter(r => r === text).length
    expect(count).toBe(1)
  })
})