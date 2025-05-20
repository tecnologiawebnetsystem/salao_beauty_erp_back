import assinaturaPacoteModel from "../models/assinaturaPacoteModel.js"
import pacoteModel from "../models/pacoteModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /assinaturas:
 *   get:
 *     summary: Listar todas as assinaturas de pacotes
 *     tags: [Assinaturas]
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
 *         name: pacote_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por pacote
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, expirado, cancelado]
 *         description: Filtrar por status
 *       - in: query
 *         name: ativa
 *         schema:
 *           type: boolean
 *         description: Filtrar por assinaturas ativas (true) ou inativas (false)
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de início
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de fim
 *     responses:
 *       200:
 *         description: Lista de assinaturas
 *       401:
 *         description: Não autorizado
 */
export const getAllAssinaturas = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      cliente_id: req.query.cliente_id,
      pacote_id: req.query.pacote_id,
      status: req.query.status,
      ativa: req.query.ativa !== undefined ? req.query.ativa === "true" : undefined,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
    }

    const assinaturas = await assinaturaPacoteModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await assinaturaPacoteModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: assinaturas.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: assinaturas,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/{id}:
 *   get:
 *     summary: Obter assinatura por ID
 *     tags: [Assinaturas]
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
 *         description: Dados da assinatura
 *       404:
 *         description: Assinatura não encontrada
 */
