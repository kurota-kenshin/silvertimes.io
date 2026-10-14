import { FadeUp, Reveal } from "../v2/cinematic";
import { fmtIn, fmtOut, outLabel, tokenLabel, type Trade } from "./swap";

const LABEL: Record<Trade["status"], { text: string; tone: string }> = {
  PENDING: { text: "Pending", tone: "text-silver-400" },
  SWAPPING: { text: "Swapping", tone: "text-brand-teal" },
  COMPLETED: { text: "Completed", tone: "text-brand-sky" },
  FAILED: { text: "Failed", tone: "text-red-400" },
  REFUNDING: { text: "Refunding", tone: "text-silver-300" },
  REFUNDED: { text: "Refunded", tone: "text-silver-300" },
};

export default function TradeHistory({ trades }: { trades: Trade[] }) {
  if (!trades.length) return null;

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Your swaps</Reveal>
        </h2>

        <div className="mt-8 space-y-3">
          {trades.map((t, i) => {
            const inp = fmtIn(t.direction);
            const out = fmtOut(t.direction);
            const s = LABEL[t.status];
            return (
              <FadeUp key={t._id} delay={i * 0.04}>
                <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="min-w-[14rem]">
                    <div className="tabular-nums text-white">
                      {inp(t.amountIn)} {tokenLabel(t.direction)}
                      <span className="mx-2 text-silver-600">to</span>
                      {out(t.actualOut ?? t.quotedOut)} {outLabel(t.direction)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className={`text-sm ${s.tone}`}>{s.text}</div>

                  <div className="ml-auto flex gap-4 text-xs">
                    {t.txHashOut && (
                      <a
                        href={`https://etherscan.io/tx/${t.txHashOut}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-silver-500 transition-colors hover:text-white"
                      >
                        Output tx
                      </a>
                    )}
                    {t.refundTxHash && (
                      <a
                        href={`https://etherscan.io/tx/${t.refundTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-silver-500 transition-colors hover:text-white"
                      >
                        Refund tx
                      </a>
                    )}
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
