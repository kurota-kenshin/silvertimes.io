import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { EASE } from "../v2/cinematic";
import { useLoginModal } from "../LoginModalProvider";
import { dailyPredictionApi } from "../../services/api";
import { useDailyGame } from "./DailyGameContext";
import { useSilverPriceStore } from "../../store/silverPriceStore";

function multiplier(streak: number) {
  return 1 + Math.min(Math.max(streak, 1) - 1, 20) * 0.05;
}

export default function PredictionCard() {
  const { authenticated, getAccessToken } = usePrivy();
  const { openLoginModal } = useLoginModal();
  const { round, me, refresh } = useDailyGame();
  const { currentPrice } = useSilverPriceStore();
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [crowd, setCrowd] = useState<number[]>([]);
  const [securedOpen, setSecuredOpen] = useState(false);

  useEffect(() => {
    if (me?.entry) setPrice(String(me.entry.predictedPrice));
  }, [me?.entry]);

  useEffect(() => {
    dailyPredictionApi
      .predictions()
      .then((p) => setCrowd(p.map((x) => x.price)))
      .catch(() => {});
  }, [round?.roundKey]);

  const closed =
    !!round && new Date(round.submissionClose).getTime() <= Date.now();
  const streak = me?.dailyStreak ?? 0;
  // Prizes are shown in STT (0.1 STT per winner). The backend still books
  // winnings in USDT until the payout migration, so this is display-side only.
  const STT_PER_WINNER = 0.1;
  const pot = Number(
    (STT_PER_WINNER * (round?.winnersCount ?? 5)).toFixed(1),
  );

  const targetLabel = useMemo(
    () =>
      round
        ? new Date(round.targetDate).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          })
        : "",
    [round],
  );

  const crowdAvg = useMemo(
    () =>
      crowd.length
        ? crowd.reduce((a, b) => a + b, 0) / crowd.length
        : null,
    [crowd],
  );

  // The post-lock, pre-result window: between a trading day's submission close
  // (11:00 UTC) and its noon Result Time (12:00 UTC). Only in this hour has
  // "today's" round locked while the next round is open — so this is the only
  // time to show the "locked, now predicting for the next round" notice. After
  // payout everyone already knows they're playing the next day, so it must
  // disappear. Computed inline (not memoized) so it re-evaluates as time passes.
  const inLockWindow = (() => {
    if (!round) return false;
    const now = new Date();
    const dow = now.getUTCDay();
    if (dow < 1 || dow > 5) return false; // no round locks on weekends
    const settle = new Date(round.targetDate);
    const lock = new Date(round.submissionClose);
    const settleAt = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      settle.getUTCHours(),
      settle.getUTCMinutes(),
    );
    const lockAt = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      lock.getUTCHours(),
      lock.getUTCMinutes(),
    );
    const t = now.getTime();
    return t >= lockAt && t < settleAt;
  })();

  const entryTimeLabel = useMemo(() => {
    if (!me?.entry?.submittedAt) return "";
    return new Date(me.entry.submittedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [me?.entry?.submittedAt]);

  const step = (delta: number) => {
    const base = Number(price || currentPrice || 0);
    const next = Math.max(0, base + delta);
    setPrice(next.toFixed(2));
  };

  const submit = async () => {
    if (!authenticated) {
      openLoginModal();
      return;
    }
    const val = Number(price);
    if (!(val > 0)) {
      setMsg("Enter a valid price");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await dailyPredictionApi.predict(token, val);
      await refresh();
      if (inLockWindow) {
        setMsg(null);
        setSecuredOpen(true);
      } else {
        setMsg("Locked in. You can edit any time before cutoff.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative"
    >
      {/* Animated aurora glow behind the card */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-blue/30 via-brand-teal/15 to-transparent blur-3xl"
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="rounded-[1.9rem] bg-gradient-to-br from-white/25 via-white/[0.07] to-transparent p-px">
        <div className="relative overflow-hidden rounded-[1.85rem] bg-background-secondary/80 p-8 backdrop-blur-xl sm:p-10">
          {/* faint top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          {/* Header: live silver reference + streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-teal" />
              </span>
              <span className="text-xs text-silver-400">
                Silver:{" "}
                <span className="font-mono text-white">
                  {currentPrice ? `$${currentPrice.toFixed(2)}` : "—"}
                </span>{" "}
                USD / oz
              </span>
            </div>
            <span className="text-sm text-silver-400">
              Streak <span className="text-white">{streak}</span> ·{" "}
              <span className="text-brand-sky">{multiplier(streak).toFixed(2)}×</span>
            </span>
          </div>

          {inLockWindow && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand-sky/25 bg-brand-sky/[0.06] px-4 py-3 text-left">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <p className="text-xs leading-relaxed text-silver-300">
                Today&apos;s round is locked. You&apos;re now predicting for{" "}
                <span className="text-white">{targetLabel}</span> — submit to
                enter the next round.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-xs tracking-[0.15em] text-silver-500">
            LBMA Silver Price
            <span className="mx-2 text-silver-700">|</span>
            {targetLabel}
            <span className="mx-2 text-silver-700">|</span>
            12:00 GMT+0
          </p>

          {/* Big stepper input */}
          <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => step(-0.1)}
              disabled={closed || saving}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xl text-silver-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-30"
              aria-label="Decrease"
            >
              −
            </button>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl text-silver-500">$</span>
              <input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={closed || saving}
                placeholder="00.00"
                className="w-[5.5ch] bg-transparent text-center text-5xl font-bold tracking-tight text-white outline-none placeholder:text-silver-700 sm:text-6xl"
              />
            </div>
            <button
              type="button"
              onClick={() => step(0.1)}
              disabled={closed || saving}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xl text-silver-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-30"
              aria-label="Increase"
            >
              +
            </button>
          </div>

          {me?.entry && (
            <p className="mt-4 text-center text-sm text-silver-400">
              Your guess{" "}
              <span className="font-mono text-white">
                ${Number(me.entry.predictedPrice).toFixed(2)}
              </span>
              {entryTimeLabel ? (
                <span className="text-silver-600"> · submitted {entryTimeLabel}</span>
              ) : null}
            </p>
          )}

          {/* Quick context chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {currentPrice ? (
              <button
                type="button"
                onClick={() => setPrice(currentPrice.toFixed(2))}
                disabled={closed || saving}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-silver-400 transition-colors hover:text-white disabled:opacity-30"
              >
                Use current ${currentPrice.toFixed(2)}
              </button>
            ) : null}
            {round && round.totalParticipants > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-silver-500">
                <svg
                  className="h-3.5 w-3.5 text-brand-sky"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-silver-300">
                  {round.totalParticipants.toLocaleString()}
                </span>{" "}
                {round.totalParticipants === 1 ? "player" : "players"} in
              </span>
            ) : round && !closed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sky/25 bg-brand-sky/[0.06] px-3 py-1 text-xs text-brand-sky">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z" />
                </svg>
                Be the first to predict
              </span>
            ) : null}
            {crowdAvg ? (
              <span className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-silver-500">
                Crowd avg{" "}
                <span className="text-silver-300">${crowdAvg.toFixed(2)}</span>
              </span>
            ) : null}
          </div>

          {/* Prize pool */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5">
              <svg
                className="h-4 w-4 text-brand-sky"
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
              <span className="text-sm text-silver-300">
                <span className="font-semibold text-white">{pot} STT</span> pool
                <span className="mx-2 text-silver-700">·</span>
                {round?.winnersCount ?? 5} winners × {STT_PER_WINNER} STT
              </span>
            </div>
          </div>

          {/* Lock in */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={closed || saving}
            className="group relative mt-8 w-full overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition-transform enabled:hover:scale-[1.01] disabled:opacity-40"
          >
            <span className="relative z-10">
              {closed
                ? "Round closed"
                : saving
                  ? "Submitting…"
                  : me?.entry
                    ? "Update prediction"
                    : "Submit"}
            </span>
            {/* shimmer */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.button>

          {msg && (
            <p className="mt-4 text-center text-sm text-silver-400">{msg}</p>
          )}
          <p className="mt-5 text-center text-xs text-silver-600">
            Closest guess wins
            <span className="mx-2 text-silver-700">|</span>
            Ties broken by earliest entry
            <span className="mx-2 text-silver-700">|</span>
            Last submit counts
          </p>
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {securedOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSecuredOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-sm"
          >
            <div className="rounded-[1.9rem] bg-gradient-to-br from-white/25 via-white/[0.07] to-transparent p-px">
              <div className="relative overflow-hidden rounded-[1.85rem] bg-background-secondary/90 p-8 text-center backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="mt-1 flex justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky/30 to-brand-blue/20 ring-1 ring-white/15">
                    <svg
                      className="h-7 w-7 text-brand-sky"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold leading-tight">
                  Guess secured for the{" "}
                  <span className="gradient-text">next round</span>
                </h3>
                <p className="mt-3 text-sm text-silver-400">
                  Today&apos;s round is locked — your prediction
                  {me?.entry ? (
                    <>
                      {" "}
                      of{" "}
                      <span className="font-mono text-white">
                        ${Number(me.entry.predictedPrice).toFixed(2)}
                      </span>
                    </>
                  ) : null}{" "}
                  has been entered into the round on{" "}
                  <span className="text-white">{targetLabel}</span>.
                </p>
                <p className="mt-2 text-sm text-silver-500">
                  You&apos;re officially in. Good luck!
                </p>
                <button
                  onClick={() => setSecuredOpen(false)}
                  className="mt-7 w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
