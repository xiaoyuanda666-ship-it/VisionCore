export async function retrieve(query){

  const qVec = await embed(query)

  const results = await table
    .search(qVec)
    .limit(5)

  return results
}