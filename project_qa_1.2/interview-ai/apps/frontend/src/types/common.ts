// Tipos para métricas y analytics
export interface UserMetrics {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  totalPracticeTime: number // en minutos
  improvementRate: number // porcentaje de mejora
  strongestCategories: QuestionCategory[]
  weakestCategories: QuestionCategory[]
  recentActivity: ActivityData[]
}

export interface ActivityData {
  date: string
  interviewsCompleted: number
  averageScore: number
  practiceTime: number
}

export interface ScoreDistribution {
  category: string
  score: number
  count: number
}

// Tipos para configuraciones del usuario
export interface UserSettings {
  language: string
  preferredInterviewDuration: number
  enableNotifications: boolean
  avatarPreferences: AvatarSettings
  audioSettings: AudioSettings
  privacySettings: PrivacySettings
}

export interface AvatarSettings {
  enabled: boolean
  avatarId: string
  voice: VoiceSettings
  appearance: AppearanceSettings
}

export interface VoiceSettings {
  provider: 'azure' | 'google' | 'elevenlabs'
  voice: string
  speed: number // 0.5 - 2.0
  pitch: number // -20 - 20
}

export interface AppearanceSettings {
  style: 'professional' | 'casual' | 'friendly'
  gender: 'male' | 'female' | 'neutral'
  age: 'young' | 'middle' | 'senior'
}

export interface AudioSettings {
  inputDevice?: string
  outputDevice?: string
  noiseReduction: boolean
  echoCancellation: boolean
  autoGainControl: boolean
}

export interface PrivacySettings {
  saveRecordings: boolean
  shareDataForImprovement: boolean
  allowAnalytics: boolean
}

// Tipos para notificaciones
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export enum NotificationType {
  INTERVIEW_COMPLETED = 'interview_completed',
  FEEDBACK_READY = 'feedback_ready',
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system'
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para errores
export interface ApiError {
  message: string
  code?: string
  details?: any
}