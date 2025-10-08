import { createClient } from 'redis'
import { config } from '../config/environment'
import { logger } from '../utils/logger'

/**
 * Cliente Redis configurado para cache y sesiones
 * Implementa reconnection automática y error handling
 */
class RedisClient {
  private client: ReturnType<typeof createClient>
  private isConnected = false

  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Max reconnection attempts reached')
            return false
          }
          return Math.min(retries * 100, 3000)
        },
      },
    })

    this.setupEventHandlers()
  }

  /**
   * Configurar event handlers para Redis
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis: Connecting...')
    })

    this.client.on('ready', () => {
      logger.info('Redis: Connected and ready')
      this.isConnected = true
    })

    this.client.on('error', (error) => {
      logger.error('Redis Error:', error)
      this.isConnected = false
    })

    this.client.on('end', () => {
      logger.info('Redis: Connection ended')
      this.isConnected = false
    })

    this.client.on('reconnecting', () => {
      logger.info('Redis: Reconnecting...')
    })
  }

  /**
   * Conectar a Redis
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect()
    } catch (error) {
      logger.error('Failed to connect to Redis:', error)
      // No lanzar error - Redis es opcional
    }
  }

  /**
   * Desconectar Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect()
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error)
    }
  }

  /**
   * Verificar si está conectado
   */
  async ping(): Promise<string | null> {
    if (!this.isConnected) return null
    try {
      return await this.client.ping()
    } catch (error) {
      logger.error('Redis ping failed:', error)
      return null
    }
  }

  /**
   * Obtener valor por clave
   */
  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null
    try {
      return await this.client.get(key)
    } catch (error) {
      logger.error('Redis get error:', error)
      return null
    }
  }

  /**
   * Establecer valor con expiración opcional
   */
  async set(key: string, value: string, expirationInSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false
    try {
      if (expirationInSeconds) {
        await this.client.setEx(key, expirationInSeconds, value)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      logger.error('Redis set error:', error)
      return false
    }
  }

  /**
   * Eliminar clave
   */
  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error('Redis del error:', error)
      return false
    }
  }

  /**
   * Obtener múltiples valores
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!this.isConnected) return []
    try {
      return await this.client.mGet(keys)
    } catch (error) {
      logger.error('Redis mget error:', error)
      return []
    }
  }

  /**
   * Incrementar valor numérico
   */
  async incr(key: string): Promise<number | null> {
    if (!this.isConnected) return null
    try {
      return await this.client.incr(key)
    } catch (error) {
      logger.error('Redis incr error:', error)
      return null
    }
  }

  /**
   * Establecer expiración en clave existente
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected) return false
    try {
      const result = await this.client.expire(key, seconds)
      return Boolean(result)
    } catch (error) {
      logger.error('Redis expire error:', error)
      return false
    }
  }

  /**
   * Cache wrapper para funciones
   */
  async cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    // Intentar obtener del cache
    const cached = await this.get(key)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (error) {
        logger.error('Error parsing cached data:', error)
      }
    }

    // Si no está en cache, ejecutar fetcher
    const result = await fetcher()
    
    // Guardar en cache
    await this.set(key, JSON.stringify(result), ttlSeconds)
    
    return result
  }
}

// Instancia única
export const redis = new RedisClient()

// Auto-conectar en desarrollo y producción
if (process.env.NODE_ENV !== 'test') {
  // Comentado temporalmente para evitar errores de conexión
  // redis.connect().catch(() => {
  //   logger.warn('Redis connection failed - running without cache')
  // })
  logger.warn('Redis connection disabled - running without cache')
}