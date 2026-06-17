import { FadeUp, Reveal } from "../v2/cinematic";

const rules = [
  {
    t: "One prediction a day",
    d: "Every trading day (Mon–Fri) there's a single round: predict the silver price at 12:00 noon London the next trading day.",
  },
  {
    t: "Cutoff at midnight",
    d: "Submissions for a round close at 00:00 London on the target day. You can edit your prediction freely until then.",
  },
  {
    t: "Closest five win USDT",
    d: "When the price settles at noon, the 5 closest predictions each win 5 USDT (25 USDT a day). Ties are broken by who submitted first.",
  },
  {
    t: "Everyone earns points",
    d: "Points reward how close you were — a perfect call is 1,000, and you always earn at least a participation bonus just for playing.",
  },
  {
    t: "Streaks multiply points",
    d: "Play on consecutive trading days to build a streak. It multiplies your points up to 2× at a 21-day streak. Weekends don't break it.",
  },
  {
    t: "Leaderboards",
    d: "Compete on the daily, weekly, and all-time leaderboards, ranked by points.",
  },
  {
    t: "Claim on BSC",
    d: "USDT winnings are paid on BNB Smart Chain. No minimum to withdraw — just set a wallet and press Claim.",
  },
];

export default function Rules() {
  return (
    <section className="relative">
      <h3 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05]">
        <Reveal className="gradient-text">The rules</Reveal>
      </h3>
      <div className="mt-8 space-y-3">
        {rules.map((r, i) => (
          <FadeUp key={r.t} delay={i * 0.04}>
            <div className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <span className="font-mono text-sm text-silver-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="text-base font-semibold text-white">{r.t}</h4>
                <p className="mt-1 text-sm leading-relaxed text-silver-400">
                  {r.d}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
