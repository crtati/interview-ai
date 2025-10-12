/**
 * Configuración centralizada de la aplicación
 * Valida y exporta todas las variables de entorno necesarias
 */
export declare const config: {
    server: {
        port: number;
    };
    node: {
        env: string;
    };
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    frontend: {
        url: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    upload: {
        maxFileSize: string;
        uploadPath: string;
    };
    ai: {
        openai: {
            apiKey: string;
            model: string;
        };
        gemini: {
            apiKey: string;
        };
        azure: {
            ttsApiKey: string;
            ttsRegion: string;
        };
        google: {
            sttApiKey: string;
        };
        did: {
            apiKey: string;
        };
    };
    email: {
        smtp: {
            host: string;
            port: number;
            user: string;
            pass: string;
        };
    };
};
/**
 * Validar configuración crítica al inicio
 */
export declare const validateConfig: () => void;
//# sourceMappingURL=environment.d.ts.map