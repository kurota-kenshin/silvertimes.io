import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp } from "../v2/cinematic";
import { dailyPredictionApi, type DailyClaimEligibility } from "../../services/api";

export default function ClaimPanel() {
  const { authenticated, getAccessToken } = usePrivy();
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

  if (!authenticated || !elig || elig.availableBalance <= 0) return null;

  const claim = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await dailyPredictionApi.claim(token);
      setMsg("Claim submitted — USDT is on its way on BSC.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
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
            {msg && <p className="text-sm text-silver-400">{msg}</p>}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
