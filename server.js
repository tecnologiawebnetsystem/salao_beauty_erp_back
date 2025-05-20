import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.js"
import dotenv from "dotenv"
import routes from "./routes/index.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { connectDB } from "./config/database.js"

// Carrega variáveis de ambiente
dotenv.config()

// Inicializa o app Express
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rotas
app.use("/api", routes)

// Middleware de tratamento de erros
app.use(errorHandler)

// Conecta ao banco de dados e inicia o servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
      console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`)
    })
  })
  .catch((err) => {
    console.error("Falha ao conectar ao banco de dados:", err)
    process.exit(1)
  })

export default app
