import express from "express"
import {
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario,
} from "../controllers/funcionariosController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Funcionários
 *   description: Endpoints para gerenciamento de funcionários
 */

// Todas as rotas de funcionários são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllFuncionarios)
router.get("/:id", getFuncionarioById)

// Rotas acessíveis apenas por administradores
router.post("/", authorize(["admin"]), createFuncionario)
router.put("/:id", authorize(["admin"]), updateFuncionario)
router.delete("/:id", authorize(["admin"]), deleteFuncionario)

export default router
