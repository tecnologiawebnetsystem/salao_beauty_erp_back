import express from "express"
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  resetPassword,
  deleteUsuario,
} from "../controllers/usuariosController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints para gerenciamento de usuários
 */

// Todas as rotas de usuários são protegidas
router.use(authenticate)

// Rotas acessíveis apenas por administradores e gerentes
router.get("/", authorize(["admin", "gerente"]), getAllUsuarios)
router.get("/:id", authorize(["admin", "gerente"]), getUsuarioById)
router.post("/", authorize(["admin"]), createUsuario)
router.put("/:id", authorize(["admin"]), updateUsuario)
router.post("/:id/reset-password", authorize(["admin"]), resetPassword)
router.delete("/:id", authorize(["admin"]), deleteUsuario)

export default router
