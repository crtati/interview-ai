import winston from 'winston';
export declare const logger: winston.Logger;
/**
 * Stream para Morgan (logging de HTTP requests)
 */
export declare const loggerStream: {
    write: (message: string) => void;
};
/**
 * Helper para logs estructurados
 */
export declare const logWithContext: (level: string, message: string, context?: any) => void;
/**
 * Log de performance de funciones
 */
export declare const logPerformance: (functionName: string, startTime: number) => void;
//# sourceMappingURL=logger.d.ts.map