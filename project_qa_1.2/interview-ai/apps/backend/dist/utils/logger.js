"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logWithContext = exports.loggerStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("../config/environment");
/**
 * Logger configurado con Winston
 * Maneja logs de diferentes niveles y outputs según el ambiente
 */
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
}));
const transports = [
    // Console transport - siempre activo
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), logFormat),
    }),
];
// File transports solo en producción
if (environment_1.config.node.env === 'production') {
    transports.push(
    // Log de errores
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }), 
    // Log combinado
    new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: environment_1.config.node.env === 'development' ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'interview-ai-backend' },
    transports,
    // No salir en errores no capturados
    exitOnError: false,
});
/**
 * Stream para Morgan (logging de HTTP requests)
 */
exports.loggerStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
/**
 * Helper para logs estructurados
 */
const logWithContext = (level, message, context) => {
    if (context) {
        exports.logger.log(level, message, { context });
    }
    else {
        exports.logger.log(level, message);
    }
};
exports.logWithContext = logWithContext;
/**
 * Log de performance de funciones
 */
const logPerformance = (functionName, startTime) => {
    const duration = Date.now() - startTime;
    exports.logger.debug(`${functionName} executed in ${duration}ms`);
};
exports.logPerformance = logPerformance;
//# sourceMappingURL=logger.js.map