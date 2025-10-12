/**
 * Cliente Redis configurado para cache y sesiones
 * Implementa reconnection automática y error handling
 */
declare class RedisClient {
    private client;
    private isConnected;
    constructor();
    /**
     * Configurar event handlers para Redis
     */
    private setupEventHandlers;
    /**
     * Conectar a Redis
     */
    connect(): Promise<void>;
    /**
     * Desconectar Redis
     */
    disconnect(): Promise<void>;
    /**
     * Verificar si está conectado
     */
    ping(): Promise<string | null>;
    /**
     * Obtener valor por clave
     */
    get(key: string): Promise<string | null>;
    /**
     * Establecer valor con expiración opcional
     */
    set(key: string, value: string, expirationInSeconds?: number): Promise<boolean>;
    /**
     * Eliminar clave
     */
    del(key: string): Promise<boolean>;
    /**
     * Obtener múltiples valores
     */
    mget(keys: string[]): Promise<(string | null)[]>;
    /**
     * Incrementar valor numérico
     */
    incr(key: string): Promise<number | null>;
    /**
     * Establecer expiración en clave existente
     */
    expire(key: string, seconds: number): Promise<boolean>;
    /**
     * Cache wrapper para funciones
     */
    cached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}
export declare const redis: RedisClient;
export {};
//# sourceMappingURL=redis.d.ts.map