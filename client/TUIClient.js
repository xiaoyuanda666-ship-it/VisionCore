import WebSocket from "ws"
import readline from "readline"

const ws = new WebSocket("ws://localhost:8080")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
})

let myId = null

ws.on("open", () => {
  console.log("Connected to dispatcher")
  rl.prompt()
})

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString())

  if (msg.type === "welcome") {
    myId = msg.id
    console.log(`Your client ID is: ${myId}`)
    return
  }

  console.log(`[${msg.from}] ${msg.content}`)
})

rl.on("line", (line) => {
  if (!myId) {
    console.log("Waiting for ID from server...")
    rl.prompt()
    return
  }

  const message = {
    from: myId,
    content: line.trim()
  }

  ws.send(JSON.stringify(message))
  rl.prompt()
})