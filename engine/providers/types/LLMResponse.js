export class LLMResponse {
  text;
  tool_calls;
  raw;

  constructor({ text = "", tool_calls = [], raw = null } = {}) {
    this.text = text;
    this.tool_calls = tool_calls;
    this.raw = raw;
  }
}