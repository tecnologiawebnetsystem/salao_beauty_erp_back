import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = "SELECT * FROM funcionarios WHERE 1=1"
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

  if (filters.cargo) {
    sql += " AND cargo = ?"
    params.push(filters.cargo)
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
  const result = await query("SELECT * FROM funcionarios WHERE id = ?", [id])
  return result[0]
}

export const findByEmail = async (email) => {
  const result = await query("SELECT * FROM funcionarios WHERE email = ?", [email])
  return result[0]
}

export const findByCpf = async (cpf) => {
  const result = await query("SELECT * FROM funcionarios WHERE cpf = ?", [cpf])
  return result[0]
}

export const create = async (funcionarioData) => {
  const {
    nome,
    email,
    telefone,
    cpf,
    endereco,
    data_nascimento,
    cargo,
    taxa_comissao,
    observacoes,
    imagem_perfil,
    ativo = 1,
  } = funcionarioData

  const id = generateUUID()

  await query(
    `INSERT INTO funcionarios (
      id, nome, email, telefone, cpf, endereco, 
      data_nascimento, cargo, taxa_comissao, observacoes, 
      imagem_perfil, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      nome,
      email,
      telefone,
      cpf || null,
      endereco || null,
      data_nascimento || null,
      cargo || "Cabeleireiro",
      taxa_comissao || 0,
      observacoes || null,
      imagem_perfil || null,
      ativo,
    ],
  )

  return findById(id)
}

export const update = async (id, funcionarioData) => {
  const {
    nome,
    email,
    telefone,
    cpf,
    endereco,
    data_nascimento,
    cargo,
    taxa_comissao,
    observacoes,
    imagem_perfil,
    ativo,
  } = funcionarioData

  let sql = "UPDATE funcionarios SET "
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

  if (cargo) {
    updates.push("cargo = ?")
    params.push(cargo)
  }

  if (taxa_comissao !== undefined) {
    updates.push("taxa_comissao = ?")
    params.push(taxa_comissao)
  }

  if (observacoes !== undefined) {
    updates.push("observacoes = ?")
    params.push(observacoes)
  }

  if (imagem_perfil !== undefined) {
    updates.push("imagem_perfil = ?")
    params.push(imagem_perfil)
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
  await query("DELETE FROM funcionarios WHERE id = ?", [id])
  return true
}

// Especialidades
export const getEspecialidades = async (funcionarioId) => {
  return await query("SELECT * FROM funcionarios_especialidades WHERE funcionario_id = ?", [funcionarioId])
}

export const addEspecialidade = async (funcionarioId, especialidade) => {
  const id = generateUUID()

  await query("INSERT INTO funcionarios_especialidades (id, funcionario_id, especialidade) VALUES (?, ?, ?)", [
    id,
    funcionarioId,
    especialidade,
  ])

  return { id, funcionario_id: funcionarioId, especialidade }
}

export const removeEspecialidade = async (id) => {
  await query("DELETE FROM funcionarios_especialidades WHERE id = ?", [id])
  return true
}

// Serviços
export const getServicos = async (funcionarioId) => {
  return await query(
    `
    SELECT s.*, c.nome as categoria_nome 
    FROM servicos s
    LEFT JOIN categorias_servicos c ON s.categoria_id = c.id
    JOIN funcionarios_servicos fs ON s.id = fs.servico_id
    WHERE fs.funcionario_id = ?
  `,
    [funcionarioId],
  )
}

export const addServico = async (funcionarioId, servicoId) => {
  await query("INSERT INTO funcionarios_servicos (funcionario_id, servico_id) VALUES (?, ?)", [
    funcionarioId,
    servicoId,
  ])

  return { funcionario_id: funcionarioId, servico_id: servicoId }
}

export const removeServico = async (funcionarioId, servicoId) => {
  await query("DELETE FROM funcionarios_servicos WHERE funcionario_id = ? AND servico_id = ?", [
    funcionarioId,
    servicoId,
  ])

  return true
}

// Horários de trabalho
export const getHorarios = async (funcionarioId) => {
  return await query(
    "SELECT * FROM horarios_trabalho WHERE funcionario_id = ? ORDER BY FIELD(dia_semana, 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'), hora_inicio",
    [funcionarioId],
  )
}

export const addHorario = async (horarioData) => {
  const { funcionario_id, dia_semana, hora_inicio, hora_fim } = horarioData

  const id = generateUUID()

  await query(
    "INSERT INTO horarios_trabalho (id, funcionario_id, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?)",
    [id, funcionario_id, dia_semana, hora_inicio, hora_fim],
  )

  return { id, funcionario_id, dia_semana, hora_inicio, hora_fim }
}

export const updateHorario = async (id, horarioData) => {
  const { dia_semana, hora_inicio, hora_fim } = horarioData

  await query("UPDATE horarios_trabalho SET dia_semana = ?, hora_inicio = ?, hora_fim = ? WHERE id = ?", [
    dia_semana,
    hora_inicio,
    hora_fim,
    id,
  ])

  const result = await query("SELECT * FROM horarios_trabalho WHERE id = ?", [id])
  return result[0]
}

export const removeHorario = async (id) => {
  await query("DELETE FROM horarios_trabalho WHERE id = ?", [id])
  return true
}

export default {
  findAll,
  findById,
  findByEmail,
  findByCpf,
  create,
  update,
  remove,
  getEspecialidades,
  addEspecialidade,
  removeEspecialidade,
  getServicos,
  addServico,
  removeServico,
  getHorarios,
  addHorario,
  updateHorario,
  removeHorario,
}
