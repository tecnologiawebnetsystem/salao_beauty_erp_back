import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT * FROM clientes WHERE 1=1"
  const params = []

  if (filters.nome) {
    sql += " AND nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.email) {
    sql += " AND email LIKE ?"
    params.push(`%${filters.email}%`)
  }

  if (filters.telefone) {
    sql += " AND telefone LIKE ?"
    params.push(`%${filters.telefone}%`)
  }

  if (filters.cpf) {
    sql += " AND cpf = ?"
    params.push(filters.cpf)
  }

  sql += " ORDER BY nome ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query("SELECT * FROM clientes WHERE id = ?", [id])
  return result[0]
}

export const findByEmail = async (email) => {
  const result = await query("SELECT * FROM clientes WHERE email = ?", [email])
  return result[0]
}

export const findByCpf = async (cpf) => {
  const result = await query("SELECT * FROM clientes WHERE cpf = ?", [cpf])
  return result[0]
}

export const create = async (clienteData) => {
  const { nome, email, telefone, cpf, endereco, data_nascimento, observacoes } = clienteData

  const id = generateUUID()

  await query(
    `INSERT INTO clientes (
      id, nome, email, telefone, cpf, endereco, 
      data_nascimento, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, nome, email, telefone, cpf || null, endereco || null, data_nascimento || null, observacoes || null],
  )

  return findById(id)
}

export const update = async (id, clienteData) => {
  const {
    nome,
    email,
    telefone,
    cpf,
    endereco,
    data_nascimento,
    observacoes,
    ultima_visita,
    total_gasto,
    qtd_agendamentos,
  } = clienteData

  let sql = "UPDATE clientes SET "
  const params = []
  const updates = []

  if (nome) {
    updates.push("nome = ?")
    params.push(nome)
  }

  if (email) {
    updates.push("email = ?")
    params.push(email)
  }

  if (telefone) {
    updates.push("telefone = ?")
    params.push(telefone)
  }

  if (cpf !== undefined) {
    updates.push("cpf = ?")
    params.push(cpf)
  }

  if (endereco !== undefined) {
    updates.push("endereco = ?")
    params.push(endereco)
  }

  if (data_nascimento !== undefined) {
    updates.push("data_nascimento = ?")
    params.push(data_nascimento)
  }

  if (observacoes !== undefined) {
    updates.push("observacoes = ?")
    params.push(observacoes)
  }

  if (ultima_visita !== undefined) {
    updates.push("ultima_visita = ?")
    params.push(ultima_visita)
  }

  if (total_gasto !== undefined) {
    updates.push("total_gasto = ?")
    params.push(total_gasto)
  }

  if (qtd_agendamentos !== undefined) {
    updates.push("qtd_agendamentos = ?")
    params.push(qtd_agendamentos)
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
  await query("DELETE FROM clientes WHERE id = ?", [id])
  return true
}

export const updateEstatisticas = async (id, { ultima_visita, valor_gasto }) => {
  const cliente = await findById(id)

  if (!cliente) {
    return false
  }

  const updates = []
  const params = []

  if (ultima_visita) {
    updates.push("ultima_visita = ?")
    params.push(ultima_visita)
  }

  if (valor_gasto) {
    updates.push("total_gasto = total_gasto + ?")
    params.push(valor_gasto)
  }

  updates.push("qtd_agendamentos = qtd_agendamentos + 1")

  const sql = `UPDATE clientes SET ${updates.join(", ")} WHERE id = ?`
  params.push(id)

  await query(sql, params)

  return findById(id)
}

export default {
  findAll,
  findById,
  findByEmail,
  findByCpf,
  create,
  update,
  remove,
  updateEstatisticas,
}
