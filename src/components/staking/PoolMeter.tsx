import { motion } from "framer-motion";
import { EASE } from "../v2/cinematic";
import { type PoolState } from "./staking";

/**
 * Share of the reward pool already committed, as a bar.
 *
 * Deliberately shows no absolute STT figure: the pool is small in token terms
 * and quoting it undersells the campaign. The percentage is the signal.
 */
export default function PoolMeter({ pool }: { pool: PoolState | null }) {
  if (!pool) {
    return (
      <div className="h-2.5 w-full animate-pulse rounded-full bg-white/[0.06]" />
    );
  }

  const used = pool.committedRewardStt + pool.heldRewardStt;
  const pct = Math.min(100, (used / pool.totalRewardStt) * 100);
  const exhausted = !pool.isOpen;

  return (
    <div className="w-full">
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            exhausted
              ? "bg-gradient-to-r from-silver-600/60 to-silver-500/50"
              : "bg-gradient-to-r from-brand-blue/60 to-brand-teal/70"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>

      {exhausted && (
        <div className="mt-2.5 text-right text-[11px] uppercase tracking-[0.14em] text-silver-500">
          Fully subscribed
        </div>
      )}
    </div>
  );
}
