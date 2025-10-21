import winston from 'winston'
import { config } from '../config/environment'

/**
 * Logger configurado con Winston
 * Maneja logs de diferentes niveles y outputs según el ambiente
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`
  })
)

const transports: winston.transport[] = [
  // Console transport - siempre activo
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      logFormat
    ),
  }),
]

// File transports solo en producción
if (config.node.env === 'production') {
  transports.push(
    // Log de errores
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
}

export const logger = winston.createLogger({
  level: config.node.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'interview-ai-backend' },
  transports,
  // No salir en errores no capturados
  exitOnError: false,
})

/**
 * Stream para Morgan (logging de HTTP requests)
 */
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

/**
 * Helper para logs estructurados
 */
export const logWithContext = (level: string, message: string, context?: any) => {
  if (context) {
    logger.log(level, message, { context })
  } else {
    logger.log(level, message)
  }
}

/**
 * Log de performance de funciones
 */
export const logPerformance = (functionName: string, startTime: number) => {
  const duration = Date.now() - startTime
  logger.debug(`${functionName} executed in ${duration}ms`)
}