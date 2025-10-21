export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  initAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}