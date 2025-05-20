import { query } from "../config/database.js"

export const findAll = async () => {
  return await query("SELECT * FROM configuracoes ORDER BY chave")
}

export const findByChave = async (chave) => {
  const result = await query("SELECT * FROM configuracoes WHERE chave = ?", [chave])
  return result[0]
}

export const create = async (configuracaoData) => {
  const { chave, valor, descricao } = configuracaoData

  await query("INSERT INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)", [chave, valor, descricao || null])

  return findByChave(chave)
}

export const update = async (chave, configuracaoData) => {
  const { valor, descricao } = configuracaoData

  let sql = "UPDATE configuracoes SET "
  const params = []
  const updates = []

  if (valor !== undefined) {
    updates.push("valor = ?")
    params.push(valor)
  }

  if (descricao !== undefined) {
    updates.push("descricao = ?")
    params.push(descricao)
  }

  if (updates.length === 0) {
    return findByChave(chave)
  }

  sql += updates.join(", ")
  sql += " WHERE chave = ?"
  params.push(chave)

  await query(sql, params)

  return findByChave(chave)
}

export const remove = async (chave) => {
  await query("DELETE FROM configuracoes WHERE chave = ?", [chave])
  return true
}

export default {
  findAll,
  findByChave,
  create,
  update,
  remove,
}
