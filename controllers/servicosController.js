import servicoModel from "../models/servicoModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /servicos:
 *   get:
 *     summary: Listar todos os serviços
 *     tags: [Serviços]
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
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por categoria
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status (ativo/inativo)
 *       - in: query
 *         name: preco_min
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *       - in: query
 *         name: preco_max
 *         schema:
 *           type: number
 *         description: Preço máximo
 *       - in: query
 *         name: duracao_min
 *         schema:
 *           type: integer
 *         description: Duração mínima em minutos
 *       - in: query
 *         name: duracao_max
 *         schema:
 *           type: integer
 *         description: Duração máxima em minutos
 *     responses:
 *       200:
 *         description: Lista de serviços
 *       401:
 *         description: Não autorizado
 */
export const getAllServicos = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      categoria_id: req.query.categoria_id,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
      preco_min: req.query.preco_min,
      preco_max: req.query.preco_max,
      duracao_min: req.query.duracao_min,
      duracao_max: req.query.duracao_max,
    }

    const servicos = await servicoModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await servicoModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: servicos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: servicos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /servicos/{id}:
 *   get:
 *     summary: Obter serviço por ID
 *     tags: [Serviços]
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
 *         description: Dados do serviço
 *       404:
 *         description: Serviço não encontrado
 */
export const getServicoById = async (req, res, next) => {
  try {
    const id = req.params.id

    const servico = await servicoModel.findById(id)

    if (!servico) {
      throw new ApiError("Serviço não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: servico,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /servicos/funcionario/{funcionarioId}:
 *   get:
 *     summary: Listar serviços por funcionário
 *     tags: [Serviços]
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
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por categoria
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status (ativo/inativo)
 *     responses:
 *       200:
 *         description: Lista de serviços do funcionário
 *       401:
 *         description: Não autorizado
 */
export const getServicosByFuncionario = async (req, res, next) => {
  try {
    const funcionarioId = req.params.funcionarioId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      categoria_id: req.query.categoria_id,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
    }

    const servicos = await servicoModel.findByFuncionario(funcionarioId, filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await servicoModel.findByFuncionario(funcionarioId, countFilters)).length

    res.status(200).json({
      success: true,
      count: servicos.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: servicos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /servicos:
 *   post:
 *     summary: Criar novo serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - descricao
 *               - preco
 *               - duracao_minutos
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *                 format: float
 *               duracao_minutos:
 *                 type: integer
 *               categoria_id:
 *                 type: string
 *                 format: uuid
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
export const createServico = async (req, res, next) => {
  try {
    const { nome, descricao, preco, duracao_minutos, categoria_id, ativo } = req.body

    // Validação básica
    if (!nome || !descricao || !preco || !duracao_minutos) {
      throw new ApiError("Nome, descrição, preço e duração são obrigatórios", 400)
    }

    // Criar serviço
    const servico = await servicoModel.create({
      nome,
      descricao,
      preco,
      duracao_minutos,
      categoria_id,
      ativo,
    })

    res.status(201).json({
      success: true,
      message: "Serviço criado com sucesso",
      data: servico,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /servicos/{id}:
 *   put:
 *     summary: Atualizar serviço
 *     tags: [Serviços]
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
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *                 format: float
 *               duracao_minutos:
 *                 type: integer
 *               categoria_id:
 *                 type: string
 *                 format: uuid
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Serviço não encontrado
 */
export const updateServico = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nome, descricao, preco, duracao_minutos, categoria_id, ativo } = req.body

    // Verificar se o serviço existe
    const servico = await servicoModel.findById(id)
    if (!servico) {
      throw new ApiError("Serviço não encontrado", 404)
    }

    // Atualizar serviço
    const updatedServico = await servicoModel.update(id, {
      nome,
      descricao,
      preco,
      duracao_minutos,
      categoria_id,
      ativo,
    })

    res.status(200).json({
      success: true,
      message: "Serviço atualizado com sucesso",
      data: updatedServico,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /servicos/{id}:
 *   delete:
 *     summary: Excluir serviço
 *     tags: [Serviços]
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
 *         description: Serviço excluído com sucesso
 *       404:
 *         description: Serviço não encontrado
 */
export const deleteServico = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o serviço existe
    const servico = await servicoModel.findById(id)
    if (!servico) {
      throw new ApiError("Serviço não encontrado", 404)
    }

    // Excluir serviço
    await servicoModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Serviço excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllServicos,
  getServicoById,
  getServicosByFuncionario,
  createServico,
  updateServico,
  deleteServico,
}
