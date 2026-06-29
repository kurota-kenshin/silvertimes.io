import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "../v2/cinematic";
import type { LatestResult } from "./useLatestResult";

const SEEN_PREFIX = "st_daily_winpopup_";
const CONFETTI_COLORS = ["#90E0EF", "#6596FE", "#77D6E3", "#CAF0F8", "#ffffff"];

function seenKey(roundKey: string) {
  return `${SEEN_PREFIX}${roundKey}`;
}

/** Pre-computed confetti particles — generated once per mount. */
function useConfetti(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // vw start position
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 1.8,
        drift: (Math.random() - 0.5) * 160, // px horizontal drift
        rotate: (Math.random() - 0.5) * 720,
        size: 6 + Math.random() * 6,
        round: Math.random() > 0.5,
      })),
    [count],
  );
}

function Confetti() {
  const pieces = useConfetti(56);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.4,
            borderRadius: p.round ? "9999px" : 1,
            backgroundColor: p.color,
          }}
          initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: p.drift,
            rotate: p.rotate,
            opacity: [0, 1, 1, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
        />
      ))}
    </div>
  );
}

export default function WinPopup({
  result,
  onClaim,
}: {
  result: LatestResult | null;
  onClaim: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Dev/demo override: ?winpopup=win or ?winpopup=lose force-opens the popup
  // with mock data so it can be previewed without a live settled round.
  const demo = useMemo<LatestResult | null>(() => {
    if (typeof window === "undefined") return null;
    const v = new URLSearchParams(window.location.search).get("winpopup");
    if (v === "win")
      return {
        roundKey: "demo",
        predictedPrice: 31.88,
        actualPrice: 32.0,
        error: 0.12,
        percentile: 2,
        points: 940,
        rank: 2,
        prize: 5,
        isWinner: true,
      };
    if (v === "lose")
      return {
        roundKey: "demo",
        predictedPrice: 30.16,
        actualPrice: 32.0,
        error: 1.84,
        percentile: 47,
        points: 210,
        rank: 119,
        isWinner: false,
      };
    return null;
  }, []);

  const active = demo ?? result;

  // Auto-open once per settled round (or immediately in demo mode).
  useEffect(() => {
    if (demo) {
      setOpen(true);
      return;
    }
    if (!result) return;
    try {
      if (localStorage.getItem(seenKey(result.roundKey))) return;
    } catch {
      // localStorage unavailable (private mode) — fall through and show.
    }
    setOpen(true);
  }, [result, demo]);

  const dismiss = () => {
    if (active && !demo) {
      try {
        localStorage.setItem(seenKey(active.roundKey), "1");
      } catch {
        // ignore — best-effort persistence
      }
    }
    setOpen(false);
  };

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // dismiss closes over `result`, stable while open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const won = !!active?.isWinner;

  return (
    <AnimatePresence>
      {open && active && (
        <motion.div
          key="winpopup"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={dismiss}
          />

          {/* Confetti only for actual winners */}
          {won && <Confetti />}

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-md"
          >
            {/* Aurora glow */}
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] blur-3xl ${
                won
                  ? "bg-gradient-to-br from-brand-blue/40 via-brand-teal/25 to-transparent"
                  : "bg-gradient-to-br from-white/10 via-brand-blue/10 to-transparent"
              }`}
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="rounded-[1.9rem] bg-gradient-to-br from-white/25 via-white/[0.07] to-transparent p-px">
              <div className="relative overflow-hidden rounded-[1.85rem] bg-background-secondary/90 p-8 text-center backdrop-blur-xl sm:p-10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                {/* Close */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-silver-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <p className="text-xs uppercase tracking-[0.22em] text-silver-500">
                  Yesterday's result
                  <span className="mx-2 text-silver-700">·</span>
                  {active.roundKey}
                </p>

                {won ? (
                  <>
                    <div className="mt-2 flex justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky/30 to-brand-blue/20 ring-1 ring-white/15">
                        <svg
                          className="h-8 w-8 text-brand-sky"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
                          <path d="M17 5h2.5a1.5 1.5 0 0 1 0 3H17M7 5H4.5a1.5 1.5 0 0 0 0 3H7" />
                          <path d="M12 12v3M9 19h6M10 19l.5-4M14 19l-.5-4" />
                        </svg>
                      </span>
                    </div>
                    <h2 className="mt-4 text-[clamp(1.8rem,5vw,2.6rem)] font-bold leading-[1.05]">
                      You won{" "}
                      <span className="gradient-text">{active.prize} USDT</span>
                    </h2>
                    <p className="mt-4 text-sm text-silver-400">
                      You were{" "}
                      <span className="text-white">
                        ${active.error.toFixed(2)}
                      </span>{" "}
                      off · top{" "}
                      <span className="text-white">{active.percentile}%</span> ·{" "}
                      <span className="text-brand-sky">+{active.points} pts</span>
                    </p>
                    <button
                      onClick={() => {
                        dismiss();
                        onClaim();
                      }}
                      className="mt-8 w-full rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
                    >
                      Claim it
                    </button>
                    <button
                      onClick={dismiss}
                      className="mt-3 text-xs text-silver-500 transition-colors hover:text-white"
                    >
                      Maybe later
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="mt-5 text-[clamp(1.8rem,5vw,2.6rem)] font-bold leading-[1.05]">
                      <span className="gradient-text">So close!</span>
                    </h2>
                    <p className="mt-4 text-sm text-silver-400">
                      You were{" "}
                      <span className="text-white">
                        ${active.error.toFixed(2)}
                      </span>{" "}
                      off · top{" "}
                      <span className="text-white">{active.percentile}%</span> ·{" "}
                      <span className="text-brand-sky">+{active.points} pts</span>
                    </p>
                    <p className="mt-3 text-sm text-silver-500">
                      Come back today and keep your streak alive.
                    </p>
                    <button
                      onClick={dismiss}
                      className="mt-8 w-full rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
                    >
                      Play today
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
