import { fmtOut, outLabel, tokenLabel, type Quote } from "./swap";

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-silver-500">
        {label}
      </span>
      <span className={`text-[15px] tabular-nums ${accent ?? "text-silver-100"}`}>
        {value}
      </span>
    </div>
  );
}

export default function QuoteSummary({
  quote,
  loading,
}: {
  quote: Quote | null;
  loading: boolean;
}) {
  if (loading || !quote) {
    return (
      <div className="mt-6 h-48 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.02]" />
    );
  }

  const out = fmtOut(quote.direction);

  return (
    <div className="mt-6 rounded-xl border border-white/[0.07] bg-gradient-to-br from-brand-blue/[0.08] to-brand-teal/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
        You receive
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums text-white">
          {out(quote.quotedOut)}
        </span>
        <span className="text-base text-silver-400">{outLabel(quote.direction)}</span>
      </div>

      <div className="mt-5 divide-y divide-white/[0.07] border-t border-white/[0.07]">
        <Row
          label="Rate"
          value={`1 ${tokenLabel(quote.direction)} = ${out(quote.rate)} ${outLabel(quote.direction)}`}
        />
        <Row
          label="Minimum received"
          value={`${out(quote.minReceived)} ${outLabel(quote.direction)}`}
          accent="text-brand-teal"
        />
        <Row label="Price impact" value={`${quote.priceImpactPct.toFixed(2)}%`} />
      </div>
    </div>
  );
}
