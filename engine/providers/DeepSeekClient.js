import OpenAI from "openai"
import { BaseLLMClient } from "./BaseLLMClient.js"
import { LLMResponse } from "./types/LLMResponse.js"

export class DeepSeekClient extends BaseLLMClient {

  constructor({ apiKey, model = "deepseek-chat" }) {
    super()

    this.model = model

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com/v1"
    })
  }

  async send(messages, options = {}) {

    const res = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024
    })

    const msg = res.choices?.[0]?.message ?? {}

    return new LLMResponse({
      text: msg.content ?? "",
      tool_calls: msg.tool_calls ?? [],
      raw: res
    })
  }
}