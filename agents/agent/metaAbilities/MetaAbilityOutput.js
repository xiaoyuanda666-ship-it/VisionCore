import { MetaAbility } from "./MetaAbility.js";
import { callLLM } from "../../engine/llmClient.js";

export class MetaAbilityOutput extends MetaAbility {

  constructor() {
    super({
      name: "Output",
      description: "决定 Agent 是否需要输出，以及输出什么",
      defaultPromptPath: "./prompts/metaAbilities/output_default.md",
      evolvedPromptPath: "./prompts/metaAbilities/output_evolved.md"
    });
  }

  async run(context) {

    if (!this.active) await this.init();
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = new Date();

    try {

      const MAX_HISTORY = 30;

      // 读取 Agent 最近历史（复制一份，避免污染主 history）
      const abilityHistory = context.history
        .slice(-MAX_HISTORY)
        .map(msg => ({ ...msg }));

      // 构造 LLM 输入
      const messages = [
        {
          role: "system",
          content: this.currentPrompt
        },
        ...abilityHistory
      ];

      console.log(messages)
      const result = await callLLM(messages);

      if (!result) {
        this.log("LLM 没返回内容");
        return;
      }

      // 统一处理返回格式
      let output = "";

      if (typeof result === "string") {
        output = result.trim();
      } else if (result?.content) {
        output = result.content.trim();
      }

      if (!output) {
        this.log("LLM 返回为空");
        return;
      }

      // 写回主 Agent history
      context.history.push({
        role: "assistant",
        content: output
      });

      this.log("输出完成");

    } catch (err) {

      this.log("运行出错", err);

    } finally {

      this.isRunning = false;

    }

  }

}