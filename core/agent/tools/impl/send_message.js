export async function send_message(args, { memoryManager ,ws, wsID }) {
  console.log("sending message", args)

  const { content } = args || {}

  if (!content) {
    return { success: false, error: "content empty" }
  }

  if (!ws) {
    return { success: false, error: "webSocket not available" }
  }

  if (ws.readyState !== 1) {
    return { success: false, error: "webSocket not connected" }
  }

  const message = {
    from: wsID || "unknown",
    content
  }

  ws.send(JSON.stringify(message))

  return {
    success: true
  }
}