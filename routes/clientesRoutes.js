import express from "express"
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../controllers/clientesController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para gerenciamento de clientes
 */

// Todas as rotas de clientes são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllClientes)
router.get("/:id", getClienteById)

// Rotas acessíveis por funcionários, gerentes e administradores
router.post("/", authorize(["funcionario", "gerente", "admin"]), createCliente)
router.put("/:id", authorize(["funcionario", "gerente", "admin"]), updateCliente)

// Rotas acessíveis apenas por gerentes e administradores
router.delete("/:id", authorize(["gerente", "admin"]), deleteCliente)

export default router
