import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT * FROM pacotes WHERE 1=1"
  const params = []

  if (filters.nome) {
    sql += " AND nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.ativo !== undefined) {
    sql += " AND ativo = ?"
    params.push(filters.ativo)
  }

  if (filters.preco_min !== undefined) {
    sql += " AND preco_pacote >= ?"
    params.push(filters.preco_min)
  }

  if (filters.preco_max !== undefined) {
    sql += " AND preco_pacote <= ?"
    params.push(filters.preco_max)
  }

  sql += " ORDER BY nome ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query("SELECT * FROM pacotes WHERE id = ?", [id])
  return result[0]
}

export const create = async (pacoteData) => {
  const { nome, descricao, preco_pacote, preco_regular, validade_dias, ativo = 1 } = pacoteData

  const id = generateUUID()

  await query(
    "INSERT INTO pacotes (id, nome, descricao, preco_pacote, preco_regular, validade_dias, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, nome, descricao, preco_pacote, preco_regular, validade_dias, ativo],
  )

  return findById(id)
}

export const update = async (id, pacoteData) => {
  const { nome, descricao, preco_pacote, preco_regular, validade_dias, ativo } = pacoteData

  let sql = "UPDATE pacotes SET "
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

  if (preco_pacote !== undefined) {
    updates.push("preco_pacote = ?")
    params.push(preco_pacote)
  }

  if (preco_regular !== undefined) {
    updates.push("preco_regular = ?")
    params.push(preco_regular)
  }

  if (validade_dias !== undefined) {
    updates.push("validade_dias = ?")
    params.push(validade_dias)
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
  await query("DELETE FROM pacotes WHERE id = ?", [id])
  return true
}

// Itens do pacote
export const getItens = async (pacoteId) => {
  return await query(
    `
    SELECT ip.*, s.nome as servico_nome, s.preco, s.duracao_minutos
    FROM itens_pacote ip
    JOIN servicos s ON ip.servico_id = s.id
    WHERE ip.pacote_id = ?
  `,
    [pacoteId],
  )
}

export const addItem = async (itemData) => {
  const { pacote_id, servico_id, quantidade = 1 } = itemData

  const id = generateUUID()

  await query("INSERT INTO itens_pacote (id, pacote_id, servico_id, quantidade) VALUES (?, ?, ?, ?)", [
    id,
    pacote_id,
    servico_id,
    quantidade,
  ])

  const result = await query(
    `
    SELECT ip.*, s.nome as servico_nome, s.preco, s.duracao_minutos
    FROM itens_pacote ip
    JOIN servicos s ON ip.servico_id = s.id
    WHERE ip.id = ?
  `,
    [id],
  )

  return result[0]
}

export const updateItem = async (id, itemData) => {
  const { quantidade } = itemData

  await query("UPDATE itens_pacote SET quantidade = ? WHERE id = ?", [quantidade, id])

  const result = await query(
    `
    SELECT ip.*, s.nome as servico_nome, s.preco, s.duracao_minutos
    FROM itens_pacote ip
    JOIN servicos s ON ip.servico_id = s.id
    WHERE ip.id = ?
  `,
    [id],
  )

  return result[0]
}

export const removeItem = async (id) => {
  await query("DELETE FROM itens_pacote WHERE id = ?", [id])
  return true
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
  getItens,
  addItem,
  updateItem,
  removeItem,
}
