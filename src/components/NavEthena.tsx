import { Link } from "react-router-dom";
import { useSilverPriceStore } from "../store/silverPriceStore";

export default function NavEthena() {
  const { currentPrice, isLoading } = useSilverPriceStore();

  return (
    <nav className="fixed top-10 left-10 right-10 z-50">
      <div className="bg-background-secondary/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <img
                src="/ST_LOGO_DARK@2x.png"
                alt="SilverTimes"
                className="h-6"
              />
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-1.5 text-sm text-white hover:text-silver-200 transition-colors rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/prediction"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Prediction
            </Link>
            <Link
              to="/products"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Product
            </Link>
            <a
              href="#about"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              About
            </a>
            <a
              href="#news"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              News
            </a>
            <a
              href="#blog"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Blog
            </a>
            <a
              href="https://silvertimes.gitbook.io/silvertimes-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Docs
            </a>
          </div>

          {/* Right side - Stats & CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-background-primary/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500/60 animate-pulse' : 'bg-green-500/60'}`}></div>
                <span className="text-xs text-silver-300">
                  {isLoading ? '...' : currentPrice ? `$${currentPrice.toFixed(2)}/oz` : '$32.50/oz'}
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-background-primary/50 rounded-lg border border-white/5">
              <span className="text-xs text-silver-300 font-medium">
                14% Silver APY
              </span>
            </div>
            <button className="px-4 py-1.5 bg-white text-black rounded-lg font-medium hover:bg-silver-200 transition-all text-sm">
              Mint now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
