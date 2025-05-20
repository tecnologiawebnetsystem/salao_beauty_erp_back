import express from "express"
import { login, getMe, changePassword } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para autenticação de usuários
 */

// Rotas públicas
router.post("/login", login)

// Rotas protegidas
router.get("/me", authenticate, getMe)
router.post("/change-password", authenticate, changePassword)

export default router
