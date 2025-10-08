import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

/**
 * Cliente Prisma configurado con logging y error handling
 * Instancia única para toda la aplicación
 */
export const prisma = new PrismaClient({
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
})

// Event listeners para logging de Prisma
prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query)
  logger.debug('Params: ' + e.params)
  logger.debug('Duration: ' + e.duration + 'ms')
})

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e)
})

prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e.message)
})

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e.message)
})

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

export default prisma