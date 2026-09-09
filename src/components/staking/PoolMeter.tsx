import { motion } from "framer-motion";
import { EASE } from "../v2/cinematic";
import { fmtStt, type PoolState } from "./staking";

/**
 * Committed rewards against the pool. Shown as value, not seats: the 1 STT
 * floor means the participant count could be anywhere from 38 to ~1,737, so a
 * "spots left" counter would be meaningless.
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
      <div className="h-9 w-full max-w-md animate-pulse rounded-lg border border-white/10 bg-white/[0.02]" />
    );
  }

  const used = pool.committedRewardStt + pool.heldRewardStt;
  const pct = Math.min(100, (used / pool.totalRewardStt) * 100);
  const exhausted = !pool.isOpen;

  return (
    <div className={compact ? "w-full" : "w-full max-w-md"}>
      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
        <motion.div
          className={`absolute inset-y-0 left-0 ${
            exhausted
              ? "bg-gradient-to-r from-silver-600/50 to-silver-500/40"
              : "bg-gradient-to-r from-brand-blue/40 to-brand-teal/50"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs tabular-nums text-silver-200">
          {exhausted
            ? "Reward pool fully subscribed"
            : `${fmtStt(pool.availableRewardStt)} STT of rewards remaining`}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] tabular-nums text-silver-500">
        <span>{pct.toFixed(1)}% committed</span>
        <span>{fmtStt(pool.totalRewardStt, 2)} STT pool</span>
      </div>
    </div>
  );
}
