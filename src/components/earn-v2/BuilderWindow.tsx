import { useState } from "react";
import { motion } from "framer-motion";
import { FadeUp } from "../v2/cinematic";
import { SttMark, TerminalWindow } from "./TerminalWindow";
import {
  CALL_STRIKES,
  DEFAULT_AMOUNT,
  DEFAULT_STRIKE_INDEX,
  PUT_STRIKES,
  STT_SPOT,
  type Vault,
  fmtInt,
  fmtUsdt,
  strikeAccent,
  strikeUsdt,
  upfrontUsdt,
} from "./yield";

export default function BuilderWindow({
  vault,
  onBack,
}: {
  vault: Vault;
  onBack: () => void;
}) {
  const isPut = vault.type === "Cash-secured put";
  const strikes = isPut ? PUT_STRIKES : CALL_STRIKES;

  const [strikeIdx, setStrikeIdx] = useState(DEFAULT_STRIKE_INDEX);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const strike = strikes[strikeIdx];
  const accent = strikeAccent(strikeIdx, strikes.length);

  const upfront = upfrontUsdt(amount, strike, vault.days);
  const settleUsdt = strikeUsdt(amount, strike);

  const step = (d: number) => setAmount((a) => Math.max(0, a + d));

  return (
    <section className="relative px-6 pt-6 pb-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Back bar */}
        <FadeUp scroll={false}>
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-silver-300 transition-colors hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            cd ~/vaults
          </button>
        </FadeUp>

        <FadeUp scroll={false} delay={0.05}>
          <TerminalWindow
            path={`~/earn/STT/${vault.expiryShort}`}
            right={
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <SttMark size={26} />
                  <span className="font-mono text-sm text-white">STT</span>
                  <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-xs text-silver-400">
                    {vault.type}
                  </span>
                  <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-xs text-silver-400">
                    {vault.expiryShort}
                  </span>
                </div>
                <span className="font-mono text-sm text-silver-300">
                  ${fmtUsdt(STT_SPOT)}
                </span>
              </div>
            }
          >
            <div className="px-5 py-7 sm:px-8">
              <p className="text-center text-lg text-silver-200">
                Choose the price you'd be happy to{" "}
                <span className="text-white">{isPut ? "buy" : "sell"} STT</span>{" "}
                at on {vault.expiryLong}{" "}
                <span className="text-silver-500">(in {vault.days} days)</span>
              </p>

              {/* Strike selector */}
              <div className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {strikes.map((s, i) => {
                  const active = i === strikeIdx;
                  const c = strikeAccent(i, strikes.length);
                  return (
                    <button
                      key={s.price}
                      onClick={() => setStrikeIdx(i)}
                      className="group relative flex flex-col items-center rounded-xl border bg-white/[0.02] px-2 pt-6 pb-3 transition-all"
                      style={{
                        borderColor: active ? c : "rgba(255,255,255,0.08)",
                        boxShadow: active ? `0 0 0 1px ${c}, 0 8px 30px -12px ${c}` : "none",
                      }}
                    >
                      <span
                        className="absolute -top-2.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
                        style={{
                          color: c,
                          backgroundColor: "#0c0c0c",
                          border: `1px solid ${active ? c : "rgba(255,255,255,0.12)"}`,
                        }}
                      >
                        {s.apr}%
                      </span>
                      <span
                        className={`font-mono text-lg ${active ? "text-white" : "text-silver-300"}`}
                      >
                        ${s.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Amount */}
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <button
                  onClick={() => setAmount(500)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-silver-400 transition-colors hover:text-white"
                >
                  MAX
                </button>
                <div className="flex flex-col">
                  <button
                    onClick={() => step(10)}
                    className="text-silver-500 transition-colors hover:text-white"
                    aria-label="increase"
                  >
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 8 7 2l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    onClick={() => step(-10)}
                    className="text-silver-500 transition-colors hover:text-white"
                    aria-label="decrease"
                  >
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-transparent font-mono text-2xl text-white outline-none"
                />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-sm text-silver-300">STT</span>
                  <SttMark size={26} />
                </div>
              </div>

              {/* Outcome split */}
              <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
                <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-center font-mono text-xs uppercase tracking-[0.16em] text-silver-500">
                  Now
                </div>
                <motion.div
                  key={`${strikeIdx}-${amount}`}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-end justify-between gap-2 px-6 py-6"
                >
                  <div>
                    <div className="text-4xl font-semibold text-white">
                      {strike.apr}%
                      <span className="ml-1.5 text-base font-normal text-silver-500">
                        APR
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-silver-400">
                      Upfront premium, paid on entry
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl" style={{ color: accent }}>
                      {fmtUsdt(upfront)}
                    </div>
                    <div className="text-sm text-silver-400">USDT upfront</div>
                  </div>
                </motion.div>

                <div className="border-y border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-center font-mono text-xs uppercase tracking-[0.16em] text-silver-500">
                  On {vault.expiryShort}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {isPut ? (
                    <>
                      <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r">
                        <div className="text-xs uppercase tracking-[0.14em] text-silver-600">
                          If silver above ${strike.price}
                        </div>
                        <div className="mt-2 text-lg text-white">
                          Keep {fmtUsdt(settleUsdt)} USDT
                        </div>
                        <div className="mt-1 text-sm text-silver-500">
                          plus the {fmtUsdt(upfront)} USDT premium — you never buy.
                        </div>
                      </div>
                      <div className="px-6 py-5 text-right">
                        <div className="text-xs uppercase tracking-[0.14em] text-silver-600">
                          If silver below ${strike.price}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2.5">
                          <span className="text-lg text-white">
                            Buy {fmtInt(amount)} STT
                          </span>
                          <SttMark size={26} />
                        </div>
                        <div className="mt-1 text-sm text-silver-500">
                          silver at ${strike.price} — a discount to today's spot.
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r">
                        <div className="text-xs uppercase tracking-[0.14em] text-silver-600">
                          If silver below ${strike.price}
                        </div>
                        <div className="mt-2 flex items-center gap-2.5">
                          <SttMark size={26} />
                          <span className="text-lg text-white">
                            Keep {fmtInt(amount)} STT
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-silver-500">
                          plus the {fmtUsdt(upfront)} USDT — it's yours to keep.
                        </div>
                      </div>
                      <div className="px-6 py-5 text-right">
                        <div className="text-xs uppercase tracking-[0.14em] text-silver-600">
                          If silver above ${strike.price}
                        </div>
                        <div className="mt-2 text-lg text-white">
                          Receive {fmtUsdt(settleUsdt)} USDT
                        </div>
                        <div className="mt-1 text-sm text-silver-500">
                          STT sells at ${strike.price} — silver becomes dollars.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button className="mt-6 w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.01]">
                Earn upfront premium now
              </button>
              <p className="mt-3 text-center text-xs text-silver-600">
                Preview only — connect a wallet to trade. Figures illustrative.
              </p>
            </div>
          </TerminalWindow>
        </FadeUp>
      </div>
    </section>
  );
}
