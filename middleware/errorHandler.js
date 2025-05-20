export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  const statusCode = err.statusCode || 500
  const message = err.message || "Erro interno do servidor"

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
}

// Classe para erros personalizados da API
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
