// prompt-runner.js
import 'dotenv/config'
import fs from "fs"
import path from "path"
import { LLMAdapter } from "./engine/llmAdapter.js"

const PROMPT_DIR = path.resolve("./test-prompts")
const apiKey = process.env.DEEPSEEK_API_KEY

const adapter = new LLMAdapter({
  provider: "deepseek",
  model: "deepseek-chat",
  apiKey
})

// 读取 md 文件
const promptFiles = fs.readdirSync(PROMPT_DIR).filter(f => f.endsWith(".md"))

async function run() {
  for (const file of promptFiles) {
    const prompt = fs.readFileSync(path.join(PROMPT_DIR, file), "utf8")

    const userPrompt = `帮我写一篇关于爱情的文章，要求不少于1000字`

    const messages = [{ role: "system", content: prompt }]
    messages.push({ role: "user", content: userPrompt })
    
    try {
      const res = await adapter.send(messages)

      console.log("\n==========")
      console.log(file)
      console.log("----------")
      console.log(res.text)

    } catch (err) {
      console.error(file, "error:", err)
    }
  }
}

run()