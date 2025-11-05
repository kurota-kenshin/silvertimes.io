import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function NetworkGlobe() {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  // Generate sphere points
  const { positions, connections } = useMemo(() => {
    const points: number[] = []
    const linePoints: number[] = []
    const radius = 2
    const segments = 40
    const rings = 40

    // Generate points on sphere
    for (let i = 0; i <= rings; i++) {
      const phi = (i / rings) * Math.PI
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        points.push(x, y, z)
      }
    }

    // Generate connections (longitude and latitude lines)
    // Longitude lines
    for (let j = 0; j <= segments; j++) {
      for (let i = 0; i < rings; i++) {
        const idx1 = i * (segments + 1) + j
        const idx2 = (i + 1) * (segments + 1) + j
        linePoints.push(points[idx1 * 3], points[idx1 * 3 + 1], points[idx1 * 3 + 2])
        linePoints.push(points[idx2 * 3], points[idx2 * 3 + 1], points[idx2 * 3 + 2])
      }
    }

    // Latitude lines
    for (let i = 0; i <= rings; i++) {
      for (let j = 0; j < segments; j++) {
        const idx1 = i * (segments + 1) + j
        const idx2 = i * (segments + 1) + j + 1
        linePoints.push(points[idx1 * 3], points[idx1 * 3 + 1], points[idx1 * 3 + 2])
        linePoints.push(points[idx2 * 3], points[idx2 * 3 + 1], points[idx2 * 3 + 2])
      }
    }

    return {
      positions: new Float32Array(points),
      connections: new Float32Array(linePoints)
    }
  }, [])

  useFrame((state) => {
    if (pointsRef.current && linesRef.current) {
      const rotation = state.clock.getElapsedTime() * 0.05
      pointsRef.current.rotation.y = rotation
      linesRef.current.rotation.y = rotation
    }
  })

  return (
    <group>
      {/* Network lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connections, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </lineSegments>

      {/* Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#60a5fa" transparent opacity={0.8} />
      </points>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
    </group>
  )
}

export default function WireframeGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <NetworkGlobe />
      </Canvas>
    </div>
  )
}
