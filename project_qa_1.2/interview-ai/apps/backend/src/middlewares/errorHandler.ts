import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  })

  // Si ya se envió una respuesta, delegar al default handler
  if (res.headersSent) {
    return next(error)
  }

  // Determinar status code
  let statusCode = 500
  let message = 'Error interno del servidor'

  // Errores de validación de Prisma
  if (error.code === 'P2002') {
    statusCode = 409
    message = 'Ya existe un registro con esos datos'
  } else if (error.code === 'P2025') {
    statusCode = 404
    message = 'Registro no encontrado'
  } else if (error.code?.startsWith('P2')) {
    statusCode = 400
    message = 'Error de base de datos'
  }

  // Errores de validación de Express Validator
  if (error.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'JSON inválido en el cuerpo de la petición'
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Token inválido'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expirado'
  }

  // Errores de Multer (subida de archivos)
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413
    message = 'Archivo demasiado grande'
  }

  // En desarrollo, incluir stack trace
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  }

  if (process.env.NODE_ENV === 'development') {
    response.error = error.message
    response.stack = error.stack
  }

  res.status(statusCode).json(response)
}

/**
 * Wrapper para async handlers
 * Captura errores automáticamente sin necesidad de try/catch
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Error personalizado para la aplicación
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Errores específicos de la aplicación
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Datos de entrada inválidos') {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual') {
    super(message, 409)
  }
}

/**
 * Helper para crear errores HTTP
 */
export const createError = (message: string, statusCode: number): AppError => {
  return new AppError(message, statusCode)
}