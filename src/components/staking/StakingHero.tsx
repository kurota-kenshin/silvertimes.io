import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import PoolMeter from "./PoolMeter";
import {
  MAX_STAKE_PER_WALLET_STT,
  MIN_STAKE_STT,
  committedPct,
  fmtRate,
  type PoolState,
} from "./staking";

function Rate({ bps, term, accent }: { bps: number; term: string; accent: string }) {
  return (
    <div>
      <div
        className={`text-[2.5rem] font-semibold leading-none tracking-tight tabular-nums ${accent}`}
      >
        {fmtRate(bps)}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-silver-500">
        {term}
      </div>
    </div>
  );
}

export default function StakingHero({
  pool,
  loading,
}: {
  pool: PoolState | null;
  loading: boolean;
}) {
  const closed = !loading && pool && !pool.isOpen;

  return (
    <section className="relative px-6 pb-10 pt-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Left: the pitch */}
          <div>
            <FadeUp scroll={false}>
              <Eyebrow>STT Staking · Fixed term</Eyebrow>
            </FadeUp>

            <h1 className="mt-7 text-[clamp(2.4rem,5.5vw,4.25rem)] font-semibold leading-[1.0] tracking-tight text-white">
              <Reveal scroll={false}>Lock silver.</Reveal>
              <Reveal scroll={false} delay={0.08} className="text-silver-400">
                Earn silver.
              </Reveal>
            </h1>

            <FadeUp delay={0.15} scroll={false}>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-silver-300">
                Stake <span className="text-white">STT</span> for a fixed term
                and take back your principal plus interest at maturity — paid in{" "}
                <span className="text-brand-teal">STT</span>, from a finite
                reward pool.
              </p>
            </FadeUp>

            <FadeUp delay={0.24} scroll={false}>
              <div className="mt-9 flex items-start gap-10">
                <Rate bps={1000} term="30-day APR" accent="text-brand-teal" />
                <div className="h-12 w-px bg-white/10" />
                <Rate bps={1500} term="90-day APR" accent="text-brand-sky" />
              </div>
            </FadeUp>
          </div>

          {/* Right: the pool, given real weight rather than a stray bar */}
          <FadeUp delay={0.32} scroll={false}>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-7 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                Reward pool
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums text-white">
                  {pool ? `${committedPct(pool).toFixed(1)}%` : "—"}
                </span>
                <span className="text-base text-silver-400">committed</span>
              </div>
              <div className="mt-6">
                <PoolMeter pool={pool} />
              </div>

              <dl className="mt-7 space-y-3 border-t border-white/[0.07] pt-5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-silver-500">Stake per wallet</dt>
                  <dd className="tabular-nums text-silver-100">
                    {MIN_STAKE_STT.toFixed(2)} – {MAX_STAKE_PER_WALLET_STT.toFixed(2)} STT
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-silver-500">Allocation</dt>
                  <dd className="text-silver-100">First come, first served</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-silver-500">Paid in</dt>
                  <dd className="text-silver-100">STT, at maturity</dd>
                </div>
              </dl>

              {closed && (
                <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-silver-300">
                  Fully subscribed — every reward has been allocated. Open
                  positions are unaffected and pay out on their maturity dates.
                </p>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
