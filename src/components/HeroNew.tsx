export default function HeroNew() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-primary pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="gradient-text">Tokenised Silver</span>
            <br />
            <span className="text-white">with Treasury-Powered Yield</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-silver-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Turn traditionally non-yielding silver into an income-bearing allocation with integrated yield streams atop spot exposure
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-silver-200 transition-all transform hover:scale-105">
              Earn with $STT
            </button>
            <button className="px-8 py-4 border-2 border-white/20 text-white rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all">
              View Documentation
            </button>
          </div>

          {/* Stats Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-background-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5.1%</div>
              <div className="text-sm text-silver-300">$STT APY</div>
            </div>
            <div className="bg-background-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$9.04B</div>
              <div className="text-sm text-silver-300">Token Supply</div>
            </div>
            <div className="bg-background-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">850K</div>
              <div className="text-sm text-silver-300">Users</div>
            </div>
            <div className="bg-background-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24</div>
              <div className="text-sm text-silver-300">Chains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-silver-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
