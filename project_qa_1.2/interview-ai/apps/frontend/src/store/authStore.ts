import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'
import type { User, AuthState } from '../types/auth'
import type { AxiosResponse } from 'axios'

/** Tipos de respuesta estándar de tu backend */
type ApiSuccess<T> = { success: true; data: T; message?: string }
type ApiFail = { success: false; message: string }
type ApiResponse<T> = ApiSuccess<T> | ApiFail

type LoginPayload = { user: User; token: string; refreshToken: string }
type RegisterPayload = { user: User; token: string; refreshToken: string }
type RefreshPayload = { token: string; refreshToken: string }

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      /** Inicializa sesión si hay token; trae perfil */
      initAuth: async () => {
        set({ isLoading: true })
        try {
          const { token } = get()
          if (!token) {
            set({ isLoading: false })
            return
          }
          // Obtén el perfil del usuario autenticado
          const res = await api.user.getProfile()
          const profile = res.data as User
          set({ user: profile, isLoading: false })
        } catch (_err) {
          set({ user: null, token: null, refreshToken: null, isLoading: false })
        }
      },

      /** LOGIN: valida contra /auth/login */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = (await api.auth.login({ email, password })) as AxiosResponse<
            ApiResponse<LoginPayload>
          >
          const payload = res.data

          if (!payload.success) {
            throw new Error(payload.message || 'Credenciales inválidas')
          }

          const { user, token, refreshToken } = payload.data
          set({ user, token, refreshToken, isLoading: false, error: null })
          return { success: true }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            'Error al iniciar sesión'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      /** REGISTRO: /auth/register */
      register: async (userData: {
        email: string
        password: string
        firstName: string
        lastName: string
      }) => {
        set({ isLoading: true, error: null })
        try {
          const res = (await api.auth.register(userData)) as AxiosResponse<
            ApiResponse<RegisterPayload>
          >
          const payload = res.data

          if (!payload.success) {
            throw new Error(payload.message || 'Error al registrarse')
          }

          const { user, token, refreshToken } = payload.data
          set({ user, token, refreshToken, isLoading: false, error: null })
          return { success: true }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            'Error al registrarse'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      /** LOGOUT */
      logout: async () => {
        try {
          await api.auth.logout()
        } catch {
          /* noop */
        } finally {
          set({ user: null, token: null, refreshToken: null, error: null })
        }
      },

      /** REFRESH TOKEN */
      refreshAccessToken: async () => {
        const r = get().refreshToken
        if (!r) return false
        try {
          const res = (await api.auth.refreshToken(r)) as AxiosResponse<
            ApiResponse<RefreshPayload>
          >
          const payload = res.data
          if (!payload.success) return false

          const { token: newToken, refreshToken: newRefresh } = payload.data
          set({ token: newToken, refreshToken: newRefresh })
          return true
        } catch {
          await get().logout()
          return false
        }
      },

      /** Actualizar perfil */
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.user.updateProfile(userData)
          const updatedUser = res.data as User
          set({ user: updatedUser, isLoading: false, error: null })
          return { success: true }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.message ||
            'Error al actualizar perfil'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

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
