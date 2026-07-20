import { useEffect, useMemo, useState } from "react";
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { useDailyGame } from "./DailyGameContext";
import PredictionCard from "./PredictionCard";
import { useSttLive } from "./prize";
import ResultReveal from "./ResultReveal";
import StreakPanel from "./StreakPanel";
import RecentWinners from "./RecentWinners";
import type { LatestResult } from "./useLatestResult";

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return "0 Hrs 0 Min 0 Sec";
    const h = Math.floor(diff / 3.6e6);
    const m = Math.floor((diff % 3.6e6) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    return `${h} Hrs ${m} Min ${s} Sec`;
  }, [now, target]);
}

export default function PlayTab({ result }: { result: LatestResult | null }) {
  const { round } = useDailyGame();
  const countdown = useCountdown(round?.submissionClose);
  const sttIsLive = useSttLive();

  return (
    <div className="relative">
      {/* Cinematic intro */}
      <div className="relative pt-6 text-center sm:pt-10">
        <FadeUp className="mb-6 flex justify-center">
          <Eyebrow>
            {countdown ? `Live  |  ${countdown}  Left` : "Daily round"}
          </Eyebrow>
        </FadeUp>
        <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.02em]">
          <Reveal scroll={false}>Silver Price</Reveal>
          <Reveal scroll={false} delay={0.08} className="gradient-text">
            Prediction
          </Reveal>
        </h2>
        <FadeUp delay={0.15}>
          <p className="mt-5 text-sm text-silver-400">
            Predict Daily Silver Price &amp; Win {sttIsLive ? "STT" : "USDT"}
          </p>
        </FadeUp>
      </div>

      {/* Centerpiece */}
      <div className="mx-auto mt-14 max-w-2xl">
        <PredictionCard />
      </div>

      {/* Supporting blocks */}
      <div className="mt-16 space-y-14">
        <ResultReveal result={result} />
        <StreakPanel />
        <RecentWinners />
      </div>
    </div>
  );
}
