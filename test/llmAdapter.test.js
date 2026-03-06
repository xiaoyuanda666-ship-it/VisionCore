import 'dotenv/config'
import { LLMAdapter } from '../engine/llmAdapter.js'

test.skip("LLMAdapter should call DeepSeek provider", async () => {

  const apiKey = process.env.DEEPSEEK_API_KEY

  const adapter = new LLMAdapter({
    provider: "deepseek",
    model: "deepseek-chat",
    apiKey
  })

  const messages = [
    { role: "user", content: "say hello" }
  ]

  const options = {}

  const res = await adapter.send(messages, options)

  console.log(res.text)

  expect(res).toBeDefined()
  expect(typeof res.text).toBe("string")
  expect(res.text.length).toBeGreaterThan(0)

}, 20000)