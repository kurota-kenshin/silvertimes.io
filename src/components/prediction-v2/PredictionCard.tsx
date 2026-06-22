import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  const pot = (round?.prizePerWinner ?? 5) * (round?.winnersCount ?? 5);

  const targetLabel = useMemo(
    () =>
      round
        ? new Date(round.targetDate).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "Europe/London",
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
      setMsg("Locked in. You can edit any time before cutoff.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
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
                <span className="font-semibold text-white">{pot} USDT</span> pool
                <span className="mx-2 text-silver-700">·</span>
                {round?.winnersCount ?? 5} winners × {round?.prizePerWinner ?? 5}{" "}
                USDT
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
  );
}
