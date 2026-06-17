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
import { FadeUp, Reveal } from "../v2/cinematic";
import { useSilverPriceStore } from "../../store/silverPriceStore";
import { dailyPredictionApi } from "../../services/api";
import { useDailyGame } from "./DailyGameContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8182";

interface PricePoint {
  date: string;
  price: number;
}

export default function DailyChart() {
  const { currentPrice } = useSilverPriceStore();
  const { me } = useDailyGame();
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/price/silver/daily?days=90`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d?.dailyData)) {
          setHistory(
            d.dailyData.filter(
              (p: PricePoint) => typeof p.price === "number" && !Number.isNaN(p.price),
            ),
          );
        }
      })
      .catch(() => {});
    dailyPredictionApi
      .predictions()
      .then((p) => setPredictions(p.map((x) => x.price).filter((n) => n > 0)))
      .catch(() => {});
  }, []);

  const lastDate = history.length ? history[history.length - 1].date : "";
  const myPrediction = me?.entry?.predictedPrice;

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

  return (
    <section className="relative">
      <FadeUp>
        <h3 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-bold leading-[1.05]">
          <Reveal className="gradient-text">Silver, last 90 days</Reveal>
        </h3>
        <p className="mt-2 text-sm text-silver-400">
          Blue line is the price. The teal dots on the right are where everyone
          predicted tomorrow's close.
        </p>
      </FadeUp>

      <FadeUp delay={0.1} className="mt-8">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 10, right: 28, bottom: 0, left: 0 }}
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
                  domain={yDomain ?? ["dataMin", "dataMax"]}
                  tick={{ fill: "#6c757d", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
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
                    stroke="rgba(255,255,255,0.3)"
                    strokeDasharray="4 4"
                    label={{
                      value: "Now",
                      fill: "#888e95",
                      fontSize: 11,
                      position: "insideLeft",
                    }}
                  />
                ) : null}
                {myPrediction ? (
                  <ReferenceLine
                    y={myPrediction}
                    stroke="#6596FE"
                    strokeWidth={1.5}
                    label={{
                      value: "You",
                      fill: "#90E0EF",
                      fontSize: 11,
                      position: "right",
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
          <div className="mt-4 flex flex-wrap gap-5 text-xs text-silver-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-3 rounded-sm bg-brand-sky" /> Silver price
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-teal/60" />{" "}
              {predictions.length} community prediction
              {predictions.length === 1 ? "" : "s"}
            </span>
            {myPrediction ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-3 rounded-sm bg-brand-blue" /> Your
                prediction ${myPrediction.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
