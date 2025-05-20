import agendamentoModel from "../models/agendamentoModel.js"
import clienteModel from "../models/clienteModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Listar todos os agendamentos
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por cliente
 *       - in: query
 *         name: funcionario_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por funcionário
 *       - in: query
 *         name: servico_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por serviço
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, concluido, cancelado, faltou]
 *         description: Filtrar por status
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data específica
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data inicial
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data final
 *       - in: query
 *         name: pago
 *         schema:
 *           type: boolean
 *         description: Filtrar por status de pagamento
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *       401:
 *         description: Não autorizado
 */
export const getAllAgendamentos = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      cliente_id: req.query.cliente_id,
      funcionario_id: req.query.funcionario_id,
      servico_id: req.query.servico_id,
      status: req.query.status,
      data: req.query.data,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
      pago: req.query.pago !== undefined ? Number(req.query.pago) : undefined,
    }

    const agendamentos = await agendamentoModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await agendamentoModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: agendamentos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: agendamentos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Obter agendamento por ID
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados do agendamento
 *       404:
 *         description: Agendamento não encontrado
 */
export const getAgendamentoById = async (req, res, next) => {
  try {
    const id = req.params.id

    const agendamento = await agendamentoModel.findById(id)

    if (!agendamento) {
      throw new ApiError("Agendamento não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: agendamento,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/cliente/{clienteId}:
 *   get:
 *     summary: Listar agendamentos por cliente
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, concluido, cancelado, faltou]
 *         description: Filtrar por status
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data inicial
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data final
 *     responses:
 *       200:
 *         description: Lista de agendamentos do cliente
 *       404:
 *         description: Cliente não encontrado
 */
export const getAgendamentosByCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.clienteId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      status: req.query.status,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
    }

    const agendamentos = await agendamentoModel.findByCliente(clienteId, filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await agendamentoModel.findByCliente(clienteId, countFilters)).length

    res.status(200).json({
      success: true,
      count: agendamentos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: agendamentos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/funcionario/{funcionarioId}:
 *   get:
 *     summary: Listar agendamentos por funcionário
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: funcionarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, concluido, cancelado, faltou]
 *         description: Filtrar por status
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data específica
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data inicial
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data final
 *     responses:
 *       200:
 *         description: Lista de agendamentos do funcionário
 *       404:
 *         description: Funcionário não encontrado
 */
export const getAgendamentosByFuncionario = async (req, res, next) => {
  try {
    const funcionarioId = req.params.funcionarioId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      status: req.query.status,
      data: req.query.data,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
    }

    const agendamentos = await agendamentoModel.findByFuncionario(funcionarioId, filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await agendamentoModel.findByFuncionario(funcionarioId, countFilters)).length

    res.status(200).json({
      success: true,
      count: agendamentos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: agendamentos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Criar novo agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - servico_id
 *               - funcionario_id
 *               - data_hora
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               servico_id:
 *                 type: string
 *                 format: uuid
 *               funcionario_id:
 *                 type: string
 *                 format: uuid
 *               data_hora:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [agendado, confirmado, concluido, cancelado, faltou]
 *                 default: agendado
 *               assinatura_pacote_id:
 *                 type: string
 *                 format: uuid
 *               observacoes:
 *                 type: string
 *               pago:
 *                 type: boolean
 *                 default: false
 *               valor_pago:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente, serviço ou funcionário não encontrado
 *       409:
 *         description: Conflito de horário
 */
export const createAgendamento = async (req, res, next) => {
  try {
    const {
      cliente_id,
      servico_id,
      funcionario_id,
      data_hora,
      status = "agendado",
      assinatura_pacote_id,
      observacoes,
      pago = 0,
      valor_pago,
    } = req.body

    // Validação básica
    if (!cliente_id || !servico_id || !funcionario_id || !data_hora) {
      throw new ApiError("Cliente, serviço, funcionário e data/hora são obrigatórios", 400)
    }

    // Verificar disponibilidade
    const disponibilidade = await agendamentoModel.verificarDisponibilidade(
      funcionario_id,
      servico_id,
      new Date(data_hora).toISOString().split("T")[0],
    )

    if (!disponibilidade.disponivel) {
      throw new ApiError("Horário indisponível para este funcionário. " + (disponibilidade.mensagem || ""), 409)
    }

    // Verificar se o horário específico está disponível
    const dataHoraAgendamento = new Date(data_hora)
    let horarioDisponivel = false

    for (const slot of disponibilidade.slots) {
      const inicioSlot = new Date(slot.inicio)
      const fimSlot = new Date(slot.fim)

      if (dataHoraAgendamento >= inicioSlot && dataHoraAgendamento < fimSlot) {
        horarioDisponivel = true
        break
      }
    }

    if (!horarioDisponivel) {
      throw new ApiError("Horário específico não disponível para este funcionário", 409)
    }

    // Criar agendamento
    const agendamento = await agendamentoModel.create({
      cliente_id,
      servico_id,
      funcionario_id,
      data_hora,
      status,
      assinatura_pacote_id,
      observacoes,
      pago,
      valor_pago,
    })

    // Atualizar estatísticas do cliente
    await clienteModel.updateEstatisticas(cliente_id, {
      ultima_visita: data_hora,
      valor_gasto: valor_pago,
    })

    res.status(201).json({
      success: true,
      message: "Agendamento criado com sucesso",
      data: agendamento,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     summary: Atualizar agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               servico_id:
 *                 type: string
 *                 format: uuid
 *               funcionario_id:
 *                 type: string
 *                 format: uuid
 *               data_hora:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [agendado, confirmado, concluido, cancelado, faltou]
 *               assinatura_pacote_id:
 *                 type: string
 *                 format: uuid
 *               observacoes:
 *                 type: string
 *               pago:
 *                 type: boolean
 *               valor_pago:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Agendamento não encontrado
 *       409:
 *         description: Conflito de horário
 */
export const updateAgendamento = async (req, res, next) => {
  try {
    const id = req.params.id
    const { servico_id, funcionario_id, data_hora, status, assinatura_pacote_id, observacoes, pago, valor_pago } =
      req.body

    // Verificar se o agendamento existe
    const agendamento = await agendamentoModel.findById(id)
    if (!agendamento) {
      throw new ApiError("Agendamento não encontrado", 404)
    }

    // Se estiver alterando funcionário, serviço ou data/hora, verificar disponibilidade
    if (
      (funcionario_id && funcionario_id !== agendamento.funcionario_id) ||
      (servico_id && servico_id !== agendamento.servico_id) ||
      (data_hora && data_hora !== agendamento.data_hora)
    ) {
      const novoFuncionarioId = funcionario_id || agendamento.funcionario_id
      const novoServicoId = servico_id || agendamento.servico_id
      const novaDataHora = data_hora || agendamento.data_hora

      const disponibilidade = await agendamentoModel.verificarDisponibilidade(
        novoFuncionarioId,
        novoServicoId,
        new Date(novaDataHora).toISOString().split("T")[0],
      )

      if (!disponibilidade.disponivel) {
        throw new ApiError("Horário indisponível para este funcionário. " + (disponibilidade.mensagem || ""), 409)
      }

      // Verificar se o horário específico está disponível
      const dataHoraAgendamento = new Date(novaDataHora)
      let horarioDisponivel = false

      for (const slot of disponibilidade.slots) {
        const inicioSlot = new Date(slot.inicio)
        const fimSlot = new Date(slot.fim)

        if (dataHoraAgendamento >= inicioSlot && dataHoraAgendamento < fimSlot) {
          horarioDisponivel = true
          break
        }
      }

      if (!horarioDisponivel) {
        throw new ApiError("Horário específico não disponível para este funcionário", 409)
      }
    }

    // Atualizar agendamento
    const updatedAgendamento = await agendamentoModel.update(id, {
      servico_id,
      funcionario_id,
      data_hora,
      status,
      assinatura_pacote_id,
      observacoes,
      pago,
      valor_pago,
    })

    // Se o status foi alterado para concluído e não estava antes, atualizar estatísticas do cliente
    if (status === "concluido" && agendamento.status !== "concluido") {
      await clienteModel.updateEstatisticas(agendamento.cliente_id, {
        ultima_visita: agendamento.data_hora,
        valor_gasto: valor_pago || agendamento.valor_pago,
      })
    }

    res.status(200).json({
      success: true,
      message: "Agendamento atualizado com sucesso",
      data: updatedAgendamento,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Excluir agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agendamento excluído com sucesso
 *       404:
 *         description: Agendamento não encontrado
 */
export const deleteAgendamento = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o agendamento existe
    const agendamento = await agendamentoModel.findById(id)
    if (!agendamento) {
      throw new ApiError("Agendamento não encontrado", 404)
    }

    // Excluir agendamento
    await agendamentoModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Agendamento excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /agendamentos/disponibilidade:
 *   get:
 *     summary: Verificar disponibilidade de horários
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: funcionario_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do funcionário
 *       - in: query
 *         name: servico_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do serviço
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data para verificar disponibilidade (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Horários disponíveis
 *       400:
 *         description: Parâmetros inválidos
 */
export const verificarDisponibilidade = async (req, res, next) => {
  try {
    const { funcionario_id, servico_id, data } = req.query

    if (!funcionario_id || !servico_id || !data) {
      throw new ApiError("Funcionário, serviço e data são obrigatórios", 400)
    }

    const disponibilidade = await agendamentoModel.verificarDisponibilidade(funcionario_id, servico_id, data)

    res.status(200).json({
      success: true,
      data: disponibilidade,
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllAgendamentos,
  getAgendamentoById,
  getAgendamentosByCliente,
  getAgendamentosByFuncionario,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  verificarDisponibilidade,
}
