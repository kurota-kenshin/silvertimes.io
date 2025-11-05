import { Suspense } from 'react'
import Globe from './Globe'

export default function HeroEthena() {
  return (
    <section className="relative min-h-screen flex items-center bg-background-primary overflow-hidden pt-20">
      {/* Particle/dot background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Tokenised Silver</span>
              <br />
              <span className="text-white">for the Internet</span>
              <br />
              <span className="text-white">Economy</span>
            </h1>

            {/* CTA Button */}
            <div>
              <button className="px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
                Earn with $STT
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right side - 3D Globe */}
          <div className="relative h-[600px] hidden lg:block">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-accent-blue/20 animate-pulse"></div>
              </div>
            }>
              <Globe />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-silver-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
