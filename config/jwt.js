import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_jwt"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"

// Gerar token JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verificar token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Token inválido ou expirado")
  }
}

export default { generateToken, verifyToken }
