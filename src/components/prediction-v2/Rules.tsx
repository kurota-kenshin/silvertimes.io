import { FadeUp, Reveal } from "../v2/cinematic";
import { useSttLive } from "./prize";

const getRules = (stt: boolean): { t: string; d: string; note?: string }[] => [
  {
    t: "One Prediction a Day",
    d: 'Predict the silver price at 12:00 (GMT+0; "Result Time") for the next trading day (Mon–Fri). One round daily.',
    note: "Source: Licensed LBMA feeds. Rounds voided if benchmark unavailable.",
  },
  {
    t: "Cutoff Before Target",
    d: "Submissions close 1 hour before the Result Time. Edit freely until the cutoff.",
  },
  {
    t: stt ? "Top 5 Win STT" : "Top 5 Win USDT",
    d: `The 5 closest predictions each win ${stt ? "0.1 STT" : "5 USDT"}. Ties go to the earliest entry (editing resets your time).`,
  },
  {
    t: "Daily Rewards",
    d: "Winner rewards are automatically added to your balance daily once results are out. Track them in your profile.",
  },
  {
    t: "Request Payout",
    d: `Click "Withdraw" to queue your transfer, and your rewards${stt ? " — USDT (BEP-20) or STT (ERC-20, coming soon)" : " (BEP-20 USDT)"} will be sent directly to your wallet.`,
  },
  {
    t: "Earn Points Daily",
    d: "Earn up to 1,000 points based on accuracy. Everyone gets a participation bonus just for playing.",
  },
  {
    t: "Multiply Your Streaks",
    d: "Play daily to build a streak and multiply points up to 2× at 21 days. Weekends don't break streaks.",
  },
  {
    t: "Climb the Leaderboards",
    d: "Compete on daily, weekly, and all-time leaderboards ranked by total points.",
  },
  {
    t: "Fair Play Enforcement",
    d: "To ensure fairness, each participant is strictly limited to one account and one submission per round. If any multi-accounting or abnormal user behavior is detected, the associated accounts will be suspended.",
  },
];

export default function Rules() {
  const rules = getRules(useSttLive());
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
                {r.note && (
                  <p className="mt-2 text-xs leading-relaxed text-silver-600">
                    {r.note}
                  </p>
                )}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
