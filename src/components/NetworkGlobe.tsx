import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GlobeWithNetwork() {
  const globeRef = useRef<THREE.Group>(null)

  // Create continent outlines as dots
  const continentData = useMemo(() => {
    const points: number[] = []
    const radius = 2

    // Simplified continent coordinates (latitude, longitude pairs)
    const continents = [
      // North America
      [49, -100], [45, -75], [40, -120], [35, -95], [25, -80],
      // South America
      [-5, -60], [-15, -55], [-25, -65], [-35, -70],
      // Europe
      [55, 10], [50, 5], [45, 15], [40, 20],
      // Africa
      [15, 20], [0, 25], [-15, 30], [-25, 25],
      // Asia
      [55, 90], [45, 100], [35, 110], [25, 80], [15, 100],
      // Australia
      [-25, 135], [-35, 140],
    ]

    // Add many points around continents
    continents.forEach(([lat, lon]) => {
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          const adjustedLat = lat + i * 2
          const adjustedLon = lon + j * 2

          const phi = (90 - adjustedLat) * (Math.PI / 180)
          const theta = (adjustedLon + 180) * (Math.PI / 180)

          const x = -radius * Math.sin(phi) * Math.cos(theta)
          const y = radius * Math.cos(phi)
          const z = radius * Math.sin(phi) * Math.sin(theta)

          points.push(x, y, z)
        }
      }
    })

    return new Float32Array(points)
  }, [])

  // Create network connections
  const connectionLines = useMemo(() => {
    const lines: number[] = []
    const radius = 2.05

    // Major network hubs
    const hubs = [
      [40, -74],   // New York
      [51, 0],     // London
      [35, 139],   // Tokyo
      [1, 103],    // Singapore
      [-33, 151],  // Sydney
    ]

    hubs.forEach((hub, i) => {
      hubs.forEach((target, j) => {
        if (i < j) {
          const [lat1, lon1] = hub
          const [lat2, lon2] = target

          const phi1 = (90 - lat1) * (Math.PI / 180)
          const theta1 = (lon1 + 180) * (Math.PI / 180)
          const phi2 = (90 - lat2) * (Math.PI / 180)
          const theta2 = (lon2 + 180) * (Math.PI / 180)

          const x1 = -radius * Math.sin(phi1) * Math.cos(theta1)
          const y1 = radius * Math.cos(phi1)
          const z1 = radius * Math.sin(phi1) * Math.sin(theta1)

          const x2 = -radius * Math.sin(phi2) * Math.cos(theta2)
          const y2 = radius * Math.cos(phi2)
          const z2 = radius * Math.sin(phi2) * Math.sin(theta2)

          lines.push(x1, y1, z1, x2, y2, z2)
        }
      })
    })

    return new Float32Array(lines)
  }, [])

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={globeRef}>
      {/* Base sphere (dark) */}
      <mesh>
        <sphereGeometry args={[1.98, 64, 64]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.9} />
      </mesh>

      {/* Continent dots */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[continentData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#60a5fa"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Network connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connectionLines, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.4} />
      </lineSegments>

      {/* Hub points */}
      <points position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              0, 2.05, 0,
              2.05, 0, 0,
              0, 0, 2.05,
              -2.05, 0, 0,
              0, 0, -2.05,
            ]), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#60a5fa" transparent opacity={1} />
      </points>

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#60a5fa" />
    </group>
  )
}

export default function NetworkGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
        <GlobeWithNetwork />
      </Canvas>
    </div>
  )
}
