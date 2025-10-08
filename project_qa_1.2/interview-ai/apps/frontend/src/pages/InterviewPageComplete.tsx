import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar3DCSS from '../components/Avatar3DCSS'

interface InterviewQuestion {
  id: string
  question: string
  category: string
  expectedDuration: number
  answer?: string
  evaluation?: any
  analyzed?: string | boolean
}

// Enum para las fases de la entrevista
enum InterviewPhase {
  WELCOME = 'WELCOME',
  EXPLANATION = 'EXPLANATION', 
  QUESTIONS = 'QUESTIONS',
  FAREWELL = 'FAREWELL',
  COMPLETED = 'COMPLETED'
}

const InterviewPageComplete = () => {
  const navigate = useNavigate()
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [useVoiceMode, setUseVoiceMode] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{type: 'ai' | 'user', message: string, timestamp: Date}>>([])
  const [messageInput, setMessageInput] = useState('')
  
  // Estados para el flujo de entrevista
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>(InterviewPhase.WELCOME)
  const [interviewId, setInterviewId] = useState<string>('')
  const [phaseTransitioning, setPhaseTransitioning] = useState<boolean>(false)
  const [phaseExecuted, setPhaseExecuted] = useState<Set<string>>(new Set())
  const [isProcessingResponse, setIsProcessingResponse] = useState<boolean>(false)
  
  const [interviewData, setInterviewData] = useState({
    currentQuestionIndex: 0,
    questions: [] as InterviewQuestion[]
  })

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Verificar soporte de APIs de voz
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    const hasSpeechSynthesis = 'speechSynthesis' in window
    
    setSpeechSupported(hasWebSpeech && hasSpeechSynthesis)
    
    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const requestPermissions = async () => {
    if (useVoiceMode && speechSupported) {
      try {
        // Solicitar permisos de micrófono
        await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Configurar reconocimiento de voz
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = 'es-ES'
          
          recognitionRef.current.onresult = (event: any) => {
            let transcript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript
            }
            setMessageInput(transcript)
          }

          recognitionRef.current.onerror = (event: any) => {
            console.error('Error de reconocimiento:', event.error)
            setIsListening(false)
          }

          recognitionRef.current.onend = () => {
            setIsListening(false)
          }
        }
      } catch (error) {
        console.error('Error solicitando permisos:', error)
        alert('No se pudieron obtener permisos de micrófono. Usaremos modo chat.')
        setUseVoiceMode(false)
      }
    }
    
    setPermissionsGranted(true)
    
    // Inicializar la entrevista
    initializeInterview()
  }

  const initializeInterview = async () => {
    try {
      // Llamada real a la API para iniciar entrevista
      const response = await fetch('http://localhost:3001/api/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Error al iniciar entrevista')
      }
      
      const interviewResponse = await response.json()
      
      setInterviewId(interviewResponse.interviewId)
      setCurrentPhase(InterviewPhase.WELCOME)
      setInterviewData({
        currentQuestionIndex: 0,
        questions: interviewResponse.questions
      })
      
      // Comenzar con el saludo de bienvenida
      setTimeout(() => {
        speakMessage(interviewResponse.message.message, () => {
          // Después del saludo, pasar a explicación
          setTimeout(() => {
            setCurrentPhase(InterviewPhase.EXPLANATION)
          }, 2000)
        })
      }, 1000)
      
    } catch (error) {
      console.error('Error inicializando entrevista:', error)
      // Fallback a datos locales si hay error de API
      const fallbackData = {
        interviewId: `interview_${Date.now()}`,
        phase: InterviewPhase.WELCOME,
        message: {
          message: "¡Hola! Soy tu entrevistadora virtual. Me da mucho gusto conocerte y estoy muy emocionada de realizar esta entrevista contigo. Espero que te sientas cómodo y confiado durante nuestra conversación.",
          duration: 8000
        },
        questions: [
          {
            id: '1',
            question: 'Cuéntame sobre ti y tu experiencia profesional más relevante.',
            category: 'PRESENTATION',
            expectedDuration: 180
          },
          {
            id: '2', 
            question: '¿Cuáles consideras que son tus principales fortalezas técnicas?',
            category: 'TECHNICAL_SKILLS',
            expectedDuration: 150
          },
          {
            id: '3',
            question: '¿Por qué te interesa trabajar en esta posición?',
            category: 'MOTIVATION',
            expectedDuration: 120
          },
          {
            id: '4',
            question: 'Describe un proyecto desafiante en el que hayas trabajado recientemente.',
            category: 'EXPERIENCE',
            expectedDuration: 200
          },
          {
            id: '5',
            question: '¿Dónde te ves profesionalmente en los próximos 5 años?',
            category: 'CAREER_GOALS',
            expectedDuration: 120
          }
        ]
      }
      
      setInterviewId(fallbackData.interviewId)
      setCurrentPhase(InterviewPhase.WELCOME)
      setInterviewData({
        currentQuestionIndex: 0,
        questions: fallbackData.questions
      })
      
      setTimeout(() => {
        speakMessage(fallbackData.message.message, () => {
          // Después del saludo, pasar a explicación
          setTimeout(() => {
            setCurrentPhase(InterviewPhase.EXPLANATION)
          }, 2000)
        })
      }, 1000)
    }
  }

  const speakMessage = (text: string, onComplete?: () => void) => {
    // Agregar mensaje al chat
    setChatHistory((prev: any) => [...prev, {
      type: 'ai',
      message: text,
      timestamp: new Date()
    }])

    if (synthRef.current && speechSupported) {
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        if (onComplete) {
          onComplete()
        }
      }
      
      synthRef.current.speak(utterance)
    } else {
      // Si no hay síntesis de voz, simular el final
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 3000)
    }
  }

  // Usar useEffect para manejar transiciones de fase
  useEffect(() => {
    const phaseKey = `${currentPhase}_${interviewId}`
    
    if (phaseTransitioning || phaseExecuted.has(phaseKey)) return
    
    switch (currentPhase) {
      case InterviewPhase.EXPLANATION:
        // Marcar como ejecutado inmediatamente
        setPhaseExecuted(prev => new Set([...prev, phaseKey]))
        setPhaseTransitioning(true)
        
        const explanationMessage = "Te explico cómo funcionará nuestra entrevista: Tendremos una conversación de aproximadamente 15-20 minutos donde te haré 5 preguntas cuidadosamente seleccionadas. Tómate tu tiempo para responder, no hay prisa. Al final, recibirás una evaluación detallada con retroalimentación constructiva para ayudarte a mejorar. Comenzamos en unos momentos."
        
        console.log("🎭 Ejecutando fase EXPLANATION - solo una vez")
        speakMessage(explanationMessage) // Solo hablar, no auto-avanzar
        
        // Después de la explicación, pasar a preguntas
        setTimeout(() => {
          console.log("🎯 Cambiando a fase QUESTIONS")
          setCurrentPhase(InterviewPhase.QUESTIONS)
          setPhaseTransitioning(false)
          
          // Iniciar primera pregunta
          setTimeout(() => {
            if (interviewData.questions.length > 0) {
              console.log("❓ Iniciando primera pregunta")
              speakQuestion(interviewData.questions[0].question)
            }
          }, 1000)
        }, 15000) // 15 segundos para la explicación
        break
    }
  }, [currentPhase, phaseTransitioning, interviewData.questions, phaseExecuted, interviewId])





  const getProgressPercentage = (): number => {
    switch (currentPhase) {
      case InterviewPhase.WELCOME:
        return 10
      case InterviewPhase.EXPLANATION:
        return 20
      case InterviewPhase.QUESTIONS:
        if (interviewData.questions.length === 0) return 30
        // 30% base + 50% distribuido entre las preguntas
        const questionProgress = (interviewData.currentQuestionIndex / interviewData.questions.length) * 50
        return 30 + questionProgress
      case InterviewPhase.FAREWELL:
        return 90
      case InterviewPhase.COMPLETED:
        return 100
      default:
        return 0
    }
  }

  const speakQuestion = (text: string) => {
    // Usar speakMessage sin avanzar la fase
    speakMessage(text)
  }

  const analyzeResponseAndDecideNext = async (currentQ: InterviewQuestion, allQuestions: InterviewQuestion[]) => {
    // Si ya hicimos una pregunta de seguimiento para esta pregunta, ir a la siguiente pregunta
    if (currentQ.analyzed === true) {
      console.log("🔄 Ya se hizo seguimiento, continuando a la siguiente pregunta...")
      proceedToNextQuestion(allQuestions)
      return
    }
    
    try {
      console.log("🤖 Analizando respuesta con IA...")
      
      // Marcar que vamos a analizar esta pregunta
      currentQ.analyzed = true
      
      // Preparar datos para el análisis
      const previousResponses = allQuestions
        .slice(0, interviewData.currentQuestionIndex)
        .map(q => q.answer || '')
        .filter(answer => answer.trim() !== '')

      const analysisResponse = await fetch(`http://localhost:3001/api/interviews/${interviewId}/analyze-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalQuestion: currentQ.question,
          userResponse: currentQ.answer,
          currentQuestionIndex: interviewData.currentQuestionIndex,
          totalQuestions: interviewData.questions.length,
          previousResponses: previousResponses,
          role: 'desarrollador'
        })
      })

      if (!analysisResponse.ok) {
        throw new Error('Error en análisis de IA')
      }

      const analysis = await analysisResponse.json()
      console.log("🧠 Análisis IA:", analysis)

      if (analysis.shouldAskFollowUp && analysis.followUpQuestion) {
        // IA decidió hacer pregunta de seguimiento
        console.log("💡 IA generó pregunta de seguimiento:", analysis.followUpQuestion)
        
        setTimeout(async () => {
          // Generar introducción natural con IA
          const generateAIFollowUpIntro = async () => {
            try {
              const response = await fetch(`http://localhost:3001/api/interviews/${interviewId}/generate-comment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userResponse: currentQ.answer,
                  questionContext: currentQ.question,
                  commentType: 'follow-up-intro'
                })
              })

              if (response.ok) {
                const data = await response.json()
                return data.comment
              }
            } catch (error) {
              console.error('Error generando introducción IA:', error)
            }
            
            // Fallback a introducción genérica
            return "Me parece muy interesante lo que comentas."
          }
          
          const aiIntro = await generateAIFollowUpIntro()
          console.log("🗨️ Comentario de seguimiento generado:", aiIntro)
          
          // Hablar la introducción y luego hacer la pregunta (sin duplicar en chat)
          speakMessage(aiIntro, () => {
            setTimeout(() => {
              speakQuestion(analysis.followUpQuestion)
            }, 1000)
          })
        }, 1000)
      } else {
        // IA decidió continuar con la siguiente pregunta
        console.log("➡️ IA decidió continuar:", analysis.reasoning)
        
        // Generar comentario natural con IA
        const generateAITransitionComment = async () => {
          try {
            const response = await fetch(`http://localhost:3001/api/interviews/${interviewId}/generate-comment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userResponse: currentQ.answer,
                questionContext: currentQ.question,
                commentType: 'transition'
              })
            })

            if (response.ok) {
              const data = await response.json()
              return data.comment
            }
          } catch (error) {
            console.error('Error generando comentario IA:', error)
          }
          
          // Fallback a comentario genérico
          return "Perfecto, entiendo tu experiencia."
        }
        
        // Generar y mostrar comentario de transición 
        setTimeout(async () => {
          const aiComment = await generateAITransitionComment()
          console.log("🗨️ Comentario de transición generado:", aiComment)
          
          // Hablar el comentario (speakMessage ya lo agrega al chat)
          speakMessage(aiComment, () => {
            // Continuar a la siguiente pregunta después del comentario
            setTimeout(() => {
              proceedToNextQuestion(allQuestions)
            }, 1000)
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Error analizando respuesta:', error)
      // Si hay error, continuar normalmente
      proceedToNextQuestion(allQuestions)
    }
  }

  const proceedToNextQuestion = (allQuestions: InterviewQuestion[]) => {
    if (interviewData.currentQuestionIndex < interviewData.questions.length - 1) {
      // Siguiente pregunta
      const nextIndex = interviewData.currentQuestionIndex + 1
      setInterviewData({
        ...interviewData,
        currentQuestionIndex: nextIndex,
        questions: allQuestions
      })
      
      // Hablar la siguiente pregunta
      setTimeout(() => {
        speakQuestion(interviewData.questions[nextIndex].question)
      }, 1500)
    } else {
      // Todas las preguntas respondidas, ir a la despedida
      setCurrentPhase(InterviewPhase.FAREWELL)
      
      // Despedida y agradecimiento
      setTimeout(() => {
        const farewellMessage = "¡Excelente trabajo! Has completado exitosamente la entrevista. Me impresionaron mucho tus respuestas y la forma en que te expresaste. Ahora procesaré toda la información para generar tu evaluación personalizada. En unos momentos podrás ver un análisis detallado de tu desempeño, incluyendo tus fortalezas y áreas de oportunidad. ¡Muchas gracias por tu tiempo y esfuerzo!"
        speakMessage(farewellMessage, () => {
          // Después de la despedida, ir a evaluación
          setTimeout(() => {
            navigate('/evaluation')
          }, 3000)
        })
      }, 1000)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setMessageInput('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const sendMessage = () => {
    console.log("📤 sendMessage called with:", messageInput)
    console.log("🔍 Current phase:", currentPhase)
    console.log("📊 Interview data:", interviewData)
    
    if (!messageInput.trim() || isProcessingResponse) return

    // Agregar respuesta del usuario al chat
    setChatHistory((prev: any) => [...prev, {
      type: 'user',
      message: messageInput,
      timestamp: new Date()
    }])

    // Solo procesar mensajes durante la fase de preguntas
    if (currentPhase === InterviewPhase.QUESTIONS) {
      console.log("✅ En fase de preguntas - procesando respuesta")
      
      // Evitar procesamiento múltiple
      setIsProcessingResponse(true)
      
      // Guardar respuesta actual
      const updatedQuestions = [...interviewData.questions]
      updatedQuestions[interviewData.currentQuestionIndex].answer = messageInput
      
      console.log("💾 Guardando respuesta:", messageInput)
      console.log("🔢 Índice actual:", interviewData.currentQuestionIndex)
      
      setInterviewData({
        ...interviewData,
        questions: updatedQuestions
      })
      setMessageInput('')

      // Analizar respuesta con IA para decidir si hacer seguimiento
      console.log("🧠 Llamando a analyzeResponseAndDecideNext...")
      analyzeResponseAndDecideNext(updatedQuestions[interviewData.currentQuestionIndex], updatedQuestions)
        .finally(() => {
          setIsProcessingResponse(false)
        })
    } else {
      console.log("⚠️ No en fase de preguntas - ignorando respuesta")
    }
  }

  const submitResponse = () => {
    if (!currentResponse.trim()) return

    // Agregar respuesta del usuario al chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: currentResponse,
      timestamp: new Date()
    }])

    // Guardar respuesta actual
    const updatedQuestions = [...interviewData.questions]
    updatedQuestions[interviewData.currentQuestionIndex].answer = currentResponse

    if (interviewData.currentQuestionIndex < interviewData.questions.length - 1) {
      // Siguiente pregunta
      const nextIndex = interviewData.currentQuestionIndex + 1
      setInterviewData({
        ...interviewData,
        currentQuestionIndex: nextIndex,
        questions: updatedQuestions
      })
      setCurrentResponse('')
      
      // Hablar la siguiente pregunta
      setTimeout(() => {
        speakQuestion(interviewData.questions[nextIndex].question)
      }, 500)
    } else {
      // Terminar entrevista
      finishInterview()
    }
  }

  const finishInterview = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    navigate('/evaluation')
  }

  const currentQuestion = interviewData.questions[interviewData.currentQuestionIndex]

  // Pantalla de configuración inicial
  if (!permissionsGranted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-400/20 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-purple-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-green-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="glass-card neon-border max-w-sm w-full mx-4 text-center animate-scale-in p-4">
          {/* Header compacto */}
          <div className="mb-4">
            <h2 className="text-lg font-black neon-text mb-1">
              CONFIGURACIÓN
            </h2>
            <p className="text-gray-400 text-xs">Prepara tu sesión de entrenamiento IA</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-cyan-400 mb-3 font-medium uppercase tracking-wide text-xs">
              Selecciona tu modo preferido:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setUseVoiceMode(true)
                  requestPermissions()
                }}
                className="p-3 rounded-lg transition-all duration-300 border-2 bg-transparent border-gray-600 text-gray-400 hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-400/10 hover:scale-105 active:scale-95"
              >
                <div className="text-xl mb-1">🎤</div>
                <div className="font-semibold text-sm">Modo Voz</div>
                <div className="text-xs text-gray-500">Reconocimiento verbal</div>
              </button>
              <button
                onClick={() => {
                  setUseVoiceMode(false)
                  requestPermissions()
                }}
                className="p-3 rounded-lg transition-all duration-300 border-2 bg-transparent border-gray-600 text-gray-400 hover:border-purple-400/50 hover:text-purple-400 hover:bg-purple-400/10 hover:scale-105 active:scale-95"
              >
                <div className="text-xl mb-1">💬</div>
                <div className="font-semibold text-sm">Modo Chat</div>
                <div className="text-xs text-gray-500">Respuestas escritas</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla principal de entrevista - Simulación de videollamada
  return (
    <div className="fixed inset-0 pt-16 text-white overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Particle effects background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-cyan-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Video call layout */}
      <div className="h-full flex relative z-10">
        {/* Sidebar izquierdo - Chat */}
        <div className="w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md border-r border-cyan-400/30 neon-border-subtle flex flex-col shadow-2xl">
          {/* Chat header futurista */}
          <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-gray-900 via-cyan-900/20 to-gray-900 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-glow-pulse shadow-lg shadow-cyan-400/50"></div>
                <h3 className="text-white font-bold text-sm neon-text tracking-wide">CHAT NEURAL</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                useVoiceMode 
                  ? 'bg-green-400/20 text-green-400 border-green-400/50 shadow-green-400/20' 
                  : 'bg-purple-400/20 text-purple-400 border-purple-400/50 shadow-purple-400/20'
              } shadow-lg`}>
                {useVoiceMode ? '🎤 VOZ' : '💬 TEXTO'}
              </div>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex flex-col h-0 flex-1">
            {/* Chat history futurista */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{maxHeight: 'calc(100vh - 250px)'}}>
              <div className="space-y-3">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[85%] glass-card p-3 rounded-lg text-sm border transition-all duration-300 hover:scale-[1.02] ${
                      msg.type === 'ai' 
                        ? 'border-cyan-400/40 bg-cyan-400/5 text-cyan-100 shadow-lg shadow-cyan-400/10' 
                        : 'border-purple-400/40 bg-purple-400/5 text-purple-100 shadow-lg shadow-purple-400/10'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          msg.type === 'ai' 
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' 
                            : 'bg-purple-400/20 text-purple-400 border border-purple-400/50'
                        }`}>
                          {msg.type === 'ai' ? '🤖' : '👤'}
                        </div>
                        <span className={`text-xs font-semibold ${msg.type === 'ai' ? 'text-cyan-400' : 'text-purple-400'}`}>
                          {msg.type === 'ai' ? 'IA Neural' : 'Usuario'}
                        </span>
                        <span className="text-xs opacity-60 font-mono">
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="leading-relaxed text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat input futurista */}
            <div className="p-4 border-t border-cyan-400/30 bg-gradient-to-t from-black/80 to-gray-900/50 backdrop-blur-md relative">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/5 to-transparent"></div>
              <div className="relative">
                <div className="mb-2">
                  <label className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider">Neural Input</label>
                </div>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full h-16 glass-card bg-black/30 text-white rounded-lg p-3 border border-cyan-400/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none text-sm backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/60"
                  placeholder="Redacta tu respuesta neural..."
                  disabled={isListening}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-cyan-400/70 font-medium flex items-center space-x-1">
                      <span>💡</span>
                      <span className="uppercase tracking-wide">Método STAR</span>
                    </div>
                    <div className={`text-xs font-mono px-2 py-1 rounded-full ${
                      messageInput.length >= 50 
                        ? 'text-green-400 bg-green-400/10 border border-green-400/30' 
                        : 'text-gray-400 bg-gray-400/10 border border-gray-400/30'
                    }`}>
                      {messageInput.length} chars
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || isListening}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 uppercase tracking-wide ${
                      messageInput.trim() && !isListening
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-400/30 hover:shadow-xl hover:scale-105'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <span>Enviar</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main video area - Avatar de IA */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          {/* Top header overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium uppercase tracking-wide">EN VIVO</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-300 font-mono bg-black/40 px-2 py-1 rounded">
                  {currentPhase === InterviewPhase.WELCOME && "Bienvenida"}
                  {currentPhase === InterviewPhase.EXPLANATION && "Instrucciones"}
                  {currentPhase === InterviewPhase.QUESTIONS && `Pregunta ${interviewData.currentQuestionIndex + 1}/${interviewData.questions.length}`}
                  {currentPhase === InterviewPhase.FAREWELL && "Despedida"}
                  {currentPhase === InterviewPhase.COMPLETED && "Completado"}
                </span>
                <div className="w-32 bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500 glow-sm"
                    style={{ 
                      width: `${getProgressPercentage()}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Avatar central - simula el video principal */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
              <Avatar3DCSS 
                isListening={isListening} 
                isSpeaking={isSpeaking}
                className="transform hover:scale-105 transition-all duration-300 scale-125"
              />
              
              {/* Estado visual superpuesto */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                {isSpeaking && (
                  <div className="bg-purple-500/90 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Hablando...</span>
                    </div>
                  </div>
                )}
                {isListening && (
                  <div className="bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Escuchando...</span>
                    </div>
                  </div>
                )}
                {!isSpeaking && !isListening && (
                  <div className="bg-cyan-500/90 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-glow-pulse"></div>
                      <span className="text-white text-sm font-medium">Listo para responder</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje contextual según la fase */}
          {currentPhase !== InterviewPhase.QUESTIONS && (
            <div className="mb-6 text-center max-w-md">
              <div className="glass-card border border-cyan-400/30 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-wide mb-2">
                  {currentPhase === InterviewPhase.WELCOME && "Bienvenida"}
                  {currentPhase === InterviewPhase.EXPLANATION && "Instrucciones"}
                  {currentPhase === InterviewPhase.FAREWELL && "Despedida"}
                </h3>
                <p className="text-white text-sm leading-relaxed">
                  {currentPhase === InterviewPhase.WELCOME && "La IA te está dando la bienvenida..."}
                  {currentPhase === InterviewPhase.EXPLANATION && "La IA te está explicando cómo funcionará la entrevista y comenzará automáticamente..."}
                  {currentPhase === InterviewPhase.FAREWELL && "La IA se está despidiendo y te va a redirigir a la evaluación..."}
                </p>
              </div>
            </div>
          )}

          {/* Controles flotantes debajo del avatar */}
            <div className="flex items-center space-x-6 mt-8">
              {/* Voice controls */}
              {useVoiceMode && speechSupported && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={startListening}
                    disabled={isListening || isSpeaking}
                    className={`w-16 h-16 rounded-full border-3 transition-all duration-300 flex items-center justify-center font-medium ${
                      isListening 
                        ? 'bg-green-400/20 border-green-400 text-green-400 shadow-lg shadow-green-400/30 scale-110' 
                        : !isListening && !isSpeaking
                        ? 'bg-transparent border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400 hover:shadow-md hover:scale-105'
                        : 'bg-gray-600/20 border-gray-600 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 0 1 6 0v4a3 3 0 1 1-6 0V4zm4 10.93A7.001 7.001 0 0 0 17 8a1 1 0 1 0-2 0A5 5 0 0 1 15 8a1 1 0 0 0-2 0 7.001 7.001 0 0 0 6 6.93V17H6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={stopListening}
                    disabled={!isListening}
                    className={`w-16 h-16 rounded-full border-3 transition-all duration-300 flex items-center justify-center font-medium ${
                      isListening 
                        ? 'bg-red-400/20 border-red-400 text-red-400 hover:bg-red-400/30 shadow-lg shadow-red-400/30 hover:scale-105'
                        : 'bg-gray-600/20 border-gray-600 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center space-x-4">
                {/* Solo mostrar botón durante las preguntas */}
                {currentPhase === InterviewPhase.QUESTIONS && (
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || isListening}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 uppercase tracking-wide border-2 ${
                      messageInput.trim() && !isListening
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-400/30 hover:shadow-xl border-cyan-400 hover:scale-105'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed border-gray-600'
                    }`}
                  >
                    {interviewData.currentQuestionIndex < interviewData.questions.length - 1 
                      ? '▶ Siguiente Pregunta' 
                      : '🏁 Finalizar Entrevista'
                    }
                  </button>
                )}
                
                <button
                  onClick={finishInterview}
                  className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border-2 border-red-600/50 hover:border-red-600 rounded-full font-medium transition-all duration-300 text-sm uppercase tracking-wide hover:scale-105"
                >
                  ❌ Terminar
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

export default InterviewPageComplete