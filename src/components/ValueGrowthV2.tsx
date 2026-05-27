import {
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eyebrow, FadeUp, Grain, Reveal } from "./v2/cinematic";

// Silver supply vs. demand, million ounces (2020–2024).
const supplyDemandData = [
  { year: "2020", supply: 974.0, demand: 929.0 },
  { year: "2021", supply: 1023.1, demand: 1102.4 },
  { year: "2022", supply: 1034.6, demand: 1284.2 },
  { year: "2023", supply: 997.8, demand: 1198.5 },
  { year: "2024", supply: 1015.1, demand: 1164.1 },
];

export default function ValueGrowthV2() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
      <Grain />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[42vh] w-[48vw] translate-x-1/4 rounded-full bg-brand-blue/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: supply & demand chart */}
          <FadeUp y={36} className="order-2 lg:order-1">
            <div className="rounded-[1.6rem] bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-[0_40px_140px_-50px_rgba(0,0,0,0.9)]">
              <div className="rounded-[1.55rem] bg-background-secondary/70 p-6 backdrop-blur-sm sm:p-8">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Silver Supply &amp; Demand
                    </h3>
                    <p className="mt-1 text-xs text-silver-500">
                      Million ounces · 2020–2024
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-silver-300">
                      <span className="h-2 w-2 rounded-full bg-brand-sky" />
                      Demand
                    </span>
                    <span className="flex items-center gap-1.5 text-silver-500">
                      <span className="inline-block h-0 w-3.5 border-t-2 border-dashed border-silver-500" />
                      Supply
                    </span>
                  </div>
                </div>

                <div className="h-[320px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={supplyDemandData}
                      margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
                    >
                      <defs>
                        <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#90E0EF" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#90E0EF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="year"
                        stroke="#6c757d"
                        style={{ fontSize: "11px" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[850, 1350]}
                        stroke="#6c757d"
                        style={{ fontSize: "11px" }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          padding: "10px 12px",
                        }}
                        labelStyle={{ color: "#a8adb3", marginBottom: 4 }}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)} Moz`,
                          name,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="demand"
                        name="Total Demand"
                        stroke="#90E0EF"
                        strokeWidth={2.5}
                        fill="url(#demandFill)"
                        dot={{ fill: "#90E0EF", r: 3, strokeWidth: 2, stroke: "#0a0a0a" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="supply"
                        name="Total Supply"
                        stroke="#888e95"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={{ fill: "#888e95", r: 2.5, strokeWidth: 2, stroke: "#0a0a0a" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Right: wording */}
          <div className="order-1 lg:order-2">
            <FadeUp className="mb-7">
              <Eyebrow>Value Growth</Eyebrow>
            </FadeUp>

            <h2 className="text-[clamp(2rem,4.8vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
              <Reveal>Industrial demand</Reveal>
              <Reveal delay={0.08} className="gradient-text">
                tailwinds
              </Reveal>
            </h2>

            <FadeUp delay={0.15} className="mt-7">
              <p className="text-[clamp(1rem,1.9vw,1.2rem)] font-light leading-relaxed text-silver-300">
                Record-high industrial demand for silver is driven by AI and green
                tech, including PV, automotive, and grid infrastructure. This
                unprecedented consumption growth, combined with structural deficits,
                provides strong long-term price support and appreciation potential.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
