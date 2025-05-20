import express from "express"
import {
  getAllTransacoes,
  getTransacaoById,
  createTransacao,
  updateTransacao,
  deleteTransacao,
  getResumoFinanceiro,
} from "../controllers/transacoesController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Transações Financeiras
 *   description: Endpoints para gerenciamento de transações financeiras
 */

// Todas as rotas de transações são protegidas
router.use(authenticate)

// Rotas acessíveis apenas por gerentes e administradores
router.get("/", authorize(["gerente", "admin"]), getAllTransacoes)
router.get("/resumo", authorize(["gerente", "admin"]), getResumoFinanceiro)
router.get("/:id", authorize(["gerente", "admin"]), getTransacaoById)
router.post("/", authorize(["gerente", "admin"]), createTransacao)
router.put("/:id", authorize(["gerente", "admin"]), updateTransacao)
router.delete("/:id", authorize(["admin"]), deleteTransacao)

export default router
