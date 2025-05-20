import express from "express"
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categoriasServicosController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Categorias de Serviços
 *   description: Endpoints para gerenciamento de categorias de serviços
 */

// Todas as rotas de categorias são protegidas
router.use(authenticate)

// Rotas acessíveis por todos os usuários autenticados
router.get("/", getAllCategorias)
router.get("/:id", getCategoriaById)

// Rotas acessíveis apenas por gerentes e administradores
router.post("/", authorize(["gerente", "admin"]), createCategoria)
router.put("/:id", authorize(["gerente", "admin"]), updateCategoria)
router.delete("/:id", authorize(["admin"]), deleteCategoria)

export default router
