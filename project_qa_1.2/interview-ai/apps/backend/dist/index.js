"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("express-async-errors");
const environment_1 = require("./config/environment");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const auth_1 = require("./routes/auth");
const user_1 = require("./routes/user");
const interviews_1 = require("./routes/interviews");
const questions_1 = require("./routes/questions");
const ai_1 = require("./routes/ai");
const media_1 = require("./routes/media");
const notifications_1 = require("./routes/notifications");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
/**
 * Servidor principal de InterviewAI Backend
 * Configuración completa con middlewares de seguridad, logging y rutas API
 */
class App {
    constructor() {
        /**
         * Cerrar conexiones limpiamente
         */
        this.gracefulShutdown = async () => {
            logger_1.logger.info('🔄 Cerrando servidor...');
            try {
                await database_1.prisma.$disconnect();
                logger_1.logger.info('✅ Base de datos desconectada');
            }
            catch (error) {
                logger_1.logger.error('❌ Error desconectando base de datos:', error);
            }
            try {
                await redis_1.redis.disconnect();
                logger_1.logger.info('✅ Redis desconectado');
            }
            catch (error) {
                logger_1.logger.error('❌ Error desconectando Redis:', error);
            }
            process.exit(0);
        };
        this.express = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    /**
     * Configuración de middlewares de seguridad y utilidad
     */
    initializeMiddlewares() {
        // Security middlewares
        this.express.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        // CORS configuration
        this.express.use((0, cors_1.default)({
            origin: environment_1.config.frontend.url,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: environment_1.config.rateLimit.windowMs,
            max: environment_1.config.rateLimit.maxRequests,
            message: {
                error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.express.use('/api/', limiter);
        // General middlewares
        this.express.use((0, compression_1.default)());
        this.express.use(express_1.default.json({ limit: '10mb' }));
        this.express.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Logging
        this.express.use((0, morgan_1.default)('combined', {
            stream: {
                write: (message) => logger_1.logger.info(message.trim())
            }
        }));
        // Health check endpoint
        this.express.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: environment_1.config.node.env,
            });
        });
    }
    /**
     * Configuración de rutas API
     */
    initializeRoutes() {
        // API Routes
        this.express.use('/api/auth', auth_1.authRoutes);
        this.express.use('/api/user', user_1.userRoutes);
        this.express.use('/api/interviews', interviews_1.interviewRoutes);
        this.express.use('/api/questions', questions_1.questionRoutes);
        this.express.use('/api/ai', ai_1.aiRoutes);
        this.express.use('/api/media', media_1.mediaRoutes);
        this.express.use('/api/notifications', notifications_1.notificationRoutes);
        // API documentation route
        this.express.get('/api', (req, res) => {
            res.json({
                name: 'InterviewAI API',
                version: '1.0.0',
                description: 'API para simulación de entrevistas con inteligencia artificial',
                endpoints: {
                    auth: '/api/auth',
                    user: '/api/user',
                    interviews: '/api/interviews',
                    questions: '/api/questions',
                    ai: '/api/ai',
                    media: '/api/media',
                    notifications: '/api/notifications',
                },
                documentation: '/api/docs', // Swagger UI cuando se implemente
            });
        });
    }
    /**
     * Configuración de manejo de errores
     */
    initializeErrorHandling() {
        this.express.use(notFoundHandler_1.notFoundHandler);
        this.express.use(errorHandler_1.errorHandler);
    }
    /**
     * Inicializar conexiones de base de datos
     */
    async initializeDatabase() {
        try {
            await database_1.prisma.$connect();
            logger_1.logger.info('✅ Base de datos PostgreSQL conectada');
        }
        catch (error) {
            logger_1.logger.error('❌ Error conectando a PostgreSQL:', error);
            process.exit(1);
        }
        try {
            await redis_1.redis.ping();
            logger_1.logger.info('✅ Redis conectado');
        }
        catch (error) {
            logger_1.logger.error('❌ Error conectando a Redis:', error);
            // Redis es opcional, continuamos sin él
        }
    }
    /**
     * Iniciar servidor
     */
    async start() {
        await this.initializeDatabase();
        const port = environment_1.config.server.port;
        this.express.listen(port, () => {
            logger_1.logger.info(`🚀 Servidor InterviewAI iniciado en puerto ${port}`);
            logger_1.logger.info(`📍 Ambiente: ${environment_1.config.node.env}`);
            logger_1.logger.info(`🔗 API URL: http://localhost:${port}/api`);
            logger_1.logger.info(`❤️  Health Check: http://localhost:${port}/health`);
        });
        // Graceful shutdown
        process.on('SIGTERM', this.gracefulShutdown);
        process.on('SIGINT', this.gracefulShutdown);
    }
}
// Inicializar y arrancar servidor
const app = new App();
if (require.main === module) {
    app.start().catch((error) => {
        logger_1.logger.error('❌ Error fatal al iniciar servidor:', error);
        process.exit(1);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map