export const getAssinaturaById = async (req, res, next) => {
  try {
    const id = req.params.id

    const assinatura = await assinaturaPacoteModel.findById(id)

    if (!assinatura) {
      throw new ApiError("Assinatura não encontrada", 404)
    }

    // Obter usos da assinatura
    const usos = await assinaturaPacoteModel.getUsos(id)

    res.status(200).json({
      success: true,
      data: {
        ...assinatura,
        usos,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/cliente/{clienteId}:
 *   get:
 *     summary: Listar assinaturas por cliente
 *     tags: [Assinaturas]
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
 *           enum: [ativo, expirado, cancelado]
 *         description: Filtrar por status
 *       - in: query
 *         name: ativa
 *         schema:
 *           type: boolean
 *         description: Filtrar por assinaturas ativas (true) ou inativas (false)
 *     responses:
 *       200:
 *         description: Lista de assinaturas do cliente
 *       404:
 *         description: Cliente não encontrado
 */
export const getAssinaturasByCliente = async (req, res, next) => {
  try {
    const clienteId = req.params.clienteId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      status: req.query.status,
      ativa: req.query.ativa !== undefined ? req.query.ativa === "true" : undefined,
    }

    const assinaturas = await assinaturaPacoteModel.findByCliente(clienteId, filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await assinaturaPacoteModel.findByCliente(clienteId, countFilters)).length

    res.status(200).json({
      success: true,
      count: assinaturas.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: assinaturas,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas:
 *   post:
 *     summary: Criar nova assinatura
 *     tags: [Assinaturas]
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
 *               - pacote_id
 *               - data_inicio
 *             properties:
 *               cliente_id:
 *                 type: string
 *                 format: uuid
 *               pacote_id:
 *                 type: string
 *                 format: uuid
 *               data_inicio:
 *                 type: string
 *                 format: date-time
 *               preco:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *                 enum: [ativo, expirado, cancelado]
 *                 default: ativo
 *     responses:
 *       201:
 *         description: Assinatura criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente ou pacote não encontrado
 */
export const createAssinatura = async (req, res, next) => {
  try {
    const { cliente_id, pacote_id, data_inicio, preco, status = "ativo" } = req.body

    // Validação básica
    if (!cliente_id || !pacote_id || !data_inicio) {
      throw new ApiError("Cliente, pacote e data de início são obrigatórios", 400)
    }

    // Obter dados do pacote
    const pacote = await pacoteModel.findById(pacote_id)
    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    // Calcular data de fim com base na validade do pacote
    const dataInicio = new Date(data_inicio)
    const dataFim = new Date(dataInicio)
    dataFim.setDate(dataFim.getDate() + pacote.validade_dias)

    // Criar assinatura
    const assinatura = await assinaturaPacoteModel.create({
      cliente_id,
      pacote_id,
      nome_pacote: pacote.nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      preco: preco || pacote.preco_pacote,
      status,
    })

    res.status(201).json({
      success: true,
      message: "Assinatura criada com sucesso",
      data: assinatura,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/{id}:
 *   put:
 *     summary: Atualizar assinatura
 *     tags: [Assinaturas]
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
 *               data_inicio:
 *                 type: string
 *                 format: date-time
 *               data_fim:
 *                 type: string
 *                 format: date-time
 *               preco:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *                 enum: [ativo, expirado, cancelado]
 *     responses:
 *       200:
 *         description: Assinatura atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Assinatura não encontrada
 */
export const updateAssinatura = async (req, res, next) => {
  try {
    const id = req.params.id
    const { data_inicio, data_fim, preco, status } = req.body

    // Verificar se a assinatura existe
    const assinatura = await assinaturaPacoteModel.findById(id)
    if (!assinatura) {
      throw new ApiError("Assinatura não encontrada", 404)
    }

    // Atualizar assinatura
    const updatedAssinatura = await assinaturaPacoteModel.update(id, {
      data_inicio,
      data_fim,
      preco,
      status,
    })

    res.status(200).json({
      success: true,
      message: "Assinatura atualizada com sucesso",
      data: updatedAssinatura,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/{id}:
 *   delete:
 *     summary: Excluir assinatura
 *     tags: [Assinaturas]
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
 *         description: Assinatura excluída com sucesso
 *       404:
 *         description: Assinatura não encontrada
 */
export const deleteAssinatura = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se a assinatura existe
    const assinatura = await assinaturaPacoteModel.findById(id)
    if (!assinatura) {
      throw new ApiError("Assinatura não encontrada", 404)
    }

    // Excluir assinatura
    await assinaturaPacoteModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Assinatura excluída com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/{id}/usos:
 *   get:
 *     summary: Listar usos da assinatura
 *     tags: [Assinaturas]
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
 *         description: Lista de usos da assinatura
 *       404:
 *         description: Assinatura não encontrada
 */
export const getUsosAssinatura = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se a assinatura existe
    const assinatura = await assinaturaPacoteModel.findById(id)
    if (!assinatura) {
      throw new ApiError("Assinatura não encontrada", 404)
    }

    const usos = await assinaturaPacoteModel.getUsos(id)

    res.status(200).json({
      success: true,
      data: usos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/{id}/usos:
 *   post:
 *     summary: Adicionar uso à assinatura
 *     tags: [Assinaturas]
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
 *             required:
 *               - servico_id
 *               - agendamento_id
 *             properties:
 *               servico_id:
 *                 type: string
 *                 format: uuid
 *               servico_nome:
 *                 type: string
 *               data_uso:
 *                 type: string
 *                 format: date-time
 *               agendamento_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Uso adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Assinatura não encontrada
 */
export const addUsoAssinatura = async (req, res, next) => {
  try {
    const id = req.params.id
    const { servico_id, servico_nome, data_uso, agendamento_id } = req.body

    // Validação básica
    if (!servico_id || !agendamento_id) {
      throw new ApiError("Serviço e agendamento são obrigatórios", 400)
    }

    // Verificar se a assinatura existe
    const assinatura = await assinaturaPacoteModel.findById(id)
    if (!assinatura) {
      throw new ApiError("Assinatura não encontrada", 404)
    }

    // Adicionar uso
    const uso = await assinaturaPacoteModel.addUso({
      assinatura_pacote_id: id,
      servico_id,
      servico_nome: servico_nome || "Serviço",
      data_uso: data_uso || new Date(),
      agendamento_id,
    })

    res.status(201).json({
      success: true,
      message: "Uso adicionado com sucesso",
      data: uso,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /assinaturas/usos/{id}:
 *   delete:
 *     summary: Remover uso da assinatura
 *     tags: [Assinaturas]
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
 *         description: Uso removido com sucesso
 *       404:
 *         description: Uso não encontrado
 */
export const removeUsoAssinatura = async (req, res, next) => {
  try {
    const id = req.params.id

    await assinaturaPacoteModel.removeUso(id)

    res.status(200).json({
      success: true,
      message: "Uso removido com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllAssinaturas,
  getAssinaturaById,
  getAssinaturasByCliente,
  createAssinatura,
  updateAssinatura,
  deleteAssinatura,
  getUsosAssinatura,
  addUsoAssinatura,
  removeUsoAssinatura,
}
