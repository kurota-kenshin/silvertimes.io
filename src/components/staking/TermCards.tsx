import { motion } from "framer-motion";
import { EASE, FadeUp, Reveal } from "../v2/cinematic";
import {
  APR_BPS,
  TERMS,
  fmtDate,
  fmtRate,
  fmtStt,
  previewMaturity,
  previewReward,
  type TermDays,
} from "./staking";

const COPY: Record<TermDays, { label: string; blurb: string }> = {
  30: {
    label: "Short term",
    blurb: "A one-month lock. Lower rate, your silver back sooner.",
  },
  90: {
    label: "Long term",
    blurb: "A three-month lock at the campaign's best rate.",
  },
};

export default function TermCards({
  term,
  onSelect,
}: {
  term: TermDays;
  onSelect: (t: TermDays) => void;
}) {
  return (
    <section className="relative px-6 pb-4 pt-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Choose your term</Reveal>
        </h2>
        <FadeUp delay={0.08}>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-silver-400">
            Interest is fixed at the rate below and paid in full on the maturity
            date — simple interest, pro-rated over the term, not compounded.
          </p>
        </FadeUp>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TERMS.map((t, i) => {
            const selected = term === t;
            const accent = t === 90 ? "text-brand-sky" : "text-brand-teal";

            return (
              <motion.button
                key={t}
                type="button"
                onClick={() => onSelect(t)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
                aria-pressed={selected}
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all sm:p-7 ${
                  selected
                    ? "border-brand-teal/50 bg-gradient-to-br from-brand-blue/[0.12] to-brand-teal/[0.06] shadow-[0_0_0_1px_rgba(119,214,227,0.15)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.035]"
                }`}
              >
                {/* Header row owns the badge, so it can never overlap the rate. */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                    {COPY[t].label}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-opacity ${
                      selected
                        ? "bg-brand-teal/15 text-brand-teal opacity-100"
                        : "border border-white/10 text-silver-500 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="text-[2.5rem] font-semibold leading-none tracking-tight text-white">
                    {t}
                    <span className="ml-1.5 text-base font-normal text-silver-400">
                      days
                    </span>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[2rem] font-semibold leading-none tracking-tight tabular-nums ${accent}`}
                    >
                      {fmtRate(APR_BPS[t])}
                    </div>
                    <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      fixed APR
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-silver-400">
                  {COPY[t].blurb}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4">
                  <div>
                    <div className="text-sm tabular-nums text-silver-100">
                      {fmtStt(previewReward(10, t))} STT
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-silver-500">
                      interest on 10 STT
                    </div>
                  </div>
                  <div>
                    <div className="text-sm tabular-nums text-silver-100">
                      {fmtDate(previewMaturity(t))}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-silver-500">
                      if started today
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
