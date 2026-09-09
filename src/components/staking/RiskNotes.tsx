import { FadeUp, Reveal } from "../v2/cinematic";

export default function RiskNotes({
  treasuryAddress,
}: {
  treasuryAddress: string;
}) {
  const short = treasuryAddress
    ? `${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(-4)}`
    : "";

  const notes: { title: string; body: string }[] = [
    {
      title: "Your STT is held by SilverTimes",
      body: "This is a custodial product. When you stake, your STT is transferred to a SilverTimes treasury address and returned, with interest, when your position closes. There is no staking smart contract.",
    },
    {
      title: "Stake from your connected wallet only",
      body: `Deposits are matched to your account by sender address${
        short ? ` and must arrive at ${short}` : ""
      }. STT sent from an exchange, or from any wallet other than the one you signed in with, cannot be credited automatically.`,
    },
    {
      title: "Early exit costs 20% of principal",
      body: "You can unstake before maturity at any time, but you receive 80% of your principal and no interest. The interest you give up returns to the reward pool for other stakers.",
    },
    {
      title: "The reward pool is finite",
      body: "Rewards are reserved the moment you stake. Once the 14.28 STT pool is fully committed, staking closes. Positions already open are unaffected and pay out as agreed.",
    },
  ];

  return (
    <section className="relative px-6 pb-20 pt-4 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>What you should know</Reveal>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {notes.map((note, i) => (
            <FadeUp key={note.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-sm font-semibold text-white">{note.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">
                  {note.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
