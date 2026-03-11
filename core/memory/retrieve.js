import { embed } from "../ai/embed.js"
import { getTable } from "../agent/db/vectorDB.js"

export async function addMemory(text) {
  const vec = await embed(text)
  const table = getTable()

  // 检查是否已经存在同样的文本
  const existing = await table.search(vec).limit(5).toArray()
  const isDuplicate = existing.some(item => item.text === text)

  if (isDuplicate) {
    console.log(`Memory already exists: "${text}"`)
    return
  }

  // 不重复才添加
  await table.add([
    {
      vector: vec,
      text: text
    }
  ])
  console.log(`Memory added: "${text}"`)
}

// 检索记忆，返回文本数组
export async function retrieve(queryText) {
  const q = await embed(queryText)
  const table = getTable()

  // 执行向量搜索，返回数组
  const resultArray = await table
    .search(q)
    .limit(3)
    .toArray()  // ⚡ LanceDB 返回数组

  // 只返回文本
  return resultArray.map(item => item.text)
}