import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp, Reveal } from "../v2/cinematic";
import { dailyPredictionApi } from "../../services/api";

interface MyResult {
  error: number;
  percentile: number;
  points: number;
  prize?: number;
}

export default function ResultReveal() {
  const { authenticated } = usePrivy();
  const [result, setResult] = useState<MyResult | null>(null);

  useEffect(() => {
    (async () => {
      if (!authenticated) return;
      const winners = await dailyPredictionApi.winners().catch(() => null);
      if (!winners?.round) return;
      const r = await dailyPredictionApi
        .result(winners.round.roundKey)
        .catch(() => null);
      if (
        r?.myEntry &&
        r.round.actualPrice != null &&
        r.myEntry.error != null
      ) {
        setResult({
          error: r.myEntry.error,
          percentile: r.myEntry.percentile ?? 100,
          points: r.myEntry.points ?? 0,
          prize: r.myEntry.prizeUsdt,
        });
      }
    })();
    // getAccessToken intentionally omitted; runs on auth change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  if (!result) return null;

  return (
    <section className="relative px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <FadeUp>
          <p className="text-xs uppercase tracking-[0.22em] text-silver-500">
            Yesterday's result
          </p>
        </FadeUp>
        <h2 className="mt-5 text-[clamp(1.8rem,5vw,3rem)] font-bold leading-[1.05]">
          <Reveal>You were ${result.error.toFixed(2)} off</Reveal>
          <Reveal delay={0.08} className="gradient-text">
            top {result.percentile}% · +{result.points} pts
          </Reveal>
        </h2>
        {result.prize ? (
          <FadeUp delay={0.2}>
            <p className="mt-5 text-brand-sky">
              You won {result.prize} USDT — claim it below.
            </p>
          </FadeUp>
        ) : (
          <FadeUp delay={0.2}>
            <p className="mt-5 text-silver-400">
              So close. Come back today and keep your streak alive.
            </p>
          </FadeUp>
        )}
      </div>
    </section>
  );
}
