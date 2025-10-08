// Tipos para las entrevistas
export interface Question {
  id: string
  text: string
  category: QuestionCategory
  difficulty: QuestionDifficulty
  expectedDuration: number // en segundos
  followUpQuestions?: string[]
}

export interface Interview {
  id: string
  userId: string
  title: string
  description?: string
  status: InterviewStatus
  type: InterviewType
  duration: number // duración total en segundos
  questions: Question[]
  responses: InterviewResponse[]
  feedback?: InterviewFeedback
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface InterviewResponse {
  id: string
  questionId: string
  audioUrl?: string
  transcription: string
  duration: number
  confidence: number // confianza del STT
  timestamp: string
}

export interface InterviewFeedback {
  id: string
  interviewId: string
  overallScore: number // 0-100
  strengths: string[]
  areasForImprovement: string[]
  detailedFeedback: QuestionFeedback[]
  recommendations: string[]
  generatedAt: string
}

export interface QuestionFeedback {
  questionId: string
  score: number // 0-100
  feedback: string
  keyPoints: string[]
  suggestedImprovements: string[]
}

// Enums
export enum InterviewStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InterviewType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  MIXED = 'mixed',
  CUSTOM = 'custom'
}

export enum QuestionCategory {
  TECHNICAL_SKILLS = 'technical_skills',
  PROBLEM_SOLVING = 'problem_solving',
  COMMUNICATION = 'communication',
  LEADERSHIP = 'leadership',
  TEAMWORK = 'teamwork',
  ADAPTABILITY = 'adaptability',
  CUSTOM = 'custom'
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Tipos para configuración de entrevista
export interface InterviewSetup {
  title: string
  description?: string
  type: InterviewType
  duration: number // en minutos
  questionCategories: QuestionCategory[]
  difficulty: QuestionDifficulty
  enableAvatar: boolean
  enableRecording: boolean
  language: string
}

// Tipos para el progreso de entrevista en tiempo real
export interface InterviewProgress {
  currentQuestionIndex: number
  totalQuestions: number
  timeElapsed: number // segundos
  timeRemaining: number // segundos
  isRecording: boolean
  currentResponse?: Partial<InterviewResponse>
}