import { FadeUp, Reveal } from "../v2/cinematic";
import { sttPrizeLabel } from "./prize";
import type { LatestResult } from "./useLatestResult";

export default function ResultReveal({
  result,
}: {
  result: LatestResult | null;
}) {
  if (!result) return null;

  return (
    <section className="relative">
      <div className="text-center">
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
              You won {sttPrizeLabel(result.prize)} — claim it below.
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
