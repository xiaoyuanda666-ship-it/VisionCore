import 'dotenv/config'
import { DeepSeekClient } from '../engine/providers/DeepSeekClient.js'

test.skip("DeepSeek API should respond", async () => {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const client = new DeepSeekClient({
    apiKey,
    model: "deepseek-chat"
  })
  const messages = [
    { role: "user", content: "say hello" }
  ]
  const res = await client.send(messages)
  expect(res).toBeDefined()
  expect(typeof res.text).toBe("string")
  expect(res.text.length).toBeGreaterThan(0)

}, 20000)