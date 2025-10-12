import express from 'express';
import 'express-async-errors';
/**
 * Servidor principal de InterviewAI Backend
 * Configuración completa con middlewares de seguridad, logging y rutas API
 */
declare class App {
    express: express.Application;
    constructor();
    /**
     * Configuración de middlewares de seguridad y utilidad
     */
    private initializeMiddlewares;
    /**
     * Configuración de rutas API
     */
    private initializeRoutes;
    /**
     * Configuración de manejo de errores
     */
    private initializeErrorHandling;
    /**
     * Inicializar conexiones de base de datos
     */
    private initializeDatabase;
    /**
     * Iniciar servidor
     */
    start(): Promise<void>;
    /**
     * Cerrar conexiones limpiamente
     */
    private gracefulShutdown;
}
declare const app: App;
export default app;
//# sourceMappingURL=index.d.ts.map