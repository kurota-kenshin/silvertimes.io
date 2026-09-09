import { FadeUp, Reveal } from "../v2/cinematic";

const ROWS: { parameter: string; spec: string; detail: string }[] = [
  { parameter: "Deposit asset", spec: "STT (ERC-20)", detail: "Ethereum mainnet" },
  {
    parameter: "Fixed rate",
    spec: "10.0% (30D) or 15.0% (90D)",
    detail: "Annualised, simple interest pro-rated over the term",
  },
  {
    parameter: "Lockup term",
    spec: "30 days or 90 days",
    detail: "Interest and principal released on the maturity date",
  },
  {
    parameter: "Reward pool",
    spec: "14.28 STT",
    detail: "Approximately $1,000 in value across the whole campaign",
  },
  {
    parameter: "Allocation",
    spec: "First come, first served",
    detail:
      "Rewards are reserved when you stake; staking closes when the pool is committed",
  },
  {
    parameter: "Quota per wallet",
    spec: "1.00 – 10.00 STT",
    detail: "Summed across all your open positions",
  },
  {
    parameter: "Early unstaking",
    spec: "80% of principal returned",
    detail: "Available any time before maturity. All interest is forfeited",
  },
];

export default function ParametersSheet() {
  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Technical parameters</Reveal>
        </h2>

        <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-white/10">
          {ROWS.map((row, i) => (
            <FadeUp key={row.parameter} delay={i * 0.04}>
              <div className="grid gap-2 border-l-2 border-brand-blue/40 bg-white/[0.02] px-6 py-5 sm:grid-cols-[1fr_1.2fr_1.6fr] sm:items-baseline sm:gap-6">
                <div className="text-[11px] uppercase tracking-[0.16em] text-silver-500">
                  {row.parameter}
                </div>
                <div className="text-sm tabular-nums text-white">{row.spec}</div>
                <div className="text-sm leading-relaxed text-silver-400">
                  {row.detail}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
