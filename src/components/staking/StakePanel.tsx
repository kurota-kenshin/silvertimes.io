import { useMemo, useState, type ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { FadeUp, Reveal } from "../v2/cinematic";
import { stakingApi } from "../../services/api";
import {
  MAX_STAKE_PER_WALLET_STT,
  MIN_STAKE_STT,
  fmtDate,
  fmtStt,
  previewMaturity,
  previewReward,
  type MyStaking,
  type StakingConfig,
  type TermDays,
} from "./staking";

const STT_ADDRESS = "0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce";
const STT_DECIMALS = 18;

/** ERC-20 transfer(address,uint256) calldata, hand-encoded to avoid a dependency. */
function encodeTransfer(to: string, amountStt: number): string {
  const selector = "a9059cbb";
  const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  // Two decimal places of STT, scaled to 18 decimals, without float error.
  const units =
    BigInt(Math.round(amountStt * 100)) * 10n ** BigInt(STT_DECIMALS - 2);
  return `0x${selector}${addr}${units.toString(16).padStart(64, "0")}`;
}

type Phase = "idle" | "intent" | "sending" | "verifying" | "done";

/** A blocked state: one clear sentence, no controls the user cannot use. */
function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
      <p className="text-[15px] leading-relaxed text-silver-300">{children}</p>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-silver-500">
        {label}
      </span>
      <span
        className={`text-[15px] tabular-nums ${accent ?? "text-silver-100"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function StakePanel({
  config,
  me,
  term,
  onStaked,
}: {
  config: StakingConfig | null;
  me: MyStaking | null;
  term: TermDays;
  onStaked: () => Promise<void>;
}) {
  const { authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const [amount, setAmount] = useState(10);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const wallet = wallets[0];
  const remaining = me?.remainingStt ?? MAX_STAKE_PER_WALLET_STT;
  const held = me?.heldStt ?? 0;
  const staked = me?.stakedTotalStt ?? 0;
  const poolOpen = config?.pool.isOpen ?? true;

  const maxForThisStake = Math.min(MAX_STAKE_PER_WALLET_STT, remaining);
  const dustAllowance = remaining > 0 && remaining < MIN_STAKE_STT;

  const reward = useMemo(() => previewReward(amount, term), [amount, term]);
  const maturity = useMemo(() => previewMaturity(term), [term]);

  const amountValid =
    amount >= MIN_STAKE_STT &&
    amount <= maxForThisStake &&
    Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-9;

  async function handleStake() {
    setError(null);
    if (!wallet) {
      setError("Connect a wallet to stake.");
      return;
    }

    // Held so an abandoned flow can release its quota hold immediately rather
    // than leaving the allowance eaten until the intent's TTL expires.
    let intentId: string | null = null;

    try {
      setPhase("intent");
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");

      const intent = await stakingApi.createIntent(token, {
        amountStt: amount,
        termDays: term,
        walletAddress: wallet.address,
      });
      intentId = intent.intentId;

      setPhase("sending");
      const provider = await wallet.getEthereumProvider();
      const txHash: string = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: STT_ADDRESS,
            data: encodeTransfer(intent.treasuryAddress, amount),
          },
        ],
      });

      setPhase("verifying");
      // The backend re-reads the chain; it needs confirmations before it will
      // credit. Poll rather than failing the first time it says "too early".
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          await stakingApi.confirmDeposit(token, {
            intentId: intent.intentId,
            txHash,
          });
          setPhase("done");
          await onStaked();
          return;
        } catch (err: any) {
          if (!/INSUFFICIENT_CONFIRMATIONS|NOT_FOUND/.test(err?.message || "")) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 6000));
        }
      }
      throw new Error(
        "Your transfer was sent but is still confirming. It will be credited automatically — check back shortly.",
      );
    } catch (err: any) {
      // Give the hold back now. A rejected wallet prompt or a failed send
      // would otherwise cost the user their allowance for the full TTL.
      if (intentId) {
        try {
          const token = await getAccessToken();
          if (token) await stakingApi.cancelIntent(token, intentId);
          await onStaked();
        } catch {
          // Best effort — the expiry sweeper is the backstop.
        }
      }
      setError(
        /user rejected|denied/i.test(err?.message || "")
          ? "Transaction cancelled. Your allowance has been released."
          : err?.message || "Staking failed. Please try again.",
      );
      setPhase("idle");
    }
  }

  const busy = phase !== "idle" && phase !== "done";

  const label =
    phase === "intent"
      ? "Preparing..."
      : phase === "sending"
        ? "Confirm in your wallet..."
        : phase === "verifying"
          ? "Verifying on-chain..."
          : `Stake ${fmtStt(amount, 2)} STT`;

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Stake your STT</Reveal>
        </h2>

        <FadeUp delay={0.08}>
          <div className="mt-8">
            {!poolOpen ? (
              <Notice>
                The reward pool is fully subscribed, so new stakes are closed.
                Existing positions are unaffected and pay out as agreed.
              </Notice>
            ) : !authenticated ? (
              <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                <p className="max-w-md text-[15px] leading-relaxed text-silver-300">
                  Connect the wallet holding your STT. Principal and interest
                  return to that same wallet.
                </p>
                <button
                  onClick={login}
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  Connect wallet
                </button>
              </div>
            ) : dustAllowance ? (
              <Notice>
                You have{" "}
                <span className="tabular-nums text-white">
                  {fmtStt(remaining, 2)} STT
                </span>{" "}
                of allowance remaining, which is below the{" "}
                {MIN_STAKE_STT.toFixed(2)} STT minimum. You cannot open another
                position until one of your current positions closes.
              </Notice>
            ) : remaining <= 0 ? (
              <Notice>
                You have reached the {MAX_STAKE_PER_WALLET_STT} STT per-wallet
                cap. You can stake again once a position closes.
              </Notice>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
                {/* Controls */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                  <div className="flex items-baseline justify-between gap-3">
                    <label
                      htmlFor="stake-amount"
                      className="text-[11px] uppercase tracking-[0.18em] text-silver-500"
                    >
                      Amount
                    </label>
                    <span className="text-xs tabular-nums text-silver-500">
                      {fmtStt(remaining, 2)} STT left of {MAX_STAKE_PER_WALLET_STT}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-silver-500">
                    {staked > 0 && (
                      <div>
                        <span className="tabular-nums text-silver-400">
                          {fmtStt(staked, 2)} STT
                        </span>{" "}
                        staked in open positions
                      </div>
                    )}
                    {held > 0 && (
                      <div className="text-brand-teal/80">
                        <span className="tabular-nums">{fmtStt(held, 2)} STT</span>{" "}
                        reserved by a stake you did not finish — released
                        automatically within 30 minutes.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="stake-amount"
                      type="number"
                      inputMode="decimal"
                      min={MIN_STAKE_STT}
                      max={maxForThisStake}
                      step={0.01}
                      value={amount}
                      disabled={busy}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-background-primary px-4 py-3 text-3xl font-semibold tabular-nums tracking-tight text-white focus:border-brand-blue focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setAmount(Math.floor(maxForThisStake * 100) / 100)
                      }
                      className="shrink-0 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white"
                    >
                      Max
                    </button>
                  </div>

                  <input
                    type="range"
                    min={MIN_STAKE_STT}
                    max={maxForThisStake}
                    step={0.01}
                    value={amount}
                    disabled={busy}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-5 w-full accent-[#6596FE]"
                    aria-label="Stake amount"
                  />
                  <div className="mt-2 flex justify-between text-[11px] tabular-nums text-silver-600">
                    <span>{MIN_STAKE_STT.toFixed(2)} min</span>
                    <span>{fmtStt(maxForThisStake, 2)} max</span>
                  </div>

                  {/*
                    Stated BEFORE the user pays gas. A deposit sent from an
                    exchange or an unregistered wallet cannot be attributed.
                  */}
                  <p className="mt-6 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] p-4 text-xs leading-relaxed text-silver-300">
                    Send from{" "}
                    <span className="tabular-nums text-white">
                      {wallet
                        ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                        : "your connected wallet"}
                    </span>{" "}
                    only. Transfers from an exchange or another address cannot be
                    matched to your account.
                  </p>
                </div>

                {/* Summary */}
                <div className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-brand-blue/[0.08] to-brand-teal/[0.04] p-7">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                    You receive at maturity
                  </div>
                  <div className="mt-3 text-[2.25rem] font-semibold leading-none tracking-tight tabular-nums text-white">
                    {fmtStt(amount + reward)}
                    <span className="ml-2 text-base font-normal text-silver-400">
                      STT
                    </span>
                  </div>

                  <div className="mt-5 divide-y divide-white/[0.07] border-t border-white/[0.07]">
                    <Stat label="Principal" value={`${fmtStt(amount, 2)} STT`} />
                    <Stat
                      label="Interest"
                      value={`+${fmtStt(reward)} STT`}
                      accent="text-brand-teal"
                    />
                    <Stat label="Term" value={`${term} days`} />
                    <Stat label="Matures" value={fmtDate(maturity)} />
                  </div>

                  {error && (
                    <p className="mt-5 text-sm leading-relaxed text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleStake}
                    disabled={!amountValid || busy}
                    className="mt-7 w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {label}
                  </button>

                  {phase === "verifying" && (
                    <p className="mt-3 text-center text-xs leading-relaxed text-silver-500">
                      Waiting for 3 confirmations. Closing this page is
                      recoverable, just slower.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
