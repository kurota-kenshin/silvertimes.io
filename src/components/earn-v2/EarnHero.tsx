import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { SttMark } from "./TerminalWindow";
import { STT_SPOT, fmtUsdt } from "./yield";

export default function EarnHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative px-6 pt-24 pb-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp>
          <Eyebrow>Silver Yield · Covered calls</Eyebrow>
        </FadeUp>

        <h1 className="mt-7 text-[clamp(2.6rem,6.5vw,5.25rem)] font-semibold leading-[0.98] tracking-tight text-white">
          <Reveal>Earn USDT upfront</Reveal>
          <Reveal delay={0.08} className="text-silver-400">
            on your silver.
          </Reveal>
        </h1>

        <FadeUp delay={0.15}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-silver-300">
            Put your <span className="text-white">STT</span> to work. Pick a
            silver price you'd be happy to sell at, and collect the premium in{" "}
            <span className="text-brand-teal">USDT</span> today — not at expiry.
            Keep your silver if it stays below.
          </p>
        </FadeUp>

        <FadeUp delay={0.32}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Earn USDT upfront
            </button>
            <a
              href="#vaults"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white"
            >
              See the vaults
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-2 pr-5 backdrop-blur">
              <SttMark size={30} />
              <div className="leading-tight">
                <div className="font-mono text-sm text-white">
                  ${fmtUsdt(STT_SPOT)}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-silver-500">
                  STT spot
                </div>
              </div>
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[11px] font-medium text-brand-teal">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-teal" />
                </span>
                live
              </span>
            </div>
            <span className="text-sm text-silver-500">
              Settle in USDT · non-custodial · no lock-up beyond expiry
            </span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
