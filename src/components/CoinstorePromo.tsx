import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { analyticsApi } from "../services/api";

// Popup CTA (Coinstore referral).
const COINSTORE_URL = "https://www.coinstore.com/signup?invitCode=o5B2zZ";
// Banner link — STT airdrop post on X.
const BANNER_URL: string | null =
  "https://x.com/SilvertimesSTT/status/2080609269280370691";
const POPUP_SEEN_KEY = "st_coinstore_listing_popup_seen";

// Campaign go-live: Friday 24 Jul 2026, 15:00 GMT+8 (07:00 UTC). Both the
// popup and the banner stay hidden before this instant and appear
// automatically at it, no redeploy.
const PROMO_LIVE_AT = Date.UTC(2026, 6, 24, 7, 0, 0);

function promoLive(): boolean {
  return Date.now() >= PROMO_LIVE_AT;
}

/** Re-renders at the go-live instant so the promo appears without a reload. */
function usePromoLive(): boolean {
  const [live, setLive] = useState(promoLive());
  useEffect(() => {
    if (live) return;
    const t = setTimeout(
      () => setLive(true),
      Math.max(50, PROMO_LIVE_AT - Date.now() + 50),
    );
    return () => clearTimeout(t);
  }, [live]);
  return live;
}

/**
 * Ad strip for the STT trading airdrop. Placed in-page per the campaign
 * spec: on the homepage below the hero, and on the prediction page between
 * the tab bar and the tab content. Clickable once BANNER_URL is set; until
 * then it displays as a plain image (link arrives at ~7pm HKT on 24 Jul).
 */
export function AirdropBanner() {
  const live = usePromoLive();
  // Impression: fire once when the banner becomes visible.
  useEffect(() => {
    if (live) analyticsApi.track("airdrop_banner_view");
  }, [live]);
  if (!live) return null;
  const cta = (extra: string) => (
    <span className={`flex items-center gap-1.5 rounded-full bg-white font-semibold text-black ${extra}`}>
      Join Now
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
  const inner = (
    <>
      {/* Desktop: full artwork with the CTA overlaid in the dark gap between
          the Coinstore logo and the parachutes. */}
      <div className="relative hidden sm:block">
        <img
          src="/promo/airdrop-banner-desktop.png"
          alt="Win 1 oz silver — STT trading airdrop on Coinstore"
          className="mx-auto w-full"
        />
        <span className="pointer-events-none absolute left-[73.5%] top-1/2 -translate-x-1/2 -translate-y-1/2">
          {cta("px-5 py-1.5 text-xs shadow-lg shadow-black/40")}
        </span>
      </div>
      {/* Mobile: artwork stays clean; the CTA gets its own slim bar beneath
          it (the ~78px strip has no room for a non-clashing overlay). */}
      <div className="sm:hidden">
        <img
          src="/promo/airdrop-banner-mobile.png"
          alt="Win 1 oz silver — STT trading airdrop on Coinstore"
          className="w-full"
        />
        <div className="flex items-center justify-center border-t border-white/10 py-2">
          {cta("px-4 py-1 text-[11px]")}
        </div>
      </div>
    </>
  );
  const className = "block bg-[#05060c]";
  if (!BANNER_URL) return <div className={className}>{inner}</div>;
  return (
    <a
      href={BANNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analyticsApi.track("airdrop_banner_click")}
      className={className}
      aria-label="Win 1 oz silver — STT trading airdrop on Coinstore"
    >
      {inner}
    </a>
  );
}

/**
 * Entry popup for the Coinstore listing — shown once per browser session,
 * a moment after landing. Buy Now (and the artwork itself) link out to
 * Coinstore; the X or backdrop dismisses.
 */
export function CoinstoreListingPopup() {
  const [open, setOpen] = useState(false);
  const live = usePromoLive();

  useEffect(() => {
    if (!live) return;
    try {
      if (sessionStorage.getItem(POPUP_SEEN_KEY)) return;
    } catch {
      // storage unavailable — still show once for this page load
    }
    const t = setTimeout(() => {
      setOpen(true);
      analyticsApi.track("coinstore_popup_view");
    }, 700);
    return () => clearTimeout(t);
  }, [live]);

  const close = () => {
    try {
      sessionStorage.setItem(POPUP_SEEN_KEY, "1");
    } catch {
      // best-effort
    }
    setOpen(false);
  };

  // Dismissal (X / backdrop / "Maybe later" / Escape) — records why.
  const dismiss = (via: string) => {
    analyticsApi.track("coinstore_popup_dismiss", { via });
    close();
  };

  // Buy Now / artwork — records the conversion, then closes.
  const buy = () => {
    analyticsApi.track("coinstore_popup_buy_click");
    close();
  };

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss("escape");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="coinstore-popup"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => dismiss("backdrop")}
          />
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-xl"
          >
            <div className="rounded-[1.4rem] bg-gradient-to-br from-white/25 via-white/[0.07] to-transparent p-px">
              <div className="relative overflow-hidden rounded-[1.35rem] bg-background-secondary/95 backdrop-blur-xl">
                <button
                  onClick={() => dismiss("close_x")}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-silver-300 transition-colors hover:bg-black/70 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <a
                  href={COINSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={buy}
                  className="block"
                >
                  <img
                    src="/promo/coinstore-listing-popup.jpg"
                    alt="STT is now live on Coinstore"
                    className="block w-full"
                  />
                </a>

                <div className="flex items-center justify-center gap-3 p-5">
                  <a
                    href={COINSTORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={buy}
                    className="rounded-full bg-white px-10 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                  >
                    Buy Now
                  </a>
                  <button
                    onClick={() => dismiss("maybe_later")}
                    className="px-4 py-3.5 text-sm text-silver-500 transition-colors hover:text-white"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
