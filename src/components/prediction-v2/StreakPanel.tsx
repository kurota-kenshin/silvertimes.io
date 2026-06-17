import { FadeUp } from "../v2/cinematic";
import { useDailyGame } from "./DailyGameContext";

const Flame = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3c.5 3-2 4.5-2 7a2 2 0 0 0 4 0c1 1.5 2 3 2 5a4 4 0 1 1-8 0c0-3 2-4 4-12Z" />
  </svg>
);

function multiplier(streak: number) {
  return 1 + Math.min(Math.max(streak, 1) - 1, 20) * 0.05;
}

export default function StreakPanel() {
  const { me } = useDailyGame();

  const stats = [
    { label: "Current streak", value: me ? `${me.dailyStreak} days` : "—" },
    {
      label: "Multiplier",
      value: me ? `${multiplier(me.dailyStreak).toFixed(2)}×` : "—",
    },
    { label: "Total points", value: me ? me.points.toLocaleString() : "—" },
    {
      label: "Longest streak",
      value: me ? `${me.longestDailyStreak} days` : "—",
    },
  ];

  return (
    <FadeUp className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((st, i) => (
        <div
          key={st.label}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          {i === 0 && (
            <div className="mb-3 text-brand-sky">
              <Flame />
            </div>
          )}
          <div className="text-2xl font-semibold text-white">{st.value}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-silver-500">
            {st.label}
          </div>
        </div>
      ))}
    </FadeUp>
  );
}
