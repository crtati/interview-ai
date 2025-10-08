import { useEffect, useState } from 'react'

interface Avatar3DProps {
  isListening?: boolean
  isSpeaking?: boolean
  className?: string
}

const Avatar3DCSS = ({ isListening = false, isSpeaking = false, className = '' }: Avatar3DProps) => {
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isSpeaking) {
      setAnimationClass('speaking')
    } else if (isListening) {
      setAnimationClass('listening')
    } else {
      setAnimationClass('idle')
    }
  }, [isListening, isSpeaking])

  return (
    <div className={`avatar-container ${className}`}>
      {/* Avatar principal */}
      <div className={`avatar-3d ${animationClass}`}>
        {/* Cabeza */}
        <div className="avatar-head">
          {/* Ojos */}
          <div className="avatar-eyes">
            <div className="eye left-eye"></div>
            <div className="eye right-eye"></div>
          </div>
          
          {/* Boca */}
          <div className="avatar-mouth">
            <div className={`mouth-shape ${isSpeaking ? 'talking' : ''}`}></div>
          </div>
        </div>
        
        {/* Cuerpo */}
        <div className="avatar-body"></div>
        
        {/* Indicadores de estado */}
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="speaking-indicator">
            <div className="sound-wave wave-1"></div>
            <div className="sound-wave wave-2"></div>
            <div className="sound-wave wave-3"></div>
          </div>
        )}
      </div>
      

    </div>
  )
}

export default Avatar3DCSS