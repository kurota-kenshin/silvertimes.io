import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { EASE } from "../v2/cinematic";
import type { LatestResult } from "./useLatestResult";
import { renderWinCard, type WinCard } from "./winShareCard";
import { prizeLabel, useSttLive } from "./prize";
import { predictionsApi } from "../../services/api";

const SHARE_URL = "https://www.silvertimes.io/prediction";

function shareText(r: LatestResult) {
  return `I called the silver price and won ${prizeLabel(r.prize)} on SilverTimes. Predicted $${r.predictedPrice.toFixed(2)}, actual $${r.actualPrice.toFixed(2)} — $${r.error.toFixed(2)} off. Play the daily game: ${SHARE_URL}`;
}

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
  const [card, setCard] = useState<WinCard | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const { getAccessToken } = usePrivy();
  const sttIsLive = useSttLive();

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

  // Pre-render the shareable win card as soon as the popup opens for a winner.
  useEffect(() => {
    if (!open || !won || !active) return;
    let cancelled = false;
    renderWinCard(active)
      .then((c) => {
        if (!cancelled) setCard(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // active is stable while the popup is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, won]);

  const canNativeShare =
    !!card &&
    typeof navigator !== "undefined" &&
    !!navigator.canShare &&
    navigator.canShare({ files: [card.file] });

  // Best-effort share counter (Broadcaster badge) — never blocks the share.
  const recordShare = () => {
    getAccessToken()
      .then((t) => (t ? predictionsApi.trackShare(t) : null))
      .catch(() => {});
  };

  const shareNative = async () => {
    if (!card || !active) return;
    recordShare();
    try {
      await navigator.share({ files: [card.file], text: shareText(active) });
    } catch {
      // user dismissed the sheet — nothing to do
    }
  };

  const shareX = async () => {
    if (!active) return;
    recordShare();
    // The X web intent can't attach media, so put the image on the clipboard
    // for the user to paste into the compose window.
    let copied = false;
    if (card && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": card.blob }),
        ]);
        copied = true;
      } catch {
        // clipboard images unsupported — intent still opens with text
      }
    }
    setShareHint(copied ? "Win card copied — paste it into your post" : null);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(active))}`,
      "_blank",
      "noopener",
    );
  };

  const shareTelegram = () => {
    if (!active) return;
    recordShare();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(shareText(active))}`,
      "_blank",
      "noopener",
    );
  };

  const downloadCard = () => {
    if (!card) return;
    recordShare();
    const a = document.createElement("a");
    a.href = card.dataUrl;
    a.download = "silvertimes-win.png";
    a.click();
  };

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
              <div className="relative max-h-[88vh] overflow-y-auto rounded-[1.85rem] bg-background-secondary/90 p-8 text-center backdrop-blur-xl sm:p-10">
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
                      <span className="gradient-text">{prizeLabel(active.prize, sttIsLive)}</span>
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

                    {/* Share your win */}
                    {card && (
                      <div className="mt-7 text-left">
                        <p className="text-center text-xs uppercase tracking-[0.22em] text-silver-500">
                          Share your win
                        </p>
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                          <img
                            src={card.dataUrl}
                            alt="Your SilverTimes win card"
                            className="block w-full"
                          />
                        </div>
                        <div className="mt-3 flex items-stretch justify-center gap-2">
                          {canNativeShare && (
                            <button
                              onClick={shareNative}
                              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-sky/25 to-brand-blue/25 px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-white/15 transition-colors hover:ring-white/30"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v13M12 3l-4 4M12 3l4 4" />
                                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
                              </svg>
                              Share
                            </button>
                          )}
                          <button
                            onClick={shareX}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-silver-200 transition-colors hover:border-white/25 hover:text-white"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Post
                          </button>
                          <button
                            onClick={shareTelegram}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-silver-200 transition-colors hover:border-white/25 hover:text-white"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Telegram
                          </button>
                          <button
                            onClick={downloadCard}
                            aria-label="Download win card"
                            className="flex items-center justify-center rounded-full border border-white/10 px-3.5 py-2.5 text-silver-200 transition-colors hover:border-white/25 hover:text-white"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 3v12M12 15l-4-4M12 15l4-4" />
                              <path d="M5 19h14" />
                            </svg>
                          </button>
                        </div>
                        {shareHint && (
                          <p className="mt-2 text-center text-xs text-brand-sky">
                            {shareHint}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={dismiss}
                      className="mt-4 text-xs text-silver-500 transition-colors hover:text-white"
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
