export default function Footer() {
  return (
    <footer className="bg-background-primary border-t border-white/10 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-silver rounded-full"></div>
              <h3 className="text-2xl font-bold text-white">SilverTimes</h3>
            </div>
            <p className="text-silver-400 mb-6 leading-relaxed">
              Tokenised silver with treasury-powered yield. Backed by real assets.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-background-secondary border border-white/10 rounded-lg flex items-center justify-center hover:bg-background-tertiary hover:border-white/20 transition-all">
                <span className="text-xl">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background-secondary border border-white/10 rounded-lg flex items-center justify-center hover:bg-background-tertiary hover:border-white/20 transition-all">
                <span className="text-xl">📱</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background-secondary border border-white/10 rounded-lg flex items-center justify-center hover:bg-background-tertiary hover:border-white/20 transition-all">
                <span className="text-xl">💬</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-silver-400">
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Staking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Minting</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Redemption</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Audits</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-silver-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-white mb-4">Developers</h4>
            <ul className="space-y-3 text-silver-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bug Bounty</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-silver-400 text-sm">
              <p>&copy; 2025 SilverTimes. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm text-silver-400">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Compliance</a>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-silver-500">
            Backed by a Hong Kong publicly listed company. Regular audits ensure 1:1 asset backing.
          </div>
        </div>
      </div>
    </footer>
  )
}
