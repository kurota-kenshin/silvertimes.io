import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp, Reveal } from "../v2/cinematic";
import { stakingApi } from "../../services/api";
import MaturityRing from "./MaturityRing";
import {
  daysRemaining,
  earlyExitPrincipal,
  fmtDate,
  fmtRate,
  fmtStt,
  progressPct,
  type MyStaking,
  type Position,
} from "./staking";

export default function PositionsPanel({
  me,
  onChanged,
}: {
  me: MyStaking | null;
  onChanged: () => Promise<void>;
}) {
  const { getAccessToken } = usePrivy();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const positions = (me?.positions ?? []).filter((p) => p.status !== "CLOSED");
  if (positions.length === 0) return null;

  async function act(position: Position, kind: "claim" | "unstake") {
    setError(null);
    setBusyId(position.id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");
      if (kind === "claim") await stakingApi.claim(token, position.id);
      else await stakingApi.unstake(token, position.id);
      setConfirmingId(null);
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "That did not go through. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Your positions</Reveal>
        </h2>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-8 space-y-4">
          {positions.map((p, i) => {
            const pct = progressPct(p.stakedAt, p.maturesAt);
            const days = daysRemaining(p.maturesAt);
            const matured = days === 0;
            const closing = p.status === "CLOSING";
            const busy = busyId === p.id;

            return (
              <FadeUp key={p.id} delay={i * 0.06}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <MaturityRing pct={pct} />

                    <div className="min-w-[9rem]">
                      <div className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-white">
                        {fmtStt(p.amountStt, 2)}{" "}
                        <span className="text-sm text-silver-400">STT</span>
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        {p.termDays}-day term · {fmtRate(p.aprBps)}
                      </div>
                    </div>

                    <div className="min-w-[8rem]">
                      <div className="text-lg tabular-nums text-brand-teal">
                        +{fmtStt(p.rewardStt)}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        interest at maturity
                      </div>
                    </div>

                    <div className="min-w-[8rem]">
                      <div className="text-sm tabular-nums text-silver-200">
                        {fmtDate(p.maturesAt)}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        {matured ? "matured" : `${days} days remaining`}
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      {closing ? (
                        <span className="rounded-full border border-white/15 px-4 py-2 text-xs text-silver-400">
                          Payout in progress
                        </span>
                      ) : matured ? (
                        <button
                          onClick={() => act(p, "claim")}
                          disabled={busy}
                          className="rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
                        >
                          {busy ? "Claiming..." : "Claim"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(p.id)}
                          disabled={busy}
                          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                        >
                          Unstake early
                        </button>
                      )}
                    </div>
                  </div>

                  {/*
                    The penalty is quoted as a concrete STT figure, never as a
                    bare percentage — the user should see exactly what they lose.
                  */}
                  {confirmingId === p.id && (
                    <div className="mt-5 rounded-lg border border-white/10 bg-background-primary/60 p-5">
                      <p className="text-sm leading-relaxed text-silver-300">
                        Unstaking now returns{" "}
                        <span className="tabular-nums text-white">
                          {fmtStt(earlyExitPrincipal(p.amountStt), 2)} STT
                        </span>{" "}
                        of your {fmtStt(p.amountStt, 2)} STT principal. You give
                        up{" "}
                        <span className="tabular-nums text-white">
                          {fmtStt(
                            p.amountStt - earlyExitPrincipal(p.amountStt),
                            2,
                          )}{" "}
                          STT
                        </span>{" "}
                        to the 20% early redemption fee and forfeit all{" "}
                        <span className="tabular-nums text-white">
                          {fmtStt(p.rewardStt)} STT
                        </span>{" "}
                        of interest. This cannot be undone.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => act(p, "unstake")}
                          disabled={busy}
                          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
                        >
                          {busy ? "Unstaking..." : "Yes, unstake early"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-silver-300 transition-colors hover:border-white/30 hover:text-white"
                        >
                          Keep staking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
