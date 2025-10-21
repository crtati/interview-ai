import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

/**
 * Configuración central de Axios para todas las llamadas API
 * Incluye interceptors para autenticación y manejo de errores
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Configurar interceptors para requests y responses
   */
  private setupInterceptors() {
    // Request interceptor - agregar token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - manejar errores y refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Si es error 401 y no hemos intentado refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshSuccess = await useAuthStore.getState().refreshAccessToken()
            if (refreshSuccess) {
              // Reintentar request original con nuevo token
              const newToken = useAuthStore.getState().token
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Si falla el refresh, redirigir a login
            useAuthStore.getState().logout()
            window.location.href = '/login'
          }
        }

        // Mostrar toast de error para otros errores
        if (error.response?.status >= 400) {
          const message = error.response.data?.message || 'Ha ocurrido un error'
          toast.error(message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP básicos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }
}

// Instancia única del cliente API
const apiClient = new ApiClient()

/**
 * Servicios API organizados por dominio
 */
export const api = {
  // Autenticación
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    
    register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
      apiClient.post('/auth/register', userData),
    
    logout: () =>
      apiClient.post('/auth/logout'),
    
    refreshToken: (refreshToken: string) =>
      apiClient.post('/auth/refresh', { refreshToken }),
    
    verifyToken: () =>
      apiClient.get('/auth/verify'),
    
    forgotPassword: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) =>
      apiClient.post('/auth/reset-password', { token, password }),
  },

  // Usuario
  user: {
    getProfile: () =>
      apiClient.get('/user/profile'),
    
    updateProfile: (userData: any) =>
      apiClient.patch('/user/profile', userData),
    
    changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
      apiClient.patch('/user/change-password', passwords),
    
    getSettings: () =>
      apiClient.get('/user/settings'),
    
    updateSettings: (settings: any) =>
      apiClient.patch('/user/settings', settings),
    
    getMetrics: () =>
      apiClient.get('/user/metrics'),
  },

  // Entrevistas
  interviews: {
    getAll: (params?: { page?: number; limit?: number; status?: string }) =>
      apiClient.get('/interviews', { params }),
    
    getById: (id: string) =>
      apiClient.get(`/interviews/${id}`),
    
    create: (interviewData: any) =>
      apiClient.post('/interviews', interviewData),
    
    update: (id: string, interviewData: any) =>
      apiClient.patch(`/interviews/${id}`, interviewData),
    
    delete: (id: string) =>
      apiClient.delete(`/interviews/${id}`),
    
    // Nuevas funciones para el flujo de entrevista con fases
    startInterview: () =>
      apiClient.post('/interviews/start'),
    
    getPhaseMessage: (phase: string) =>
      apiClient.get(`/interviews/phase/${phase}`),
    
    nextPhase: (interviewId: string, currentPhase: string) =>
      apiClient.post(`/interviews/${interviewId}/next-phase`, { currentPhase }),
    
    completeInterview: (interviewId: string, responses: any[]) =>
      apiClient.post(`/interviews/${interviewId}/complete`, { responses }),
    
    // Funciones existentes
    start: (id: string) =>
      apiClient.post(`/interviews/${id}/start`),
    
    complete: (id: string) =>
      apiClient.post(`/interviews/${id}/complete`),
    
    saveResponse: (interviewId: string, responseData: any) =>
      apiClient.post(`/interviews/${interviewId}/responses`, responseData),
  },

  // Preguntas
  questions: {
    getAll: (params?: { category?: string; difficulty?: string; limit?: number }) =>
      apiClient.get('/questions', { params }),
    
    getById: (id: string) =>
      apiClient.get(`/questions/${id}`),
    
    getByCategory: (category: string) =>
      apiClient.get(`/questions/category/${category}`),
    
    create: (questionData: any) =>
      apiClient.post('/questions', questionData),
    
    update: (id: string, questionData: any) =>
      apiClient.patch(`/questions/${id}`, questionData),
    
    delete: (id: string) =>
      apiClient.delete(`/questions/${id}`),
  },

  // Feedback e IA
  ai: {
    generateFeedback: (interviewId: string) =>
      apiClient.post(`/ai/feedback/${interviewId}`),
    
    simulateInterview: (setupData: any) =>
      apiClient.post('/ai/simulate', setupData),
    
    transcribeAudio: (audioBlob: Blob) => {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      return apiClient.post('/ai/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    
    generateSpeech: (text: string, voice?: string) =>
      apiClient.post('/ai/speech', { text, voice }),
  },

  // Media y avatar
  media: {
    uploadAvatar: (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return apiClient.post('/media/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    
    generateAvatarVideo: (text: string, avatarId: string) =>
      apiClient.post('/media/avatar/generate', { text, avatarId }),
    
    getAvatarStatus: (jobId: string) =>
      apiClient.get(`/media/avatar/status/${jobId}`),
  },

  // Notificaciones
  notifications: {
    getAll: (params?: { page?: number; limit?: number; unread?: boolean }) =>
      apiClient.get('/notifications', { params }),
    
    markAsRead: (id: string) =>
      apiClient.patch(`/notifications/${id}/read`),
    
    markAllAsRead: () =>
      apiClient.patch('/notifications/read-all'),
    
    delete: (id: string) =>
      apiClient.delete(`/notifications/${id}`),
  },
}

export default apiClient