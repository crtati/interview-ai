import { Request, Response, NextFunction } from 'express';
/**
 * Interface para extender Request con información del usuario
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
/**
 * Middleware de autenticación JWT
 * Verifica el token y adjunta información del usuario al request
 */
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware de autorización por roles
 * Debe usarse después del middleware de autenticación
 */
export declare const authorize: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware opcional de autenticación
 * Adjunta información del usuario si hay token válido, pero no falla si no lo hay
 */
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Utilities para JWT
 */
export declare const jwtUtils: {
    /**
     * Generar token de acceso
     */
    generateAccessToken: (payload: {
        userId: string;
        email: string;
        role: string;
    }) => string;
    /**
     * Generar refresh token
     */
    generateRefreshToken: (payload: {
        userId: string;
    }) => string;
    /**
     * Verificar refresh token
     */
    verifyRefreshToken: (token: string) => any;
    /**
     * Decodificar token sin verificar (útil para extraer información)
     */
    decodeToken: (token: string) => any;
};
//# sourceMappingURL=auth.d.ts.map