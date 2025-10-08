import dotenv from 'dotenv'

dotenv.config()

/**
 * Configuración centralizada de la aplicación
 * Valida y exporta todas las variables de entorno necesarias
 */
export const config = {
  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },

  // Configuración de Node.js
  node: {
    env: process.env.NODE_ENV || 'development',
  },

  // Configuración de base de datos
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/interview_ai_dev',
  },

  // Configuración de Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Configuración JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Configuración del frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Configuración de archivos
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Configuración de servicios de IA
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
    },
    azure: {
      ttsApiKey: process.env.AZURE_TTS_API_KEY || '',
      ttsRegion: process.env.AZURE_TTS_REGION || 'eastus',
    },
    google: {
      sttApiKey: process.env.GOOGLE_STT_API_KEY || '',
    },
    did: {
      apiKey: process.env.DID_API_KEY || '',
    },
  },

  // Configuración de email (opcional)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
}

/**
 * Validar configuración crítica al inicio
 */
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '))
    console.error('Por favor, copia .env.example a .env y configura las variables necesarias')
    process.exit(1)
  }

  // Advertencias para servicios opcionales
  if (!config.ai.openai.apiKey) {
    console.warn('⚠️  OPENAI_API_KEY no configurado - funcionalidades de IA limitadas')
  }

  if (!config.redis.url) {
    console.warn('⚠️  REDIS_URL no configurado - cache deshabilitado')
  }
}

// Validar configuración al importar
if (process.env.NODE_ENV !== 'test') {
  validateConfig()
}