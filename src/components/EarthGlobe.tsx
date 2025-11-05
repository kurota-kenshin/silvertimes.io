import { useRef, useEffect } from 'react'
// @ts-ignore
import Globe from 'globe.gl'

export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const globe = new Globe(containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#60a5fa')
      .atmosphereAltitude(0.15)
      .width(containerRef.current.clientWidth)
      .height(containerRef.current.clientHeight)

    // Auto-rotate
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.5
    globe.controls().enableZoom = true

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        globe
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
