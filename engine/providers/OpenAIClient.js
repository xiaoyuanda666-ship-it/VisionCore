import OpenAI from "openai";
import { BaseLLMClient } from "./BaseLLMClient.js";

export class OpenAIClient extends BaseLLMClient {

  constructor(config = {}) {

    this.client = new OpenAI({
      apiKey: config.apiKey
    });

    this.model = config.model || "gpt-4o-mini";
  }

  async send(messages, options = {}) {

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
      top_p: options.top_p ?? 1
    });

    return {
      role: "assistant",
      content: response.choices[0].message.content
    };
  }
}