import transacaoFinanceiraModel from "../models/transacaoFinanceiraModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /transacoes:
 *   get:
 *     summary: Listar todas as transações financeiras
 *     tags: [Transações Financeiras]
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
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [receita, despesa]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
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
 *         name: agendamento_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por agendamento
 *       - in: query
 *         name: assinatura_pacote_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por assinatura de pacote
 *     responses:
 *       200:
 *         description: Lista de transações financeiras
 *       401:
 *         description: Não autorizado
 */
export const getAllTransacoes = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      tipo: req.query.tipo,
      categoria: req.query.categoria,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
      agendamento_id: req.query.agendamento_id,
      assinatura_pacote_id: req.query.assinatura_pacote_id,
    }

    const transacoes = await transacaoFinanceiraModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await transacaoFinanceiraModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: transacoes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transacoes,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /transacoes/{id}:
 *   get:
 *     summary: Obter transação por ID
 *     tags: [Transações Financeiras]
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
 *         description: Dados da transação
 *       404:
 *         description: Transação não encontrada
 */
export const getTransacaoById = async (req, res, next) => {
  try {
    const id = req.params.id

    const transacao = await transacaoFinanceiraModel.findById(id)

    if (!transacao) {
      throw new ApiError("Transação não encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: transacao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /transacoes:
 *   post:
 *     summary: Criar nova transação financeira
 *     tags: [Transações Financeiras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descricao
 *               - valor
 *               - data
 *               - tipo
 *               - categoria
 *             properties:
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *                 format: float
 *               data:
 *                 type: string
 *                 format: date-time
 *               tipo:
 *                 type: string
 *                 enum: [receita, despesa]
 *               categoria:
 *                 type: string
 *               agendamento_id:
 *                 type: string
 *                 format: uuid
 *               assinatura_pacote_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
export const createTransacao = async (req, res, next) => {
  try {
    const { descricao, valor, data, tipo, categoria, agendamento_id, assinatura_pacote_id } = req.body

    // Validação básica
    if (!descricao || !valor || !data || !tipo || !categoria) {
      throw new ApiError("Descrição, valor, data, tipo e categoria são obrigatórios", 400)
    }

    // Criar transação
    const transacao = await transacaoFinanceiraModel.create({
      descricao,
      valor,
      data,
      tipo,
      categoria,
      agendamento_id,
      assinatura_pacote_id,
    })

    res.status(201).json({
      success: true,
      message: "Transação criada com sucesso",
      data: transacao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /transacoes/{id}:
 *   put:
 *     summary: Atualizar transação financeira
 *     tags: [Transações Financeiras]
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
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *                 format: float
 *               data:
 *                 type: string
 *                 format: date-time
 *               tipo:
 *                 type: string
 *                 enum: [receita, despesa]
 *               categoria:
 *                 type: string
 *               agendamento_id:
 *                 type: string
 *                 format: uuid
 *               assinatura_pacote_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Transação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Transação não encontrada
 */
export const updateTransacao = async (req, res, next) => {
  try {
    const id = req.params.id
    const { descricao, valor, data, tipo, categoria, agendamento_id, assinatura_pacote_id } = req.body

    // Verificar se a transação existe
    const transacao = await transacaoFinanceiraModel.findById(id)
    if (!transacao) {
      throw new ApiError("Transação não encontrada", 404)
    }

    // Atualizar transação
    const updatedTransacao = await transacaoFinanceiraModel.update(id, {
      descricao,
      valor,
      data,
      tipo,
      categoria,
      agendamento_id,
      assinatura_pacote_id,
    })

    res.status(200).json({
      success: true,
      message: "Transação atualizada com sucesso",
      data: updatedTransacao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /transacoes/{id}:
 *   delete:
 *     summary: Excluir transação financeira
 *     tags: [Transações Financeiras]
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
 *         description: Transação excluída com sucesso
 *       404:
 *         description: Transação não encontrada
 */
export const deleteTransacao = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se a transação existe
    const transacao = await transacaoFinanceiraModel.findById(id)
    if (!transacao) {
      throw new ApiError("Transação não encontrada", 404)
    }

    // Excluir transação
    await transacaoFinanceiraModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Transação excluída com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /transacoes/resumo:
 *   get:
 *     summary: Obter resumo financeiro
 *     tags: [Transações Financeiras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: data_fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Resumo financeiro
 *       400:
 *         description: Parâmetros inválidos
 */
export const getResumoFinanceiro = async (req, res, next) => {
  try {
    const { data_inicio, data_fim } = req.query

    if (!data_inicio || !data_fim) {
      throw new ApiError("Data inicial e final são obrigatórias", 400)
    }

    const resumo = await transacaoFinanceiraModel.getResumoFinanceiro(data_inicio, data_fim)
    const receitasPorCategoria = await transacaoFinanceiraModel.getReceitasPorCategoria(data_inicio, data_fim)
    const despesasPorCategoria = await transacaoFinanceiraModel.getDespesasPorCategoria(data_inicio, data_fim)

    res.status(200).json({
      success: true,
      data: {
        resumo,
        receitas_por_categoria: receitasPorCategoria,
        despesas_por_categoria: despesasPorCategoria,
      },
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllTransacoes,
  getTransacaoById,
  createTransacao,
  updateTransacao,
  deleteTransacao,
  getResumoFinanceiro,
}
