import { PrismaClient } from '@prisma/client';
/**
 * Cliente Prisma configurado con logging y error handling
 * Instancia única para toda la aplicación
 */
export declare const prisma: PrismaClient<{
    log: ({
        emit: "event";
        level: "query";
    } | {
        emit: "event";
        level: "error";
    } | {
        emit: "event";
        level: "info";
    } | {
        emit: "event";
        level: "warn";
    })[];
}, "error" | "info" | "query" | "warn", import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Middleware para soft delete (si se implementa)
 */
export default prisma;
//# sourceMappingURL=database.d.ts.map