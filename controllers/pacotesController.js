import pacoteModel from "../models/pacoteModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /pacotes:
 *   get:
 *     summary: Listar todos os pacotes
 *     tags: [Pacotes]
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
 *     responses:
 *       200:
 *         description: Lista de pacotes
 *       401:
 *         description: Não autorizado
 */
export const getAllPacotes = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
      preco_min: req.query.preco_min,
      preco_max: req.query.preco_max,
    }

    const pacotes = await pacoteModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await pacoteModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: pacotes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: pacotes,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/{id}:
 *   get:
 *     summary: Obter pacote por ID
 *     tags: [Pacotes]
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
 *         description: Dados do pacote
 *       404:
 *         description: Pacote não encontrado
 */
export const getPacoteById = async (req, res, next) => {
  try {
    const id = req.params.id

    const pacote = await pacoteModel.findById(id)

    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    // Obter itens do pacote
    const itens = await pacoteModel.getItens(id)

    res.status(200).json({
      success: true,
      data: {
        ...pacote,
        itens,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes:
 *   post:
 *     summary: Criar novo pacote
 *     tags: [Pacotes]
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
 *               - preco_pacote
 *               - preco_regular
 *               - validade_dias
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco_pacote:
 *                 type: number
 *                 format: float
 *               preco_regular:
 *                 type: number
 *                 format: float
 *               validade_dias:
 *                 type: integer
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Pacote criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
export const createPacote = async (req, res, next) => {
  try {
    const { nome, descricao, preco_pacote, preco_regular, validade_dias, ativo } = req.body

    // Validação básica
    if (!nome || !descricao || !preco_pacote || !preco_regular || !validade_dias) {
      throw new ApiError("Nome, descrição, preço do pacote, preço regular e validade são obrigatórios", 400)
    }

    // Criar pacote
    const pacote = await pacoteModel.create({
      nome,
      descricao,
      preco_pacote,
      preco_regular,
      validade_dias,
      ativo,
    })

    res.status(201).json({
      success: true,
      message: "Pacote criado com sucesso",
      data: pacote,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/{id}:
 *   put:
 *     summary: Atualizar pacote
 *     tags: [Pacotes]
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
 *               preco_pacote:
 *                 type: number
 *                 format: float
 *               preco_regular:
 *                 type: number
 *                 format: float
 *               validade_dias:
 *                 type: integer
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pacote atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Pacote não encontrado
 */
export const updatePacote = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nome, descricao, preco_pacote, preco_regular, validade_dias, ativo } = req.body

    // Verificar se o pacote existe
    const pacote = await pacoteModel.findById(id)
    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    // Atualizar pacote
    const updatedPacote = await pacoteModel.update(id, {
      nome,
      descricao,
      preco_pacote,
      preco_regular,
      validade_dias,
      ativo,
    })

    res.status(200).json({
      success: true,
      message: "Pacote atualizado com sucesso",
      data: updatedPacote,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/{id}:
 *   delete:
 *     summary: Excluir pacote
 *     tags: [Pacotes]
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
 *         description: Pacote excluído com sucesso
 *       404:
 *         description: Pacote não encontrado
 */
export const deletePacote = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o pacote existe
    const pacote = await pacoteModel.findById(id)
    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    // Excluir pacote
    await pacoteModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Pacote excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/{id}/itens:
 *   get:
 *     summary: Listar itens do pacote
 *     tags: [Pacotes]
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
 *         description: Lista de itens do pacote
 *       404:
 *         description: Pacote não encontrado
 */
export const getItensPacote = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o pacote existe
    const pacote = await pacoteModel.findById(id)
    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    const itens = await pacoteModel.getItens(id)

    res.status(200).json({
      success: true,
      data: itens,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/{id}/itens:
 *   post:
 *     summary: Adicionar item ao pacote
 *     tags: [Pacotes]
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
 *             properties:
 *               servico_id:
 *                 type: string
 *                 format: uuid
 *               quantidade:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Pacote não encontrado
 */
export const addItemPacote = async (req, res, next) => {
  try {
    const id = req.params.id
    const { servico_id, quantidade = 1 } = req.body

    // Validação básica
    if (!servico_id) {
      throw new ApiError("ID do serviço é obrigatório", 400)
    }

    // Verificar se o pacote existe
    const pacote = await pacoteModel.findById(id)
    if (!pacote) {
      throw new ApiError("Pacote não encontrado", 404)
    }

    // Adicionar item ao pacote
    const item = await pacoteModel.addItem({
      pacote_id: id,
      servico_id,
      quantidade,
    })

    res.status(201).json({
      success: true,
      message: "Item adicionado com sucesso",
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/itens/{id}:
 *   put:
 *     summary: Atualizar item do pacote
 *     tags: [Pacotes]
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
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Item não encontrado
 */
export const updateItemPacote = async (req, res, next) => {
  try {
    const id = req.params.id
    const { quantidade } = req.body

    // Validação básica
    if (!quantidade || quantidade < 1) {
      throw new ApiError("Quantidade deve ser maior que zero", 400)
    }

    // Atualizar item
    const item = await pacoteModel.updateItem(id, { quantidade })

    res.status(200).json({
      success: true,
      message: "Item atualizado com sucesso",
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /pacotes/itens/{id}:
 *   delete:
 *     summary: Remover item do pacote
 *     tags: [Pacotes]
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
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */
export const removeItemPacote = async (req, res, next) => {
  try {
    const id = req.params.id

    await pacoteModel.removeItem(id)

    res.status(200).json({
      success: true,
      message: "Item removido com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllPacotes,
  getPacoteById,
  createPacote,
  updatePacote,
  deletePacote,
  getItensPacote,
  addItemPacote,
  updateItemPacote,
  removeItemPacote,
}
