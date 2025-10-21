// Constantes de la aplicación
export const APP_CONFIG = {
  name: 'InterviewAI',
  version: '1.0.0',
  description: 'Simulación de entrevistas con IA',
} as const

export const API_ENDPOINTS = {
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
    detail: (id: string) => `/interviews/${id}`,
    start: (id: string) => `/interviews/${id}/start`,
    responses: (id: string) => `/interviews/${id}/responses`,
  },
  ai: {
    feedback: (id: string) => `/ai/feedback/${id}`,
    transcribe: '/ai/transcribe',
    speech: '/ai/speech',
  },
} as const

export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  MIXED: 'mixed',
  CUSTOM: 'custom',
} as const

export const QUESTION_CATEGORIES = {
  TECHNICAL_SKILLS: 'technical_skills',
  PROBLEM_SOLVING: 'problem_solving',
  COMMUNICATION: 'communication',
  LEADERSHIP: 'leadership',
  TEAMWORK: 'teamwork',
  ADAPTABILITY: 'adaptability',
  CUSTOM: 'custom',
} as const

export const QUESTION_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const

export const INTERVIEW_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export const NOTIFICATION_TYPES = {
  INTERVIEW_COMPLETED: 'interview_completed',
  FEEDBACK_READY: 'feedback_ready',
  REMINDER: 'reminder',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
} as const

// Configuraciones por defecto
export const DEFAULT_SETTINGS = {
  language: 'es',
  preferredInterviewDuration: 30, // minutos
  enableNotifications: true,
  avatarEnabled: true,
  voiceProvider: 'azure',
  saveRecordings: true,
  shareDataForImprovement: false,
  allowAnalytics: true,
} as const

// Límites de la aplicación
export const LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxInterviewDuration: 120, // 2 horas en minutos
  maxQuestionsPerInterview: 20,
  maxResponseDuration: 300, // 5 minutos en segundos
} as const

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Datos de entrada inválidos',
  SERVER_ERROR: 'Error interno del servidor',
  NETWORK_ERROR: 'Error de conexión',
} as const