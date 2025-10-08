import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay datos de autenticación en localStorage
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        if (parsed.state && parsed.state.user && parsed.state.token) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error parsing auth data:', error)
      }
    }
  }, [])

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('auth-storage')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}