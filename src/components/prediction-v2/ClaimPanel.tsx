import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp } from "../v2/cinematic";
import { dailyPredictionApi, type DailyClaimEligibility } from "../../services/api";
import { useDailyGame } from "./DailyGameContext";

export default function ClaimPanel({ embedded = false }: { embedded?: boolean }) {
  const { authenticated, getAccessToken } = usePrivy();
  const { refresh } = useDailyGame();
  const [elig, setElig] = useState<DailyClaimEligibility | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authenticated) return;
    const token = await getAccessToken();
    if (token)
      setElig(await dailyPredictionApi.claimEligibility(token).catch(() => null));
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (!authenticated) {
    return embedded ? (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-silver-400">
        Sign in to see your claimable balance.
      </div>
    ) : null;
  }
  if (!elig) return null;

  const claim = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await dailyPredictionApi.claim(token);
      setMsg("Claim submitted — USDT is on its way on BSC.");
      await load();
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const Card = (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-teal/20 bg-brand-blue/[0.06] p-8 text-center">
      <div className="text-sm uppercase tracking-[0.18em] text-silver-500">
        Available to claim (BSC)
      </div>
      <div className="text-4xl font-bold text-white">
        {elig.availableBalance} USDT
      </div>
      <button
        onClick={claim}
        disabled={busy || !elig.canClaim}
        className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
      >
        {busy ? "Submitting…" : "Claim to my wallet"}
      </button>
      {!elig.canClaim && elig.reasons?.missingWallet && (
        <p className="text-sm text-silver-400">
          Set a withdrawal wallet in your profile first.
        </p>
      )}
      {!elig.canClaim &&
        !elig.reasons?.missingWallet &&
        elig.availableBalance <= 0 && (
          <p className="text-sm text-silver-400">
            No winnings to claim yet — finish in the top 5 to earn USDT.
          </p>
        )}
      {msg && <p className="text-sm text-silver-400">{msg}</p>}
    </div>
  );

  if (embedded) return <FadeUp className="mt-6">{Card}</FadeUp>;
  if (elig.availableBalance <= 0) return null;
  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeUp>{Card}</FadeUp>
      </div>
    </section>
  );
}
