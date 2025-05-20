import clienteModel from "../models/clienteModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar todos os clientes
 *     tags: [Clientes]
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
 *         name: telefone
 *         schema:
 *           type: string
 *         description: Filtrar por telefone
 *       - in: query
 *         name: cpf
 *         schema:
 *           type: string
 *         description: Filtrar por CPF
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       401:
 *         description: Não autorizado
 */
export const getAllClientes = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      email: req.query.email,
      telefone: req.query.telefone,
      cpf: req.query.cpf,
    }

    const clientes = await clienteModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await clienteModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: clientes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: clientes,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obter cliente por ID
 *     tags: [Clientes]
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
 *         description: Dados do cliente
 *       404:
 *         description: Cliente não encontrado
 */
export const getClienteById = async (req, res, next) => {
  try {
    const id = req.params.id

    const cliente = await clienteModel.findById(id)

    if (!cliente) {
      throw new ApiError("Cliente não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: cliente,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
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
 *               - telefone
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               cpf:
 *                 type: string
 *               endereco:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 */
export const createCliente = async (req, res, next) => {
  try {
    const { nome, email, telefone, cpf, endereco, data_nascimento, observacoes } = req.body

    // Validação básica
    if (!nome || !email || !telefone) {
      throw new ApiError("Nome, email e telefone são obrigatórios", 400)
    }

    // Verificar se o email já existe
    const existingEmail = await clienteModel.findByEmail(email)
    if (existingEmail) {
      throw new ApiError("Email já cadastrado", 409)
    }

    // Verificar se o CPF já existe (se fornecido)
    if (cpf) {
      const existingCpf = await clienteModel.findByCpf(cpf)
      if (existingCpf) {
        throw new ApiError("CPF já cadastrado", 409)
      }
    }

    // Criar cliente
    const cliente = await clienteModel.create({
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      observacoes,
    })

    res.status(201).json({
      success: true,
      message: "Cliente criado com sucesso",
      data: cliente,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
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
 *               telefone:
 *                 type: string
 *               cpf:
 *                 type: string
 *               endereco:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 *       409:
 *         description: Email ou CPF já cadastrado
 */
export const updateCliente = async (req, res, next) => {
  try {
    const id = req.params.id
    const { nome, email, telefone, cpf, endereco, data_nascimento, observacoes } = req.body

    // Verificar se o cliente existe
    const cliente = await clienteModel.findById(id)
    if (!cliente) {
      throw new ApiError("Cliente não encontrado", 404)
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== cliente.email) {
      const existingEmail = await clienteModel.findByEmail(email)
      if (existingEmail) {
        throw new ApiError("Email já cadastrado", 409)
      }
    }

    // Verificar se o CPF já existe (se estiver sendo alterado)
    if (cpf && cpf !== cliente.cpf) {
      const existingCpf = await clienteModel.findByCpf(cpf)
      if (existingCpf) {
        throw new ApiError("CPF já cadastrado", 409)
      }
    }

    // Atualizar cliente
    const updatedCliente = await clienteModel.update(id, {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      observacoes,
    })

    res.status(200).json({
      success: true,
      message: "Cliente atualizado com sucesso",
      data: updatedCliente,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Excluir cliente
 *     tags: [Clientes]
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
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
export const deleteCliente = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o cliente existe
    const cliente = await clienteModel.findById(id)
    if (!cliente) {
      throw new ApiError("Cliente não encontrado", 404)
    }

    // Excluir cliente
    await clienteModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Cliente excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
}
