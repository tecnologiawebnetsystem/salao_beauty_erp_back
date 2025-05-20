import { verifyToken } from "../config/jwt.js"

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Acesso negado. Token não fornecido.",
      })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido.",
      })
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado.",
    })
  }
}

// Middleware para verificar permissões de usuário
export const authorize = (tipos = []) => {
  if (typeof tipos === "string") {
    tipos = [tipos]
  }

  return (req, res, next) => {
    if (tipos.length && !tipos.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        message: "Acesso proibido. Você não tem permissão para acessar este recurso.",
      })
    }
    next()
  }
}
