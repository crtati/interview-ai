import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/database'
import { redis } from '../config/redis'
import { jwtUtils } from '../middlewares/auth'
import { asyncHandler } from '../middlewares/errorHandler'
import { logger } from '../utils/logger'

const router: Router = Router()

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 8 }).withMessage('Contraseña debe tener mínimo 8 caracteres'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('Nombre requerido'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Apellido requerido'),
], asyncHandler(async (req: Request, res: Response) => {
  // Validar entrada
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array(),
    })
  }

  const { email, password, firstName, lastName } = req.body

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      })
    }

    // Hash de la contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear usuario y configuraciones por defecto
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        settings: {
          create: {
            language: 'es',
            preferredInterviewDuration: 30,
            enableNotifications: true,
            avatarEnabled: true,
            voiceProvider: 'azure',
            saveRecordings: true,
            shareDataForImprovement: false,
            allowAnalytics: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    // Generar tokens
    const accessToken = jwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwtUtils.generateRefreshToken({
      userId: user.id,
    })

    // Guardar refresh token en base de datos
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    })

    logger.info(`New user registered: ${user.email}`)

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    logger.error('Registration error:', error)
    throw error
  }
}))

/**
 * POST /api/auth/login
 * Inicio de sesión
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 1 }).withMessage('Contraseña requerida'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array(),
    })
  }

  const { email, password } = req.body

  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    // Generar tokens
    const accessToken = jwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwtUtils.generateRefreshToken({
      userId: user.id,
    })

    // Guardar refresh token (eliminar tokens anteriores)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    })

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = user

    logger.info(`User logged in: ${user.email}`)

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}))

/**
 * POST /api/auth/refresh
 * Renovar token de acceso
 */
router.post('/refresh', [
  body('refreshToken').isLength({ min: 1 }).withMessage('Refresh token requerido'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token requerido',
    })
  }

  const { refreshToken } = req.body

  try {
    // Verificar refresh token
    const decoded = jwtUtils.verifyRefreshToken(refreshToken)
    
    // Buscar token en base de datos
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado',
      })
    }

    // Generar nuevo access token
    const newAccessToken = jwtUtils.generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    })

    // Opcionalmente generar nuevo refresh token
    const newRefreshToken = jwtUtils.generateRefreshToken({
      userId: storedToken.user.id,
    })

    // Actualizar refresh token en BD
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido',
    })
  }
}))

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken

  if (refreshToken) {
    try {
      // Eliminar refresh token de la base de datos
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  })
}))

export { router as authRoutes }