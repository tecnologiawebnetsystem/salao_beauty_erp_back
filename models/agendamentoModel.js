import { query, generateUUID } from "../config/database.js"

export const findAll = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT a.*, 
      c.nome as cliente_nome, 
      s.nome as servico_nome, 
      f.nome as funcionario_nome
    FROM agendamentos a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN servicos s ON a.servico_id = s.id
    JOIN funcionarios f ON a.funcionario_id = f.id
    WHERE 1=1
  `
  const params = []

  if (filters.cliente_id) {
    sql += " AND a.cliente_id = ?"
    params.push(filters.cliente_id)
  }

  if (filters.funcionario_id) {
    sql += " AND a.funcionario_id = ?"
    params.push(filters.funcionario_id)
  }

  if (filters.servico_id) {
    sql += " AND a.servico_id = ?"
    params.push(filters.servico_id)
  }

  if (filters.status) {
    sql += " AND a.status = ?"
    params.push(filters.status)
  }

  if (filters.data) {
    sql += " AND DATE(a.data_hora) = ?"
    params.push(filters.data)
  }

  if (filters.data_inicio && filters.data_fim) {
    sql += " AND DATE(a.data_hora) BETWEEN ? AND ?"
    params.push(filters.data_inicio, filters.data_fim)
  } else if (filters.data_inicio) {
    sql += " AND DATE(a.data_hora) >= ?"
    params.push(filters.data_inicio)
  } else if (filters.data_fim) {
    sql += " AND DATE(a.data_hora) <= ?"
    params.push(filters.data_fim)
  }

  if (filters.pago !== undefined) {
    sql += " AND a.pago = ?"
    params.push(filters.pago)
  }

  sql += " ORDER BY a.data_hora DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findById = async (id) => {
  const result = await query(
    `
    SELECT a.*, 
      c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email,
      s.nome as servico_nome, s.preco as servico_preco, s.duracao_minutos,
      f.nome as funcionario_nome
    FROM agendamentos a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN servicos s ON a.servico_id = s.id
    JOIN funcionarios f ON a.funcionario_id = f.id
    WHERE a.id = ?
  `,
    [id],
  )
  return result[0]
}

export const findByCliente = async (clienteId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT a.*, 
      s.nome as servico_nome, 
      f.nome as funcionario_nome
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    JOIN funcionarios f ON a.funcionario_id = f.id
    WHERE a.cliente_id = ?
  `
  const params = [clienteId]

  if (filters.status) {
    sql += " AND a.status = ?"
    params.push(filters.status)
  }

  if (filters.data_inicio && filters.data_fim) {
    sql += " AND DATE(a.data_hora) BETWEEN ? AND ?"
    params.push(filters.data_inicio, filters.data_fim)
  } else if (filters.data_inicio) {
    sql += " AND DATE(a.data_hora) >= ?"
    params.push(filters.data_inicio)
  } else if (filters.data_fim) {
    sql += " AND DATE(a.data_hora) <= ?"
    params.push(filters.data_fim)
  }

  sql += " ORDER BY a.data_hora DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const findByFuncionario = async (funcionarioId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit

  let sql = `
    SELECT a.*, 
      c.nome as cliente_nome, 
      s.nome as servico_nome
    FROM agendamentos a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN servicos s ON a.servico_id = s.id
    WHERE a.funcionario_id = ?
  `
  const params = [funcionarioId]

  if (filters.status) {
    sql += " AND a.status = ?"
    params.push(filters.status)
  }

  if (filters.data) {
    sql += " AND DATE(a.data_hora) = ?"
    params.push(filters.data)
  }

  if (filters.data_inicio && filters.data_fim) {
    sql += " AND DATE(a.data_hora) BETWEEN ? AND ?"
    params.push(filters.data_inicio, filters.data_fim)
  } else if (filters.data_inicio) {
    sql += " AND DATE(a.data_hora) >= ?"
    params.push(filters.data_inicio)
  } else if (filters.data_fim) {
    sql += " AND DATE(a.data_hora) <= ?"
    params.push(filters.data_fim)
  }

  sql += " ORDER BY a.data_hora ASC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  return await query(sql, params)
}

