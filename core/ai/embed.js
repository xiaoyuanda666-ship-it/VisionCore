// /core/ai/embed.js
import { getLlama } from "node-llama-cpp"
let embeddingContext
export async function initEmbed() {
  const llama = await getLlama()
  const model = await llama.loadModel({
    modelPath: "../VisionHub/core/agent/models/embeddinggemma-300m-q4_k_m.gguf",
  })

  embeddingContext = await model.createEmbeddingContext()
  // console.log("embedding model loaded")
}
export async function embed(text) {
  if (!embeddingContext) throw new Error("embeddingContext not initialized")
  const result = await embeddingContext.getEmbeddingFor(text)
  // console.log("embed result:", result)
  if (!result || !result.vector) { 
    throw new Error("embedding returned undefined")
  }

  return result.vector
}