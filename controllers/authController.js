import { generateToken } from "../config/jwt.js"
import { ApiError } from "../middleware/errorHandler.js"
import usuarioModel from "../models/usuarioModel.js"

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 */
export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body

    // Validação básica
    if (!email || !senha) {
      throw new ApiError("Email e senha são obrigatórios", 400)
    }

    // Buscar usuário pelo email
    const usuario = await usuarioModel.findByEmail(email)
    if (!usuario) {
      throw new ApiError("Credenciais inválidas", 401)
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      throw new ApiError("Usuário inativo. Entre em contato com o administrador.", 401)
    }

    // Verificar senha
    const isPasswordValid = await usuarioModel.comparePassword(senha, usuario.senha)
    if (!isPasswordValid) {
      throw new ApiError("Credenciais inválidas", 401)
    }

    // Gerar token JWT
    const token = generateToken({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    })

    res.status(200).json({
      success: true,
      message: "Login bem-sucedido",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autorizado
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id

    const usuario = await usuarioModel.findById(userId)

    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ativo: usuario.ativo,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Alterar senha do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senha_atual
 *               - nova_senha
 *             properties:
 *               senha_atual:
 *                 type: string
 *                 format: password
 *               nova_senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { senha_atual, nova_senha } = req.body

    // Validação básica
    if (!senha_atual || !nova_senha) {
      throw new ApiError("Senha atual e nova senha são obrigatórias", 400)
    }

    // Buscar usuário
    const usuario = await usuarioModel.findById(userId)
    if (!usuario) {
      throw new ApiError("Usuário não encontrado", 404)
    }

    // Verificar senha atual
    const isPasswordValid = await usuarioModel.comparePassword(senha_atual, usuario.senha)
    if (!isPasswordValid) {
      throw new ApiError("Senha atual incorreta", 401)
    }

    // Atualizar senha
    await usuarioModel.updatePassword(userId, nova_senha)

    res.status(200).json({
      success: true,
      message: "Senha alterada com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  login,
  getMe,
  changePassword,
}