export const create = async (agendamentoData) => {
  const {
    cliente_id,
    servico_id,
    funcionario_id,
    data_hora,
    status = "agendado",
    assinatura_pacote_id = null,
    observacoes = null,
    pago = 0,
    valor_pago = null,
  } = agendamentoData

  const id = generateUUID()

  await query(
    `INSERT INTO agendamentos (
      id, cliente_id, servico_id, funcionario_id, 
      data_hora, status, assinatura_pacote_id, 
      observacoes, pago, valor_pago
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      cliente_id,
      servico_id,
      funcionario_id,
      data_hora,
      status,
      assinatura_pacote_id,
      observacoes,
      pago,
      valor_pago,
    ],
  )

  return findById(id)
}

export const update = async (id, agendamentoData) => {
  const { servico_id, funcionario_id, data_hora, status, assinatura_pacote_id, observacoes, pago, valor_pago } =
    agendamentoData

  let sql = "UPDATE agendamentos SET "
  const params = []
  const updates = []

  if (servico_id) {
    updates.push("servico_id = ?")
    params.push(servico_id)
  }

  if (funcionario_id) {
    updates.push("funcionario_id = ?")
    params.push(funcionario_id)
  }

  if (data_hora) {
    updates.push("data_hora = ?")
    params.push(data_hora)
  }

  if (status) {
    updates.push("status = ?")
    params.push(status)
  }

  if (assinatura_pacote_id !== undefined) {
    updates.push("assinatura_pacote_id = ?")
    params.push(assinatura_pacote_id)
  }

  if (observacoes !== undefined) {
    updates.push("observacoes = ?")
    params.push(observacoes)
  }

  if (pago !== undefined) {
    updates.push("pago = ?")
    params.push(pago)
  }

  if (valor_pago !== undefined) {
    updates.push("valor_pago = ?")
    params.push(valor_pago)
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
  await query("DELETE FROM agendamentos WHERE id = ?", [id])
  return true
}

export const verificarDisponibilidade = async (funcionarioId, servicoId, data) => {
  // Obter duração do serviço
  const servicos = await query("SELECT * FROM servicos WHERE id = ?", [servicoId])
  if (servicos.length === 0) {
    throw new Error("Serviço não encontrado")
  }

  const servico = servicos[0]
  const duracaoServico = servico.duracao_minutos

  // Obter horários de trabalho do funcionário para o dia da semana
  const diaSemana = new Date(data).toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0].trim()
  const diasSemanaMap = {
    domingo: "domingo",
    segunda: "segunda",
    terça: "terca",
    quarta: "quarta",
    quinta: "quinta",
    sexta: "sexta",
    sábado: "sabado",
  }

  const horariosFuncionario = await query(
    "SELECT * FROM horarios_trabalho WHERE funcionario_id = ? AND dia_semana = ?",
    [funcionarioId, diasSemanaMap[diaSemana]],
  )

  if (horariosFuncionario.length === 0) {
    return { disponivel: false, mensagem: "Funcionário não trabalha neste dia da semana" }
  }

  // Obter agendamentos do funcionário na data especificada
  const agendamentos = await query(
    `
    SELECT a.*, s.duracao_minutos 
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    WHERE a.funcionario_id = ? 
    AND DATE(a.data_hora) = ?
    AND a.status NOT IN ('cancelado', 'faltou')
    ORDER BY a.data_hora
  `,
    [funcionarioId, data],
  )

  // Criar slots disponíveis com base nos horários de trabalho
  const slotsDisponiveis = []

  for (const horario of horariosFuncionario) {
    const [horaInicio, minutoInicio] = horario.hora_inicio.split(":")
    const [horaFim, minutoFim] = horario.hora_fim.split(":")

    const inicioTrabalho = new Date(data)
    inicioTrabalho.setHours(Number.parseInt(horaInicio, 10), Number.parseInt(minutoInicio, 10), 0, 0)

    const fimTrabalho = new Date(data)
    fimTrabalho.setHours(Number.parseInt(horaFim, 10), Number.parseInt(minutoFim, 10), 0, 0)

    // Criar slots de 30 minutos
    const slots = []
    let slotAtual = new Date(inicioTrabalho)

    while (slotAtual.getTime() + duracaoServico * 60000 <= fimTrabalho.getTime()) {
      const fimSlot = new Date(slotAtual.getTime() + duracaoServico * 60000)
      let disponivel = true

      // Verificar se o slot está disponível (não conflita com agendamentos existentes)
      for (const agendamento of agendamentos) {
        const inicioAgendamento = new Date(agendamento.data_hora)
        const fimAgendamento = new Date(inicioAgendamento.getTime() + agendamento.duracao_minutos * 60000)

        // Verificar sobreposição
        if (
          (slotAtual < fimAgendamento && fimSlot > inicioAgendamento) ||
          (inicioAgendamento < fimSlot && fimAgendamento > slotAtual)
        ) {
          disponivel = false
          break
        }
      }

      if (disponivel) {
        slots.push({
          inicio: slotAtual.toISOString(),
          fim: fimSlot.toISOString(),
        })
      }

      // Avançar para o próximo slot (30 minutos)
      slotAtual = new Date(slotAtual.getTime() + 30 * 60000)
    }

    slotsDisponiveis.push(...slots)
  }

  return {
    disponivel: slotsDisponiveis.length > 0,
    slots: slotsDisponiveis,
  }
}

export default {
  findAll,
  findById,
  findByCliente,
  findByFuncionario,
  create,
  update,
  remove,
  verificarDisponibilidade,
}
