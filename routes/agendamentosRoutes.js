import express from "express"
import {
  getAllAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  verificarDisponibilidade,
} from "../controllers/agendamentosController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Agendamentos
 *   description: Endpoints para gerenciamento de agendamentos
 */

// Todas as rotas de agendamentos são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllAgendamentos)
router.get("/:id", getAgendamentoById)
router.get("/disponibilidade", verificarDisponibilidade)

// Rotas acessíveis por clientes, funcionários e administradores
router.post("/", createAgendamento)

// Rotas acessíveis apenas por funcionários e administradores
router.put("/:id", authorize(["funcionario", "admin"]), updateAgendamento)
router.delete("/:id", authorize(["funcionario", "admin"]), deleteAgendamento)

export default router
