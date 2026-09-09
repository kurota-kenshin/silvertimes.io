import { motion } from "framer-motion";
import { EASE } from "../v2/cinematic";
import { fmtStt, type PoolState } from "./staking";

/**
 * Committed rewards against the pool. Shown as value, not seats: the 1 STT
 * floor means the participant count could be anywhere from 38 to ~1,737, so a
 * "spots left" counter would be meaningless.
 *
 * `compact` is for callers that already display the remaining figure
 * themselves — it drops the in-bar label so the same number is not repeated.
 */
export default function PoolMeter({
  pool,
  compact = false,
}: {
  pool: PoolState | null;
  compact?: boolean;
}) {
  if (!pool) {
    return (
      <div
        className={`animate-pulse rounded-lg border border-white/10 bg-white/[0.02] ${
          compact ? "h-2.5 w-full" : "h-9 w-full max-w-md"
        }`}
      />
    );
  }

  const used = pool.committedRewardStt + pool.heldRewardStt;
  const pct = Math.min(100, (used / pool.totalRewardStt) * 100);
  const exhausted = !pool.isOpen;
  const fill = exhausted
    ? "bg-gradient-to-r from-silver-600/60 to-silver-500/50"
    : "bg-gradient-to-r from-brand-blue/60 to-brand-teal/70";

  if (compact) {
    return (
      <div className="w-full">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${fill}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
            transition={{ duration: 1.1, ease: EASE }}
          />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-silver-500">
          <span className="tabular-nums">{pct.toFixed(1)}% committed</span>
          <span>
            {exhausted ? "Fully subscribed" : `of ${fmtStt(pool.totalRewardStt, 2)}`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
        <motion.div
          className={`absolute inset-y-0 left-0 ${fill}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs tabular-nums text-silver-200">
          {exhausted
            ? "Reward pool fully subscribed"
            : `${fmtStt(pool.availableRewardStt, 2)} STT of rewards remaining`}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] tabular-nums text-silver-500">
        <span>{pct.toFixed(1)}% committed</span>
        <span>{fmtStt(pool.totalRewardStt, 2)} STT pool</span>
      </div>
    </div>
  );
}
