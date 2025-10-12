"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.LIMITS = exports.DEFAULT_SETTINGS = exports.NOTIFICATION_TYPES = exports.USER_ROLES = exports.INTERVIEW_STATUS = exports.QUESTION_DIFFICULTIES = exports.QUESTION_CATEGORIES = exports.INTERVIEW_TYPES = exports.API_ENDPOINTS = exports.APP_CONFIG = void 0;
// Constantes de la aplicación
exports.APP_CONFIG = {
    name: 'InterviewAI',
    version: '1.0.0',
    description: 'Simulación de entrevistas con IA',
};
exports.API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
    },
    user: {
        profile: '/user/profile',
        settings: '/user/settings',
        metrics: '/user/metrics',
    },
    interviews: {
        list: '/interviews',
        create: '/interviews',
        detail: (id) => `/interviews/${id}`,
        start: (id) => `/interviews/${id}/start`,
        responses: (id) => `/interviews/${id}/responses`,
    },
    ai: {
        feedback: (id) => `/ai/feedback/${id}`,
        transcribe: '/ai/transcribe',
        speech: '/ai/speech',
    },
};
exports.INTERVIEW_TYPES = {
    TECHNICAL: 'technical',
    BEHAVIORAL: 'behavioral',
    MIXED: 'mixed',
    CUSTOM: 'custom',
};
exports.QUESTION_CATEGORIES = {
    TECHNICAL_SKILLS: 'technical_skills',
    PROBLEM_SOLVING: 'problem_solving',
    COMMUNICATION: 'communication',
    LEADERSHIP: 'leadership',
    TEAMWORK: 'teamwork',
    ADAPTABILITY: 'adaptability',
    CUSTOM: 'custom',
};
exports.QUESTION_DIFFICULTIES = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};
exports.INTERVIEW_STATUS = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
exports.USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};
exports.NOTIFICATION_TYPES = {
    INTERVIEW_COMPLETED: 'interview_completed',
    FEEDBACK_READY: 'feedback_ready',
    REMINDER: 'reminder',
    ACHIEVEMENT: 'achievement',
    SYSTEM: 'system',
};
// Configuraciones por defecto
exports.DEFAULT_SETTINGS = {
    language: 'es',
    preferredInterviewDuration: 30, // minutos
    enableNotifications: true,
    avatarEnabled: true,
    voiceProvider: 'azure',
    saveRecordings: true,
    shareDataForImprovement: false,
    allowAnalytics: true,
};
// Límites de la aplicación
exports.LIMITS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxInterviewDuration: 120, // 2 horas en minutos
    maxQuestionsPerInterview: 20,
    maxResponseDuration: 300, // 5 minutos en segundos
};
// Mensajes de error comunes
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Datos de entrada inválidos',
    SERVER_ERROR: 'Error interno del servidor',
    NETWORK_ERROR: 'Error de conexión',
};
