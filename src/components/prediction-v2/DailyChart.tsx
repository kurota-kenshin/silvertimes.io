import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FadeUp } from "../v2/cinematic";
import { useSilverPriceStore } from "../../store/silverPriceStore";
import { dailyPredictionApi } from "../../services/api";
import { useDailyGame } from "./DailyGameContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8182";

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
];

interface PricePoint {
  date: string;
  price: number;
}

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 8.64e7),
      h: Math.floor((diff % 8.64e7) / 3.6e6),
      m: Math.floor((diff % 3.6e6) / 6e4),
      s: Math.floor((diff % 6e4) / 1e3),
    };
  }, [now, target]);
}

export default function DailyChart() {
  const { currentPrice } = useSilverPriceStore();
  const { me, round } = useDailyGame();
  const [days, setDays] = useState(90);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);
  const cd = useCountdown(round?.submissionClose);

  useEffect(() => {
    fetch(`${API_URL}/price/silver/daily?days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.dailyData)) {
          setHistory(
            d.dailyData.filter(
              (p: PricePoint) =>
                typeof p.price === "number" && !Number.isNaN(p.price),
            ),
          );
        }
      })
      .catch(() => {});
  }, [days]);

  useEffect(() => {
    dailyPredictionApi
      .predictions()
      .then((p) => setPredictions(p.map((x) => x.price).filter((n) => n > 0)))
      .catch(() => {});
  }, [round?.roundKey]);

  const lastDate = history.length ? history[history.length - 1].date : "";
  const myPrediction = me?.entry?.predictedPrice;

  const latest =
    currentPrice || (history.length ? history[history.length - 1].price : 0);
  const prevClose =
    history.length > 1
      ? history[history.length - 2].price
      : (history[0]?.price ?? latest);
  const changePct = prevClose ? ((latest - prevClose) / prevClose) * 100 : 0;
  const up = changePct >= 0;

  const yDomain = useMemo<[number, number] | undefined>(() => {
    const prices = history.map((h) => h.price);
    if (!prices.length) return undefined;
    const anchors = [...prices];
    if (myPrediction) anchors.push(myPrediction);
    if (currentPrice) anchors.push(currentPrice);
    const min = Math.min(...anchors);
    const max = Math.max(...anchors);
    const pad = (max - min) * 0.1 || 1;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [history, myPrediction, currentPrice]);

  // Clamp community dots into the visible band so outliers don't fly off-axis.
  const dots = useMemo(() => {
    if (!yDomain || !lastDate) return [];
    const [lo, hi] = yDomain;
    return predictions
      .slice(0, 120)
      .map((price) => Math.min(hi, Math.max(lo, price)));
  }, [predictions, yDomain, lastDate]);

  // A price chip pinned to the right edge of the plot, on the current-price line.
  const priceTag =
    (value: number, fill: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const vb = props?.viewBox;
      if (!vb) return <g />;
      const x = vb.x + vb.width;
      const y = vb.y;
      const w = 58;
      const h = 20;
      return (
        <g>
          <rect
            x={x - w}
            y={y - h / 2}
            width={w}
            height={h}
            rx={5}
            fill={fill}
          />
          <text
            x={x - w / 2}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={700}
            fill="#0a0a0a"
          >
            ${value.toFixed(2)}
          </text>
        </g>
      );
    };

  return (
    <section className="relative">
      <FadeUp>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-silver-500">
              Precious Metals · Silver
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <h3 className="text-[clamp(1.6rem,4.2vw,2.5rem)] font-bold leading-none">
                Silver{" "}
                <span className="gradient-text">${latest.toFixed(2)}</span>
              </h3>
              <span className="text-sm text-silver-500">USD / oz</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  up
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {up ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}%
              </span>
            </div>
          </div>
          {cd && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-silver-600">
                Closes in
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-brand-sky sm:text-2xl">
                {cd.d > 0 && <>{cd.d}d </>}
                {String(cd.h).padStart(2, "0")}:{String(cd.m).padStart(2, "0")}:
                {String(cd.s).padStart(2, "0")}
              </p>
            </div>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={0.1} className="mt-6">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          <div className="mb-4 flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  days === r.days
                    ? "bg-white/10 text-white"
                    : "text-silver-500 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 14, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="silverFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6596FE" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6596FE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6c757d", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  minTickGap={56}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis
                  orientation="right"
                  domain={yDomain ?? ["dataMin", "dataMax"]}
                  tick={{ fill: "#6c757d", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#888e95" }}
                  formatter={(v: number) => [`$${Number(v).toFixed(2)}`, "Silver"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#90E0EF"
                  strokeWidth={2}
                  fill="url(#silverFill)"
                  dot={false}
                  isAnimationActive={false}
                />
                {currentPrice ? (
                  <ReferenceLine
                    y={currentPrice}
                    stroke="rgba(255,255,255,0.35)"
                    strokeDasharray="4 4"
                    label={priceTag(currentPrice, "#90E0EF")}
                  />
                ) : null}
                {myPrediction ? (
                  <ReferenceLine
                    y={myPrediction}
                    stroke="#6596FE"
                    strokeWidth={1.5}
                    label={{
                      value: `You $${myPrediction.toFixed(2)}`,
                      fill: "#ffffff",
                      fontSize: 12,
                      fontWeight: 700,
                      position: "insideLeft",
                    }}
                  />
                ) : null}
                {dots.map((y, i) => (
                  <ReferenceDot
                    key={i}
                    x={lastDate}
                    y={y}
                    r={4}
                    fill="#77D6E3"
                    fillOpacity={0.4}
                    stroke="none"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-silver-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-3 rounded-sm bg-brand-sky" /> Silver price
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-teal/60" />{" "}
              {predictions.length} community prediction
              {predictions.length === 1 ? "" : "s"}
            </span>
            {myPrediction ? (
              <span className="flex items-center gap-2 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-white">
                <span className="h-2.5 w-3.5 rounded-sm bg-brand-blue" /> Your
                prediction ${myPrediction.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
