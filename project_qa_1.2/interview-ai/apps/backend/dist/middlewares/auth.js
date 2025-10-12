"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtUtils = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
/**
 * Middleware de autenticación JWT
 * Verifica el token y adjunta información del usuario al request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Token de acceso requerido',
            });
            return;
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        try {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            // Verificar que el usuario existe y está activo
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido - usuario no encontrado',
                });
                return;
            }
            // Adjuntar información del usuario al request
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
            next();
        }
        catch (jwtError) {
            logger_1.logger.warn('JWT verification failed:', jwtError.message);
            // Diferentes mensajes según el tipo de error JWT
            let message = 'Token inválido';
            if (jwtError.name === 'TokenExpiredError') {
                message = 'Token expirado';
            }
            else if (jwtError.name === 'JsonWebTokenError') {
                message = 'Token malformado';
            }
            res.status(401).json({
                success: false,
                message,
            });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware de autorización por roles
 * Debe usarse después del middleware de autenticación
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger_1.logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Middleware opcional de autenticación
 * Adjunta información del usuario si hay token válido, pero no falla si no lo hay
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            });
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
            }
        }
        catch (jwtError) {
            // Ignorar errores JWT en autenticación opcional
            logger_1.logger.debug('Optional auth JWT error (ignored):', jwtError);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Optional authentication middleware error:', error);
        next(); // Continuar incluso con errores
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Utilities para JWT
 */
exports.jwtUtils = {
    /**
     * Generar token de acceso
     */
    generateAccessToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, environment_1.config.jwt.secret);
    },
    /**
     * Generar refresh token
     */
    generateRefreshToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, environment_1.config.jwt.refreshSecret);
    },
    /**
     * Verificar refresh token
     */
    verifyRefreshToken: (token) => {
        return jsonwebtoken_1.default.verify(token, environment_1.config.jwt.refreshSecret);
    },
    /**
     * Decodificar token sin verificar (útil para extraer información)
     */
    decodeToken: (token) => {
        return jsonwebtoken_1.default.decode(token);
    },
};
//# sourceMappingURL=auth.js.map