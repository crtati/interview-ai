import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// Componente del avatar 3D simple
const Avatar3DModel = ({ isListening, isSpeaking }: { isListening: boolean, isSpeaking: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [time, setTime] = useState(0)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animación de respiración
      const breathScale = 1 + Math.sin(time * 2) * 0.05
      meshRef.current.scale.setScalar(breathScale)
      
      // Animación de habla cuando el avatar está hablando
      if (isSpeaking) {
        meshRef.current.rotation.y = Math.sin(time * 8) * 0.1
      }
      
      // Efecto visual cuando está escuchando
      if (isListening) {
        meshRef.current.material.color.setHSL(0.6, 1, 0.5 + Math.sin(time * 4) * 0.2)
      } else {
        meshRef.current.material.color.setHSL(0.5, 0.8, 0.6)
      }
    }
    setTime(time + delta)
  })

  return (
    <group>
      {/* Cabeza del avatar */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#4ade80"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Cuerpo del avatar */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1.5, 8]} />
        <meshStandardMaterial 
          color="#22d3ee"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      
      {/* Ojos */}
      <mesh position={[-0.3, 0.7, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.3, 0.7, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1f2a37" />
      </mesh>
      
      {/* Boca - cambia cuando habla */}
      <mesh position={[0, 0.3, 0.7]} scale={isSpeaking ? [1.2, 0.8, 1] : [1, 1, 1]}>
        <ringGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  )
}

// Componente principal del Avatar 3D
interface Avatar3DProps {
  isListening: boolean
  isSpeaking: boolean
  className?: string
}

const Avatar3D = ({ isListening, isSpeaking, className = "" }: Avatar3DProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Iluminación */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
        
        {/* Avatar */}
        <Avatar3DModel isListening={isListening} isSpeaking={isSpeaking} />
        
        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Estado visual */}
      <div className="absolute bottom-4 left-4 text-white">
        {isListening && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Escuchando...</span>
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
            <span>Hablando...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Avatar3D