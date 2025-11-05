import PixelBlast from './PixelBlast'

export default function HeroCorrect() {
  const stats = [
    { value: '5.1%', label: '$STT APY' },
    { value: '19%', label: '2024 AVG $STT APY' },
    { value: '$9.04B', label: '$STT SUPPLY' },
    { value: '$1.83B', label: '$STTB SUPPLY' },
    { value: '850K', label: 'USERS' },
    { value: '24', label: 'CHAINS' },
  ]

  return (
    <section className="relative bg-background-primary px-4 py-4" style={{ minHeight: '98vh' }}>
      {/* Main container - almost full viewport */}
      <div className="relative border border-white/10 rounded-3xl bg-background-primary/50 backdrop-blur-sm overflow-hidden" style={{ height: 'calc(98vh - 2rem)' }}>

        {/* PixelBlast background */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#60a5fa"
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.25}
            transparent
          />
        </div>

        {/* Main content area - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-8 pointer-events-none">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white mb-6">
            It's Silver Time.
          </h1>

          <button className="group px-6 py-3 bg-white text-black rounded-lg font-semibold text-base hover:bg-silver-200 transition-all inline-flex items-center gap-2 pointer-events-auto">
            Earn with $STT
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-background-primary/80 backdrop-blur-sm z-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-6 text-center ${
                  index !== stats.length - 1 ? 'border-r border-white/5' : ''
                } ${index >= 3 ? 'border-t md:border-t-0 lg:border-t-0' : ''}`}
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-silver-400 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-[-2rem] left-1/2 transform -translate-x-1/2 animate-bounce z-30">
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
