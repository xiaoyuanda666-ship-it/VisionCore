export class BaseLLMClient {
  async chat(messages, options = {}) {
    throw new Error("send() must be implemented");
  }
}