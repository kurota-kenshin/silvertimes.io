import { useEffect, useMemo, useState } from "react";
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { useDailyGame } from "./DailyGameContext";
import PredictionCard from "./PredictionCard";
import ResultReveal from "./ResultReveal";
import StreakPanel from "./StreakPanel";
import RecentWinners from "./RecentWinners";

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / 3.6e6);
    const m = Math.floor((diff % 3.6e6) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }, [now, target]);
}

export default function PlayTab() {
  const { round } = useDailyGame();
  const countdown = useCountdown(round?.submissionClose);

  const targetLabel = round
    ? new Date(round.targetDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "Europe/London",
      })
    : "";

  return (
    <div className="relative">
      {/* Cinematic intro */}
      <div className="relative pt-6 text-center sm:pt-10">
        <FadeUp className="mb-6 flex justify-center">
          <Eyebrow>
            {countdown ? `Round closes in ${countdown}` : "Daily round"}
          </Eyebrow>
        </FadeUp>
        <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.02em]">
          <Reveal scroll={false}>Where will silver</Reveal>
          <Reveal scroll={false} delay={0.08} className="gradient-text">
            close tomorrow?
          </Reveal>
        </h2>
        {targetLabel && (
          <FadeUp delay={0.15}>
            <p className="mt-5 text-sm text-silver-400">
              Predicting the noon (London) price for{" "}
              <span className="text-silver-200">{targetLabel}</span>. One shot a
              day — edit until midnight.
            </p>
          </FadeUp>
        )}
      </div>

      {/* Centerpiece */}
      <div className="mx-auto mt-14 max-w-2xl">
        <PredictionCard />
      </div>

      {/* Supporting blocks */}
      <div className="mt-16 space-y-14">
        <ResultReveal />
        <StreakPanel />
        <RecentWinners />
      </div>
    </div>
  );
}
