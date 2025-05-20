import { query, generateUUID } from "../config/database.js"
import bcrypt from "bcrypt"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT id, nome, email, tipo, ativo, data_criacao, data_atualizacao FROM usuarios WHERE 1=1"
  const params = []

  if (filters.nome) {
    sql += " AND nome LIKE ?"
    params.push(`%${filters.nome}%`)
  }

  if (filters.email) {
    sql += " AND email LIKE ?"
    params.push(`%${filters.email}%`)
  }

  if (filters.tipo) {
    sql += " AND tipo = ?"
    params.push(filters.tipo)
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
  const result = await query(
    "SELECT id, nome, email, tipo, ativo, data_criacao, data_atualizacao FROM usuarios WHERE id = ?",
    [id],
  )
  return result[0]
}

export const findByEmail = async (email) => {
  const result = await query("SELECT * FROM usuarios WHERE email = ?", [email])
  return result[0]
}

export const create = async (userData) => {
  const { nome, email, senha, tipo = "funcionario" } = userData

  // Hash da senha
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(senha, salt)

  const id = generateUUID()

  await query("INSERT INTO usuarios (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)", [
    id,
    nome,
    email,
    hashedPassword,
    tipo,
  ])

  return findById(id)
}

export const update = async (id, userData) => {
  const { nome, email, tipo, ativo } = userData

  let sql = "UPDATE usuarios SET "
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

  if (tipo) {
    updates.push("tipo = ?")
    params.push(tipo)
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

export const updatePassword = async (id, newPassword) => {
  // Hash da nova senha
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)

  await query("UPDATE usuarios SET senha = ? WHERE id = ?", [hashedPassword, id])

  return true
}

export const remove = async (id) => {
  await query("DELETE FROM usuarios WHERE id = ?", [id])
  return true
}

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  updatePassword,
  remove,
  comparePassword,
}
