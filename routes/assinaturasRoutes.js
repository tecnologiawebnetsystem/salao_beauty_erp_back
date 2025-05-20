import express from "express"
import {
  getAllAssinaturas,
  getAssinaturaById,
  getAssinaturasByCliente,
  createAssinatura,
  updateAssinatura,
  deleteAssinatura,
  getUsosAssinatura,
  addUsoAssinatura,
  removeUsoAssinatura,
} from "../controllers/assinaturasController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Assinaturas
 *   description: Endpoints para gerenciamento de assinaturas de pacotes
 */

// Todas as rotas de assinaturas são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllAssinaturas)
router.get("/:id", getAssinaturaById)
router.get("/cliente/:clienteId", getAssinaturasByCliente)
router.get("/:id/usos", getUsosAssinatura)

// Rotas acessíveis por funcionários, gerentes e administradores
router.post("/", authorize(["funcionario", "gerente", "admin"]), createAssinatura)
router.put("/:id", authorize(["funcionario", "gerente", "admin"]), updateAssinatura)
router.post("/:id/usos", authorize(["funcionario", "gerente", "admin"]), addUsoAssinatura)

// Rotas acessíveis apenas por gerentes e administradores
router.delete("/:id", authorize(["gerente", "admin"]), deleteAssinatura)
router.delete("/usos/:id", authorize(["gerente", "admin"]), removeUsoAssinatura)

export default router
