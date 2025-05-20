import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"

dotenv.config()

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "salao_beleza",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Função para testar a conexão com o banco de dados
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("Conexão com o banco de dados MySQL estabelecida com sucesso")
    connection.release()
    return true
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados MySQL:", error)
    throw error
  }
}

// Função para executar queries SQL
export const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Erro ao executar query:", error)
    throw error
  }
}

// Função para gerar UUID
export const generateUUID = () => {
  return uuidv4()
}

export default { connectDB, query, generateUUID }
