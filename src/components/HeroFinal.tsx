import { Suspense } from 'react'
import WireframeGlobe from './WireframeGlobe'
import MatrixRain from './MatrixRain'

export default function HeroFinal() {
  const stats = [
    { value: '5.1%', label: '$STT APY', icon: '⟳' },
    { value: '19%', label: '2024 AVG $STT APY', icon: '📊' },
    { value: '$9.04B', label: '$STT SUPPLY', icon: '$' },
    { value: '$1.83B', label: '$STTB SUPPLY', icon: '💎' },
    { value: '850K', label: 'USERS', icon: '👥' },
    { value: '24', label: 'CHAINS', icon: '⛓' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background-primary px-4 pt-32 pb-16">
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Main container with border - like Ethena */}
      <div className="relative w-full max-w-[1400px] border border-white/10 rounded-3xl bg-background-primary/50 backdrop-blur-sm overflow-hidden">
        {/* Content area */}
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-16 min-h-[600px]">
          {/* Left - Text content */}
          <div className="space-y-8 z-10">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] text-white">
              Tokenised Silver
              <br />
              for the Internet
              <br />
              Economy
            </h1>

            <button className="group px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all inline-flex items-center gap-3">
              Earn with $STT
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right - Wireframe globe */}
          <div className="relative h-[500px] lg:h-[600px]">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-accent-blue/30 animate-pulse" />
                </div>
              }
            >
              <WireframeGlobe />
            </Suspense>
          </div>
        </div>

        {/* Stats bar at bottom - inside the container */}
        <div className="border-t border-white/10 bg-background-primary/80 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-6 text-center ${
                  index !== stats.length - 1 ? 'border-r border-white/10' : ''
                } ${index >= 3 ? 'border-t md:border-t-0 lg:border-t-0' : ''}`}
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-silver-400 uppercase tracking-wider font-medium">
                  <span className="text-sm opacity-50">{stat.icon}</span>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-silver-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
