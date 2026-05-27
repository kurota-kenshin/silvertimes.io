import { Fragment } from "react";
import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

type Row = {
  aspect: string;
  st: string;
  stTag?: string;
  etf: string;
  phys: string;
};

const groups: { label: string; rows: Row[] }[] = [
  {
    label: "The Asset",
    rows: [
      { aspect: "Format", st: "Ethereum tokens", etf: "Brokerage shares", phys: "Tangible coins/bars" },
      { aspect: "Redemption", st: "1:1 physically redeemable", etf: "Cash only (No physical)", phys: "Direct possession" },
    ],
  },
  {
    label: "Trading",
    rows: [
      { aspect: "Availability", st: "24/7 continuous, borderless", etf: "Market hours, instant", phys: "Dealer hours, slow to sell" },
      { aspect: "Min. Entry", st: "Fractional (< $1)", etf: "~$25–$30 (1 share)", phys: "~$30+ (1+ oz)" },
    ],
  },
  {
    label: "Financials",
    rows: [
      { aspect: "Total Costs", st: "Lowest (Tx gas fees, free storage)", etf: "Low (~0.5% expense ratio)", phys: "High (5–10% premium + storage + insurance + assaying fee)" },
      { aspect: "Yield", st: "DeFi staking", stTag: "Coming soon", etf: "None", phys: "None" },
    ],
  },
  {
    label: "Risk & Regs",
    rows: [
      { aspect: "Primary Risk", st: "Smart contract vulnerabilities (mitigated by audit)", etf: "Custodian/Issuer default", phys: "Theft, physical loss" },
      { aspect: "Regulation", st: "Varies (KYC/AML typical)", etf: "SEC regulated", phys: "Local sales tax" },
    ],
  },
];

const lastGroup = groups.length - 1;

export default function ComparisonTableV2() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />
      <div className="pointer-events-none absolute left-0 top-1/4 h-[40vh] w-[45vw] -translate-x-1/4 rounded-full bg-brand-blue/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Left-aligned heading — contrasts the centered section above */}
        <FadeUp className="mb-7">
          <Eyebrow>Compare</Eyebrow>
        </FadeUp>

        <h2 className="max-w-3xl text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
          <Reveal>How SilverTimes</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            compares
          </Reveal>
        </h2>

        <FadeUp delay={0.15} className="mt-6 max-w-xl">
          <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] font-light text-silver-400">
            See how tokenized silver stacks up against traditional alternatives.
          </p>
        </FadeUp>

        {/* Table */}
        <FadeUp delay={0.2} y={36} className="mt-14">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-[0_40px_140px_-50px_rgba(0,0,0,0.9)]">
            <div className="scrollbar-hide overflow-x-auto rounded-[1.55rem] bg-background-secondary/70 backdrop-blur-sm">
              <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-6 align-bottom text-xs font-medium uppercase tracking-wider text-silver-500">
                      Aspect
                    </th>
                    {/* Featured SilverTimes column */}
                    <th className="relative rounded-t-2xl border-x border-t border-brand-teal/20 bg-brand-blue/[0.08] px-6 py-6 align-bottom">
                      <span className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-gradient-to-r from-brand-teal to-brand-blue" />
                      <span className="bg-gradient-to-r from-brand-teal to-brand-blue bg-clip-text text-base font-bold text-transparent">
                        SilverTimes
                      </span>
                    </th>
                    <th className="px-6 py-6 align-bottom text-base font-medium text-silver-300">Silver ETF</th>
                    <th className="px-6 py-6 align-bottom text-base font-medium text-silver-300">Physical Silver</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, gi) => (
                    <Fragment key={group.label}>
                      {/* Group label */}
                      <tr>
                        <td className="px-6 pb-2 pt-7">
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-teal">
                            {group.label}
                          </span>
                        </td>
                        <td className="border-x border-brand-teal/20 bg-brand-blue/[0.08]" />
                        <td />
                        <td />
                      </tr>

                      {group.rows.map((row, ri) => {
                        const isLast = gi === lastGroup && ri === group.rows.length - 1;
                        return (
                          <tr key={row.aspect} className="group">
                            <td className="border-b border-white/5 px-6 py-4 font-medium text-silver-400">
                              {row.aspect}
                            </td>
                            <td
                              className={`border-x border-b border-brand-teal/20 bg-brand-blue/[0.08] px-6 py-4 font-medium text-white transition-colors group-hover:bg-brand-blue/[0.12] ${
                                isLast ? "rounded-b-2xl" : ""
                              }`}
                            >
                              {row.st}
                              {row.stTag && (
                                <span className="ml-1.5 text-xs text-brand-teal">({row.stTag})</span>
                              )}
                            </td>
                            <td className="border-b border-white/5 px-6 py-4 text-silver-300 transition-colors group-hover:bg-white/[0.02]">
                              {row.etf}
                            </td>
                            <td className="border-b border-white/5 px-6 py-4 text-silver-300 transition-colors group-hover:bg-white/[0.02]">
                              {row.phys}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
