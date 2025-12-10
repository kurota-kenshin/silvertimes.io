import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { useSilverPriceStore } from "../store/silverPriceStore";

export default function PredictionGame() {
  const [prediction, setPrediction] = useState("");
  const [activeTab, setActiveTab] = useState<
    "accuracy" | "winnings" | "weekly"
  >("accuracy");
  const [selectedWeek, setSelectedWeek] = useState("2024-W45");

  // Use Zustand store
  const {
    currentPrice,
    weeklyData: lbmaSilverData,
    isLoading,
    error,
    fetchData,
  } = useSilverPriceStore();

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate next Monday's date
  const nextMonday = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMon = new Date(today);
    nextMon.setDate(today.getDate() + daysUntilMonday);

    const day = String(nextMon.getDate()).padStart(2, "0");
    const month = String(nextMon.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  }, []);

  // Mock data for leaderboard
  const accuracyLeaders = [
    {
      rank: 1,
      address: "0x742d...4e89",
      predictions: 24,
      wins: 18,
      winRate: 75.0,
      avgError: 0.12,
    },
    {
      rank: 2,
      address: "0x8f3a...2c14",
      predictions: 31,
      wins: 22,
      winRate: 71.0,
      avgError: 0.15,
    },
    {
      rank: 3,
      address: "0x1b5e...7f93",
      predictions: 19,
      wins: 13,
      winRate: 68.4,
      avgError: 0.18,
    },
    {
      rank: 4,
      address: "0x9d2c...3a67",
      predictions: 27,
      wins: 18,
      winRate: 66.7,
      avgError: 0.21,
    },
    {
      rank: 5,
      address: "0x4e7f...8b12",
      predictions: 22,
      wins: 14,
      winRate: 63.6,
      avgError: 0.24,
    },
  ];

  const winningsLeaders = [
    {
      rank: 1,
      address: "0x742d...4e89",
      totalWinnings: "145.5 oz",
      usdValue: "$4,412",
      wins: 18,
    },
    {
      rank: 2,
      address: "0x8f3a...2c14",
      totalWinnings: "132.0 oz",
      usdValue: "$4,001",
      wins: 22,
    },
    {
      rank: 3,
      address: "0x1b5e...7f93",
      totalWinnings: "98.5 oz",
      usdValue: "$2,986",
      wins: 13,
    },
    {
      rank: 4,
      address: "0x9d2c...3a67",
      totalWinnings: "87.0 oz",
      usdValue: "$2,638",
      wins: 18,
    },
    {
      rank: 5,
      address: "0x4e7f...8b12",
      totalWinnings: "76.5 oz",
      usdValue: "$2,320",
      wins: 14,
    },
  ];

  const weeklyWinners = [
    {
      rank: 1,
      address: "0x742d...4e89",
      prediction: 32.45,
      actual: 32.47,
      error: 0.02,
      prize: "10 oz",
    },
    {
      rank: 2,
      address: "0x3c8f...5d21",
      prediction: 32.51,
      actual: 32.47,
      error: 0.04,
      prize: "5 oz",
    },
    {
      rank: 3,
      address: "0x6a1b...9e34",
      prediction: 32.39,
      actual: 32.47,
      error: 0.08,
      prize: "3 oz",
    },
    {
      rank: 4,
      address: "0x8d4e...2f76",
      prediction: 32.55,
      actual: 32.47,
      error: 0.08,
      prize: "2 oz",
    },
    {
      rank: 5,
      address: "0x1f9c...7a45",
      prediction: 32.38,
      actual: 32.47,
      error: 0.09,
      prize: "1 oz",
    },
  ];

  const availableWeeks = [
    "2024-W45",
    "2024-W44",
    "2024-W43",
    "2024-W42",
    "2024-W41",
  ];

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Demo Notice - Fixed at top */}
      <div className="fixed top-24 left-10 right-10 z-40 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md rounded-xl p-4">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-blue-300 font-medium">
            Pure frontend demo - This is a preview of the prediction game
            interface
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 mt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
              Weekly Competition
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            My Prediction on {nextMonday} LBMA Silver Price
          </h2>
          <p className="text-base text-silver-400 max-w-3xl mx-auto">
            Predict next week's LBMA silver price and win physical silver bars
            or crypto rewards
          </p>
        </div>

        {/* Prediction Input Section */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 mb-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Enter Your Prediction
            </h3>

            <div className="mb-8">
              <label className="block text-sm text-silver-400 mb-3">
                Next Monday's LBMA Silver Price (USD/oz)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/50">
                  $
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder={currentPrice ? currentPrice.toFixed(2) : "32.5"}
                  className="w-full bg-background-primary/50 border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-2xl font-bold text-white focus:outline-none focus:border-blue-500/30 focus:bg-background-primary/80 transition-all"
                />
              </div>
            </div>

            <button className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all mb-4">
              Connect Wallet to Submit
            </button>

            <p className="text-xs text-silver-500 text-center">
              Connect your EVM wallet to participate. One submission per wallet
              per round.
            </p>
          </div>
        </div>

        {/* LBMA Silver Price Chart */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white">
              LBMA Weekly Silver Price
            </h3>
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
          </div>

          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lbmaSilverData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 1", "dataMax + 1"]}
                  label={{
                    value: "USD/oz",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                    style: { fontSize: "11px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}/oz`,
                    "LBMA Price",
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return `Week of ${date.toLocaleDateString()}`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{
                    fill: "#60a5fa",
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#0a0a0a",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-silver-600">
              {isLoading
                ? "Loading data..."
                : error
                ? "Using fallback data"
                : "Live silver price data - Updates every 5 minutes"}
            </p>
            <p className="text-xs text-blue-400 italic">
              {!error && !isLoading && "🟢 Connected to live feed"}
            </p>
          </div>
        </div>

        {/* Current Round Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">
                Current Price
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isLoading
                    ? "bg-yellow-500/50 animate-pulse"
                    : error
                    ? "bg-red-500/50"
                    : "bg-green-500/50"
                }`}
              ></div>
            </div>
            <div className="text-4xl font-bold text-white">
              {isLoading
                ? "..."
                : currentPrice
                ? `$${currentPrice.toFixed(2)}`
                : "$32.50"}
            </div>
            <div className="text-xs text-silver-500 mt-1">
              {error ? "Fallback Price" : "Live LBMA"}
            </div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">
                Prize Pool
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">100 oz</div>
            <div className="text-xs text-silver-500 mt-1">Physical Silver</div>
          </div>
          <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-silver-600 uppercase tracking-wider">
                Participants
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></div>
            </div>
            <div className="text-4xl font-bold text-white">847</div>
            <div className="text-xs text-silver-500 mt-1">Unique Wallets</div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Game Rules</h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Benchmark:</strong> use the
                official LBMA Silver Price (USD/oz) on 12:00 PM London time;
                valid reference is the first fixing after the round locks,
                rounded to two decimal places.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Example:</strong> if Monday's
                fixing is USD 47.690, guesses closest to 47.69 win.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Access:</strong> connect an EVM
                wallet to enter; one submission per wallet per round; edits
                allowed until lock; login is mandatory before submitting any
                entry.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Schedule:</strong> weekly rounds;
                submission window runs Monday 12:00 PM London time – Thursday
                11:59 PM London time; winners are determined each Monday using
                that day's fixing.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Scoring:</strong> rank by
                absolute error to the benchmark; ties break by earliest valid
                submission timestamp at lock.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">How to win:</strong> A total of
                25 oz of silver (in the form of STT) will be distributed each
                week to reward the top 25 participants whose predictions are
                closest to Monday's official fixing price. Each winning
                participant receives 1 oz of physical silver as their prize.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Rewards:</strong> Rewards will be
                distributed in Q1 2026 after the STT token issuance is complete.
                Winners can view their results and prize status in their profile
                page upon logging in.
              </p>
            </div>
          </div>
        </div>

        {/* Prizes and Rewards */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500/60 to-emerald-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Prizes and Rewards</h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Monthly base prize pool:</strong>{" "}
                100 oz.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">
                  Tier unlocks (for next month's pool):
                </strong>{" "}
                Tier 1 = 150 oz at 1,000 unique wallets; Tier 2 = 200 oz at
                5,000 unique wallets.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Payout timing:</strong> Prizes
                distributed within 7 days of each Monday determination.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
              <p>
                Rewards are distributed according to the{" "}
                <Link
                  to="/rewards-terms"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  rewards delivery T&C
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Data, Fairness, and Admin */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-violet-500/60 to-violet-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">
              Data, Fairness, and Admin
            </h3>
          </div>

          <div className="space-y-4 text-sm text-silver-400">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Data:</strong> Use only licensed
                LBMA feeds or validated manual inputs; rounds may be voided if
                the benchmark is unavailable or materially disrupted.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
              <p>
                <strong className="text-white">Compliance:</strong> Physical
                deliveries may require KYC and are subject to regional
                restrictions; terms may be updated with notice.
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-12 bg-gradient-to-b from-yellow-500/60 to-yellow-600/70 rounded-full"></div>
              <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
            <button
              onClick={() => setActiveTab("accuracy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "accuracy"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
              }`}
            >
              Most Accurate
            </button>
            <button
              onClick={() => setActiveTab("winnings")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "winnings"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
              }`}
            >
              Top Winnings
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "weekly"
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
              }`}
            >
              Weekly Winners
            </button>
          </div>

          {/* Week Selector for Weekly Winners */}
          {activeTab === "weekly" && (
            <div className="mb-6">
              <label className="block text-xs text-silver-500 mb-2">
                Select Week
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="bg-background-primary/50 border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/30"
              >
                {availableWeeks.map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Accuracy Leaderboard */}
          {activeTab === "accuracy" && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Rank</div>
                <div className="col-span-2">Wallet Address</div>
                <div className="text-right">Predictions</div>
                <div className="text-right">Win Rate</div>
                <div className="text-right">Avg Error</div>
              </div>
              {/* Rows */}
              {accuracyLeaders.map((leader) => (
                <div
                  key={leader.rank}
                  className="grid grid-cols-6 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-blue-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {leader.rank <= 3 ? (
                      <span className="text-lg">
                        {leader.rank === 1
                          ? "🥇"
                          : leader.rank === 2
                          ? "🥈"
                          : "🥉"}
                      </span>
                    ) : (
                      <span className="text-sm text-silver-500">
                        #{leader.rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-white font-mono">
                      {leader.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-silver-300">
                      {leader.predictions}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-blue-400 font-semibold">
                      {leader.winRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-silver-300">
                      ±${leader.avgError}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Winnings Leaderboard */}
          {activeTab === "winnings" && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Rank</div>
                <div className="col-span-2">Wallet Address</div>
                <div className="text-right">Total Winnings</div>
                <div className="text-right">USD Value</div>
              </div>
              {/* Rows */}
              {winningsLeaders.map((leader) => (
                <div
                  key={leader.rank}
                  className="grid grid-cols-5 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {leader.rank <= 3 ? (
                      <span className="text-lg">
                        {leader.rank === 1
                          ? "🥇"
                          : leader.rank === 2
                          ? "🥈"
                          : "🥉"}
                      </span>
                    ) : (
                      <span className="text-sm text-silver-500">
                        #{leader.rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-white font-mono">
                      {leader.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-emerald-400 font-semibold">
                      {leader.totalWinnings}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-silver-300">
                      {leader.usdValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly Winners Leaderboard */}
          {activeTab === "weekly" && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Rank</div>
                <div className="col-span-2">Wallet Address</div>
                <div className="text-right">Prediction</div>
                <div className="text-right">Error</div>
                <div className="text-right">Prize</div>
              </div>
              {/* Rows */}
              {weeklyWinners.map((winner) => (
                <div
                  key={winner.rank}
                  className="grid grid-cols-6 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-violet-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {winner.rank <= 3 ? (
                      <span className="text-lg">
                        {winner.rank === 1
                          ? "🥇"
                          : winner.rank === 2
                          ? "🥈"
                          : "🥉"}
                      </span>
                    ) : (
                      <span className="text-sm text-silver-500">
                        #{winner.rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-white font-mono">
                      {winner.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-silver-300">
                      ${winner.prediction}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-violet-400 font-semibold">
                      ±${winner.error}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-white font-semibold">
                      {winner.prize}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-silver-600 text-center">
              Demo data shown - Real leaderboard will be populated when the game
              goes live
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
