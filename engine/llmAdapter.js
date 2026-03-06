import { DeepSeekClient } from './providers/DeepSeekClient.js'
import { OpenAIClient } from './providers/OpenAIClient.js'
export class LLMAdapter {

  constructor(config) {

  if (config.provider === "deepseek") {
    this.provider = new DeepSeekClient(config)
  }

  if (config.provider === "openai") {
    this.provider = new OpenAIClient(config)
  }

}

  async send(messages, options = {}) {
    return this.provider.send(messages, options)
  }

}