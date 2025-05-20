import express from "express"
import {
  getAllPacotes,
  getPacoteById,
  createPacote,
  updatePacote,
  deletePacote,
  getItensPacote,
  addItemPacote,
  updateItemPacote,
  removeItemPacote,
} from "../controllers/pacotesController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Pacotes
 *   description: Endpoints para gerenciamento de pacotes
 */

// Todas as rotas de pacotes são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllPacotes)
router.get("/:id", getPacoteById)
router.get("/:id/itens", getItensPacote)

// Rotas acessíveis apenas por gerentes e administradores
router.post("/", authorize(["gerente", "admin"]), createPacote)
router.put("/:id", authorize(["gerente", "admin"]), updatePacote)
router.delete("/:id", authorize(["admin"]), deletePacote)
router.post("/:id/itens", authorize(["gerente", "admin"]), addItemPacote)
router.put("/itens/:id", authorize(["gerente", "admin"]), updateItemPacote)
router.delete("/itens/:id", authorize(["gerente", "admin"]), removeItemPacote)

export default router
