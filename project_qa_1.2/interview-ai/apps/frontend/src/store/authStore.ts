import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'
import { User, AuthState } from '../types/auth'

/**
 * Store global de autenticación usando Zustand
 * Maneja login, logout, refresh tokens y estado del usuario
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      /**
       * Inicializar autenticación al cargar la app
       * Verifica si hay tokens válidos y restaura la sesión
       */
      initAuth: async () => {
        set({ isLoading: true })
        try {
          const { token, refreshToken } = get()
          if (token && refreshToken) {
            // Verificar si el token es válido
            const user = await api.auth.verifyToken()
            set({ user, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          // Si el token no es válido, limpiar estado
          set({ user: null, token: null, refreshToken: null, isLoading: false })
        }
      },

      /**
       * Login de usuario
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.auth.login({ email, password })
          const { user, token, refreshToken } = response.data
          
          set({ 
            user, 
            token, 
            refreshToken, 
            isLoading: false, 
            error: null 
          })
          
          return { success: true }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al iniciar sesión'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      /**
       * Registro de usuario
       */
      register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.auth.register(userData)
          const { user, token, refreshToken } = response.data
          
          set({ 
            user, 
            token, 
            refreshToken, 
            isLoading: false, 
            error: null 
          })
          
          return { success: true }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al registrarse'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      /**
       * Logout de usuario
       */
      logout: async () => {
        try {
          await api.auth.logout()
        } catch (error) {
          console.error('Error during logout:', error)
        } finally {
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            error: null 
          })
        }
      },

      /**
       * Refresh del token de acceso
       */
      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const response = await api.auth.refreshToken(refreshToken)
          const { token: newToken, refreshToken: newRefreshToken } = response.data
          
          set({ 
            token: newToken, 
            refreshToken: newRefreshToken 
          })
          
          return true
        } catch (error) {
          console.error('Error refreshing token:', error)
          // Si no se puede refrescar, hacer logout
          get().logout()
          return false
        }
      },

      /**
       * Actualizar perfil de usuario
       */
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.user.updateProfile(userData)
          const updatedUser = response.data
          
          set({ 
            user: updatedUser, 
            isLoading: false, 
            error: null 
          })
          
          return { success: true }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al actualizar perfil'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      /**
       * Limpiar errores
       */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
)