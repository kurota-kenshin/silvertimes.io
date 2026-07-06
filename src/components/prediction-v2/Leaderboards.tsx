import { useEffect, useState } from "react";
import { FadeUp, Reveal } from "../v2/cinematic";
import { dailyPredictionApi, type DailyLeader } from "../../services/api";
import { useDailyGame } from "./DailyGameContext";
import type { LatestResult } from "./useLatestResult";

type Win = "daily" | "weekly" | "alltime";
const TABS: { key: Win; label: string }[] = [
  { key: "daily", label: "Last round" },
  { key: "weekly", label: "This week" },
  { key: "alltime", label: "All time" },
];

function shortWallet(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function mask(l: DailyLeader) {
  // Prefer email, then the wallet the user bound, then the embedded login wallet.
  if (l.email) return l.email.replace(/(.{2}).*(@.*)/, "$1***$2");
  if (l.withdrawWalletAddress) return shortWallet(l.withdrawWalletAddress);
  if (l.walletAddress) return shortWallet(l.walletAddress);
  return "Anonymous";
}

export default function Leaderboards({
  result,
}: {
  result?: LatestResult | null;
}) {
  const [tab, setTab] = useState<Win>("daily");
  const [rows, setRows] = useState<DailyLeader[]>([]);
  const { me } = useDailyGame();
  const myId = me?.userId;
  useEffect(() => {
    dailyPredictionApi
      .leaderboard(tab)
      .then(setRows)
      .catch(() => setRows([]));
  }, [tab]);

  // Your own entry from the last settled round — shown on the "Last round" tab
  // so you can always see your guess and standing even outside the top 25.
  const showYou = tab === "daily" && !!result;

  return (
    <section className="relative">
      <h3 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05]">
        <Reveal className="gradient-text">Leaderboard</Reveal>
      </h3>
      <FadeUp delay={0.1} className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              tab === t.key
                ? "bg-white text-black"
                : "border border-white/10 text-silver-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </FadeUp>
      {showYou && result && (
        <FadeUp
          delay={0.12}
          className="mt-6 rounded-2xl border border-brand-sky/30 bg-brand-sky/[0.06] px-6 py-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-sky/20 px-2.5 py-0.5 text-xs font-semibold text-brand-sky">
                You
              </span>
              <span className="text-sm text-silver-300">
                Your guess{" "}
                <span className="font-mono text-white">
                  ${result.predictedPrice.toFixed(2)}
                </span>
                <span className="mx-2 text-silver-700">·</span>
                actual{" "}
                <span className="font-mono text-white">
                  ${result.actualPrice.toFixed(2)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3 pl-9 sm:pl-0 sm:text-right">
              <span className="font-mono text-sm text-brand-sky">
                {result.points.toLocaleString()} pts
              </span>
              {result.isWinner ? (
                <span className="text-xs text-brand-teal">
                  Won ${result.prize} USDT
                </span>
              ) : result.rank ? (
                <span className="text-xs text-silver-500">
                  Rank #{result.rank}
                </span>
              ) : null}
            </div>
          </div>
        </FadeUp>
      )}
      <FadeUp
        delay={0.15}
        className="mt-6 overflow-hidden rounded-2xl border border-white/10"
      >
        {rows.length === 0 && (
          <div className="p-8 text-center text-silver-500">No entries yet.</div>
        )}
        {rows.map((r, i) => {
          const isMe = !!myId && String(r._id) === myId;
          return (
            <div
              key={(r._id ?? "") + i}
              className={`flex items-center justify-between border-b border-white/5 px-6 py-4 last:border-0 ${
                isMe
                  ? "border-l-2 border-l-brand-sky bg-brand-sky/[0.08]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-6 text-sm ${isMe ? "font-semibold text-brand-sky" : "text-silver-500"}`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-white">{mask(r)}</span>
                {isMe && (
                  <span className="rounded-full bg-brand-sky/20 px-2.5 py-0.5 text-xs font-semibold text-brand-sky">
                    You
                  </span>
                )}
                {r.dailyStreak ? (
                  <span className="text-xs text-silver-600">
                    {r.dailyStreak}d streak
                  </span>
                ) : null}
              </div>
              <span className="font-mono text-sm text-brand-sky">
                {r.points.toLocaleString()} pts
              </span>
            </div>
          );
        })}
      </FadeUp>
    </section>
  );
}
