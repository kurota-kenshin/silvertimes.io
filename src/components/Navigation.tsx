import { Link } from 'react-router-dom'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-silver rounded-full"></div>
            <span className="text-xl font-bold text-white">SilverTimes</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-silver-200 hover:text-white transition-colors">Home</Link>
            <Link to="/products" className="text-silver-200 hover:text-white transition-colors">Products</Link>
            <a href="#ecosystem" className="text-silver-200 hover:text-white transition-colors">Ecosystem</a>
            <a href="#transparency" className="text-silver-200 hover:text-white transition-colors">Transparency</a>
            <a href="#docs" className="text-silver-200 hover:text-white transition-colors">Docs</a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-lg">
                <span className="text-silver-300">$32.50/oz</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary rounded-lg">
                <span className="text-green-400">14% Silver APY</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-silver-200 transition-colors">
              Mint now
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
