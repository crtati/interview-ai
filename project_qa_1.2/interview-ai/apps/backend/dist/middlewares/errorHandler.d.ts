import { Request, Response, NextFunction } from 'express';
/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Wrapper para async handlers
 * Captura errores automáticamente sin necesidad de try/catch
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error personalizado para la aplicación
 */
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
/**
 * Errores específicos de la aplicación
 */
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
/**
 * Helper para crear errores HTTP
 */
export declare const createError: (message: string, statusCode: number) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map