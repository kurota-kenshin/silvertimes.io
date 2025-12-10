export default function Footer() {
  return (
    <footer className="relative bg-background-primary py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top section */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/ST_LOGO_DARK@2x.png"
                alt="SilverTimes"
                className="h-6"
              />
            </div>
            <p className="text-xs text-silver-500 mb-8 leading-relaxed">
              Tokenised silver with treasury-powered yield. Backed by real
              assets.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-lg flex items-center justify-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-silver-400 hover:text-blue-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-lg flex items-center justify-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-silver-400 hover:text-blue-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.358-.168.56-.5.748-.82.767-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.322.023.466.14.122.1.155.235.171.33.016.095.036.311.02.48z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-lg flex items-center justify-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-silver-400 hover:text-blue-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-silver-600 uppercase tracking-wider mb-6">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              {/* <li><a href="#" className="text-xs text-silver-500 hover:text-white transition-colors">Staking</a></li>
              <li><a href="#" className="text-xs text-silver-500 hover:text-white transition-colors">Minting</a></li>
              <li><a href="#" className="text-xs text-silver-500 hover:text-white transition-colors">Redemption</a></li>
              <li><a href="#" className="text-xs text-silver-500 hover:text-white transition-colors">Audits</a></li> */}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-silver-600 uppercase tracking-wider mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              {/* <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li> */}
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              {/* <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li> */}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-xs font-semibold text-silver-600 uppercase tracking-wider mb-6">
              Developers
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              {/* <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Smart Contracts
                </a>
              </li> */}
              {/* <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-xs text-silver-500 hover:text-white transition-colors"
                >
                  Bug Bounty
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="text-xs text-silver-600">
              <p>&copy; 2025 SilverTimes. All rights reserved.</p>
            </div>
            <div className="flex gap-8 text-xs text-silver-600">
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
