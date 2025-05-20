import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT * FROM categorias_servicos WHERE 1=1"
  const params = []

  if (filters.nome) {
    sql += " AND nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.ativo !== undefined) {
    sql += " AND ativo = ?"
    params.push(filters.ativo)
  }

  sql += " ORDER BY nome ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query("SELECT * FROM categorias_servicos WHERE id = ?", [id])
  return result[0]
}

export const findByNome = async (nome) => {
  const result = await query("SELECT * FROM categorias_servicos WHERE nome = ?", [nome])
  return result[0]
}

export const create = async (categoriaData) => {
  const { nome, descricao, ativo = 1 } = categoriaData

  const id = generateUUID()

  await query("INSERT INTO categorias_servicos (id, nome, descricao, ativo) VALUES (?, ?, ?, ?)", [
    id,
    nome,
    descricao || null,
    ativo,
  ])

  return findById(id)
}

export const update = async (id, categoriaData) => {
  const { nome, descricao, ativo } = categoriaData

  let sql = "UPDATE categorias_servicos SET "
  const params = []
  const updates = []

  if (nome) {
    updates.push("nome = ?")
    params.push(nome)
  }

  if (descricao !== undefined) {
    updates.push("descricao = ?")
    params.push(descricao)
  }

  if (ativo !== undefined) {
    updates.push("ativo = ?")
    params.push(ativo)
  }

  if (updates.length === 0) {
    return findById(id)
  }

  sql += updates.join(", ")
  sql += " WHERE id = ?"
  params.push(id)

  await query(sql, params)

  return findById(id)
}

export const remove = async (id) => {
  await query("DELETE FROM categorias_servicos WHERE id = ?", [id])
  return true
}

export default {
  findAll,
  findById,
  findByNome,
  create,
  update,
  remove,
}
