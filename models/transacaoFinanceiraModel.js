import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT * FROM transacoes_financeiras WHERE 1=1"
  const params = []

  if (filters.tipo) {
    sql += " AND tipo = ?"
    params.push(filters.tipo)
  }

  if (filters.categoria) {
    sql += " AND categoria = ?"
    params.push(filters.categoria)
  }

  if (filters.data_inicio && filters.data_fim) {
    sql += " AND DATE(data) BETWEEN ? AND ?"
    params.push(filters.data_inicio, filters.data_fim)
  } else if (filters.data_inicio) {
    sql += " AND DATE(data) >= ?"
    params.push(filters.data_inicio)
  } else if (filters.data_fim) {
    sql += " AND DATE(data) <= ?"
    params.push(filters.data_fim)
  }

  if (filters.agendamento_id) {
    sql += " AND agendamento_id = ?"
    params.push(filters.agendamento_id)
  }

  if (filters.assinatura_pacote_id) {
    sql += " AND assinatura_pacote_id = ?"
    params.push(filters.assinatura_pacote_id)
  }

  sql += " ORDER BY data DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query("SELECT * FROM transacoes_financeiras WHERE id = ?", [id])
  return result[0]
}

export const create = async (transacaoData) => {
  const { descricao, valor, data, tipo, categoria, agendamento_id = null, assinatura_pacote_id = null } = transacaoData

  const id = generateUUID()

  await query(
    `INSERT INTO transacoes_financeiras (
      id, descricao, valor, data, tipo, categoria, 
      agendamento_id, assinatura_pacote_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, descricao, valor, data, tipo, categoria, agendamento_id, assinatura_pacote_id],
  )

  return findById(id)
}

export const update = async (id, transacaoData) => {
  const { descricao, valor, data, tipo, categoria, agendamento_id, assinatura_pacote_id } = transacaoData

  let sql = "UPDATE transacoes_financeiras SET "
  const params = []
  const updates = []

  if (descricao) {
    updates.push("descricao = ?")
    params.push(descricao)
  }

  if (valor !== undefined) {
    updates.push("valor = ?")
    params.push(valor)
  }

  if (data) {
    updates.push("data = ?")
    params.push(data)
  }

  if (tipo) {
    updates.push("tipo = ?")
    params.push(tipo)
  }

  if (categoria) {
    updates.push("categoria = ?")
    params.push(categoria)
  }

  if (agendamento_id !== undefined) {
    updates.push("agendamento_id = ?")
    params.push(agendamento_id)
  }

  if (assinatura_pacote_id !== undefined) {
    updates.push("assinatura_pacote_id = ?")
    params.push(assinatura_pacote_id)
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
  await query("DELETE FROM transacoes_financeiras WHERE id = ?", [id])
  return true
}

export const getResumoFinanceiro = async (dataInicio, dataFim) => {
  const result = await query(
    `
    SELECT 
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas,
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) as saldo
    FROM transacoes_financeiras
    WHERE DATE(data) BETWEEN ? AND ?
  `,
    [dataInicio, dataFim],
  )

  return result[0]
}

export const getReceitasPorCategoria = async (dataInicio, dataFim) => {
  return await query(
    `
    SELECT categoria, SUM(valor) as total
    FROM transacoes_financeiras
    WHERE tipo = 'receita' AND DATE(data) BETWEEN ? AND ?
    GROUP BY categoria
    ORDER BY total DESC
  `,
    [dataInicio, dataFim],
  )
}

export const getDespesasPorCategoria = async (dataInicio, dataFim) => {
  return await query(
    `
    SELECT categoria, SUM(valor) as total
    FROM transacoes_financeiras
    WHERE tipo = 'despesa' AND DATE(data) BETWEEN ? AND ?
    GROUP BY categoria
    ORDER BY total DESC
  `,
    [dataInicio, dataFim],
  )
}

export default {
  findAll,
  findById,
  create,
  update,
  remove,
  getResumoFinanceiro,
  getReceitasPorCategoria,
  getDespesasPorCategoria,
}
