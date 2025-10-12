import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar3DCSS from '../components/Avatar3DCSS'

// Fases de la entrevista
enum InterviewPhase {
    SETUP = 'SETUP',
    WELCOME = 'WELCOME',
    EXPLANATION = 'EXPLANATION',
    QUESTIONS = 'QUESTIONS',
    CANDIDATE_QUESTIONS = 'CANDIDATE_QUESTIONS',
    FAREWELL = 'FAREWELL',
    COMPLETED = 'COMPLETED'
}

const InterviewPageZavi = () => {
    const navigate = useNavigate()
    const [currentPhase, setCurrentPhase] = useState<InterviewPhase>(InterviewPhase.SETUP)
    const [interviewId, setInterviewId] = useState<string>('')
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [messageInput, setMessageInput] = useState('')
    const [chatHistory, setChatHistory] = useState<Array<{ type: 'ai' | 'user', message: string, isLive?: boolean }>>([])
    const [questionNumber, setQuestionNumber] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [useVoiceMode, setUseVoiceMode] = useState(false)
    const [liveTranscript, setLiveTranscript] = useState('')

    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const [speechSupported, setSpeechSupported] = useState(false)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const fullTranscriptRef = useRef<string>('')
    const voiceModeRef = useRef<boolean>(false)
    const currentPhaseRef = useRef<InterviewPhase>(InterviewPhase.SETUP)
    const interviewIdRef = useRef<string>('')

    useEffect(() => {
        const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        const hasSpeechSynthesis = 'speechSynthesis' in window

        setSpeechSupported(hasWebSpeech && hasSpeechSynthesis)

        if (hasSpeechSynthesis) {
            synthRef.current = window.speechSynthesis
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop()
            if (synthRef.current) synthRef.current.cancel()
        }
    }, [])

    // Auto-scroll del chat cuando hay nuevos mensajes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatHistory])

    // Auto-scroll del chat cuando cambia el transcript live
    useEffect(() => {
        if (chatContainerRef.current && liveTranscript) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [liveTranscript])

    // Auto-scroll del textarea cuando el texto es muy largo
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        }
    }, [messageInput])

    const speakMessage = (text: string, onComplete?: () => void) => {
        setChatHistory(prev => [...prev, { type: 'ai', message: text }])

        if (synthRef.current && speechSupported) {
            synthRef.current.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'es-ES'
            utterance.rate = 0.9
            utterance.pitch = 1

            utterance.onstart = () => {
                console.log('🗣️ Zavi empezó a hablar')
                setIsSpeaking(true)
            }
            utterance.onend = () => {
                console.log('🗣️ Zavi terminó de hablar', {
                    onComplete: !!onComplete,
                    useVoiceMode,
                    voiceModeRef: voiceModeRef.current,
                    isProcessing
                })
                setIsSpeaking(false)
                if (onComplete) {
                    console.log('📞 Ejecutando onComplete callback')
                    onComplete()
                } else if (voiceModeRef.current && !isProcessing) {
                    // Solo iniciar reconocimiento si NO estamos procesando ya otra respuesta
                    console.log('⏱️ Esperando 1.5 segundos antes de iniciar escucha... (usando voiceModeRef)')
                    setTimeout(() => {
                        // Verificar de nuevo antes de iniciar
                        if (voiceModeRef.current && !isProcessing) {
                            startAutoListening()
                        } else {
                            console.log('⚠️ No se inicia reconocimiento: isProcessing=true')
                        }
                    }, 1500) // Aumentado a 1.5 segundos para dar más margen
                } else {
                    console.log('⚠️ No se inicia reconocimiento: voiceModeRef=false, hay onComplete, o isProcessing=true')
                }
            }

            synthRef.current.speak(utterance)
        } else {
            setTimeout(() => {
                if (onComplete) onComplete()
            }, 2000)
        }
    }

    const requestPermissionsAndStart = async (voiceMode: boolean) => {
        console.log('🎤 requestPermissionsAndStart llamado', { voiceMode, speechSupported })
        setUseVoiceMode(voiceMode)
        voiceModeRef.current = voiceMode
        console.log('📝 Estado useVoiceMode actualizado:', { voiceMode, ref: voiceModeRef.current })

        try {
            // Solicitar permisos de micrófono si usa modo voz
            if (voiceMode && speechSupported) {
                console.log('🎙️ Solicitando permisos de micrófono...')
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true })
                    console.log('✅ Permisos de micrófono concedidos')

                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                    if (SpeechRecognition) {
                        console.log('🔧 Configurando reconocimiento de voz...')
                        recognitionRef.current = new SpeechRecognition()
                        recognitionRef.current.continuous = true
                        recognitionRef.current.interimResults = true
                        recognitionRef.current.lang = 'es-ES'

                        recognitionRef.current.onresult = (event: any) => {
                            let interimTranscript = ''

                            // Reiniciar timer de silencio cada vez que hay voz
                            if (silenceTimerRef.current) {
                                clearTimeout(silenceTimerRef.current)
                            }

                            for (let i = event.resultIndex; i < event.results.length; i++) {
                                const transcript = event.results[i][0].transcript
                                if (event.results[i].isFinal) {
                                    fullTranscriptRef.current += transcript + ' '
                                    // Solo log cada 10 palabras para reducir spam
                                    const wordCount = fullTranscriptRef.current.split(' ').length
                                    if (wordCount % 10 === 0) {
                                        console.log('📝 Transcript actualizado:', fullTranscriptRef.current.substring(0, 100) + '...')
                                    }
                                } else {
                                    interimTranscript = transcript
                                }
                            }

                            // Mostrar texto final acumulado + texto temporal
                            const displayText = (fullTranscriptRef.current + interimTranscript).trim()

                            // En modo voz, mostrar el transcript en tiempo real en el chat
                            if (voiceMode && displayText) {
                                setLiveTranscript(displayText)
                            } else {
                                // En modo chat normal, usar el input
                                setMessageInput(displayText)
                            }

                            // Timer de 5 segundos de silencio para envío automático (aumentado para evitar envíos prematuros)
                            if (voiceMode) {
                                silenceTimerRef.current = setTimeout(() => {
                                    const transcript = fullTranscriptRef.current.trim()
                                    // Validar longitud mínima (al menos 10 caracteres) para evitar ruidos
                                    if (transcript && transcript.length >= 10) {
                                        console.log('⏱️ 5 segundos de silencio detectados, enviando respuesta...')
                                        autoSendResponse()
                                    } else {
                                        console.log('⏱️ Silencio detectado pero transcript muy corto, ignorando:', transcript)
                                    }
                                }, 5000) // Aumentado de 3 a 5 segundos
                            }
                        }

                        recognitionRef.current.onerror = (event: any) => {
                            console.error('❌ Error de reconocimiento:', event.error)

                            // Si es error de "no-speech" (no se detectó voz), SOLO reintentar sin interrumpir
                            if (event.error === 'no-speech' && voiceMode && !fullTranscriptRef.current.trim()) {
                                console.log('⚠️ No se detectó voz, reintentando silenciosamente...')
                                setIsListening(false)

                                // Reintentar después de 2 segundos SIN dar mensajes que interrumpan el flujo
                                setTimeout(() => {
                                    if (voiceModeRef.current && !isProcessing) {
                                        console.log('🔄 Reintentando reconocimiento...')
                                        startAutoListening()
                                    }
                                }, 2000)
                            } else {
                                setIsListening(false)
                            }
                        }

                        recognitionRef.current.onstart = () => {
                            console.log('✅ Reconocimiento iniciado (onstart event)')
                            setIsListening(true)
                        }

                        recognitionRef.current.onend = () => {
                            console.log('🛑 Reconocimiento detenido (onend event)', {
                                hasTranscript: !!fullTranscriptRef.current.trim(),
                                transcriptLength: fullTranscriptRef.current.trim().length,
                                voiceMode,
                                isProcessing
                            })
                            setIsListening(false)

                            // Solo enviar si hay transcript VÁLIDO (mínimo 10 caracteres) y no se está procesando
                            const transcript = fullTranscriptRef.current.trim()
                            if (voiceMode && transcript && transcript.length >= 10 && !isProcessing) {
                                console.log('📤 Enviando transcript válido desde onend')
                                autoSendResponse()
                            } else if (transcript && transcript.length < 10) {
                                console.log('⚠️ Reconocimiento detenido con transcript muy corto, ignorando:', transcript)
                                fullTranscriptRef.current = '' // Limpiar para evitar acumulación de ruido
                            }
                            // NO reiniciar automáticamente - solo cuando Zavi termine de hablar
                        }
                    } else {
                        console.error('❌ SpeechRecognition no disponible')
                    }
                } catch (error) {
                    console.error('Error con permisos de micrófono:', error)
                    alert('No se pudieron obtener permisos de micrófono. Usaremos modo chat.')
                    setUseVoiceMode(false)
                }
            } else {
                console.log('⚠️ No se configura reconocimiento:', { voiceMode, speechSupported })
            }

            console.log('✅ Configuración completada, iniciando entrevista...')
            startInterview()

        } catch (error) {
            console.error('Error solicitando permisos:', error)
        }
    }

    const startInterview = async () => {
        try {
            // Iniciar entrevista con Zavi
            const response = await fetch('http://localhost:3002/api/interviews/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) throw new Error('Error al iniciar entrevista')

            const data = await response.json()
            console.log('🎬 Entrevista iniciada:', data)

            setInterviewId(data.interviewId)
            interviewIdRef.current = data.interviewId
            console.log('📝 Interview ID actualizado en startInterview:', { state: data.interviewId, ref: interviewIdRef.current })
            setCurrentPhase(InterviewPhase.WELCOME)

            // Zavi se presenta
            speakMessage(data.message, () => {
                setTimeout(() => {
                    // Automáticamente pasar a explicación
                    getExplanation(data.interviewId)
                }, 2000)
            })

        } catch (error) {
            console.error('Error iniciando entrevista:', error)
            alert('Error al conectar con el servidor. Verifica que el backend esté corriendo en puerto 3002.')
        }
    }

    const getExplanation = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3002/api/interviews/${id}/explanation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) throw new Error('Error obteniendo explicación')

            const data = await response.json()
            setCurrentPhase(InterviewPhase.EXPLANATION)

            speakMessage(data.message, () => {
                setTimeout(() => {
                    // Automáticamente comenzar con la primera pregunta
                    getFirstQuestion(id)
                }, 2000)
            })
        } catch (error) {
            console.error('Error obteniendo explicación:', error)
        }
    }

    const getFirstQuestion = async (id: string) => {
        try {
            console.log('📋 Obteniendo primera pregunta...')
            const response = await fetch(`http://localhost:3002/api/interviews/${id}/first-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) throw new Error('Error obteniendo primera pregunta')

            const data = await response.json()
            console.log('✅ Primera pregunta obtenida:', data)
            setCurrentPhase(InterviewPhase.QUESTIONS)
            currentPhaseRef.current = InterviewPhase.QUESTIONS
            console.log('📊 Fase cambiada a QUESTIONS', { state: InterviewPhase.QUESTIONS, ref: currentPhaseRef.current })
            setQuestionNumber(data.questionNumber)

            speakMessage(data.question)
        } catch (error) {
            console.error('❌ Error obteniendo primera pregunta:', error)
        }
    }

    const sendResponse = async () => {
        if (!messageInput.trim() || isProcessing) return

        setIsProcessing(true)

        // Agregar respuesta del usuario al chat
        setChatHistory(prev => [...prev, { type: 'user', message: messageInput }])
        const userResponse = messageInput
        setMessageInput('')

        // Resetear el transcript acumulado del reconocimiento de voz
        if (recognitionRef.current) {
            recognitionRef.current.abort()
        }

        try {
            if (currentPhase === InterviewPhase.QUESTIONS) {
                // Zavi analiza y responde
                const response = await fetch(`http://localhost:3002/api/interviews/${interviewId}/analyze-and-respond`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userResponse })
                })

                if (!response.ok) throw new Error('Error analizando respuesta')

                const data = await response.json()

                // Zavi da comentario
                speakMessage(data.comment, () => {
                    setTimeout(() => {
                        // Verificar si debemos transicionar ANTES de procesar nextQuestion
                        if (data.shouldTransitionToCandidateQuestions) {
                            console.log('🔄 Transicionando a fase de preguntas del candidato...')
                            setTimeout(() => {
                                transitionToCandidateQuestions()
                            }, 2000)
                            return // No procesar nextQuestion si vamos a transicionar
                        }

                        // Si NO transicionamos, procesar siguiente pregunta
                        const nextQuestion = data.shouldAskFollowUp ? data.followUpQuestion : data.nextQuestion

                        if (nextQuestion) {
                            speakMessage(nextQuestion, () => {
                                // Actualizar contador DESPUÉS de mostrar la nueva pregunta
                                // El backend envía el número de la pregunta que acabó de responder,
                                // así que incrementamos +1 para la nueva pregunta que estamos mostrando
                                if (data.questionNumber) {
                                    setQuestionNumber(data.questionNumber + 1)
                                }
                            })
                        }
                    }, 1000)
                })

            } else if (currentPhase === InterviewPhase.CANDIDATE_QUESTIONS) {
                // Usuario hace pregunta a Zavi - delegar a processUserResponse para manejar despedida
                setIsProcessing(false) // Liberar el lock antes de delegar
                processUserResponse(userResponse)
                return // Salir temprano para evitar el finally
            }

        } catch (error) {
            console.error('Error enviando respuesta:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const transitionToCandidateQuestions = async () => {
        try {
            const currentInterviewId = interviewIdRef.current
            if (!currentInterviewId) {
                console.error('❌ No hay interviewId para transición')
                return
            }

            console.log('🔄 Transición con interviewId:', currentInterviewId)
            const response = await fetch(`http://localhost:3002/api/interviews/${currentInterviewId}/transition-to-candidate-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) throw new Error('Error en transición')

            const data = await response.json()
            setCurrentPhase(InterviewPhase.CANDIDATE_QUESTIONS)
            currentPhaseRef.current = InterviewPhase.CANDIDATE_QUESTIONS
            speakMessage(data.message)

        } catch (error) {
            console.error('❌ Error en transición:', error)
        }
    }

    // Función para corregir términos técnicos comunes en el transcript
    const correctTechnicalTerms = (transcript: string): string => {
        return transcript
            .replace(/\bs\s*a\s*p\b/gi, 'SAP')
            .replace(/\bs\s*f\s*a\s*p\b/gi, 'SAP')
            .replace(/\bno\s*s\s*f\s*a\s*p\b/gi, 'no SAP')
            .replace(/\ben\s*no\s*s\s*f\s*a\s*p\b/gi, 'en SAP')
            .replace(/\bconcha\b/gi, 'con SAP')
            .replace(/\bcon\s*sí\b/gi, 'con SAP')
            .replace(/\bjava\s*script/gi, 'JavaScript')
            .replace(/\bnode\s*j\s*s/gi, 'Node.js')
            .replace(/\breact\s*j\s*s/gi, 'React.js')
            .replace(/\bmongo\s*d\s*b/gi, 'MongoDB')
            .replace(/\bmysql/gi, 'MySQL')
            .replace(/\bapi\s*rest/gi, 'API REST')
            .replace(/\bjson/gi, 'JSON')
            .replace(/\bhtml/gi, 'HTML')
            .replace(/\bcss/gi, 'CSS')
            .replace(/\bsql/gi, 'SQL')
    }

    // Nueva función para envío automático en modo voz
    const autoSendResponse = () => {
        const transcript = fullTranscriptRef.current.trim()
        console.log('🚀 autoSendResponse llamado', {
            transcriptLength: transcript.length,
            transcript: transcript.substring(0, 50) + '...',
            isProcessing
        })

        // Validación estricta: mínimo 10 caracteres para evitar ruidos
        if (!transcript || transcript.length < 10) {
            console.log('⚠️ Transcript muy corto o vacío, ignorando:', transcript)
            fullTranscriptRef.current = '' // Limpiar
            return
        }

        if (isProcessing) {
            console.log('⚠️ Ya se está procesando una respuesta, ignorando')
            return
        }

        // Detener reconocimiento
        if (recognitionRef.current && isListening) {
            console.log('🛑 Deteniendo reconocimiento antes de enviar')
            try {
                recognitionRef.current.stop()
            } catch (e) {
                // Ignorar errores al detener
            }
        }

        // Limpiar timer
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
        }

        // Usar el transcript acumulado y corregir términos técnicos
        const finalText = correctTechnicalTerms(transcript)
        console.log('📤 Enviando respuesta VÁLIDA:', finalText)

        // Agregar al chat como mensaje final (no live)
        setChatHistory(prev => [...prev, { type: 'user', message: finalText, isLive: false }])

        // Reset
        fullTranscriptRef.current = ''
        setMessageInput('')
        setLiveTranscript('')
        setIsListening(false)

        // Procesar respuesta
        processUserResponse(finalText)
    }

    // Nueva función para iniciar escucha automática - SIMPLIFICADA
    const startAutoListening = () => {
        console.log('🎤 startAutoListening llamado - SIMPLIFICADO')

        if (!recognitionRef.current || !voiceModeRef.current) {
            console.log('⚠️ No se puede iniciar reconocimiento')
            return
        }

        // Limpiar estado
        fullTranscriptRef.current = ''
        setMessageInput('')
        setLiveTranscript('')

        // Detener cualquier reconocimiento previo de forma segura
        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        } catch (e) {
            // Ignorar errores al detener
        }

        // Iniciar después de un delay para evitar conflictos
        setTimeout(() => {
            if (recognitionRef.current && voiceModeRef.current) {
                try {
                    recognitionRef.current.start()
                    console.log('✅ Reconocimiento iniciado exitosamente')
                } catch (error: any) {
                    console.error('❌ Error iniciando reconocimiento:', error.message)
                }
            }
        }, 500)
    }

    // Extraer lógica de procesamiento de respuesta
    const processUserResponse = async (userResponse: string) => {
        console.log('🔄 processUserResponse iniciado', {
            userResponse,
            currentPhase,
            currentPhaseRef: currentPhaseRef.current,
            interviewId,
            interviewIdRef: interviewIdRef.current
        })

        // Evitar procesamiento duplicado
        if (isProcessing) {
            console.log('⚠️ Ya se está procesando una respuesta, ignorando...')
            return
        }

        setIsProcessing(true)

        try {
            if (currentPhaseRef.current === InterviewPhase.QUESTIONS) {
                console.log('📡 Enviando análisis a backend...')
                const response = await fetch(`http://localhost:3002/api/interviews/${interviewIdRef.current}/analyze-and-respond`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userResponse })
                })

                if (!response.ok) {
                    console.error('❌ Error en respuesta del backend:', response.status, response.statusText)

                    // Si el error es 404 (entrevista no encontrada), reiniciar
                    if (response.status === 404 || response.status === 500) {
                        console.log('🔄 Backend reiniciado detectado, reiniciando entrevista...')
                        speakMessage('Lo siento, parece que hubo un problema técnico. Voy a reiniciar la entrevista.', () => {
                            setTimeout(() => {
                                window.location.reload()
                            }, 2000)
                        })
                        return
                    }

                    throw new Error('Error analizando respuesta')
                }

                const data = await response.json()
                console.log('✅ Respuesta del backend recibida:', data)

                speakMessage(data.comment, () => {
                    setTimeout(() => {
                        const nextQuestion = data.shouldAskFollowUp ? data.followUpQuestion : data.nextQuestion

                        // ⚠️ CRÍTICO: Solo transicionar si NO hay nextQuestion
                        // Si hay nextQuestion, significa que aún quedan preguntas por hacer
                        console.log('🔍 Analizando si transicionar:', {
                            shouldTransition: data.shouldTransitionToCandidateQuestions,
                            hasNextQuestion: !!nextQuestion,
                            questionNumber: data.questionNumber
                        })

                        if (data.shouldTransitionToCandidateQuestions && !nextQuestion) {
                            console.log('🔄 Iniciando transición a preguntas del candidato (sin más preguntas)...')
                            setTimeout(() => {
                                transitionToCandidateQuestions()
                            }, 2000)
                            return
                        }

                        // Si no hay nextQuestion y estamos en pregunta 5, transicionar de todos modos
                        if (!nextQuestion && data.questionNumber === 5) {
                            console.log('⚠️ Pregunta 5 completada pero shouldTransition es false, forzando transición...')
                            setTimeout(() => {
                                transitionToCandidateQuestions()
                            }, 2000)
                            return
                        }

                        if (nextQuestion) {
                            console.log('❓ Enviando siguiente pregunta:', nextQuestion)
                            console.log('📊 Estado de transición:', {
                                shouldTransition: data.shouldTransitionToCandidateQuestions,
                                questionNumber: data.questionNumber,
                                hasNextQuestion: true
                            })

                            // Para todas las preguntas (1-5), habilitar reconocimiento automático
                            speakMessage(nextQuestion)
                        }

                        if (data.questionNumber) {
                            setQuestionNumber(data.questionNumber)
                        }
                    }, 1000)
                })

            } else if (currentPhaseRef.current === InterviewPhase.CANDIDATE_QUESTIONS) {
                console.log('📡 Respondiendo pregunta del candidato...')
                const response = await fetch(`http://localhost:3002/api/interviews/${interviewIdRef.current}/answer-candidate-question`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: userResponse })
                })

                if (!response.ok) throw new Error('Error respondiendo pregunta')

                const data = await response.json()
                console.log('✅ Respuesta a pregunta del candidato:', data)

                // Después de responder la primera pregunta del candidato, FINALIZAR entrevista
                speakMessage(data.answer, async () => {
                    console.log('🏁 Finalizando entrevista después de responder pregunta del candidato...')
                    // Esperar 2 segundos para que el usuario escuche la respuesta completa
                    setTimeout(async () => {
                        console.log('👋 Generando despedida final...')
                        try {
                            const farewellResponse = await fetch(`http://localhost:3002/api/interviews/${interviewIdRef.current}/farewell`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            })

                            if (farewellResponse.ok) {
                                const farewellData = await farewellResponse.json()
                                console.log('✅ Despedida generada:', farewellData)

                                // speakMessage ya agrega el mensaje al chat automáticamente
                                // No necesitamos agregarlo manualmente aquí
                                speakMessage(farewellData.message, () => {
                                    console.log('🎉 Entrevista COMPLETADA')
                                    setCurrentPhase(InterviewPhase.COMPLETED)
                                    currentPhaseRef.current = InterviewPhase.COMPLETED

                                    // Detener reconocimiento de voz completamente
                                    if (recognitionRef.current) {
                                        recognitionRef.current.stop()
                                    }
                                    setIsListening(false)
                                    setUseVoiceMode(false)
                                    voiceModeRef.current = false

                                    // Redirigir a la vista de evaluación después de 3 segundos
                                    console.log('🔄 Redirigiendo a evaluación en 3 segundos...')
                                    setTimeout(() => {
                                        navigate('/evaluation')
                                    }, 3000)
                                })
                            }
                        } catch (error) {
                            console.error('❌ Error generando despedida:', error)
                        }
                    }, 2000)
                })
            } else {
                console.log('⚠️ Fase no reconocida para procesamiento:', currentPhaseRef.current, 'vs state:', currentPhase)
            }

        } catch (error) {
            console.error('❌ Error procesando respuesta:', error)
        } finally {
            console.log('🔄 processUserResponse finalizado, setIsProcessing(false)')
            setIsProcessing(false)
        }
    }

    // Pantalla de configuración inicial
    if (currentPhase === InterviewPhase.SETUP) {
        return (
            <div className="fixed inset-0 flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Animated background elements - Más suaves */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-400/30 rounded-full animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-purple-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/3 right-1/3 w-16 h-16 border border-green-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative glass-card neon-border max-w-sm w-full mx-4 text-center animate-scale-in p-6 shadow-2xl shadow-cyan-500/20">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-lg blur-xl"></div>

                    {/* Content */}
                    <div className="relative">
                        {/* Header compacto */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-black neon-text mb-2 tracking-wide">
                                ENTREVISTA CON ZAVI
                            </h2>
                            <p className="text-gray-400 text-sm">Tu entrevistadora virtual impulsada por IA</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-cyan-400 mb-4 font-medium uppercase tracking-wide text-xs">
                                Selecciona tu modo preferido:
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => requestPermissionsAndStart(true)}
                                    className="group relative p-4 rounded-xl transition-all duration-300 border-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/50 text-gray-400 hover:border-cyan-400/70 hover:text-cyan-400 hover:bg-gradient-to-br hover:from-cyan-900/20 hover:to-blue-900/20 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 rounded-xl transition-colors"></div>
                                    <div className="relative">
                                        <div className="text-3xl mb-2">🎤</div>
                                        <div className="font-semibold text-sm mb-1">Modo Voz</div>
                                        <div className="text-xs text-gray-500 group-hover:text-cyan-400/70">Reconocimiento verbal</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => requestPermissionsAndStart(false)}
                                    className="group relative p-4 rounded-xl transition-all duration-300 border-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/50 text-gray-400 hover:border-purple-400/70 hover:text-purple-400 hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-pink-900/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-purple-400/0 group-hover:bg-purple-400/5 rounded-xl transition-colors"></div>
                                    <div className="relative">
                                        <div className="text-3xl mb-2">💬</div>
                                        <div className="font-semibold text-sm mb-1">Modo Chat</div>
                                        <div className="text-xs text-gray-500 group-hover:text-purple-400/70">Respuestas escritas</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Pantalla principal de entrevista
    return (
        <div className="fixed inset-0 pt-16 text-white overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <div className="h-full flex relative z-10">
                {/* Sidebar - Chat */}
                <div className="w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md border-r border-cyan-400/30 flex flex-col">
                    {/* Chat header */}
                    <div className="p-4 border-b border-cyan-400/30 bg-gradient-to-r from-gray-900 via-cyan-900/20 to-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-glow-pulse"></div>
                                <h3 className="text-white font-bold text-sm">CHAT CON ZAVI</h3>
                            </div>
                            <div className="px-2 py-1 rounded-full text-xs font-bold bg-cyan-400/20 text-cyan-400 border border-cyan-400/50">
                                {currentPhase === InterviewPhase.QUESTIONS && `Pregunta ${questionNumber}/5`}
                                {currentPhase === InterviewPhase.CANDIDATE_QUESTIONS && 'Tus Preguntas'}
                                {currentPhase === InterviewPhase.WELCOME && 'Bienvenida'}
                                {currentPhase === InterviewPhase.EXPLANATION && 'Instrucciones'}
                                {currentPhase === InterviewPhase.FAREWELL && 'Despedida'}
                            </div>
                        </div>
                    </div>

                    {/* Chat messages */}
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] glass-card p-3 rounded-lg text-sm border ${msg.type === 'ai'
                                        ? 'border-cyan-400/40 bg-cyan-400/5 text-cyan-100'
                                        : 'border-purple-400/40 bg-purple-400/5 text-purple-100'
                                        }`}>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${msg.type === 'ai'
                                                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                                                : 'bg-purple-400/20 text-purple-400 border border-purple-400/50'
                                                }`}>
                                                {msg.type === 'ai' ? '🤖' : '👤'}
                                            </div>
                                            <span className={`text-xs font-semibold ${msg.type === 'ai' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                                {msg.type === 'ai' ? 'Zavi' : 'Tú'}
                                            </span>
                                        </div>
                                        <p className="leading-relaxed text-sm">{msg.message}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Mensaje LIVE del usuario mientras habla */}
                            {useVoiceMode && isListening && liveTranscript && (
                                <div className="flex justify-end">
                                    <div className="max-w-[85%] glass-card p-3 rounded-lg text-sm border border-purple-400/60 bg-purple-400/10 text-purple-100 animate-pulse">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-purple-400/30 text-purple-400 border border-purple-400/70">
                                                👤
                                            </div>
                                            <span className="text-xs font-semibold text-purple-400">Tú (transcribiendo...)</span>
                                            <span className="text-xs text-purple-400/70">🎤</span>
                                        </div>
                                        <p className="leading-relaxed text-sm">{liveTranscript}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat input - Solo en modo TEXTO */}
                    {!useVoiceMode && (
                        <div className="p-4 border-t border-cyan-400/30 bg-gradient-to-t from-black/80 to-gray-900/50">
                            <textarea
                                ref={textareaRef}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                className="w-full h-16 glass-card bg-black/30 text-white rounded-lg p-3 border border-cyan-400/40 focus:border-cyan-400 focus:outline-none resize-none text-sm"
                                placeholder="Escribe tu respuesta..."
                                disabled={isListening || isProcessing}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        sendResponse()
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <div className="text-xs text-cyan-400/70">
                                    {messageInput.length} caracteres
                                </div>
                                <button
                                    onClick={sendResponse}
                                    disabled={!messageInput.trim() || isListening || isProcessing}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${messageInput.trim() && !isListening && !isProcessing
                                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105'
                                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isProcessing ? 'Procesando...' : 'Enviar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Indicador en modo VOZ */}
                    {useVoiceMode && (
                        <div className="p-4 border-t border-cyan-400/30 bg-gradient-to-t from-black/80 to-gray-900/50">
                            <div className="text-center">
                                {isListening && (
                                    <div className="mb-3">
                                        <div className="inline-block bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400/50 animate-pulse">
                                            <span className="text-purple-400 text-sm font-medium">🎤 Te estoy escuchando...</span>
                                        </div>
                                    </div>
                                )}
                                {isSpeaking && (
                                    <div className="bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-400/50 animate-pulse">
                                        <span className="text-cyan-400 text-sm font-medium">🗣️ Zavi está hablando...</span>
                                    </div>
                                )}
                                {/* En modo VOZ nunca mostrar "Esperando..." - solo "hablando" o "escuchando" */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main area - Avatar */}
                <div className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
                    {/* Efectos de fondo pulsantes - SIEMPRE PRESENTES pero con opacidad variable */}
                    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${isListening ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-20 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white text-sm font-medium">EN VIVO</span>
                            </div>
                            {currentPhase === InterviewPhase.QUESTIONS && (
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs text-gray-300 bg-black/40 px-2 py-1 rounded">
                                        Pregunta {questionNumber}/5
                                    </span>
                                    <div className="w-32 bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-cyan-400 h-1.5 rounded-full transition-all"
                                            style={{ width: `${(questionNumber / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="relative z-10 flex flex-col items-center">
                        <Avatar3DCSS
                            isListening={isListening}
                            isSpeaking={isSpeaking}
                            className="scale-125"
                        />

                        {/* Estado visual - Mejorado y más compacto */}
                        <div className="mt-8">
                            {isSpeaking && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                                            <span className="text-white text-sm font-semibold">Zavi está hablando</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isListening && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-purple-400/50 shadow-lg shadow-purple-500/30">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                                            <span className="text-white text-sm font-semibold">Te estoy escuchando</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Solo mostrar "Esperando..." en modo TEXTO cuando no está hablando, escuchando ni procesando */}
                            {!isSpeaking && !isListening && !isProcessing && !useVoiceMode && (currentPhase === InterviewPhase.QUESTIONS || currentPhase === InterviewPhase.CANDIDATE_QUESTIONS) && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                                    <div className="relative bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-purple-400/50 shadow-lg shadow-purple-500/20">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                                            <span className="text-white text-sm font-semibold">Esperando tu respuesta</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isProcessing && !isSpeaking && !isListening && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                                            <span className="text-white text-sm font-semibold">Pensando...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controles eliminados - El usuario solo escribe en modo texto, o habla en modo voz (automático) */}
                </div>
            </div>
        </div>
    )
}

export default InterviewPageZavi
