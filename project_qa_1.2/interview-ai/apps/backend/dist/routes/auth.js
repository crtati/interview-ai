"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const auth_1 = require("../middlewares/auth");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.authRoutes = router;
/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email válido requerido'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Contraseña debe tener mínimo 8 caracteres'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 2 }).withMessage('Nombre requerido'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 2 }).withMessage('Apellido requerido'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Validar entrada
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array(),
        });
    }
    const { email, password, firstName, lastName } = req.body;
    try {
        // Verificar si el usuario ya existe
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado',
            });
        }
        // Hash de la contraseña
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Crear usuario y configuraciones por defecto
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                settings: {
                    create: {
                        language: 'es',
                        preferredInterviewDuration: 30,
                        enableNotifications: true,
                        avatarEnabled: true,
                        voiceProvider: 'azure',
                        saveRecordings: true,
                        shareDataForImprovement: false,
                        allowAnalytics: true,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });
        // Generar tokens
        const accessToken = auth_1.jwtUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = auth_1.jwtUtils.generateRefreshToken({
            userId: user.id,
        });
        // Guardar refresh token en base de datos
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
            },
        });
        logger_1.logger.info(`New user registered: ${user.email}`);
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user,
                token: accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        throw error;
    }
}));
/**
 * POST /api/auth/login
 * Inicio de sesión
 */
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email válido requerido'),
    (0, express_validator_1.body)('password').isLength({ min: 1 }).withMessage('Contraseña requerida'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array(),
        });
    }
    const { email, password } = req.body;
    try {
        // Buscar usuario
        const user = await database_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }
        // Verificar contraseña
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }
        // Generar tokens
        const accessToken = auth_1.jwtUtils.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = auth_1.jwtUtils.generateRefreshToken({
            userId: user.id,
        });
        // Guardar refresh token (eliminar tokens anteriores)
        await database_1.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        // Remover password de la respuesta
        const { password: _, ...userWithoutPassword } = user;
        logger_1.logger.info(`User logged in: ${user.email}`);
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: userWithoutPassword,
                token: accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        throw error;
    }
}));
/**
 * POST /api/auth/refresh
 * Renovar token de acceso
 */
router.post('/refresh', [
    (0, express_validator_1.body)('refreshToken').isLength({ min: 1 }).withMessage('Refresh token requerido'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Refresh token requerido',
        });
    }
    const { refreshToken } = req.body;
    try {
        // Verificar refresh token
        const decoded = auth_1.jwtUtils.verifyRefreshToken(refreshToken);
        // Buscar token en base de datos
        const storedToken = await database_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido o expirado',
            });
        }
        // Generar nuevo access token
        const newAccessToken = auth_1.jwtUtils.generateAccessToken({
            userId: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role,
        });
        // Opcionalmente generar nuevo refresh token
        const newRefreshToken = auth_1.jwtUtils.generateRefreshToken({
            userId: storedToken.user.id,
        });
        // Actualizar refresh token en BD
        await database_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            success: true,
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Refresh token inválido',
        });
    }
}));
/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
        try {
            // Eliminar refresh token de la base de datos
            await database_1.prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
        }
    }
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
    });
}));
//# sourceMappingURL=auth.js.map