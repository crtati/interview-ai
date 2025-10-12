export declare const APP_CONFIG: {
    readonly name: "InterviewAI";
    readonly version: "1.0.0";
    readonly description: "Simulación de entrevistas con IA";
};
export declare const API_ENDPOINTS: {
    readonly auth: {
        readonly login: "/auth/login";
        readonly register: "/auth/register";
        readonly refresh: "/auth/refresh";
        readonly logout: "/auth/logout";
    };
    readonly user: {
        readonly profile: "/user/profile";
        readonly settings: "/user/settings";
        readonly metrics: "/user/metrics";
    };
    readonly interviews: {
        readonly list: "/interviews";
        readonly create: "/interviews";
        readonly detail: (id: string) => string;
        readonly start: (id: string) => string;
        readonly responses: (id: string) => string;
    };
    readonly ai: {
        readonly feedback: (id: string) => string;
        readonly transcribe: "/ai/transcribe";
        readonly speech: "/ai/speech";
    };
};
export declare const INTERVIEW_TYPES: {
    readonly TECHNICAL: "technical";
    readonly BEHAVIORAL: "behavioral";
    readonly MIXED: "mixed";
    readonly CUSTOM: "custom";
};
export declare const QUESTION_CATEGORIES: {
    readonly TECHNICAL_SKILLS: "technical_skills";
    readonly PROBLEM_SOLVING: "problem_solving";
    readonly COMMUNICATION: "communication";
    readonly LEADERSHIP: "leadership";
    readonly TEAMWORK: "teamwork";
    readonly ADAPTABILITY: "adaptability";
    readonly CUSTOM: "custom";
};
export declare const QUESTION_DIFFICULTIES: {
    readonly EASY: "easy";
    readonly MEDIUM: "medium";
    readonly HARD: "hard";
};
export declare const INTERVIEW_STATUS: {
    readonly DRAFT: "draft";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export declare const USER_ROLES: {
    readonly USER: "user";
    readonly ADMIN: "admin";
};
export declare const NOTIFICATION_TYPES: {
    readonly INTERVIEW_COMPLETED: "interview_completed";
    readonly FEEDBACK_READY: "feedback_ready";
    readonly REMINDER: "reminder";
    readonly ACHIEVEMENT: "achievement";
    readonly SYSTEM: "system";
};
export declare const DEFAULT_SETTINGS: {
    readonly language: "es";
    readonly preferredInterviewDuration: 30;
    readonly enableNotifications: true;
    readonly avatarEnabled: true;
    readonly voiceProvider: "azure";
    readonly saveRecordings: true;
    readonly shareDataForImprovement: false;
    readonly allowAnalytics: true;
};
export declare const LIMITS: {
    readonly maxFileSize: number;
    readonly maxInterviewDuration: 120;
    readonly maxQuestionsPerInterview: 20;
    readonly maxResponseDuration: 300;
};
export declare const ERROR_MESSAGES: {
    readonly UNAUTHORIZED: "No autorizado";
    readonly FORBIDDEN: "Acceso denegado";
    readonly NOT_FOUND: "Recurso no encontrado";
    readonly VALIDATION_ERROR: "Datos de entrada inválidos";
    readonly SERVER_ERROR: "Error interno del servidor";
    readonly NETWORK_ERROR: "Error de conexión";
};
//# sourceMappingURL=constants.d.ts.map