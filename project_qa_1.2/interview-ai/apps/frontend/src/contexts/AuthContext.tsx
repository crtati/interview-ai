import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

type AuthContextType = {
  /** true si hay user + token en el store */
  isAuthenticated: boolean
  /** login real contra backend; devuelve true si OK */
  login: (email: string, password: string) => Promise<boolean>
  /** cierra sesión */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Leemos el estado real desde Zustand
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const storeLogin = useAuthStore((s) => s.login)
  const storeLogout = useAuthStore((s) => s.logout)
  const initAuth = useAuthStore((s) => s.initAuth)

  // Al montar la app, intenta restaurar sesión desde el store (persist)
  useEffect(() => {
    initAuth().catch(() => {})
  }, [initAuth])

  const isAuthenticated = !!(user && token)

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      login: async (email: string, password: string) => {
        const res = await storeLogin(email, password)
        return !!res.success
      },
      logout: async () => {
        await storeLogout()
      },
    }),
    [isAuthenticated, storeLogin, storeLogout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
