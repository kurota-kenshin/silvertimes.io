import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useSilverPriceStore,
  getFormattedAPY,
} from "../store/silverPriceStore";
import { usePrivy } from "@privy-io/react-auth";
import { useLoginModal } from "./LoginModalProvider";
import GetSTTModal from "./GetSTTModal";

export default function NavEthena() {
  const { currentPrice, isLoading, fetchData } = useSilverPriceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ready, authenticated } = usePrivy();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/prediction", label: "Prediction" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
    { to: "/docs", label: "Docs" },
  ];

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

            {/* Center Navigation - desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
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

              {/* Sign In - only when not authenticated */}
              {ready && !authenticated && (
                <button
                  onClick={openLoginModal}
                  className="px-4 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Sign In
                </button>
              )}

              {/* Hamburger - mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-silver-300 hover:text-white transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background-secondary/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-silver-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              {ready && !authenticated && (
                <button
                  onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                  className="w-full mt-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
