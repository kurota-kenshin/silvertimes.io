import { useEffect, useMemo, useState } from "react";
import { useDailyGame } from "./DailyGameContext";

function multiplier(streak: number) {
  return 1 + Math.min(Math.max(streak, 1) - 1, 20) * 0.05;
}

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return useMemo(() => {
    if (!target) return "—";
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / 3.6e6);
    const m = Math.floor((diff % 3.6e6) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }, [now, target]);
}

const Flame = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3c.5 3-2 4.5-2 7a2 2 0 0 0 4 0c1 1.5 2 3 2 5a4 4 0 1 1-8 0c0-3 2-4 4-12Z" />
  </svg>
);

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: ReactAccent;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.18em] text-silver-500">
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular-nums ${
          accent === "teal" ? "text-brand-sky" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type ReactAccent = "teal" | "white";

export default function StatusBar() {
  const { round, me } = useDailyGame();
  const countdown = useCountdown(round?.submissionClose);
  const streak = me?.dailyStreak ?? 0;

  return (
    <div className="border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-2 text-brand-sky">
          <Flame />
          <span className="font-mono text-sm tabular-nums text-white">
            {streak}
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-silver-500 sm:inline">
            day streak
          </span>
        </div>
        <div className="flex items-center gap-6 sm:gap-8">
          <Stat
            label="Players"
            value={(round?.totalParticipants ?? 0).toLocaleString()}
          />
          <Stat label="Points" value={(me?.points ?? 0).toLocaleString()} />
          <Stat
            label="Multiplier"
            value={`${multiplier(streak).toFixed(2)}×`}
            accent="teal"
          />
          <Stat label="Closes in" value={countdown} accent="teal" />
        </div>
      </div>
    </div>
  );
}
