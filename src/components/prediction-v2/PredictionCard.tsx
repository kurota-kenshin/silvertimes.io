import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp } from "../v2/cinematic";
import { useLoginModal } from "../LoginModalProvider";
import { dailyPredictionApi, type DailyMeState } from "../../services/api";

function multiplier(streak: number) {
  return 1 + Math.min(Math.max(streak, 1) - 1, 20) * 0.05;
}

export default function PredictionCard() {
  const { authenticated, getAccessToken } = usePrivy();
  const { openLoginModal } = useLoginModal();
  const [state, setState] = useState<DailyMeState | null>(null);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!authenticated) return;
    const token = await getAccessToken();
    if (!token) return;
    const s = await dailyPredictionApi.me(token);
    setState(s);
    if (s.entry) setPrice(String(s.entry.predictedPrice));
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closed =
    !!state?.round &&
    new Date(state.round.submissionClose).getTime() <= Date.now();

  const submit = async () => {
    if (!authenticated) {
      openLoginModal();
      return;
    }
    const val = Number(price);
    if (!(val > 0)) {
      setMsg("Enter a valid price");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await dailyPredictionApi.predict(token, val);
      await refresh();
      setMsg("Locked in. Edit any time before cutoff.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const streak = state?.dailyStreak ?? 0;

  return (
    <section id="predict" className="relative px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <div className="rounded-[1.6rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent p-px">
            <div className="rounded-[1.55rem] bg-background-secondary/80 p-8 backdrop-blur-sm sm:p-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Today's prediction
                </h3>
                <span className="text-sm text-silver-400">
                  Streak <span className="text-white">{streak}</span> ·{" "}
                  {multiplier(streak).toFixed(2)}×
                </span>
              </div>

              <label className="mt-8 block text-xs uppercase tracking-[0.18em] text-silver-500">
                Tomorrow's silver close (USD/oz)
              </label>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl text-silver-400">$</span>
                <input
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={closed || saving}
                  placeholder="00.00"
                  className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-silver-700"
                />
              </div>

              <button
                onClick={submit}
                disabled={closed || saving}
                className="mt-8 w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
              >
                {closed
                  ? "Round closed"
                  : state?.entry
                    ? "Update prediction"
                    : "Lock it in"}
              </button>
              {msg && (
                <p className="mt-4 text-center text-sm text-silver-400">{msg}</p>
              )}
              {state?.round && (
                <p className="mt-6 text-center text-xs text-silver-600">
                  {state.round.totalParticipants} predictions so far · 5 winners ×
                  5 USDT
                </p>
              )}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
