import fs from "fs/promises";

export class MetaAbility {
  /**
   * @param {Object} options
   * @param {string} options.name 元能力名称
   * @param {string} options.description 元能力描述
   * @param {string} options.defaultPromptPath 默认系统提示词文件路径
   * @param {string} options.evolvedPromptPath 自主进化系统提示词文件路径（备份作用）
   */
  constructor({ name, description, defaultPromptPath, evolvedPromptPath }) {
    this.name = name;
    this.description = description;
    this.defaultPromptPath = defaultPromptPath;
    this.evolvedPromptPath = evolvedPromptPath;

    this.active = false;          // 元能力是否可用
    this.isRunning = false;       // 当前 run 是否正在执行
    this.lastTickTime = null;     // 上一次 Tick 时间
    this.currentPrompt = null;    // 当前系统提示词
  }

  // 生命周期函数：初始化
  async init() {
    this.active = true;
    this.currentPrompt = await this.loadPrompt();
    this.log("初始化完成");
  }

  // 加载系统提示词
  async loadPrompt() {
    try {
      const evolved = await fs.readFile(this.evolvedPromptPath, "utf-8");
      if (evolved && evolved.trim()) return evolved;
    } catch (err) { /* 自主进化提示词不可用，忽略 */ }

    try {
      const defaultPrompt = await fs.readFile(this.defaultPromptPath, "utf-8");
      return defaultPrompt;
    } catch (err) {
      this.log("默认提示词加载失败", err);
      return "";
    }
  }

  // 生命周期函数：运行（子类实现具体逻辑）
  async run(context) {
    if (!this.active) await this.init();
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = new Date();
    this.log("开始运行...");

    try {
      // 子类实现具体逻辑
      // 比如读取文件、处理信息、写入会话文件摘要等
      this.log("运行完成");
    } catch (err) {
      this.log("运行出错", err);
    } finally {
      this.isRunning = false;
    }
  }

  // 生命周期函数：结束
  async end() {
    this.active = false;
    this.isRunning = false;
    // 元能力在结束时，应该在主 Agent 会话中写入摘要
    this.log("已结束，结果摘要已写入主 Agent 会话");
  }

  // 主 Agent Tick 调用
  async tick(context) {
    if (!this.active) return;
    this.lastTickTime = new Date();
    this.run(context).catch(err => this.log("Tick 调用 run 出错", err));
  }

  // 日志管理
  log(...args) {
    console.log(`[MetaAbility-${this.name}]`, ...args);
  }
}