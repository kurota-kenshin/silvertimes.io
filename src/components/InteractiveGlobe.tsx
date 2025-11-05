import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Detailed continent coordinates (many more points for realistic continents)
const CONTINENT_POINTS = [
  // North America - densely packed
  ...Array.from({ length: 300 }, () => {
    const lat = 25 + Math.random() * 50
    const lon = -170 + Math.random() * 90
    return [lat, lon]
  }),
  // South America
  ...Array.from({ length: 200 }, () => {
    const lat = -55 + Math.random() * 70
    const lon = -82 + Math.random() * 40
    return [lat, lon]
  }),
  // Europe
  ...Array.from({ length: 150 }, () => {
    const lat = 35 + Math.random() * 40
    const lon = -10 + Math.random() * 50
    return [lat, lon]
  }),
  // Africa
  ...Array.from({ length: 250 }, () => {
    const lat = -35 + Math.random() * 70
    const lon = -20 + Math.random() * 70
    return [lat, lon]
  }),
  // Asia
  ...Array.from({ length: 400 }, () => {
    const lat = 0 + Math.random() * 70
    const lon = 50 + Math.random() * 100
    return [lat, lon]
  }),
  // Australia
  ...Array.from({ length: 100 }, () => {
    const lat = -45 + Math.random() * 35
    const lon = 110 + Math.random() * 45
    return [lat, lon]
  }),
]

function GlobePoints() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = new Float32Array(
    CONTINENT_POINTS.flatMap(([lat, lon]) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const radius = 2

      const x = -radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)

      return [x, y, z]
    })
  )

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001
    }
  })

  return (
    <group>
      {/* Base dark sphere */}
      <mesh>
        <sphereGeometry args={[1.99, 64, 64]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Continent points with glow */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#60a5fa"
          transparent
          opacity={1}
          sizeAttenuation={true}
        />
      </points>

      {/* Connection arcs between major hubs */}
      <CurvedConnections />

      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#60a5fa" />
    </group>
  )
}

function CurvedConnections() {
  const connections = [
    [[40, -74], [51, 0]],    // NY to London
    [[51, 0], [35, 139]],    // London to Tokyo
    [[35, 139], [1, 103]],   // Tokyo to Singapore
    [[1, 103], [-33, 151]],  // Singapore to Sydney
    [[-33, 151], [40, -74]], // Sydney to NY
  ]

  return (
    <>
      {connections.map(([start, end], i) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(
            -2.02 * Math.sin((90 - start[0]) * Math.PI / 180) * Math.cos((start[1] + 180) * Math.PI / 180),
            2.02 * Math.cos((90 - start[0]) * Math.PI / 180),
            2.02 * Math.sin((90 - start[0]) * Math.PI / 180) * Math.sin((start[1] + 180) * Math.PI / 180)
          ),
          new THREE.Vector3(0, 3, 0), // Control point above
          new THREE.Vector3(
            -2.02 * Math.sin((90 - end[0]) * Math.PI / 180) * Math.cos((end[1] + 180) * Math.PI / 180),
            2.02 * Math.cos((90 - end[0]) * Math.PI / 180),
            2.02 * Math.sin((90 - end[0]) * Math.PI / 180) * Math.sin((end[1] + 180) * Math.PI / 180)
          )
        )

        const points = curve.getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <primitive key={i} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.3 }))} />
        )
      })}
    </>
  )
}

export default function InteractiveGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <GlobePoints />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
    </div>
  )
}
