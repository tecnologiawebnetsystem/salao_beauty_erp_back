import express from "express"
import {
  getAllServicos,
  getServicoById,
  createServico,
  updateServico,
  deleteServico,
} from "../controllers/servicosController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Serviços
 *   description: Endpoints para gerenciamento de serviços
 */

// Todas as rotas de serviços são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllServicos)
router.get("/:id", getServicoById)

// Rotas acessíveis apenas por administradores
router.post("/", authorize(["admin"]), createServico)
router.put("/:id", authorize(["admin"]), updateServico)
router.delete("/:id", authorize(["admin"]), deleteServico)

export default router
