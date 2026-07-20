import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const COINSTORE_URL = "https://www.coinstore.com/SignUp?invitCode=VBcva5";
// 24 Jul 2026: swap to the X (Twitter) pin-post link once published.
const BANNER_URL = COINSTORE_URL;
const POPUP_SEEN_KEY = "st_coinstore_listing_popup_seen";

/**
 * Ad strip for the STT trading airdrop. Placed in-page per the campaign
 * spec: on the homepage below the hero, and on the prediction page between
 * the tab bar and the tab content. Whole strip is a link.
 */
export function AirdropBanner() {
  return (
    <a
      href={BANNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#05060c]"
      aria-label="Win 1 oz silver — STT trading airdrop on Coinstore"
    >
      <img
        src="/promo/airdrop-banner-desktop.jpg"
        alt="Win 1 oz silver — STT trading airdrop on Coinstore"
        className="mx-auto hidden w-full sm:block"
      />
      <img
        src="/promo/airdrop-banner-mobile.jpg"
        alt="Win 1 oz silver — STT trading airdrop on Coinstore"
        className="w-full sm:hidden"
      />
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

  useEffect(() => {
    try {
      if (sessionStorage.getItem(POPUP_SEEN_KEY)) return;
    } catch {
      // storage unavailable — still show once for this page load
    }
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(POPUP_SEEN_KEY, "1");
    } catch {
      // best-effort
    }
    setOpen(false);
  };

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
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
            onClick={dismiss}
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
                  onClick={dismiss}
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
                  onClick={dismiss}
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
                    onClick={dismiss}
                    className="rounded-full bg-white px-10 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                  >
                    Buy Now
                  </a>
                  <button
                    onClick={dismiss}
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
