/** Circular progress through a staking term. Inline SVG — no chart library. */
export default function MaturityRing({
  pct,
  size = 56,
}: {
  pct: number;
  size?: number;
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const complete = pct >= 100;

  return (
    <svg width={size} height={size} className="shrink-0" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={complete ? "#90E0EF" : "#6596FE"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 900ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-silver-200 font-mono"
        style={{ fontSize: size * 0.24 }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
