// core/__test__/memoryManager.init.test.js
import { MemoryManager } from "../memory/memoryManager.js"
import { initEmbed } from "../ai/embed.js"
import { jest } from "@jest/globals"

jest.setTimeout(60000)

describe.skip("MemoryManager 初始化测试", () => {
  let mm

  beforeAll(async () => {
    await initEmbed() // 先初始化 embedding
    mm = new MemoryManager()
    await mm.init() // 初始化表格
  })

  test("MemoryManager 对象创建成功", () => {
    expect(mm).toBeDefined()
    expect(mm.tables).toBeDefined()
  })

  test("表格初始化完成", () => {
    const tableNames = ["longterm", "recent", "shortterm", "self"]
    tableNames.forEach(name => {
      expect(mm.tables[name]).toBeDefined()
      expect(typeof mm.tables[name].add).toBe("function") // 基本方法存在
    })
  })
})