// test/LLMManager.integration.test.js
import { jest } from '@jest/globals'
import { LLMManager } from "../core/ai/LLMManager.js"

jest.setTimeout(30000) // LLM 调用可能慢

describe.skip("LLMManager Integration Test", () => {
  let llmManager

  beforeAll(async () => {
    llmManager = new LLMManager()
    await llmManager.init()
  })

  test("should load providers", () => {
    const providers = llmManager.getProviders()
    expect(providers.length).toBeGreaterThan(0)
  })

  test("should have models mapped", () => {
    const models = llmManager.getModels()
    expect(models.includes("deepseek-chat") || models.includes("gpt-4o-mini")).toBe(true)
  })

  test("getClientByModel should return client", () => {
    const model = llmManager.getModels()[0]
    const client = llmManager.getClientByModel(model)
    expect(client).toBeDefined()
    expect(typeof client.send).toBe("function")
  })

  test("call() should return response from real API", async () => {
    const model = llmManager.getModels()[0]

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say hello." }
    ]

    const response = await llmManager.call(model, messages)
    
    expect(response).toHaveProperty("content")
    expect(typeof response.content).toBe("string")
    console.log("API response:", response.content)
  })
})