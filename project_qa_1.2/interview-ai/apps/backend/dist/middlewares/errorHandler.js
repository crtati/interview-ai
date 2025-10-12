"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
const errorHandler = (error, req, res, next) => {
    // Log del error
    logger_1.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
    });
    // Si ya se envió una respuesta, delegar al default handler
    if (res.headersSent) {
        return next(error);
    }
    // Determinar status code
    let statusCode = 500;
    let message = 'Error interno del servidor';
    // Errores de validación de Prisma
    if (error.code === 'P2002') {
        statusCode = 409;
        message = 'Ya existe un registro con esos datos';
    }
    else if (error.code === 'P2025') {
        statusCode = 404;
        message = 'Registro no encontrado';
    }
    else if (error.code?.startsWith('P2')) {
        statusCode = 400;
        message = 'Error de base de datos';
    }
    // Errores de validación de Express Validator
    if (error.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'JSON inválido en el cuerpo de la petición';
    }
    // Errores de JWT
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expirado';
    }
    // Errores de Multer (subida de archivos)
    if (error.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        message = 'Archivo demasiado grande';
    }
    // En desarrollo, incluir stack trace
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'development') {
        response.error = error.message;
        response.stack = error.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
/**
 * Wrapper para async handlers
 * Captura errores automáticamente sin necesidad de try/catch
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Error personalizado para la aplicación
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Errores específicos de la aplicación
 */
class ValidationError extends AppError {
    constructor(message = 'Datos de entrada inválidos') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Conflicto con el estado actual') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * Helper para crear errores HTTP
 */
const createError = (message, statusCode) => {
    return new AppError(message, statusCode);
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map