import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import 'express-async-errors'
import { config } from './config/environment'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import { notFoundHandler } from './middlewares/notFoundHandler'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/user'
import { interviewRoutes } from './routes/interviews'
import { questionRoutes } from './routes/questions'
import { aiRoutes } from './routes/ai'
import { mediaRoutes } from './routes/media'
import { notificationRoutes } from './routes/notifications'
import { prisma } from './config/database'
import { redis } from './config/redis'

/**
 * Servidor principal de InterviewAI Backend
 * Configuración completa con middlewares de seguridad, logging y rutas API
 */
class App {
  public express: express.Application

  constructor() {
    this.express = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  /**
   * Configuración de middlewares de seguridad y utilidad
   */
  private initializeMiddlewares(): void {
    // Security middlewares
    this.express.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // CORS configuration
    this.express.use(cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }))

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
    this.express.use('/api/', limiter)

    // General middlewares
    this.express.use(compression())
    this.express.use(express.json({ limit: '10mb' }))
    this.express.use(express.urlencoded({ extended: true, limit: '10mb' }))
    
    // Logging
    this.express.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }))

    // Health check endpoint
    this.express.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.node.env,
      })
    })
  }

  /**
   * Configuración de rutas API
   */
  private initializeRoutes(): void {
    // API Routes
    this.express.use('/api/auth', authRoutes)
    this.express.use('/api/user', userRoutes)
    this.express.use('/api/interviews', interviewRoutes)
    this.express.use('/api/questions', questionRoutes)
    this.express.use('/api/ai', aiRoutes)
    this.express.use('/api/media', mediaRoutes)
    this.express.use('/api/notifications', notificationRoutes)

    // API documentation route
    this.express.get('/api', (req, res) => {
      res.json({
        name: 'InterviewAI API',
        version: '1.0.0',
        description: 'API para simulación de entrevistas con inteligencia artificial',
        endpoints: {
          auth: '/api/auth',
          user: '/api/user',
          interviews: '/api/interviews',
          questions: '/api/questions',
          ai: '/api/ai',
          media: '/api/media',
          notifications: '/api/notifications',
        },
        documentation: '/api/docs', // Swagger UI cuando se implemente
      })
    })
  }

  /**
   * Configuración de manejo de errores
   */
  private initializeErrorHandling(): void {
    this.express.use(notFoundHandler)
    this.express.use(errorHandler)
  }

  /**
   * Inicializar conexiones de base de datos
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await prisma.$connect()
      logger.info('✅ Base de datos PostgreSQL conectada')
    } catch (error) {
      logger.error('❌ Error conectando a PostgreSQL:', error)
      process.exit(1)
    }

    try {
      await redis.ping()
      logger.info('✅ Redis conectado')
    } catch (error) {
      logger.error('❌ Error conectando a Redis:', error)
      // Redis es opcional, continuamos sin él
    }
  }

  /**
   * Iniciar servidor
   */
  public async start(): Promise<void> {
    await this.initializeDatabase()
    
    const port = config.server.port
    
    this.express.listen(port, () => {
      logger.info(`🚀 Servidor InterviewAI iniciado en puerto ${port}`)
      logger.info(`📍 Ambiente: ${config.node.env}`)
      logger.info(`🔗 API URL: http://localhost:${port}/api`)
      logger.info(`❤️  Health Check: http://localhost:${port}/health`)
    })

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown)
    process.on('SIGINT', this.gracefulShutdown)
  }

  /**
   * Cerrar conexiones limpiamente
   */
  private gracefulShutdown = async (): Promise<void> => {
    logger.info('🔄 Cerrando servidor...')
    
    try {
      await prisma.$disconnect()
      logger.info('✅ Base de datos desconectada')
    } catch (error) {
      logger.error('❌ Error desconectando base de datos:', error)
    }

    try {
      await redis.disconnect()
      logger.info('✅ Redis desconectado')
    } catch (error) {
      logger.error('❌ Error desconectando Redis:', error)
    }

    process.exit(0)
  }
}

// Inicializar y arrancar servidor
const app = new App()

if (require.main === module) {
  app.start().catch((error) => {
    logger.error('❌ Error fatal al iniciar servidor:', error)
    process.exit(1)
  })
}

export default app