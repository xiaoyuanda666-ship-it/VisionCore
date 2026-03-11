// core/__test__/embed.test.js
import { initEmbed, embed } from "../ai/embed.js"
import { jest } from "@jest/globals"

jest.setTimeout(60000) // 模型加载可能慢

describe.skip("embed.js 测试", () => {
  beforeAll(async () => {
    await initEmbed()
  })

  test("embed 返回向量", async () => {
    const text = "这是一段测试文本"
    const vec = await embed(text)

    expect(vec).toBeDefined()
    expect(Array.isArray(vec)).toBe(true)
    expect(vec.length).toBeGreaterThan(0)
    expect(typeof vec[0]).toBe("number")
  })

  test("不同文本向量不完全相同", async () => {
    const vec1 = await embed("文本 A")
    const vec2 = await embed("文本 B")
    expect(vec1).not.toEqual(vec2)
  })
})