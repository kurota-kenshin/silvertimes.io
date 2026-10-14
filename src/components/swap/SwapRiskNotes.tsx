import { FadeUp, Reveal } from "../v2/cinematic";

export default function SwapRiskNotes({
  treasuryAddress,
}: {
  treasuryAddress: string;
}) {
  const short = treasuryAddress
    ? `${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(-4)}`
    : "";

  const notes = [
    {
      title: "SilverTimes executes the swap",
      body: "You send one token to a SilverTimes treasury address; we route it through an aggregator and send the other back. Your tokens pass through our custody during the swap.",
    },
    {
      title: "Send from your connected wallet only",
      body: `Deposits are matched to your account by sender address${
        short ? ` and must arrive at ${short}` : ""
      }. A transfer from an exchange, or from any wallet other than the one you signed in with, cannot be credited.`,
    },
    {
      title: "Quotes move with the market",
      body: "The rate is live and can move between quoting and execution. If the result would fall below your minimum received, the swap is cancelled and your original tokens are returned.",
    },
    {
      title: "Failed swaps are refunded",
      body: "If no route is available, or the price moves too far, your input token is sent back to the wallet it came from. The refund transaction appears in your swap history.",
    },
  ];

  return (
    <section className="relative px-6 pb-20 pt-4 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>What you should know</Reveal>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {notes.map((n, i) => (
            <FadeUp key={n.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">{n.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
