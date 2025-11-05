export default function NavEthena() {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-background-secondary/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-silver-300 to-silver-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-background-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">SilverTimes</span>
            </div>

            {/* Center Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <a href="#home" className="px-4 py-2 text-white hover:text-silver-200 transition-colors rounded-lg hover:bg-white/5">
                Home
              </a>
              <a href="#products" className="px-4 py-2 text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Products
              </a>
              <a href="#ecosystem" className="px-4 py-2 text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Ecosystem
              </a>
              <a href="#network" className="px-4 py-2 text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Network
              </a>
              <a href="#transparency" className="px-4 py-2 text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Transparency
              </a>
              <a href="#docs" className="px-4 py-2 text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Docs
              </a>
            </div>

            {/* Right side - Stats & CTA */}
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-background-primary/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-silver-300">$10.87B</span>
                </div>
              </div>
              <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-background-primary/50 rounded-xl border border-white/5">
                <span className="text-sm text-green-400 font-semibold">5.1% APY</span>
              </div>
              <button className="px-6 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-silver-200 transition-all text-sm">
                Launch App
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
