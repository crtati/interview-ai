import { useState, useCallback, useRef } from 'react'

interface UseTextToSpeechProps {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}

interface TextToSpeechResult {
  isSpeaking: boolean
  isSupported: boolean
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
  voices: SpeechSynthesisVoice[]
  error: string | null
}

const useTextToSpeech = ({
  onStart,
  onEnd,
  onError,
  voice,
  rate = 1,
  pitch = 1,
  volume = 1
}: UseTextToSpeechProps = {}): TextToSpeechResult => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  // Verificar si el navegador soporta Web Speech API (Text-to-Speech)
  const isSupported = 'speechSynthesis' in window

  // Cargar voces disponibles
  const loadVoices = useCallback(() => {
    if (isSupported) {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
    }
  }, [isSupported])

  // Cargar voces al inicializar
  useState(() => {
    if (isSupported) {
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      const errorMsg = 'Text-to-Speech no soportado en este navegador'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (!text.trim()) {
      const errorMsg = 'No hay texto para reproducir'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Detener cualquier síntesis en curso
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configurar la voz
    if (voice) {
      const selectedVoice = voices.find(v => v.name === voice || v.lang.includes(voice))
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    } else {
      // Buscar una voz en español
      const spanishVoice = voices.find(v => 
        v.lang.startsWith('es') || 
        v.name.toLowerCase().includes('spanish') ||
        v.name.toLowerCase().includes('español')
      )
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
    }

    // Configurar parámetros
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Event listeners
    utterance.onstart = () => {
      setIsSpeaking(true)
      setError(null)
      onStart?.()
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }

    utterance.onerror = (event) => {
      const errorMsg = `Error en Text-to-Speech: ${event.error}`
      setError(errorMsg)
      setIsSpeaking(false)
      onError?.(errorMsg)
    }

    utterance.onpause = () => {
      setIsSpeaking(false)
    }

    utterance.onresume = () => {
      setIsSpeaking(true)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [isSupported, voices, voice, rate, pitch, volume, onStart, onEnd, onError])

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported) {
      speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported) {
      speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    voices,
    error
  }
}

export default useTextToSpeech