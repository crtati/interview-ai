import { Link } from 'react-router-dom'
import { useState } from 'react'

const DashboardPage = () => {
  const [showRecommendations, setShowRecommendations] = useState(false)

  return (
    <div className="text-white relative">
      {/* Geometric floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-float opacity-30" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header compacto */}
        <div className="mb-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-glow-pulse"></div>
                <span className="text-cyan-400 text-xs font-mono uppercase tracking-wide">Sistema Activo</span>
              </div>
              <h1 className="text-2xl font-black mb-1">
                <span className="neon-text">Hola,</span> Usuario
              </h1>
              <p className="text-xs text-gray-300 max-w-xl">
                Centro de entrenamiento IA - Tu evolución profesional continúa
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-cyan-400 mb-0.5">
                {new Date().toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit'
                })}
              </div>
              <div className="text-gray-400 text-xs">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'short'
                }).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar Menu futurista */}
          <div className="col-span-3 space-y-3 animate-slide-in-right">
            <div className="glass-card neon-border p-4">
              <h3 className="text-cyan-400 font-bold mb-4 uppercase tracking-wide text-xs">
                Centro de Control
              </h3>
              
              <nav className="space-y-2">
                <Link 
                  to="/interview" 
                  className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-cyan-400/10 hover:border-cyan-400/50 border border-transparent group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12l-2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white group-hover:text-cyan-400 font-medium text-sm">Nueva Entrevista</div>
                    <div className="text-gray-400 text-xs">Comenzar sesión IA</div>
                  </div>
                </Link>
                
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-purple-400/10 hover:border-purple-400/50 border border-transparent group">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white group-hover:text-purple-400 font-medium text-sm">Historial</div>
                    <div className="text-gray-400 text-xs">Sesiones anteriores</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-green-400/10 hover:border-green-400/50 border border-transparent group">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white group-hover:text-green-400 font-medium text-sm">Configuración</div>
                    <div className="text-gray-400 text-xs">Ajustes del sistema</div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="glass-card neon-border p-4">
              <h4 className="text-purple-400 font-bold mb-3 uppercase tracking-wide text-xs">Stats Rápidas</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Sesiones</span>
                  <span className="text-cyan-400 font-bold text-sm">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Promedio</span>
                  <span className="text-green-400 font-bold text-sm">8.5/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Tiempo</span>
                  <span className="text-yellow-400 font-bold text-sm">45m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9 space-y-4 animate-fade-in-up">
            {/* Performance Overview */}
            <div className="glass-card neon-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Panel de Rendimiento</h2>
                  <p className="text-gray-400 text-sm">Análisis de tu progreso</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-glow-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Sistema Activo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Total Interviews */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                    <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
                      <span className="text-2xl font-black neon-text">3</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-30 animate-glow-pulse"></div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">Entrevistas</h3>
                  <p className="text-gray-400 text-xs">Sesiones completadas</p>
                </div>

                {/* Performance Level */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"></div>
                    <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center flex-col">
                      <span className="text-sm font-black text-green-400">ADV</span>
                      <span className="text-xs text-gray-400">LVL</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">Nivel</h3>
                  <div className="bg-green-400/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                    AVANZADO
                  </div>
                </div>

                {/* Score Trend */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="rgba(139, 92, 246, 0.2)"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="url(#scoreGradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(85 * 219.8) / 100} 219.8`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#00f5ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-purple-400">85%</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">Promedio</h3>
                  <p className="text-purple-400 text-xs font-bold">↗ +15%</p>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="mb-8">
                <h4 className="text-white font-semibold mb-4">Evolución de Puntuaciones</h4>
                <div className="relative h-32">
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f5ff" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#00f5ff" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Grid */}
                    <defs>
                      <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Chart line */}
                    <path
                      d="M 40 90 Q 80 70 120 80 T 200 60 T 280 50 T 360 40"
                      stroke="url(#chartGradient)"
                      strokeWidth="3"
                      fill="none"
                      filter="url(#glow)"
                    />
                    
                    {/* Data points */}
                    <circle cx="40" cy="90" r="4" fill="#00f5ff" className="animate-glow-pulse"/>
                    <circle cx="120" cy="80" r="4" fill="#8b5cf6" className="animate-glow-pulse" style={{animationDelay: '0.5s'}}/>
                    <circle cx="200" cy="60" r="4" fill="#00f5ff" className="animate-glow-pulse" style={{animationDelay: '1s'}}/>
                    <circle cx="280" cy="50" r="4" fill="#8b5cf6" className="animate-glow-pulse" style={{animationDelay: '1.5s'}}/>
                    <circle cx="360" cy="40" r="4" fill="#00f5ff" className="animate-glow-pulse" style={{animationDelay: '2s'}}/>
                  </svg>
                  
                  {/* Score labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-8">
                    <span>56pt</span>
                    <span>72pt</span>
                    <span>84pt</span>
                    <span>89pt</span>
                    <span>97pt</span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-2 gap-8">
                {/* Strengths */}
                <div>
                  <h4 className="text-green-400 font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Fortalezas Identificadas
                  </h4>
                  <div className="space-y-3">
                    <div className="glass-card border border-green-400/30 p-3">
                      <span className="text-green-400 font-medium">Comunicación Clara</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>
                    <div className="glass-card border border-green-400/30 p-3">
                      <span className="text-green-400 font-medium">Conocimientos Técnicos</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Áreas de Mejora
                  </h4>
                  <div className="space-y-3">
                    <div className="glass-card border border-yellow-400/30 p-3">
                      <span className="text-yellow-400 font-medium">Método STAR</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div className="glass-card border border-yellow-400/30 p-3">
                      <span className="text-yellow-400 font-medium">Gestión de Nervios</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Icono flotante de recomendaciones - Esquina inferior derecha */}
      <button
        onClick={() => setShowRecommendations(true)}
        className="fixed bottom-20 right-4 z-[60] w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 animate-float neon-border group relative"
        title="¡Tengo recomendaciones para ti! 🤖"
        style={{position: 'fixed'}}
      >
        {/* Cara del robot */}
        <div className="relative">
          {/* Cabeza del robot */}
          <div className="w-10 h-10 bg-black rounded-lg flex flex-col items-center justify-center relative">
            {/* Ojos del robot */}
            <div className="flex space-x-1 mb-1">
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            {/* Boca del robot */}
            <div className="w-3 h-0.5 bg-cyan-300 rounded-full opacity-80"></div>
            {/* Antenas */}
            <div className="absolute -top-1 left-1 w-0.5 h-1 bg-purple-300 rounded-full"></div>
            <div className="absolute -top-1 right-1 w-0.5 h-1 bg-purple-300 rounded-full"></div>
          </div>
        </div>
        
        {/* Indicador de mensaje */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-30 animate-glow-pulse -z-10"></div>
      </button>

      {/* Modal de recomendaciones */}
      {showRecommendations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRecommendations(false)}
          ></div>
          <div className="relative glass-card neon-border p-6 max-w-lg w-full mx-4 animate-fade-in-up">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center animate-float">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="neon-text font-semibold">Asistente IA</h3>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date().toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowRecommendations(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Contenido del mensaje */}
            <div className="glass-card border border-cyan-400/30 p-4 mb-4">
              <p className="text-gray-300 leading-relaxed">
                Tu comunicación técnica ha mejorado <span className="text-green-400 font-semibold">notablemente</span> en las últimas sesiones. 
                Recomiendo enfocar las próximas prácticas en <span className="text-cyan-400 font-semibold">entrevistas comportamentales</span> 
                usando el método STAR para maximizar tu puntuación.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRecommendations(false)}
                className="btn-secondary text-sm py-2 px-4 flex-1"
              >
                Entendido
              </button>
              <Link 
                to="/interview"
                className="btn-primary text-sm py-2 px-4 flex-1 text-center"
                onClick={() => setShowRecommendations(false)}
              >
                Iniciar Práctica
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage