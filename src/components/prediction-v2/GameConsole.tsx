import { useState } from "react";
import StatusBar from "./StatusBar";
import PlayTab from "./PlayTab";
import DailyChart from "./DailyChart";
import Leaderboards from "./Leaderboards";
import HowToClaim from "./HowToClaim";
import Rules from "./Rules";
import WinPopup from "./WinPopup";
import { useLatestResult } from "./useLatestResult";

type Tab = "play" | "chart" | "leaderboard" | "claim" | "rules";
const TABS: { key: Tab; label: string }[] = [
  { key: "play", label: "Play" },
  { key: "chart", label: "Chart" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "claim", label: "Claim" },
  { key: "rules", label: "Rules" },
];

export default function GameConsole() {
  const [tab, setTab] = useState<Tab>("play");
  const latestResult = useLatestResult();

  return (
    <div className="relative z-10">
      <WinPopup result={latestResult} onClaim={() => setTab("claim")} />
      {/* Status bar + tabs stick together just below the fixed site nav (~54px). */}
      <div className="sticky top-14 z-30">
        <StatusBar />
        <div className="border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 sm:px-8">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition-colors ${
                  tab === t.key
                    ? "bg-white text-black"
                    : "text-silver-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab body */}
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        {tab === "play" && <PlayTab result={latestResult} />}
        {tab === "chart" && <DailyChart />}
        {tab === "leaderboard" && <Leaderboards result={latestResult} />}
        {tab === "claim" && <HowToClaim />}
        {tab === "rules" && <Rules />}
      </div>
    </div>
  );
}
