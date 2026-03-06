export class LLMOptions {
  temperature = 0.7;
  max_tokens = 1024;
  tools = [];
  response_format = "text";
  stop = [];

  constructor(opts = {}) {
    Object.assign(this, opts);
  }
}