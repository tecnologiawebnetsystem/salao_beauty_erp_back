import categoriaServicoModel from "../models/categoriaServicoModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /categorias-servicos:
 *   get:
 *     summary: Listar todas as categorias de serviços
 *     tags: [Categorias de Serviços]
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
 *     responses:
 *       200:
 *         description: Lista de categorias de serviços
 *       401:
 *         description: Não autorizado
 */
export const getAllCategorias = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
    }

    const categorias = await categoriaServicoModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await categoriaServicoModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: categorias.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: categorias,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /categorias-servicos/{id}:
 *   get:
 *     summary: Obter categoria de serviço por ID
 *     tags: [Categorias de Serviços]
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
 *         description: Dados da categoria de serviço
 *       404:
 *         description: Categoria de serviço não encontrada
 */
export const getCategoriaById = async (req, res, next) => {
  try {
    const id = req.params.id

    const categoria = await categoriaServicoModel.findById(id)

    if (!categoria) {
      throw new ApiError("Categoria de serviço não encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: categoria,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /categorias-servicos:
 *   post:
 *     summary: Criar nova categoria de serviço
 *     tags: [Categorias de Serviços]
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
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Categoria de serviço criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Nome já cadastrado
 */
export const createCategoria = async (req, res, next) => {
  try {
    const { nome, descricao, ativo } = req.body

    // Validação básica
    if (!nome) {
      throw new ApiError("Nome é obrigatório", 400)
    }

    // Verificar se o nome já existe
    const existingCategoria = await categoriaServicoModel.findByNome(nome)
    if (existingCategoria) {
      throw new ApiError("Nome já cadastrado", 409)
    }

    // Criar categoria
    const categoria = await categoriaServicoModel.create({
      nome,
      descricao,
      ativo,
    })

    res.status(201).json({
      success: true,
      message: "Categoria de serviço criada com sucesso",
      data: categoria,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /categorias-servicos/{id}:
 *   put:
 *     summary: Atualizar categoria de serviço
 *     tags: [Categorias de Serviços]
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
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoria de serviço atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria de serviço não encontrada
 *       409:
 *         description: Nome já cadastrado
 */
export const updateCategoria = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nome, descricao, ativo } = req.body

    // Verificar se a categoria existe
    const categoria = await categoriaServicoModel.findById(id)
    if (!categoria) {
      throw new ApiError("Categoria de serviço não encontrada", 404)
    }

    // Verificar se o nome já existe (se estiver sendo alterado)
    if (nome && nome !== categoria.nome) {
      const existingCategoria = await categoriaServicoModel.findByNome(nome)
      if (existingCategoria) {
        throw new ApiError("Nome já cadastrado", 409)
      }
    }

    // Atualizar categoria
    const updatedCategoria = await categoriaServicoModel.update(id, {
      nome,
      descricao,
      ativo,
    })

    res.status(200).json({
      success: true,
      message: "Categoria de serviço atualizada com sucesso",
      data: updatedCategoria,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /categorias-servicos/{id}:
 *   delete:
 *     summary: Excluir categoria de serviço
 *     tags: [Categorias de Serviços]
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
 *         description: Categoria de serviço excluída com sucesso
 *       404:
 *         description: Categoria de serviço não encontrada
 */
export const deleteCategoria = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se a categoria existe
    const categoria = await categoriaServicoModel.findById(id)
    if (!categoria) {
      throw new ApiError("Categoria de serviço não encontrada", 404)
    }

    // Excluir categoria
    await categoriaServicoModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Categoria de serviço excluída com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
}
