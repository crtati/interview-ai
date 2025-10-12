"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
/**
 * Cliente Prisma configurado con logging y error handling
 * Instancia única para toda la aplicación
 */
exports.prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
// Event listeners para logging de Prisma
exports.prisma.$on('query', (e) => {
    logger_1.logger.debug('Query: ' + e.query);
    logger_1.logger.debug('Params: ' + e.params);
    logger_1.logger.debug('Duration: ' + e.duration + 'ms');
});
exports.prisma.$on('error', (e) => {
    logger_1.logger.error('Prisma Error:', e);
});
exports.prisma.$on('info', (e) => {
    logger_1.logger.info('Prisma Info:', e.message);
});
exports.prisma.$on('warn', (e) => {
    logger_1.logger.warn('Prisma Warning:', e.message);
});
/**
 * Middleware para soft delete (si se implementa)
 */
// prisma.$use(async (params, next) => {
//   // Ejemplo de middleware para soft delete
//   if (params.action === 'delete') {
//     params.action = 'update'
//     params.args['data'] = { deletedAt: new Date() }
//   }
//   return next(params)
// })
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map