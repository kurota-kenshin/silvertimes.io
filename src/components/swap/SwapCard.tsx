import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { swapApi } from "../../services/api";
import QuoteSummary from "./QuoteSummary";
import {
  decimalsIn,
  encodeTransfer,
  isValidAmount,
  outLabel,
  tokenIn,
  tokenLabel,
  type Direction,
  type Quote,
  type SwapConfig,
} from "./swap";

type Phase = "idle" | "sending" | "verifying" | "done";

export default function SwapCard({
  config,
  loading,
  onSwapped,
}: {
  config: SwapConfig | null;
  loading: boolean;
  onSwapped: () => Promise<void>;
}) {
  const { authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const [direction, setDirection] = useState<Direction>("BUY");
  const [amount, setAmount] = useState(10);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => isValidAmount(amount, direction), [amount, direction]);
  const limits = config?.limits[direction];

  // Debounced: the aggregator is a network call, so do not fire per keystroke.
  useEffect(() => {
    if (!valid) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(async () => {
      try {
        const q = await swapApi.getQuote(amount, direction);
        if (!cancelled) {
          setQuote(q);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setQuote(null);
          setError(e?.message || "Could not fetch a quote.");
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, direction, valid]);

  const flip = useCallback(() => {
    setDirection((d) => {
      const next: Direction = d === "BUY" ? "SELL" : "BUY";
      setAmount(next === "BUY" ? 10 : 1);
      return next;
    });
    setQuote(null);
    setError(null);
  }, []);

  async function handleSwap() {
    setError(null);
    if (!wallet || !quote) return;

    try {
      setPhase("sending");
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");

      const provider = await wallet.getEthereumProvider();
      const txHash: string = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: tokenIn(direction),
            data: encodeTransfer(quote.treasuryAddress, amount, decimalsIn(direction)),
          },
        ],
      });

      setPhase("verifying");
      // The backend needs confirmations before it credits; retry rather than
      // failing on the first "too early".
      for (let i = 0; i < 20; i += 1) {
        try {
          await swapApi.execute(token, { direction, amountIn: amount, txHashIn: txHash });
          setPhase("done");
          await onSwapped();
          return;
        } catch (e: any) {
          if (!/INSUFFICIENT_CONFIRMATIONS|NOT_FOUND/.test(e?.message || "")) throw e;
          await new Promise((r) => setTimeout(r, 6000));
        }
      }
      throw new Error(
        "Your transfer was sent but is still confirming. It will be picked up automatically.",
      );
    } catch (e: any) {
      setError(
        /user rejected|denied/i.test(e?.message || "")
          ? "Transaction cancelled."
          : e?.message || "Swap failed. Please try again.",
      );
      setPhase("idle");
    }
  }

  const busy = phase === "sending" || phase === "verifying";

  const label =
    phase === "sending"
      ? "Confirm in your wallet..."
      : phase === "verifying"
        ? "Verifying on-chain..."
        : quoting
          ? "Fetching quote..."
          : `Swap ${tokenLabel(direction)} for ${outLabel(direction)}`;

  return (
    <section className="relative px-6 pb-10 pt-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* Left: the pitch */}
          <div>
            <FadeUp scroll={false}>
              <Eyebrow>Swap · USDT and STT</Eyebrow>
            </FadeUp>

            <h1 className="mt-7 text-[clamp(2.4rem,5.5vw,4.25rem)] font-semibold leading-[1.0] tracking-tight text-white">
              <Reveal scroll={false}>Swap into</Reveal>
              <Reveal scroll={false} delay={0.08} className="text-silver-400">
                silver.
              </Reveal>
            </h1>

            <FadeUp delay={0.15} scroll={false}>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-silver-300">
                Move between <span className="text-white">USDT</span> and{" "}
                <span className="text-brand-teal">STT</span> at live market
                rates, routed through the deepest available liquidity.
              </p>
            </FadeUp>

            <FadeUp delay={0.24} scroll={false}>
              <dl className="mt-9 space-y-3 border-t border-white/[0.07] pt-6 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-silver-500">Slippage tolerance</dt>
                  <dd className="tabular-nums text-silver-100">
                    {((config?.slippageBps ?? 500) / 100).toFixed(1)}%
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-silver-500">Settles in</dt>
                  <dd className="text-silver-100">A few minutes</dd>
                </div>
              </dl>
            </FadeUp>
          </div>

          {/* Right: the swap card */}
          <FadeUp delay={0.3} scroll={false}>
            <div className="rounded-2xl border border-white/10 bg-background-secondary/50 p-7 backdrop-blur-sm">
              {!loading && config && !config.enabled ? (
                <p className="text-[15px] leading-relaxed text-silver-300">
                  Swaps are not available right now.
                </p>
              ) : !authenticated ? (
                <div>
                  <p className="text-[15px] leading-relaxed text-silver-300">
                    Connect the wallet holding your {tokenLabel(direction)} to
                    swap. Tokens return to that same wallet.
                  </p>
                  <button
                    onClick={login}
                    className="mt-6 w-full rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                  >
                    Connect wallet
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                      You pay · {tokenLabel(direction)}
                    </span>
                    <button
                      type="button"
                      onClick={flip}
                      disabled={busy}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                    >
                      Swap to {outLabel(direction)}
                    </button>
                  </div>

                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    disabled={busy}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-4 w-full rounded-lg border border-white/10 bg-background-primary px-4 py-3 text-3xl font-semibold tabular-nums tracking-tight text-white focus:border-brand-blue focus:outline-none"
                  />
                  {limits && (
                    <div className="mt-2 flex justify-between text-[11px] tabular-nums text-silver-600">
                      <span>{limits.min} min</span>
                      <span>{limits.max} max</span>
                    </div>
                  )}

                  <QuoteSummary quote={quote} loading={quoting} />

                  <p className="mt-5 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] p-4 text-xs leading-relaxed text-silver-300">
                    Send from{" "}
                    <span className="tabular-nums text-white">
                      {wallet
                        ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                        : "your connected wallet"}
                    </span>{" "}
                    only. A transfer from an exchange or another address cannot
                    be matched to your account.
                  </p>

                  {error && (
                    <p className="mt-4 text-sm leading-relaxed text-red-400">{error}</p>
                  )}

                  <button
                    onClick={handleSwap}
                    disabled={!valid || !quote || busy || quoting}
                    className="mt-6 w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {label}
                  </button>

                  {phase === "verifying" && (
                    <p className="mt-3 text-center text-xs leading-relaxed text-silver-500">
                      Waiting for confirmations. Closing this page is
                      recoverable — the swap completes on its own.
                    </p>
                  )}
                </>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
