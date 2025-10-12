"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
/**
 * Middleware para manejar rutas no encontradas (404)
 * Debe colocarse después de todas las rutas definidas
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map