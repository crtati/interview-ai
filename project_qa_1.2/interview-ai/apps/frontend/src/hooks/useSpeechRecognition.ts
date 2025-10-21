import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSpeechRecognitionProps {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  language?: string
}

interface SpeechRecognitionResult {
  isListening: boolean
  transcript: string
  error: string | null
  isSupported: boolean
  hasPermission: boolean
  startListening: () => void
  stopListening: () => void
  requestPermissions: () => Promise<boolean>
}

const useSpeechRecognition = ({
  onTranscript,
  onError,
  continuous = true,
  language = 'es-ES'
}: UseSpeechRecognitionProps = {}): SpeechRecognitionResult => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Verificar si el navegador soporta Web Speech API
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  // Solicitar permisos para micrófono
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      })
      
      // Detener el stream inmediatamente, solo queríamos el permiso
      stream.getTracks().forEach(track => track.stop())
      
      setHasPermission(true)
      setError(null)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error solicitando permisos'
      setError(`Error de permisos: ${errorMessage}`)
      setHasPermission(false)
      onError?.(errorMessage)
      return false
    }
  }, [onError])

  // Inicializar Speech Recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Tu navegador no soporta reconocimiento de voz')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscript || interimTranscript
      setTranscript(fullTranscript)
      
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      const errorMessage = `Error de reconocimiento: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported, continuous, language, onTranscript, onError])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado')
      return
    }

    if (!hasPermission) {
      setError('Necesitas conceder permisos de micrófono primero')
      return
    }

    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }, [isSupported, hasPermission, isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
    requestPermissions
  }
}

export default useSpeechRecognition