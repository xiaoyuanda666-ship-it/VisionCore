// HistoryManager.js
import fs from "fs";
import path from "path";

export class HistoryManager {
  constructor({ historyDir, windowSize = 30, rollCount = 330 }) {
    this.historyDir = historyDir;
    this.windowSize = windowSize;
    this.rollCount = rollCount;

    if (!fs.existsSync(this.historyDir)) fs.mkdirSync(this.historyDir, { recursive: true });

    this.historyPath = this._getNewHistoryPath();
    this.history = this._initHistory();
  }

  _getNewHistoryPath() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, "-");
    return path.join(this.historyDir, `History-${timestamp}.json`);
    return path.join(this.historyDir, `History-01.json`);
  }

  _initHistory() {
    if (!fs.existsSync(this.historyPath)) fs.writeFileSync(this.historyPath, "[]", "utf-8");
    try {
      const content = fs.readFileSync(this.historyPath, "utf-8").trim();
      return content ? JSON.parse(content) : [];
    } catch (e) {
      console.error("Failed to load history:", e);
      return [];
    }
  }

  _saveHistory() {
    fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2), "utf-8");
  }

  pushHistory(msg) {
    this.history.push(msg);

    if (this.history.length >= this.rollCount) {
      this._rollHistory();
    } else {
      this._saveHistory();
    }
  }

  _rollHistory() {
    const recent = this.history.slice(-this.windowSize);
    this.history = this.history.slice(0, this.history.length - this.windowSize);
    this._saveHistory();

    this.historyPath = this._getNewHistoryPath();
    this.history = [...recent];
    this._saveHistory();

    // console.log(`Rolled over history. New file: ${this.historyPath}`);
  }

  getChatHistory() {
    return this.history;
  }
}