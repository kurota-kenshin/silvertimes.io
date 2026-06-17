import { useEffect, useState } from "react";
import { FadeUp, Reveal } from "../v2/cinematic";
import { dailyPredictionApi, type DailyLeader } from "../../services/api";

type Win = "daily" | "weekly" | "alltime";
const TABS: { key: Win; label: string }[] = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This week" },
  { key: "alltime", label: "All time" },
];

function mask(l: DailyLeader) {
  if (l.email) return l.email.replace(/(.{2}).*(@.*)/, "$1***$2");
  if (l.walletAddress)
    return `${l.walletAddress.slice(0, 6)}…${l.walletAddress.slice(-4)}`;
  return "Anonymous";
}

export default function Leaderboards() {
  const [tab, setTab] = useState<Win>("daily");
  const [rows, setRows] = useState<DailyLeader[]>([]);
  useEffect(() => {
    dailyPredictionApi
      .leaderboard(tab)
      .then(setRows)
      .catch(() => setRows([]));
  }, [tab]);

  return (
    <section className="relative px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.0]">
          <Reveal className="gradient-text">Leaderboard</Reveal>
        </h2>
        <FadeUp delay={0.1} className="mt-8 flex gap-2">
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
        <FadeUp
          delay={0.15}
          className="mt-8 overflow-hidden rounded-2xl border border-white/10"
        >
          {rows.length === 0 && (
            <div className="p-8 text-center text-silver-500">No entries yet.</div>
          )}
          {rows.map((r, i) => (
            <div
              key={(r._id ?? "") + i}
              className="flex items-center justify-between border-b border-white/5 px-6 py-4 last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-sm text-silver-500">{i + 1}</span>
                <span className="text-sm text-white">{mask(r)}</span>
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
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
