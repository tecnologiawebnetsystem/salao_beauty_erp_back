import express from "express"
import authRoutes from "./authRoutes.js"
import usuariosRoutes from "./usuariosRoutes.js"
import clientesRoutes from "./clientesRoutes.js"
import categoriasServicosRoutes from "./categoriasServicosRoutes.js"
import servicosRoutes from "./servicosRoutes.js"
import funcionariosRoutes from "./funcionariosRoutes.js"
import pacotesRoutes from "./pacotesRoutes.js"
import assinaturasRoutes from "./assinaturasRoutes.js"
import agendamentosRoutes from "./agendamentosRoutes.js"
import transacoesRoutes from "./transacoesRoutes.js"
import configuracoesRoutes from "./configuracoesRoutes.js"

const router = express.Router()

// Rotas de autenticação
router.use("/auth", authRoutes)

// Rotas de usuários
router.use("/usuarios", usuariosRoutes)

// Rotas de clientes
router.use("/clientes", clientesRoutes)

// Rotas de categorias de serviços
router.use("/categorias-servicos", categoriasServicosRoutes)

// Rotas de serviços
router.use("/servicos", servicosRoutes)

// Rotas de funcionários
router.use("/funcionarios", funcionariosRoutes)

// Rotas de pacotes
router.use("/pacotes", pacotesRoutes)

// Rotas de assinaturas
router.use("/assinaturas", assinaturasRoutes)

// Rotas de agendamentos
router.use("/agendamentos", agendamentosRoutes)

// Rotas de transações financeiras
router.use("/transacoes", transacoesRoutes)

// Rotas de configurações
router.use("/configuracoes", configuracoesRoutes)

export default router
