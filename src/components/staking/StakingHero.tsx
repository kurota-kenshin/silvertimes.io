import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import PoolMeter from "./PoolMeter";
import { fmtRate, type PoolState } from "./staking";

export default function StakingHero({
  pool,
  loading,
}: {
  pool: PoolState | null;
  loading: boolean;
}) {
  const closed = !loading && pool && !pool.isOpen;

  return (
    <section className="relative px-6 pt-24 pb-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp scroll={false}>
          <Eyebrow>STT Staking · Fixed term</Eyebrow>
        </FadeUp>

        <h1 className="mt-7 text-[clamp(2.6rem,6.5vw,5.25rem)] font-semibold leading-[0.98] tracking-tight text-white">
          <Reveal scroll={false}>Lock silver.</Reveal>
          <Reveal scroll={false} delay={0.08} className="text-silver-400">
            Earn silver.
          </Reveal>
        </h1>

        <FadeUp delay={0.15} scroll={false}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-silver-300">
            Stake <span className="text-white">STT</span> for a fixed term and
            take back your principal plus interest at maturity — paid in{" "}
            <span className="text-brand-teal">STT</span>, from a finite reward
            pool.
          </p>
        </FadeUp>

        <FadeUp delay={0.24} scroll={false}>
          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <div className="font-mono text-4xl leading-none text-brand-teal">
                {fmtRate(1000)}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-silver-500">
                30-day fixed rate
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <div className="font-mono text-4xl leading-none text-brand-sky">
                {fmtRate(1500)}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-silver-500">
                90-day fixed rate
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.32} scroll={false}>
          <div className="mt-10">
            <PoolMeter pool={pool} />
          </div>
        </FadeUp>

        {closed && (
          <FadeUp delay={0.4} scroll={false}>
            <p className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-silver-300">
              This campaign is fully subscribed — every reward in the pool has
              been allocated. Existing positions are unaffected and will pay out
              on their maturity dates as agreed.
            </p>
          </FadeUp>
        )}
      </div>
    </section>
  );
}
