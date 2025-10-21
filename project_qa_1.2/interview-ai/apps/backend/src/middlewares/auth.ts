import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

/**
 * Interface para extender Request con información del usuario
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica el token y adjunta información del usuario al request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      })
      return
    }

    const token = authHeader.substring(7) // Remover 'Bearer '

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any
      
      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido - usuario no encontrado',
        })
        return
      }

      // Adjuntar información del usuario al request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      next()
    } catch (jwtError: any) {
      logger.warn('JWT verification failed:', jwtError.message)
      
      // Diferentes mensajes según el tipo de error JWT
      let message = 'Token inválido'
      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expirado'
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Token malformado'
      }

      res.status(401).json({
        success: false,
        message,
      })
      return
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    })
  }
}

/**
 * Middleware de autorización por roles
 * Debe usarse después del middleware de autenticación
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`)
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      })
      return
    }

    next()
  }
}

/**
 * Middleware opcional de autenticación
 * Adjunta información del usuario si hay token válido, pero no falla si no lo hay
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }
    } catch (jwtError) {
      // Ignorar errores JWT en autenticación opcional
      logger.debug('Optional auth JWT error (ignored):', jwtError)
    }

    next()
  } catch (error) {
    logger.error('Optional authentication middleware error:', error)
    next() // Continuar incluso con errores
  }
}

/**
 * Utilities para JWT
 */
export const jwtUtils = {
  /**
   * Generar token de acceso
   */
  generateAccessToken: (payload: { userId: string; email: string; role: string }): string => {
    return jwt.sign(payload, config.jwt.secret)
  },

  /**
   * Generar refresh token
   */
  generateRefreshToken: (payload: { userId: string }): string => {
    return jwt.sign(payload, config.jwt.refreshSecret)
  },

  /**
   * Verificar refresh token
   */
  verifyRefreshToken: (token: string): any => {
    return jwt.verify(token, config.jwt.refreshSecret)
  },

  /**
   * Decodificar token sin verificar (útil para extraer información)
   */
  decodeToken: (token: string): any => {
    return jwt.decode(token)
  },
}