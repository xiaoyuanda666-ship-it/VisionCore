import { getSystemPrompt } from "../../utils/systemPrompt.js";

export async function buildMessages(memoryManager, userInput, query, types = ["self","longterm","recent"]) {
  let memoryTexts = [];
  for (const type of types) {
    const retrieved = await memoryManager.retrieve(query, type);
    if (retrieved.length > 0) {
      const listText = retrieved.map((t,i) => `${i+1}. ${t}`).join("\n");
      memoryTexts.push(`[${type}记忆参考]\n${listText}`);
    }
  }

  const defSystemPrompt = await getSystemPrompt();

  const systemPrompt = memoryTexts.length > 0
    ? `${defSystemPrompt}\n\n请参考以下记忆信息回答用户问题：\n${memoryTexts.join("\n\n")}`
    : defSystemPrompt;

  return systemPrompt;
}