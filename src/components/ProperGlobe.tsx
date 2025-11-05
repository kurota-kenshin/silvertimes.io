import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Real coastline data - traced from actual geography
const COASTLINE_COORDINATES: [number, number][] = [
  // NORTH AMERICA - West Coast (Alaska to Mexico)
  [71, -156], [70, -158], [68, -165], [65, -168], [60, -170], [58, -155], [56, -158], [54, -160],
  [52, -165], [51, -168], [49, -125], [48, -124], [47, -123], [46, -124], [45, -124], [43, -124],
  [42, -124], [40, -124], [38, -123], [37, -122], [36, -122], [35, -121], [34, -120], [33, -118],
  [32, -117], [30, -116], [28, -112], [26, -110], [24, -107], [22, -106], [20, -105],

  // NORTH AMERICA - Gulf of Mexico and East Coast
  [18, -95], [20, -97], [25, -97], [27, -97], [28, -95], [29, -90], [30, -88], [30, -86],
  [29, -85], [28, -83], [27, -80], [26, -80], [25, -80], [27, -82], [30, -81], [32, -80],
  [33, -79], [34, -78], [35, -76], [37, -76], [39, -75], [40, -74], [41, -72], [42, -71],
  [43, -70], [44, -68], [45, -67], [47, -65], [48, -64], [50, -60], [52, -56], [54, -58],
  [58, -65], [62, -70], [65, -75], [68, -80], [70, -85],

  // SOUTH AMERICA - East Coast
  [10, -60], [8, -58], [5, -52], [2, -50], [0, -50], [-2, -48], [-5, -45], [-8, -38],
  [-10, -36], [-12, -38], [-15, -39], [-18, -40], [-20, -40], [-23, -43], [-25, -48],
  [-28, -49], [-30, -50], [-33, -52], [-35, -55], [-38, -58], [-40, -62], [-42, -65],
  [-45, -68], [-48, -72], [-50, -75], [-52, -70], [-54, -68], [-55, -67],

  // SOUTH AMERICA - West Coast
  [-55, -68], [-52, -72], [-48, -74], [-45, -74], [-42, -73], [-38, -73], [-35, -72],
  [-30, -71], [-25, -70], [-20, -70], [-15, -76], [-10, -78], [-5, -80], [0, -79],
  [5, -78], [8, -80], [10, -75], [10, -72],

  // EUROPE - Scandinavia
  [71, 26], [70, 28], [69, 30], [68, 32], [67, 24], [65, 22], [63, 20], [61, 18],
  [60, 11], [59, 10], [58, 8], [56, 8], [55, 10], [55, 12], [56, 14], [57, 16],

  // EUROPE - Western Coast
  [59, 5], [58, 4], [57, 3], [55, 4], [53, 5], [52, 4], [51, 1], [50, -1], [49, -2],
  [48, -4], [47, -3], [46, -2], [45, -1], [44, 0], [43, -2], [42, -8], [40, -9],
  [38, -9], [37, -8],

  // EUROPE - Mediterranean
  [36, -6], [36, -3], [37, 0], [38, 3], [39, 8], [40, 9], [41, 14], [42, 16], [43, 12],
  [44, 10], [45, 7], [46, 10], [47, 12], [48, 16], [49, 18], [50, 20], [52, 22], [54, 24],

  // AFRICA - North Coast
  [37, -6], [36, -5], [35, -3], [34, 0], [33, 5], [33, 8], [34, 10], [35, 15], [34, 18],
  [32, 20], [31, 22], [31, 25], [31, 28], [31, 30], [30, 32], [30, 34],

  // AFRICA - East Coast
  [30, 34], [28, 35], [25, 38], [22, 40], [18, 42], [15, 43], [12, 44], [8, 44],
  [5, 45], [2, 45], [0, 44], [-2, 43], [-5, 42], [-8, 42], [-10, 42], [-12, 41],
  [-15, 40], [-18, 39], [-20, 38], [-22, 37], [-25, 35], [-28, 33], [-30, 32],
  [-32, 30], [-34, 28], [-35, 26],

  // AFRICA - South Tip
  [-35, 18], [-34, 20], [-33, 22], [-32, 24], [-30, 26], [-28, 28], [-26, 30],

  // AFRICA - West Coast
  [-34, 18], [-32, 16], [-30, 15], [-28, 14], [-25, 14], [-20, 13], [-15, 13],
  [-10, 10], [-5, 8], [0, 8], [5, 9], [8, 10], [10, 12], [12, 12], [15, 10],
  [18, 8], [20, 6], [23, 5], [25, 5], [28, 5], [30, 3], [32, 0], [33, -5], [35, -10],

  // ASIA - Middle East
  [30, 34], [32, 35], [34, 36], [36, 38], [37, 40], [38, 42], [38, 45], [37, 48],
  [36, 50], [35, 52], [33, 54], [30, 56], [28, 58], [27, 60], [26, 62], [25, 63],

  // ASIA - Indian Subcontinent
  [25, 67], [23, 68], [20, 70], [18, 72], [15, 73], [12, 75], [10, 76], [8, 77],
  [8, 79], [9, 82], [11, 85], [13, 88], [15, 90], [18, 92], [20, 94], [22, 95],

  // ASIA - Southeast Asia
  [22, 95], [20, 97], [18, 99], [15, 100], [12, 102], [10, 102], [8, 104], [5, 105],
  [3, 106], [1, 104], [-1, 103], [-3, 104], [-5, 105], [-8, 108], [-10, 110],

  // ASIA - East Coast (China, Korea, Japan)
  [22, 110], [24, 112], [26, 115], [28, 117], [30, 120], [32, 122], [34, 125], [36, 128],
  [38, 130], [40, 132], [42, 135], [43, 138], [42, 140], [40, 142], [38, 143], [36, 141],
  [34, 138], [32, 136], [30, 134], [28, 132],

  // ASIA - North Coast (Siberia)
  [70, 100], [68, 110], [67, 120], [68, 130], [69, 140], [70, 150], [71, 160], [70, 170],
  [68, 175], [65, 178], [63, -180], [60, -175], [58, -170], [55, -165], [52, -160],

  // AUSTRALIA - North Coast
  [-10, 130], [-11, 132], [-12, 134], [-12, 136], [-13, 138], [-14, 140], [-14, 142],
  [-15, 144], [-16, 146], [-17, 148], [-18, 150], [-19, 152],

  // AUSTRALIA - East Coast
  [-19, 152], [-21, 152], [-23, 153], [-25, 153], [-28, 153], [-30, 152], [-33, 151],
  [-35, 150], [-37, 149], [-38, 148], [-39, 147],

  // AUSTRALIA - South Coast
  [-39, 147], [-38, 145], [-37, 143], [-36, 140], [-35, 138], [-34, 136], [-33, 134],
  [-32, 132], [-32, 130], [-32, 128], [-32, 126], [-32, 124], [-32, 122], [-32, 118],

  // AUSTRALIA - West Coast
  [-32, 115], [-30, 115], [-28, 115], [-25, 114], [-22, 114], [-20, 115], [-17, 120],
  [-14, 125], [-12, 128], [-11, 130],

  // Additional detail - Madagascar
  [-12, 45], [-14, 46], [-16, 47], [-18, 48], [-20, 48], [-22, 48], [-24, 47], [-25, 46],
  [-25, 44], [-24, 43], [-22, 43], [-20, 43], [-18, 44], [-16, 44], [-14, 44], [-12, 44],

  // Additional detail - UK/Ireland
  [50, -5], [51, -4], [52, -3], [53, -2], [54, -3], [55, -4], [56, -5], [57, -6],
  [58, -5], [59, -4], [58, -3], [57, -2], [56, -2], [55, -2], [54, 0], [53, 0], [52, 0],
  [51, -1], [50, -2], [50, -4],

  // Additional detail - New Zealand
  [-34, 173], [-36, 174], [-38, 175], [-40, 175], [-42, 174], [-44, 170], [-45, 168],
  [-46, 167], [-45, 166], [-43, 167], [-41, 168], [-39, 170], [-37, 172], [-35, 173],

  // Additional detail - Japan detailed
  [45, 142], [44, 143], [43, 144], [42, 143], [41, 142], [40, 141], [39, 140], [38, 140],
  [37, 139], [36, 139], [35, 138], [34, 136], [33, 135], [32, 133], [31, 131], [32, 130],
  [33, 131], [34, 133], [36, 137], [38, 139], [40, 140],

  // Additional detail - Philippines
  [20, 122], [19, 122], [18, 121], [17, 120], [16, 120], [15, 121], [14, 122], [13, 123],
  [12, 124], [11, 125], [10, 126], [9, 125], [8, 125], [7, 124], [6, 123], [7, 122],
  [8, 122], [10, 122], [12, 122], [14, 121], [16, 121], [18, 122],

  // Additional detail - Indonesia islands
  [-1, 120], [-2, 122], [-3, 124], [-5, 126], [-6, 128], [-7, 130], [-8, 132], [-8, 135],
  [-7, 138], [-6, 140], [-5, 142], [-4, 140], [-3, 138], [-2, 135], [-1, 132], [0, 128],
  [1, 125], [1, 122], [0, 120],

  // Additional detail - Greenland
  [83, -35], [82, -30], [81, -25], [80, -20], [79, -22], [77, -25], [75, -30], [73, -35],
  [72, -40], [71, -45], [70, -50], [69, -52], [68, -53], [67, -52], [66, -50], [65, -48],
  [64, -45], [63, -42], [62, -40], [61, -38], [60, -35], [60, -30], [61, -25], [63, -22],
  [65, -20], [67, -18], [69, -18], [71, -20], [73, -22], [75, -25], [77, -28], [79, -30],
  [81, -32], [82, -34],
]

function DenseGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  // Convert lat/lon coordinates to 3D positions
  const latLonTo3D = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)

    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }

  // Create continent outlines as connected line paths
  const continentLines = useMemo(() => {
    const radius = 2.02
    const lines: THREE.Line[] = []

    // Group coordinates into continent paths
    const continentPaths = [
      COASTLINE_COORDINATES.slice(0, 31), // North America West
      COASTLINE_COORDINATES.slice(31, 50), // North America East
      COASTLINE_COORDINATES.slice(50, 78), // South America
      COASTLINE_COORDINATES.slice(78, 112), // Europe
      COASTLINE_COORDINATES.slice(112, 183), // Africa
      COASTLINE_COORDINATES.slice(183, 220), // Asia Middle East + India
      COASTLINE_COORDINATES.slice(220, 235), // Southeast Asia
      COASTLINE_COORDINATES.slice(235, 255), // East Asia
      COASTLINE_COORDINATES.slice(255, 270), // Siberia
      COASTLINE_COORDINATES.slice(270, 320), // Australia + islands
    ]

    continentPaths.forEach((path) => {
      const points = path.map(([lat, lon]) => latLonTo3D(lat, lon, radius))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      })
      lines.push(new THREE.Line(geometry, material))
    })

    return lines
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {/* Dark base sphere */}
      <mesh>
        <sphereGeometry args={[1.98, 64, 64]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* Outer glow atmosphere - layer 1 */}
      <mesh>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow atmosphere - layer 2 (larger) */}
      <mesh>
        <sphereGeometry args={[2.25, 64, 64]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Render continent outline lines */}
      {continentLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}

      {/* Latitude/Longitude grid lines */}
      <GridLines />

      {/* Network connections between cities */}
      <NetworkLines />

      {/* Enhanced lighting for maximum glow effect */}
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 0, 5]} intensity={2.5} color="#60a5fa" />
      <pointLight position={[-5, 0, -5]} intensity={2} color="#60a5fa" />
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#60a5fa" />
      <pointLight position={[0, -5, 0]} intensity={1.2} color="#3b82f6" />
      <pointLight position={[0, 0, 5]} intensity={1.8} color="#60a5fa" />
    </group>
  )
}

