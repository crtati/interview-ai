import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simplemente verificamos que hay datos y navegamos
    if (username.trim() && password.trim()) {
      // Simulamos un usuario logueado en el store
      try {
        // Crear un usuario mock y token
        const mockUser = {
          id: '1',
          email: username,
          firstName: 'Usuario',
          lastName: 'Demo'
        }
        // Guardamos directamente en localStorage para que persista
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: mockUser,
            token: 'mock-token-123',
            refreshToken: 'mock-refresh-token'
          },
          version: 0
        }))
        // Actualizamos el estado de autenticación
        login()
        navigate('/dashboard')
      } catch (error) {
        console.error('Error de login:', error)
      }
    } else {
      alert('Por favor ingresa usuario y contraseña')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Geometric background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border border-cyan-400/30 rotate-45 animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 border border-purple-400/30 rotate-12 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-cyan-400/20 rotate-[30deg] animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 border border-purple-400/25 rotate-[60deg] animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-lines" patternUnits="userSpaceOnUse" width="60" height="60">
              <path d="M 0,30 L 30,30 L 30,0 M 30,30 L 60,30 M 30,30 L 30,60" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="30" cy="30" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-lines)" className="text-cyan-400"/>
        </svg>
      </div>

      {/* Header futurista */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="neon-text text-2xl font-bold font-mono tracking-wider">
          INTERVIEW.AI
        </div>
        <nav className="flex space-x-8">
          <a href="#" className="text-white hover:text-cyan-400 transition-all duration-300 relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-white hover:text-cyan-400 transition-all duration-300 relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-white hover:text-cyan-400 transition-all duration-300 relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto px-8 gap-16">
        {/* Lado izquierdo - Información */}
        <div className="flex-1 text-white animate-fade-in-up">
          <div className="mb-4">
            <span className="text-cyan-400 text-sm font-mono uppercase tracking-widest">Artificial Intelligence</span>
          </div>
          <h1 className="text-6xl font-black mb-6 leading-tight">
            Master Your
            <br />
            <span className="neon-text bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Interview Skills
            </span>
          </h1>
          <p className="text-xl mb-12 leading-relaxed text-gray-300 max-w-lg">
            Entrena con IA avanzada, recibe feedback personalizado en tiempo real 
            y conquista cualquier entrevista laboral con confianza absoluta.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-glow-pulse"></div>
              <span>IA Conversacional</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-glow-pulse" style={{animationDelay: '0.5s'}}></div>
              <span>Análisis en Tiempo Real</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-glow-pulse" style={{animationDelay: '1s'}}></div>
              <span>Feedback Personalizado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
              <span>Múltiples Escenarios</span>
            </div>
          </div>
          
          {/* Redes sociales */}
          <div className="flex space-x-4">
            <a href="#" className="p-4 glass-card hover-lift interactive-element group border border-cyan-400/30">
              <FaGithub className="text-cyan-400 group-hover:text-white text-xl transition-colors" />
            </a>
            <a href="#" className="p-4 glass-card hover-lift interactive-element group border border-purple-400/30">
              <FaInstagram className="text-purple-400 group-hover:text-white text-xl transition-colors" />
            </a>
            <a href="#" className="p-4 glass-card hover-lift interactive-element group border border-green-400/30">
              <FaLinkedin className="text-green-400 group-hover:text-white text-xl transition-colors" />
            </a>
          </div>
        </div>

        {/* Lado derecho - Formulario de login */}
        <div className="flex-1 max-w-md animate-slide-in-right">
          {/* Avatar/Logo futurista */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-float"></div>
              <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-30 animate-glow-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Acceso al Sistema</h2>
            <p className="text-gray-400 text-sm">Inicia sesión para comenzar tu entrenamiento</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 glass-card neon-border">
            <div className="space-y-2">
              <label className="text-cyan-400 text-sm font-medium">Usuario</label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-futuristic"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-cyan-400 text-sm font-medium">Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-futuristic"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-400">
                <input type="checkbox" className="w-4 h-4 text-cyan-400 rounded border-gray-600 focus:ring-cyan-400" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-lg font-bold"
            >
              INICIAR SESIÓN
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                ¿No tienes cuenta? 
                <a href="#" className="text-cyan-400 hover:text-cyan-300 ml-1 transition-colors">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage