import { useEffect, useMemo, useState } from "react";
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { dailyPredictionApi, type DailyRoundInfo } from "../../services/api";

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

export default function DailyHero() {
  const [round, setRound] = useState<DailyRoundInfo | null>(null);
  useEffect(() => {
    dailyPredictionApi.current().then(setRound).catch(() => {});
  }, []);
  const countdown = useCountdown(round?.submissionClose);

  return (
    <section className="relative overflow-hidden px-6 pt-36 pb-24 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[150px]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeUp className="mb-7">
          <Eyebrow>Daily silver prediction</Eyebrow>
        </FadeUp>
        <h1 className="max-w-3xl text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          <Reveal scroll={false}>Predict silver.</Reveal>
          <Reveal scroll={false} delay={0.08} className="gradient-text">
            Every day.
          </Reveal>
        </h1>
        <FadeUp delay={0.15} className="mt-6 max-w-xl">
          <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] font-light text-silver-400">
            One prediction a day. The five closest each win 5 USDT, paid on BSC.
            Keep your streak alive to multiply your points.
          </p>
        </FadeUp>
        <FadeUp delay={0.25} className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href="#predict"
            className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            Make today's prediction
          </a>
          {countdown && (
            <div className="flex items-center gap-3 text-sm text-silver-400">
              <span className="uppercase tracking-[0.18em] text-silver-500">
                Closes in
              </span>
              <span className="font-mono text-lg tabular-nums text-white">
                {countdown}
              </span>
            </div>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
