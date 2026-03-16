import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useSilverPriceStore,
  getFormattedAPY,
} from "../store/silverPriceStore";
import { usePrivy } from "@privy-io/react-auth";
import GetSTTModal from "./GetSTTModal";

export default function NavEthena() {
  const { currentPrice, isLoading, fetchData } = useSilverPriceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <GetSTTModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-background-secondary/60 backdrop-blur-xl border-b border-white/10 px-6 py-3">
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
                to="/about"
                className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                About
              </Link>
              <Link
                to="/blog"
                className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Blog
              </Link>
              <Link
                to="/docs"
                className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Docs
              </Link>
            </div>

            {/* Right side - Stats & Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-background-primary/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLoading
                        ? "bg-brand-sky/60 animate-pulse"
                        : "bg-brand-teal/60"
                    }`}
                  ></div>
                  <span className="text-xs text-silver-300">
                    {isLoading
                      ? "..."
                      : currentPrice
                      ? `$${currentPrice.toFixed(2)}/oz`
                      : "$73.50/oz"}
                  </span>
                </div>
              </div>
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-background-primary/50 rounded-lg border border-white/5">
                <span className="text-xs text-silver-300 font-medium">
                  {getFormattedAPY(currentPrice)} Silver APY
                </span>
              </div>

              {/* Sign In Button - only when not authenticated */}
              {ready && !authenticated && (
                <button
                  onClick={login}
                  className="px-4 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
