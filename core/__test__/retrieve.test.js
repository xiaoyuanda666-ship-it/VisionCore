import { jest, beforeAll, test, expect, afterAll } from '@jest/globals'
import { initEmbed } from "../ai/embed.js"
import { initVectorDB } from "../agent/db/vectorDB.js"
import { addMemory, retrieve } from "../memory/retrieve.js"

jest.setTimeout(60000)

beforeAll(async () => {
  await initEmbed()
  await initVectorDB()
})

afterAll(async () => {
  // 可关闭资源
})

test.skip("should retrieve related memory", async () => {
  await addMemory("Tesla was founded in 2003")
  await addMemory("Elon Musk joined Tesla in 2004")
  await addMemory("The first Tesla car was Roadster")

  const result = await retrieve("Tesla 创始时间")
  console.log("检索结果:", result)

  expect(result.length).toBeGreaterThan(0)
})