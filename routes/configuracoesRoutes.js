import express from "express"
import {
  getAllConfiguracoes,
  getConfiguracaoPorChave,
  createConfiguracao,
  updateConfiguracao,
  deleteConfiguracao,
} from "../controllers/configuracoesController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Configurações
 *   description: Endpoints para gerenciamento de configurações do sistema
 */

// Todas as rotas de configurações são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllConfiguracoes)
router.get("/:chave", getConfiguracaoPorChave)

// Rotas acessíveis apenas por administradores
router.post("/", authorize(["admin"]), createConfiguracao)
router.put("/:chave", authorize(["admin"]), updateConfiguracao)
router.delete("/:chave", authorize(["admin"]), deleteConfiguracao)

export default router
