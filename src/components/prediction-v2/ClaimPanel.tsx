import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp } from "../v2/cinematic";
import {
  authApi,
  dailyPredictionApi,
  type DailyClaimEligibility,
} from "../../services/api";
import { useDailyGame } from "./DailyGameContext";
import { usdtToStt, useSttLive } from "./prize";

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

function shorten(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function ClaimPanel({ embedded = false }: { embedded?: boolean }) {
  const { authenticated, getAccessToken } = usePrivy();
  const { refresh } = useDailyGame();
  const [elig, setElig] = useState<DailyClaimEligibility | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // The USDT/STT choice is visible from day one (team wants users to see
  // the STT option early); STT payouts themselves open later. Only the
  // "earn USDT/STT" wording follows the site-wide cutover.
  const sttIsLive = useSttLive();
  const [currency, setCurrency] = useState<"usdt" | "stt">("usdt");

  // Withdrawal wallet
  const [wallet, setWallet] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authenticated) return;
    const token = await getAccessToken();
    if (!token) return;
    const [e, w] = await Promise.all([
      dailyPredictionApi.claimEligibility(token).catch(() => null),
      authApi.getWithdrawWallet(token).catch(() => ({ wallet: null })),
    ]);
    setElig(e);
    setWallet(w.wallet);
    setWalletInput(w.wallet ?? "");
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

  const saveWallet = async () => {
    const trimmed = walletInput.trim();
    if (!EVM_RE.test(trimmed)) {
      setWalletError("Enter a valid BSC/EVM address (0x…)");
      return;
    }
    setSavingWallet(true);
    setWalletError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await authApi.updateWithdrawWallet(token, trimmed);
      setWallet(trimmed);
      setEditing(false);
      await load();
      await refresh();
    } catch (e) {
      setWalletError(e instanceof Error ? e.message : "Failed to save wallet");
    } finally {
      setSavingWallet(false);
    }
  };

  const claim = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await dailyPredictionApi.claim(token);
      setMsg("Withdrawal submitted — USDT is on its way on BSC.");
      await load();
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const showWalletForm = editing || !wallet;

  const Card = (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-teal/20 bg-brand-blue/[0.06] p-8 text-center">
      <div className="text-sm uppercase tracking-[0.18em] text-silver-500">
        {currency === "stt"
          ? "Available to claim (Ethereum · ERC-20)"
          : "Available to claim (BSC)"}
      </div>
      <div className="flex gap-1 rounded-full border border-white/10 p-1">
          {(["usdt", "stt"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                currency === c
                  ? "bg-white text-black"
                  : "text-silver-400 hover:text-white"
              }`}
            >
              {c === "usdt" ? "USDT" : "STT"}
            </button>
          ))}
      </div>
      <div className="text-4xl font-bold text-white">
        {currency === "stt"
          ? `${usdtToStt(elig.availableBalance)} STT`
          : `${elig.availableBalance} USDT`}
      </div>
      <button
        onClick={claim}
        disabled={busy || !elig.canClaim || currency === "stt"}
        className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
      >
        {currency === "stt"
          ? "STT Coming Soon"
          : busy
            ? "Submitting…"
            : "Withdraw"}
      </button>
      {currency === "stt" && (
        <p className="text-sm text-silver-400">
          STT claiming (ERC-20 on Ethereum) is coming soon — withdraw USDT on
          BSC now, or hold your balance and claim it as STT once live.
        </p>
      )}
      {!wallet && (
        <p className="text-sm text-silver-400">Set your wallet before withdrawing</p>
      )}
      {wallet &&
        !elig.canClaim &&
        !elig.reasons?.missingWallet &&
        elig.availableBalance <= 0 && (
          <p className="text-sm text-silver-400">
            No winnings yet — finish in the top 5 to earn {sttIsLive ? "STT" : "USDT"}.
          </p>
        )}
      {msg && <p className="text-sm text-silver-400">{msg}</p>}

      {/* Withdrawal wallet */}
      <div className="mt-4 w-full max-w-md text-left">
        {!showWalletForm ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-silver-500">
                Withdrawal wallet (BSC · Ethereum)
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-white">
                {shorten(wallet!)}
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(true);
                setWalletInput(wallet ?? "");
                setWalletError(null);
              }}
              className="shrink-0 rounded-lg border border-brand-blue/30 bg-brand-blue/10 px-4 py-2 text-sm font-medium text-brand-sky transition-colors hover:bg-brand-blue/20"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-blue/25 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-silver-500">
              Withdrawal wallet (BSC · Ethereum)
            </p>
            <p className="mt-1 text-xs text-silver-400">
              BEP-20 USDT will be sent to this address on BSC; STT (ERC-20)
              will use the same address on Ethereum once live. That's the only
              requirement — no minimum, no social handles.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => {
                  setWalletInput(e.target.value);
                  setWalletError(null);
                }}
                placeholder="0x…"
                className="flex-1 rounded-lg border border-white/10 bg-background-primary/50 px-4 py-2.5 font-mono text-sm text-white placeholder:text-silver-600 outline-none transition-colors focus:border-brand-blue/50"
              />
              <button
                onClick={saveWallet}
                disabled={savingWallet}
                className="shrink-0 rounded-lg bg-gradient-to-r from-brand-blue to-brand-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {savingWallet ? "Saving…" : "Save"}
              </button>
              {wallet && (
                <button
                  onClick={() => {
                    setEditing(false);
                    setWalletInput(wallet);
                    setWalletError(null);
                  }}
                  className="shrink-0 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-silver-300 transition-colors hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
            {walletError && (
              <p className="mt-2 text-sm text-rose-400">{walletError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return <FadeUp className="mt-6">{Card}</FadeUp>;
  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeUp>{Card}</FadeUp>
      </div>
    </section>
  );
}
