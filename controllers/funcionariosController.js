import funcionarioModel from "../models/funcionarioModel.js"
import { ApiError } from "../middleware/errorHandler.js"

/**
 * @swagger
 * /funcionarios:
 *   get:
 *     summary: Listar todos os funcionários
 *     tags: [Funcionários]
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
 *       - in: query
 *         name: cargo
 *         schema:
 *           type: string
 *         description: Filtrar por cargo
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status (ativo/inativo)
 *     responses:
 *       200:
 *         description: Lista de funcionários
 *       401:
 *         description: Não autorizado
 */
export const getAllFuncionarios = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const filters = {
      nome: req.query.nome,
      email: req.query.email,
      telefone: req.query.telefone,
      cpf: req.query.cpf,
      cargo: req.query.cargo,
      ativo: req.query.ativo !== undefined ? Number(req.query.ativo) : undefined,
    }

    const funcionarios = await funcionarioModel.findAll(filters, page, limit)

    // Contar total de registros para paginação
    const countFilters = { ...filters }
    const total = (await funcionarioModel.findAll(countFilters)).length

    res.status(200).json({
      success: true,
      count: funcionarios.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: funcionarios,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}:
 *   get:
 *     summary: Obter funcionário por ID
 *     tags: [Funcionários]
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
 *         description: Dados do funcionário
 *       404:
 *         description: Funcionário não encontrado
 */
export const getFuncionarioById = async (req, res, next) => {
  try {
    const id = req.params.id

    const funcionario = await funcionarioModel.findById(id)

    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    res.status(200).json({
      success: true,
      data: funcionario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios:
 *   post:
 *     summary: Criar novo funcionário
 *     tags: [Funcionários]
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
 *               cargo:
 *                 type: string
 *               taxa_comissao:
 *                 type: number
 *                 format: float
 *               observacoes:
 *                 type: string
 *               imagem_perfil:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Funcionário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 */
export const createFuncionario = async (req, res, next) => {
  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      cargo,
      taxa_comissao,
      observacoes,
      imagem_perfil,
      ativo,
    } = req.body

    // Validação básica
    if (!nome || !email || !telefone) {
      throw new ApiError("Nome, email e telefone são obrigatórios", 400)
    }

    // Verificar se o email já existe
    const existingEmail = await funcionarioModel.findByEmail(email)
    if (existingEmail) {
      throw new ApiError("Email já cadastrado", 409)
    }

    // Verificar se o CPF já existe (se fornecido)
    if (cpf) {
      const existingCpf = await funcionarioModel.findByCpf(cpf)
      if (existingCpf) {
        throw new ApiError("CPF já cadastrado", 409)
      }
    }

    // Criar funcionário
    const funcionario = await funcionarioModel.create({
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      cargo,
      taxa_comissao,
      observacoes,
      imagem_perfil,
      ativo,
    })

    res.status(201).json({
      success: true,
      message: "Funcionário criado com sucesso",
      data: funcionario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}:
 *   put:
 *     summary: Atualizar funcionário
 *     tags: [Funcionários]
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
 *               cargo:
 *                 type: string
 *               taxa_comissao:
 *                 type: number
 *                 format: float
 *               observacoes:
 *                 type: string
 *               imagem_perfil:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Funcionário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Funcionário não encontrado
 *       409:
 *         description: Email ou CPF já cadastrado
 */
export const updateFuncionario = async (req, res, next) => {
  try {
    const id = req.params.id
    const {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      cargo,
      taxa_comissao,
      observacoes,
      imagem_perfil,
      ativo,
    } = req.body

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== funcionario.email) {
      const existingEmail = await funcionarioModel.findByEmail(email)
      if (existingEmail) {
        throw new ApiError("Email já cadastrado", 409)
      }
    }

    // Verificar se o CPF já existe (se estiver sendo alterado)
    if (cpf && cpf !== funcionario.cpf) {
      const existingCpf = await funcionarioModel.findByCpf(cpf)
      if (existingCpf) {
        throw new ApiError("CPF já cadastrado", 409)
      }
    }

    // Atualizar funcionário
    const updatedFuncionario = await funcionarioModel.update(id, {
      nome,
      email,
      telefone,
      cpf,
      endereco,
      data_nascimento,
      cargo,
      taxa_comissao,
      observacoes,
      imagem_perfil,
      ativo,
    })

    res.status(200).json({
      success: true,
      message: "Funcionário atualizado com sucesso",
      data: updatedFuncionario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}:
 *   delete:
 *     summary: Excluir funcionário
 *     tags: [Funcionários]
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
 *         description: Funcionário excluído com sucesso
 *       404:
 *         description: Funcionário não encontrado
 */
export const deleteFuncionario = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    // Excluir funcionário
    await funcionarioModel.remove(id)

    res.status(200).json({
      success: true,
      message: "Funcionário excluído com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/especialidades:
 *   get:
 *     summary: Listar especialidades do funcionário
 *     tags: [Funcionários]
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
 *         description: Lista de especialidades
 *       404:
 *         description: Funcionário não encontrado
 */
export const getEspecialidades = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const especialidades = await funcionarioModel.getEspecialidades(id)

    res.status(200).json({
      success: true,
      data: especialidades,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/especialidades:
 *   post:
 *     summary: Adicionar especialidade ao funcionário
 *     tags: [Funcionários]
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
 *               - especialidade
 *             properties:
 *               especialidade:
 *                 type: string
 *     responses:
 *       201:
 *         description: Especialidade adicionada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Funcionário não encontrado
 */
export const addEspecialidade = async (req, res, next) => {
  try {
    const id = req.params.id
    const { especialidade } = req.body

    // Validação básica
    if (!especialidade) {
      throw new ApiError("Especialidade é obrigatória", 400)
    }

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const novaEspecialidade = await funcionarioModel.addEspecialidade(id, especialidade)

    res.status(201).json({
      success: true,
      message: "Especialidade adicionada com sucesso",
      data: novaEspecialidade,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/especialidades/{id}:
 *   delete:
 *     summary: Remover especialidade do funcionário
 *     tags: [Funcionários]
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
 *         description: Especialidade removida com sucesso
 *       404:
 *         description: Especialidade não encontrada
 */
export const removeEspecialidade = async (req, res, next) => {
  try {
    const id = req.params.id

    await funcionarioModel.removeEspecialidade(id)

    res.status(200).json({
      success: true,
      message: "Especialidade removida com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/servicos:
 *   get:
 *     summary: Listar serviços do funcionário
 *     tags: [Funcionários]
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
 *         description: Lista de serviços
 *       404:
 *         description: Funcionário não encontrado
 */
export const getServicos = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const servicos = await funcionarioModel.getServicos(id)

    res.status(200).json({
      success: true,
      data: servicos,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/servicos:
 *   post:
 *     summary: Adicionar serviço ao funcionário
 *     tags: [Funcionários]
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
 *     responses:
 *       201:
 *         description: Serviço adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Funcionário ou serviço não encontrado
 */
export const addServico = async (req, res, next) => {
  try {
    const id = req.params.id
    const { servico_id } = req.body

    // Validação básica
    if (!servico_id) {
      throw new ApiError("ID do serviço é obrigatório", 400)
    }

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const novoServico = await funcionarioModel.addServico(id, servico_id)

    res.status(201).json({
      success: true,
      message: "Serviço adicionado com sucesso",
      data: novoServico,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{funcionarioId}/servicos/{servicoId}:
 *   delete:
 *     summary: Remover serviço do funcionário
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: funcionarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: servicoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Serviço removido com sucesso
 *       404:
 *         description: Funcionário ou serviço não encontrado
 */
export const removeServico = async (req, res, next) => {
  try {
    const funcionarioId = req.params.funcionarioId
    const servicoId = req.params.servicoId

    await funcionarioModel.removeServico(funcionarioId, servicoId)

    res.status(200).json({
      success: true,
      message: "Serviço removido com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/horarios:
 *   get:
 *     summary: Listar horários de trabalho do funcionário
 *     tags: [Funcionários]
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
 *         description: Lista de horários de trabalho
 *       404:
 *         description: Funcionário não encontrado
 */
export const getHorarios = async (req, res, next) => {
  try {
    const id = req.params.id

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const horarios = await funcionarioModel.getHorarios(id)

    res.status(200).json({
      success: true,
      data: horarios,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/{id}/horarios:
 *   post:
 *     summary: Adicionar horário de trabalho ao funcionário
 *     tags: [Funcionários]
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
 *               - dia_semana
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               dia_semana:
 *                 type: string
 *                 enum: [segunda, terca, quarta, quinta, sexta, sabado, domingo]
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *               hora_fim:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Horário adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Funcionário não encontrado
 */
export const addHorario = async (req, res, next) => {
  try {
    const id = req.params.id
    const { dia_semana, hora_inicio, hora_fim } = req.body

    // Validação básica
    if (!dia_semana || !hora_inicio || !hora_fim) {
      throw new ApiError("Dia da semana, hora de início e hora de fim são obrigatórios", 400)
    }

    // Verificar se o funcionário existe
    const funcionario = await funcionarioModel.findById(id)
    if (!funcionario) {
      throw new ApiError("Funcionário não encontrado", 404)
    }

    const novoHorario = await funcionarioModel.addHorario({
      funcionario_id: id,
      dia_semana,
      hora_inicio,
      hora_fim,
    })

    res.status(201).json({
      success: true,
      message: "Horário adicionado com sucesso",
      data: novoHorario,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/horarios/{id}:
 *   put:
 *     summary: Atualizar horário de trabalho
 *     tags: [Funcionários]
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
 *               - dia_semana
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               dia_semana:
 *                 type: string
 *                 enum: [segunda, terca, quarta, quinta, sexta, sabado, domingo]
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *               hora_fim:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Horário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Horário não encontrado
 */
export const updateHorario = async (req, res, next) => {
  try {
    const id = req.params.id
    const { dia_semana, hora_inicio, hora_fim } = req.body

    // Validação básica
    if (!dia_semana || !hora_inicio || !hora_fim) {
      throw new ApiError("Dia da semana, hora de início e hora de fim são obrigatórios", 400)
    }

    const horarioAtualizado = await funcionarioModel.updateHorario(id, {
      dia_semana,
      hora_inicio,
      hora_fim,
    })

    res.status(200).json({
      success: true,
      message: "Horário atualizado com sucesso",
      data: horarioAtualizado,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /funcionarios/horarios/{id}:
 *   delete:
 *     summary: Remover horário de trabalho
 *     tags: [Funcionários]
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
 *         description: Horário removido com sucesso
 *       404:
 *         description: Horário não encontrado
 */
export const removeHorario = async (req, res, next) => {
  try {
    const id = req.params.id

    await funcionarioModel.removeHorario(id)

    res.status(200).json({
      success: true,
      message: "Horário removido com sucesso",
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario,
  getEspecialidades,
  addEspecialidade,
  removeEspecialidade,
  getServicos,
  addServico,
  removeServico,
  getHorarios,
  addHorario,
  updateHorario,
  removeHorario,
}
