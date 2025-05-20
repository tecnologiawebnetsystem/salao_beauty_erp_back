import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT s.*, c.nome as categoria_nome 
    FROM servicos s
    LEFT JOIN categorias_servicos c ON s.categoria_id = c.id
    WHERE 1=1
  `
  const params = []

  if (filters.nome) {
    sql += " AND s.nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.categoria_id) {
    sql += " AND s.categoria_id = ?"
    params.push(filters.categoria_id)
  }

  if (filters.ativo !== undefined) {
    sql += " AND s.ativo = ?"
    params.push(filters.ativo)
  }

  if (filters.preco_min !== undefined) {
    sql += " AND s.preco >= ?"
    params.push(filters.preco_min)
  }

  if (filters.preco_max !== undefined) {
    sql += " AND s.preco <= ?"
    params.push(filters.preco_max)
  }

  if (filters.duracao_min !== undefined) {
    sql += " AND s.duracao_minutos >= ?"
    params.push(filters.duracao_min)
  }

  if (filters.duracao_max !== undefined) {
    sql += " AND s.duracao_minutos <= ?"
    params.push(filters.duracao_max)
  }

  sql += " ORDER BY s.nome ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query(
    `
    SELECT s.*, c.nome as categoria_nome 
    FROM servicos s
    LEFT JOIN categorias_servicos c ON s.categoria_id = c.id
    WHERE s.id = ?
  `,
    [id],
  )

  return result[0]
}

export const findByFuncionario = async (funcionarioId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT s.*, c.nome as categoria_nome 
    FROM servicos s
    LEFT JOIN categorias_servicos c ON s.categoria_id = c.id
    JOIN funcionarios_servicos fs ON s.id = fs.servico_id
    WHERE fs.funcionario_id = ?
  `
  const params = [funcionarioId]

  if (filters.nome) {
    sql += " AND s.nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.categoria_id) {
    sql += " AND s.categoria_id = ?"
    params.push(filters.categoria_id)
  }

  if (filters.ativo !== undefined) {
    sql += " AND s.ativo = ?"
    params.push(filters.ativo)
  }

  sql += " ORDER BY s.nome ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const create = async (servicoData) => {
  const { nome, descricao, preco, duracao_minutos, categoria_id, ativo = 1 } = servicoData

  const id = generateUUID()

  await query(
    `INSERT INTO servicos (
      id, nome, descricao, preco, duracao_minutos, 
      categoria_id, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, nome, descricao, preco, duracao_minutos, categoria_id || null, ativo],
  )

  return findById(id)
}

export const update = async (id, servicoData) => {
  const { nome, descricao, preco, duracao_minutos, categoria_id, ativo } = servicoData

  let sql = "UPDATE servicos SET "
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

  if (preco !== undefined) {
    updates.push("preco = ?")
    params.push(preco)
  }

  if (duracao_minutos !== undefined) {
    updates.push("duracao_minutos = ?")
    params.push(duracao_minutos)
  }

  if (categoria_id !== undefined) {
    updates.push("categoria_id = ?")
    params.push(categoria_id)
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
  await query("DELETE FROM servicos WHERE id = ?", [id])
  return true
}

export default {
  findAll,
  findById,
  findByFuncionario,
  create,
  update,
  remove,
}
