import configuracaoModel from "../models/configuracaoModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /configuracoes:
 *   get:
 *     summary: Listar todas as configurações
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de configurações
 *       401:
 *         description: Não autorizado
 */
export const getAllConfiguracoes = async (req, res, next) => {
  try {
    const configuracoes = await configuracaoModel.findAll()

    res.status(200).json({
      success: true,
      count: configuracoes.length,
      data: configuracoes,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /configuracoes/{chave}:
 *   get:
 *     summary: Obter configuração por chave
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chave
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da configuração
 *       404:
 *         description: Configuração não encontrada
 */
export const getConfiguracaoPorChave = async (req, res, next) => {
  try {
    const chave = req.params.chave

    const configuracao = await configuracaoModel.findByChave(chave)

    if (!configuracao) {
      throw new ApiError("Configuração não encontrada", 404)
    }

    res.status(200).json({
      success: true,
      data: configuracao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /configuracoes:
 *   post:
 *     summary: Criar nova configuração
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chave
 *               - valor
 *             properties:
 *               chave:
 *                 type: string
 *               valor:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Configuração criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Chave já existe
 */
export const createConfiguracao = async (req, res, next) => {
  try {
    const { chave, valor, descricao } = req.body

    // Validação básica
    if (!chave || !valor) {
      throw new ApiError("Chave e valor são obrigatórios", 400)
    }

    // Verificar se a chave já existe
    const configuracaoExistente = await configuracaoModel.findByChave(chave)
    if (configuracaoExistente) {
      throw new ApiError("Chave já existe", 409)
    }

    // Criar configuração
    const configuracao = await configuracaoModel.create({
      chave,
      valor,
      descricao,
    })

    res.status(201).json({
      success: true,
      message: "Configuração criada com sucesso",
      data: configuracao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /configuracoes/{chave}:
 *   put:
 *     summary: Atualizar configuração
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chave
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuração atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Configuração não encontrada
 */
export const updateConfiguracao = async (req, res, next) => {
  try {
    const chave = req.params.chave
    const { valor, descricao } = req.body

    // Verificar se a configuração existe
    const configuracao = await configuracaoModel.findByChave(chave)
    if (!configuracao) {
      throw new ApiError("Configuração não encontrada", 404)
    }

    // Atualizar configuração
    const updatedConfiguracao = await configuracaoModel.update(chave, {
      valor,
      descricao,
    })

    res.status(200).json({
      success: true,
      message: "Configuração atualizada com sucesso",
      data: updatedConfiguracao,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /configuracoes/{chave}:
 *   delete:
 *     summary: Excluir configuração
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chave
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuração excluída com sucesso
 *       404:
 *         description: Configuração não encontrada
 */
export const deleteConfiguracao = async (req, res, next) => {
  try {
    const chave = req.params.chave

    // Verificar se a configuração existe
    const configuracao = await configuracaoModel.findByChave(chave)
    if (!configuracao) {
      throw new ApiError("Configuração não encontrada", 404)
    }

    // Excluir configuração
    await configuracaoModel.remove(chave)

    res.status(200).json({
      success: true,
      message: "Configuração excluída com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllConfiguracoes,
  getConfiguracaoPorChave,
  createConfiguracao,
  updateConfiguracao,
  deleteConfiguracao,
}
