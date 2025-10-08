import { Request, Response, NextFunction } from 'express'

/**
 * Middleware para manejar rutas no encontradas (404)
 * Debe colocarse después de todas las rutas definidas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    timestamp: new Date().toISOString(),
  })
}