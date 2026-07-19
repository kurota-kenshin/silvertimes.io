import { useEffect, useState } from "react";
import { FadeUp } from "../v2/cinematic";
import { dailyPredictionApi, type DailyWinnersResponse } from "../../services/api";
import { sttPrizeLabel } from "./prize";

function maskWinner(w: DailyWinnersResponse["winners"][number]) {
  if (w.userId?.email) return w.userId.email.replace(/(.{2}).*(@.*)/, "$1***$2");
  if (w.userId?.walletAddress)
    return `${w.userId.walletAddress.slice(0, 6)}…${w.userId.walletAddress.slice(-4)}`;
  return "Anonymous";
}

export default function RecentWinners() {
  const [data, setData] = useState<DailyWinnersResponse | null>(null);
  useEffect(() => {
    dailyPredictionApi.winners().then(setData).catch(() => {});
  }, []);
  if (!data?.winners?.length) return null;

  return (
    <section className="relative">
      <div>
        <FadeUp>
          <p className="text-xs uppercase tracking-[0.22em] text-silver-500">
            Latest winners · {data.round.roundKey}
            {data.round.actualPrice
              ? ` · settled $${data.round.actualPrice.toFixed(2)}`
              : ""}
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="mt-6 space-y-2">
          {data.winners.map((w, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3"
            >
              <span className="text-sm text-white">
                #{w.rank} · {maskWinner(w)}
              </span>
              <span className="text-sm text-brand-sky">
                {sttPrizeLabel(w.prizeUsdt)}
              </span>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
