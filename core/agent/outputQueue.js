export class OutputQueue {
  constructor() {
    this.queue = []
    this.running = false
  }

  push(text, duration = 5000) {
    this.queue.push({ text, duration })
    this.run()
  }

  async run() {
    if (this.running) return
    this.running = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()
      await this.animate(job.text, job.duration)
    }

    this.running = false
  }

  async animate(text, totalTime = 5000) {
    if (!text) return

    // 如果不是字符串，转成字符串
    if (typeof text !== "string") {
      text = JSON.stringify(text, null, 2)
    }

    const lines = text
      .split("\n")
      .map(line =>
        line
          .replace(/[\{\}\,\[\]]/g, "") // 去掉 {} []
          .trimStart()                // 去掉行首空格
      )
      .filter(line => line.length > 0)

    if (lines.length === 0) return

    const interval = totalTime / lines.length

    for (const line of lines) {
      process.stdout.write(line + "\n")
      await new Promise(r => setTimeout(r, interval))
    }
  }
}