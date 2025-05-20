import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT ap.*, c.nome as cliente_nome, p.nome as pacote_nome_original
    FROM assinaturas_pacote ap
    JOIN clientes c ON ap.cliente_id = c.id
    JOIN pacotes p ON ap.pacote_id = p.id
    WHERE 1=1
  `
  const params = []

  if (filters.cliente_id) {
    sql += " AND ap.cliente_id = ?"
    params.push(filters.cliente_id)
  }

  if (filters.pacote_id) {
    sql += " AND ap.pacote_id = ?"
    params.push(filters.pacote_id)
  }

  if (filters.status) {
    sql += " AND ap.status = ?"
    params.push(filters.status)
  }

  if (filters.data_inicio) {
    sql += " AND DATE(ap.data_inicio) = ?"
    params.push(filters.data_inicio)
  }

  if (filters.data_fim) {
    sql += " AND DATE(ap.data_fim) = ?"
    params.push(filters.data_fim)
  }

  if (filters.ativa !== undefined) {
    const hoje = new Date().toISOString().split("T")[0]
    if (filters.ativa) {
      sql += " AND ap.status = 'ativo' AND ap.data_fim >= ?"
      params.push(hoje)
    } else {
      sql += " AND (ap.status != 'ativo' OR ap.data_fim < ?)"
      params.push(hoje)
    }
  }

  sql += " ORDER BY ap.data_inicio DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query(
    `
    SELECT ap.*, c.nome as cliente_nome, p.nome as pacote_nome_original
    FROM assinaturas_pacote ap
    JOIN clientes c ON ap.cliente_id = c.id
    JOIN pacotes p ON ap.pacote_id = p.id
    WHERE ap.id = ?
  `,
    [id],
  )
  return result[0]
}

export const findByCliente = async (clienteId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT ap.*, p.nome as pacote_nome_original
    FROM assinaturas_pacote ap
    JOIN pacotes p ON ap.pacote_id = p.id
    WHERE ap.cliente_id = ?
  `
  const params = [clienteId]

  if (filters.status) {
    sql += " AND ap.status = ?"
    params.push(filters.status)
  }

  if (filters.ativa !== undefined) {
    const hoje = new Date().toISOString().split("T")[0]
    if (filters.ativa) {
      sql += " AND ap.status = 'ativo' AND ap.data_fim >= ?"
      params.push(hoje)
    } else {
      sql += " AND (ap.status != 'ativo' OR ap.data_fim < ?)"
      params.push(hoje)
    }
  }

  sql += " ORDER BY ap.data_inicio DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const create = async (assinaturaData) => {
  const { cliente_id, pacote_id, nome_pacote, data_inicio, data_fim, preco, status = "ativo" } = assinaturaData

  const id = generateUUID()

  await query(
    `INSERT INTO assinaturas_pacote (
      id, cliente_id, pacote_id, nome_pacote, 
      data_inicio, data_fim, preco, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, cliente_id, pacote_id, nome_pacote, data_inicio, data_fim, preco, status],
  )

  return findById(id)
}

export const update = async (id, assinaturaData) => {
  const { data_inicio, data_fim, preco, status } = assinaturaData

  let sql = "UPDATE assinaturas_pacote SET "
  const params = []
  const updates = []

  if (data_inicio) {
    updates.push("data_inicio = ?")
    params.push(data_inicio)
  }

  if (data_fim) {
    updates.push("data_fim = ?")
    params.push(data_fim)
  }

  if (preco !== undefined) {
    updates.push("preco = ?")
    params.push(preco)
  }

  if (status) {
    updates.push("status = ?")
    params.push(status)
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
  await query("DELETE FROM assinaturas_pacote WHERE id = ?", [id])
  return true
}

// Usos do pacote
export const getUsos = async (assinaturaId) => {
  return await query(
    `
    SELECT up.*, s.nome as servico_nome_atual, a.data_hora
    FROM usos_pacote up
    JOIN servicos s ON up.servico_id = s.id
    JOIN agendamentos a ON up.agendamento_id = a.id
    WHERE up.assinatura_pacote_id = ?
    ORDER BY up.data_uso DESC
  `,
    [assinaturaId],
  )
}

export const addUso = async (usoData) => {
  const { assinatura_pacote_id, servico_id, servico_nome, data_uso, agendamento_id } = usoData

  const id = generateUUID()

  await query(
    `INSERT INTO usos_pacote (
      id, assinatura_pacote_id, servico_id, servico_nome, 
      data_uso, agendamento_id
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, assinatura_pacote_id, servico_id, servico_nome, data_uso, agendamento_id],
  )

  const result = await query(
    `
    SELECT up.*, s.nome as servico_nome_atual, a.data_hora
    FROM usos_pacote up
    JOIN servicos s ON up.servico_id = s.id
    JOIN agendamentos a ON up.agendamento_id = a.id
    WHERE up.id = ?
  `,
    [id],
  )

  return result[0]
}

export const removeUso = async (id) => {
  await query("DELETE FROM usos_pacote WHERE id = ?", [id])
  return true
}

export default {
  findAll,
  findById,
  findByCliente,
  create,
  update,
  remove,
  getUsos,
  addUso,
  removeUso,
}