function GridLines() {
  const gridLines = useMemo(() => {
    const radius = 2.0
    const lines: THREE.Line[] = []

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const points: THREE.Vector3[] = []
      for (let lon = -180; lon <= 180; lon += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)

        const x = -radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)

        points.push(new THREE.Vector3(x, y, z))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.15,
      })
      lines.push(new THREE.Line(geometry, material))
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
      const points: THREE.Vector3[] = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)

        const x = -radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)

        points.push(new THREE.Vector3(x, y, z))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.15,
      })
      lines.push(new THREE.Line(geometry, material))
    }

    return lines
  }, [])

  return (
    <>
      {gridLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  )
}

function NetworkLines() {
  const connections = [
    [[40, -74], [51, 0]], // NY-London
    [[51, 0], [35, 139]], // London-Tokyo
    [[35, 139], [1, 103]], // Tokyo-Singapore
    [[1, 103], [-33, 151]], // Singapore-Sydney
    [[-33, 151], [40, -74]], // Sydney-NY
  ]

  return (
    <>
      {connections.map(([start, end], i) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(
            -2.05 * Math.sin((90 - start[0]) * Math.PI / 180) * Math.cos((start[1] + 180) * Math.PI / 180),
            2.05 * Math.cos((90 - start[0]) * Math.PI / 180),
            2.05 * Math.sin((90 - start[0]) * Math.PI / 180) * Math.sin((start[1] + 180) * Math.PI / 180)
          ),
          new THREE.Vector3(0, 2.8, 0),
          new THREE.Vector3(
            -2.05 * Math.sin((90 - end[0]) * Math.PI / 180) * Math.cos((end[1] + 180) * Math.PI / 180),
            2.05 * Math.cos((90 - end[0]) * Math.PI / 180),
            2.05 * Math.sin((90 - end[0]) * Math.PI / 180) * Math.sin((end[1] + 180) * Math.PI / 180)
          )
        )

        const points = curve.getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <primitive
            key={i}
            object={new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.4 })
            )}
          />
        )
      })}
    </>
  )
}

export default function ProperGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <DenseGlobe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          dampingFactor={0.05}
          enableDamping={true}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
