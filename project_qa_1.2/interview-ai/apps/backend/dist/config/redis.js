"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
/**
 * Cliente Redis configurado para cache y sesiones
 * Implementa reconnection automática y error handling
 */
class RedisClient {
    constructor() {
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: environment_1.config.redis.url,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.logger.error('Redis: Max reconnection attempts reached');
                        return false;
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        this.setupEventHandlers();
    }
    /**
     * Configurar event handlers para Redis
     */
    setupEventHandlers() {
        this.client.on('connect', () => {
            logger_1.logger.info('Redis: Connecting...');
        });
        this.client.on('ready', () => {
            logger_1.logger.info('Redis: Connected and ready');
            this.isConnected = true;
        });
        this.client.on('error', (error) => {
            logger_1.logger.error('Redis Error:', error);
            this.isConnected = false;
        });
        this.client.on('end', () => {
            logger_1.logger.info('Redis: Connection ended');
            this.isConnected = false;
        });
        this.client.on('reconnecting', () => {
            logger_1.logger.info('Redis: Reconnecting...');
        });
    }
    /**
     * Conectar a Redis
     */
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to Redis:', error);
            // No lanzar error - Redis es opcional
        }
    }
    /**
     * Desconectar Redis
     */
    async disconnect() {
        try {
            await this.client.disconnect();
        }
        catch (error) {
            logger_1.logger.error('Error disconnecting from Redis:', error);
        }
    }
    /**
     * Verificar si está conectado
     */
    async ping() {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.ping();
        }
        catch (error) {
            logger_1.logger.error('Redis ping failed:', error);
            return null;
        }
    }
    /**
     * Obtener valor por clave
     */
    async get(key) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            logger_1.logger.error('Redis get error:', error);
            return null;
        }
    }
    /**
     * Establecer valor con expiración opcional
     */
    async set(key, value, expirationInSeconds) {
        if (!this.isConnected)
            return false;
        try {
            if (expirationInSeconds) {
                await this.client.setEx(key, expirationInSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis set error:', error);
            return false;
        }
    }
    /**
     * Eliminar clave
     */
    async del(key) {
        if (!this.isConnected)
            return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Redis del error:', error);
            return false;
        }
    }
    /**
     * Obtener múltiples valores
     */
    async mget(keys) {
        if (!this.isConnected)
            return [];
        try {
            return await this.client.mGet(keys);
        }
        catch (error) {
            logger_1.logger.error('Redis mget error:', error);
            return [];
        }
    }
    /**
     * Incrementar valor numérico
     */
    async incr(key) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            logger_1.logger.error('Redis incr error:', error);
            return null;
        }
    }
    /**
     * Establecer expiración en clave existente
     */
    async expire(key, seconds) {
        if (!this.isConnected)
            return false;
        try {
            const result = await this.client.expire(key, seconds);
            return Boolean(result);
        }
        catch (error) {
            logger_1.logger.error('Redis expire error:', error);
            return false;
        }
    }
    /**
     * Cache wrapper para funciones
     */
    async cached(key, fetcher, ttlSeconds = 3600) {
        // Intentar obtener del cache
        const cached = await this.get(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            }
            catch (error) {
                logger_1.logger.error('Error parsing cached data:', error);
            }
        }
        // Si no está en cache, ejecutar fetcher
        const result = await fetcher();
        // Guardar en cache
        await this.set(key, JSON.stringify(result), ttlSeconds);
        return result;
    }
}
// Instancia única
exports.redis = new RedisClient();
// Auto-conectar en desarrollo y producción
if (process.env.NODE_ENV !== 'test') {
    // Comentado temporalmente para evitar errores de conexión
    // redis.connect().catch(() => {
    //   logger.warn('Redis connection failed - running without cache')
    // })
    logger_1.logger.warn('Redis connection disabled - running without cache');
}
//# sourceMappingURL=redis.js.map