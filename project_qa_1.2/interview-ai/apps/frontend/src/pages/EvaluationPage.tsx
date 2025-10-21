import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface EvaluationData {
  overallScore: number
  categories: {
    clarity: number
    technical: number
    communication: number
  }
  strengths: string[]
  improvements: string[]
  aiMessage: string
}

const EvaluationPage = () => {
  const location = useLocation()
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationData>({
    overallScore: 7,
    categories: {
      clarity: 3,
      technical: 3,
      communication: 4
    },
    strengths: [
      'Respondiste con claridad',
      'Usaste ejemplos concretos en tus respuestas'
    ],
    improvements: [
      'Te faltó estructurar tus respuestas con método STAR',
      'Podrías reforzar terminología técnica en tus respuestas'
    ],
    aiMessage: 'Te sugerimos practicar entrevistas de comportamiento enfocadas en trabajo en equipo para fortalecer tu claridad y estructura.'
  })

  useEffect(() => {
    // Si viene datos de la entrevista desde InterviewPage, los usamos
    if (location.state?.evaluation) {
      setEvaluation(location.state.evaluation)
    }
  }, [location])

  useEffect(() => {
    // Deshabilitar scroll cuando el componente se monta
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    // Limpiar cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [])

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= rating ? 'text-cyan-400' : 'text-gray-500'}`}>
          {i <= rating ? '★' : '☆'}
        </span>
      )
    }
    return stars
  }
  return (
    <div className="h-screen text-white relative overflow-hidden">
      <div className="relative z-10 pt-8 p-8 max-w-7xl mx-auto">
        {/* Header de celebración */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-5xl font-black mb-3">
            <span className="neon-text">¡Excelente trabajo,</span> Usuario!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Has completado tu sesión de entrenamiento IA. Aquí tienes un análisis completo 
            de tu desempeño y recomendaciones personalizadas.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Actions - Always visible */}
          <div className="col-span-12 md:col-span-3 space-y-3 animate-slide-in-right">
            <div className="glass-card neon-border p-4 bg-gray-900/50 backdrop-blur-sm">
              <h3 className="text-cyan-400 font-bold mb-4 uppercase tracking-wide text-xs">
                Acciones Rápidas
              </h3>
              
              <nav className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 hover:bg-cyan-400/10 hover:border-cyan-400/50 border border-transparent group">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white group-hover:text-cyan-400 font-medium text-sm">Revisar Sesión</div>
                    <div className="text-gray-400 text-xs">Ver respuestas</div>
                  </div>
                </button>
                
                <Link 
                  to="/interview"
                  className="w-full flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 hover:bg-green-400/10 hover:border-green-400/50 border border-transparent group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white group-hover:text-green-400 font-medium text-sm">Nueva Práctica</div>
                    <div className="text-gray-400 text-xs">Entrenar de nuevo</div>
                  </div>
                </Link>
                
                <Link 
                  to="/dashboard"
                  className="w-full flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 hover:bg-purple-400/10 hover:border-purple-400/50 border border-transparent group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0L3 9.414V17a1 1 0 001 1h12a1 1 0 001-1V9.414l-5.293 5.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v1.5l-5.5 5.5a1 1 0 01-1.414 0L2 7.5V6z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white group-hover:text-purple-400 font-medium text-sm">Dashboard</div>
                    <div className="text-gray-400 text-xs">Panel principal</div>
                  </div>
                </Link>
              </nav>
            </div>

            {/* Quick Stats Recap */}
            <div className="glass-card neon-border p-4 bg-gray-900/50 backdrop-blur-sm">
              <h4 className="text-green-400 font-bold mb-3 uppercase tracking-wide text-xs">Esta Sesión</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Tiempo</span>
                  <span className="text-cyan-400 font-bold text-sm">12m 45s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Preguntas</span>
                  <span className="text-purple-400 font-bold text-sm">5/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Modalidad</span>
                  <span className="text-green-400 font-bold text-sm">Voz + Chat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Results Area - Compact Unified Section */}
          <div className="col-span-12 md:col-span-9 animate-fade-in-up">
            {/* Unified Evaluation Dashboard */}
            <div className="glass-card neon-border p-6 space-y-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold neon-text">ANÁLISIS COMPLETO DE EVALUACIÓN</h2>
                  <button 
                    onClick={() => setShowRecommendation(true)}
                    className="relative p-2 rounded-lg group transition-colors"
                    title="Ver Recomendación IA"
                  >
                    <div className="absolute inset-0 rounded-full border border-purple-400 opacity-60 animate-spin-slow"></div>
                    <div className="relative">
                      <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </button>
                </div>
                <p className="text-gray-400 text-sm">Puntuación, categorías, fortalezas y áreas de mejora unificadas</p>
              </div>

              {/* Top Row: Score + Categories in grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Overall Score - Compact */}
                <div className="text-center">
                  <div className="relative mx-auto w-24 h-24 mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="35" stroke="rgba(0, 245, 255, 0.2)" strokeWidth="6" fill="none" />
                      <circle
                        cx="50" cy="50" r="35" stroke="url(#scoreGradientEval)" strokeWidth="6" fill="none"
                        strokeDasharray={`${(evaluation.overallScore * 21.99) / 10} 219.9`}
                        className="transition-all duration-2000" strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="scoreGradientEval" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00f5ff" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-black neon-text">{evaluation.overallScore}</div>
                        <div className="text-gray-400 text-xs">de 10</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-cyan-400 font-bold text-sm uppercase">Puntuación Global</h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {evaluation.overallScore >= 8 ? 'Excelente' : evaluation.overallScore >= 6 ? 'Bueno' : 'En progreso'}
                  </p>
                </div>

                {/* Categories - Compact */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-cyan-400 font-semibold text-sm mb-1">Claridad</h4>
                  <div className="flex justify-center space-x-1 mb-2">
                    {renderStars(evaluation.categories.clarity)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full transition-all duration-1000" 
                         style={{width: `${(evaluation.categories.clarity / 5) * 100}%`}}></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-purple-400 font-semibold text-sm mb-1">Técnico</h4>
                  <div className="flex justify-center space-x-1 mb-2">
                    {renderStars(evaluation.categories.technical)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-purple-400 h-1.5 rounded-full transition-all duration-1000" 
                         style={{width: `${(evaluation.categories.technical / 5) * 100}%`}}></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-green-400 font-semibold text-sm mb-1">Comunicación</h4>
                  <div className="flex justify-center space-x-1 mb-2">
                    {renderStars(evaluation.categories.communication)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-green-400 h-1.5 rounded-full transition-all duration-1000" 
                         style={{width: `${(evaluation.categories.communication / 5) * 100}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Strengths & Improvements - Compact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths - Compact */}
                <div className="border border-green-400/30 rounded-xl p-4 bg-green-400/5">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-green-400 font-bold text-sm uppercase tracking-wide">Fortalezas</h4>
                  </div>
                  <div className="space-y-2">
                    {evaluation.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-green-400/10 rounded-lg">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements - Compact */}
                <div className="border border-yellow-400/30 rounded-xl p-4 bg-yellow-400/5">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wide">Áreas de Mejora</h4>
                  </div>
                  <div className="space-y-2">
                    {evaluation.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-400/10 rounded-lg">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modal de Recomendación IA */}
      {showRecommendation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card neon-border max-w-2xl w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold neon-text">Recomendación IA Personalizada</h3>
              </div>
              <button 
                onClick={() => setShowRecommendation(false)}
                className="p-2 border border-red-400/30 hover:border-red-400/50 rounded-lg transition-colors group"
              >
                <svg className="w-4 h-4 text-red-400 group-hover:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs text-gray-400 font-mono">
                  Generado: {new Date().toLocaleString('es-ES')}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                {evaluation.aiMessage}
              </p>
              <div className="flex space-x-4">
                <Link 
                  to="/interview"
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => setShowRecommendation(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Practicar Ahora</span>
                </Link>
                <Link 
                  to="/dashboard"
                  className="btn-secondary flex items-center space-x-2"
                  onClick={() => setShowRecommendation(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvaluationPage