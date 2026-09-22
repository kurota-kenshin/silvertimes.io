import { useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "../services/api";

/**
 * Ad strip for the STT staking campaign. Replaces the Coinstore airdrop
 * banner on the homepage.
 *
 * The destination is an internal route, so this uses a router Link rather
 * than an anchor — a full page load would throw away the SPA state and make
 * the jump feel slower than it is.
 */
export default function StakingBanner() {
  // Impression: fire once when the banner mounts.
  useEffect(() => {
    analyticsApi.track("staking_banner_view");
  }, []);

  const cta = (extra: string) => (
    <span
      className={`flex items-center gap-1.5 rounded-full bg-white font-semibold text-black shadow-lg shadow-black/40 ${extra}`}
    >
      Stake now
      <svg
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );

  return (
    <Link
      to="/staking"
      onClick={() => analyticsApi.track("staking_banner_click")}
      // The artwork is a transparent PNG built for a dark strip — the glow
      // and chrome lettering only read against near-black.
      className="block bg-[#05060c]"
      aria-label="STT staking is now live — earn up to 15% APR"
    >
      {/* Desktop: CTA overlaid in the gap between the APR line and the coins. */}
      <div className="relative hidden sm:block">
        <img
          src="/promo/staking-banner-desktop.png"
          alt="STT staking is now live — earn up to 15% APR"
          className="mx-auto w-full"
        />
        <span className="pointer-events-none absolute left-[69%] top-1/2 -translate-x-1/2 -translate-y-1/2">
          {cta("px-5 py-1.5 text-xs")}
        </span>
      </div>

      {/* Mobile: artwork stays clean; the CTA gets its own slim bar beneath. */}
      <div className="sm:hidden">
        <img
          src="/promo/staking-banner-mobile.png"
          alt="STT staking is now live — earn up to 15% APR"
          className="w-full"
        />
        <div className="flex items-center justify-center border-t border-white/10 py-2">
          {cta("px-4 py-1 text-[11px]")}
        </div>
      </div>
    </Link>
  );
}
