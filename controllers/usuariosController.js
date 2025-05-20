import usuarioModel from "../models/usuarioModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
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
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [admin, gerente, funcionario]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status (ativo/inativo)
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido
 */
export const getAllUsuarios = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      email: req.query.email,
      tipo: req.query.tipo,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
    }

    const usuarios = await usuarioModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await usuarioModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: usuarios.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: usuarios,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Usuários]
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
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
export const getUsuarioById = async (req, res, next) => {
  try {
    const id = req.params.id

    const usuario = await usuarioModel.findById(id)

    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: usuario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
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
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *                 format: password
 *               tipo:
 *                 type: string
 *                 enum: [admin, gerente, funcionario]
 *                 default: funcionario
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
export const createUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha, tipo = "funcionario" } = req.body

    // Validação básica
    if (!nome || !email || !senha) {
      throw new ApiError("Nome, email e senha são obrigatórios", 400)
    }

    // Verificar se o email já existe
    const existingUser = await usuarioModel.findByEmail(email)
    if (existingUser) {
      throw new ApiError("Email já cadastrado", 409)
    }

    // Criar usuário
    const usuario = await usuarioModel.create({ nome, email, senha, tipo })

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: usuario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
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
 *               email:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [admin, gerente, funcionario]
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email já cadastrado
 */
export const updateUsuario = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nome, email, tipo, ativo } = req.body

    // Verificar se o usuário existe
    const usuario = await usuarioModel.findById(id)
    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== usuario.email) {
      const existingUser = await usuarioModel.findByEmail(email)
      if (existingUser) {
        throw new ApiError("Email já cadastrado", 409)
      }
    }

    // Atualizar usuário
    const updatedUsuario = await usuarioModel.update(id, { nome, email, tipo, ativo })

    res.status(200).json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: updatedUsuario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /usuarios/{id}/reset-password:
 *   post:
 *     summary: Resetar senha do usuário
 *     tags: [Usuários]
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
 *
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nova_senha
 *             properties:
 *               nova_senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
export const resetPassword = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nova_senha } = req.body

    // Validação básica
    if (!nova_senha) {
      throw new ApiError("Nova senha é obrigatória", 400)
    }

    // Verificar se o usuário existe
    const usuario = await usuarioModel.findById(id)
    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    // Atualizar senha
    await usuarioModel.updatePassword(id, nova_senha)

    res.status(200).json({
      success: true,
      message: "Senha resetada com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Usuários]
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
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
export const deleteUsuario = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o usuário existe
    const usuario = await usuarioModel.findById(id)
    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    // Excluir usuário
    await usuarioModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Usuário excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  resetPassword,
  deleteUsuario,
}
