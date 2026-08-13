import { useState } from "react";
import { motion } from "framer-motion";
import { EASE, FadeUp } from "../v2/cinematic";
import { SttMark, TerminalWindow } from "./TerminalWindow";
import {
  CAP_SOLD,
  CASH_SECURED_PUTS,
  COVERED_CALLS,
  type Vault,
} from "./yield";

type Tab = "calls" | "puts";

// Single-observer stagger: the parent triggers once when scrolled into view and
// staggers its children via variants, so no per-row reveal can get stranded at
// opacity 0 during a fast scroll.
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const listItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function CapBar() {
  const pct = Math.round(CAP_SOLD * 1000) / 10;
  return (
    <div className="relative flex h-9 items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-blue/40 to-brand-teal/50"
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs tracking-tight text-silver-200">
        {pct}% of cap sold
      </div>
    </div>
  );
}

function Row({
  vault,
  onEarn,
}: {
  vault: Vault;
  onEarn: (v: Vault) => void;
}) {
  return (
    <motion.div
      variants={listItem}
      onClick={() => onEarn(vault)}
      className="grid cursor-pointer grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-3 border-t border-white/[0.06] px-5 py-4 transition-colors hover:bg-white/[0.02] sm:px-7"
    >
      <div className="flex items-center gap-3">
        <SttMark size={30} />
        <div className="leading-tight">
          <div className="font-medium text-white">STT</div>
          <div className="text-xs text-silver-500">{vault.type}</div>
        </div>
      </div>

      <div className="hidden leading-tight sm:block">
        <div className="font-mono text-sm text-silver-200">{vault.tenor}</div>
        <div className="text-xs text-silver-500">exp {vault.expiry}</div>
      </div>

      <div className="text-left">
        <div className="font-mono text-base text-brand-teal">
          {vault.maxApr}%
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-silver-500">
          max apr · <span className="text-silver-400">{vault.minApr}% min</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onEarn(vault);
        }}
        className="justify-self-end rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-4 py-2 text-sm font-medium text-brand-teal transition-colors hover:bg-brand-teal/20"
      >
        Earn
      </button>
    </motion.div>
  );
}

export default function VaultsWindow({
  onEarn,
}: {
  onEarn: (v: Vault) => void;
}) {
  const [tab, setTab] = useState<Tab>("calls");
  const rows = tab === "calls" ? COVERED_CALLS : CASH_SECURED_PUTS;

  return (
    <section id="vaults" className="relative scroll-mt-24 px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp>
          <TerminalWindow path="~/vaults" right={<div className="flex w-full items-center gap-4"><span className="hidden font-mono text-xs text-silver-500 sm:block">STT vaults</span><div className="flex-1"><CapBar /></div></div>}>
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] px-5 pt-4 sm:px-7">
              {(
                [
                  ["calls", "covered calls"],
                  ["puts", "cash secured puts"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative -mb-px rounded-t-lg px-4 py-2.5 font-mono text-sm transition-colors ${
                    tab === key
                      ? "border border-b-0 border-white/10 bg-[#141414] text-white"
                      : "text-silver-500 hover:text-silver-300"
                  }`}
                >
                  {label}
                  {tab === key && (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-brand-teal" />
                  )}
                </button>
              ))}
            </div>

            {/* Column head */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-3 px-5 pt-4 pb-1 text-[11px] uppercase tracking-[0.14em] text-silver-600 sm:px-7">
              <div>Asset</div>
              <div className="hidden sm:block">Tenor</div>
              <div>Apr</div>
              <div className="justify-self-end">Type</div>
            </div>

            <motion.div
              key={tab}
              variants={listContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {rows.map((v) => (
                <Row key={v.id} vault={v} onEarn={onEarn} />
              ))}
            </motion.div>

            <div className="px-5 py-4 font-mono text-xs text-silver-600 sm:px-7">
              <span className="text-brand-teal">$</span> settled in USDT on BSC ·
              collateral returned in STT
            </div>
          </TerminalWindow>
        </FadeUp>
      </div>
    </section>
  );
}
