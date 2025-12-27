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
              Tokenised silver with sustainable yield. Backed by real assets.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://x.com/SilvertimesSTT"
                target="_blank"
                rel="noopener noreferrer"
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
                href="https://t.me/SilverTimesToken"
                target="_blank"
                rel="noopener noreferrer"
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
                href="https://www.reddit.com/r/SilverTimesToken"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-lg flex items-center justify-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-silver-400 hover:text-blue-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
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
                  href="/docs"
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
                  href="/about"
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
                  href="mailto:marketing@silvertimes.io"
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
                  href="/docs"
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
