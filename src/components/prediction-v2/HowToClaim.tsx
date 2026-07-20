import { FadeUp, Reveal } from "../v2/cinematic";
import ClaimPanel from "./ClaimPanel";
import { useSttLive } from "./prize";

const getSteps = (stt: boolean) => [
  {
    n: "01",
    t: "Rank in the Top 5",
    d: `Be one of the top 5 closest predictions each trading day to win ${stt ? "0.1 STT" : "5 USDT"}. Winnings accumulate in your balance.`,
  },
  {
    n: "02",
    t: "Add Your Wallet",
    d: "Add your BSC (BNB Smart Chain) address to your profile.",
  },
  {
    n: "03",
    t: "Request Payout",
    d: 'Click "Withdraw" to queue your transfer.',
  },
  {
    n: "04",
    t: "Receive Your Rewards",
    d: "USDT (BEP-20) will be sent directly to your wallet. STT (ERC-20) coming soon.",
  },
];

export default function HowToClaim() {
  const steps = getSteps(useSttLive());
  return (
    <section className="relative">
      <h3 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05]">
        <Reveal>My Rewards</Reveal>
      </h3>

      <ClaimPanel embedded />

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
        {steps.map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.06}>
            <div className="h-full bg-background-secondary/60 p-7">
              <div className="font-mono text-sm text-brand-sky">{s.n}</div>
              <h4 className="mt-4 text-lg font-semibold text-white">{s.t}</h4>
              <p className="mt-2 text-sm leading-relaxed text-silver-400">
                {s.d}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
