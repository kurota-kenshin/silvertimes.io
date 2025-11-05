import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedGlobe() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group>
      {/* Main globe */}
      <Sphere ref={meshRef} args={[2, 128, 128]}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.4}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Network points */}
      {Array.from({ length: 200 }).map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 200)
        const theta = Math.sqrt(200 * Math.PI) * phi
        const x = 2.1 * Math.cos(theta) * Math.sin(phi)
        const y = 2.1 * Math.sin(theta) * Math.sin(phi)
        const z = 2.1 * Math.cos(phi)

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        )
      })}

      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </group>
  )
}

export default function Globe() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedGlobe />
      </Canvas>
    </div>
  )
}
