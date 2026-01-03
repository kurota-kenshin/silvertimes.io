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
import { usePrivy } from "@privy-io/react-auth";
import { useSilverPriceStore } from "../store/silverPriceStore";
import {
  predictionsApi,
  AccuracyLeader,
  WeeklyWinner,
  RoundInfo,
} from "../services/api";

// Helper to format address/email for display
const formatAddress = (user: { walletAddress?: string; email?: string }) => {
  if (user.walletAddress) {
    return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
  }
  if (user.email) {
    return user.email.length > 20
      ? `${user.email.slice(0, 17)}...`
      : user.email;
  }
  return "Anonymous";
};

// Helper to get tier based on rank
const getTier = (rank: number): string => {
  if (rank <= 10) return "Tier 1";
  if (rank <= 25) return "Tier 2";
  return "Tier 3";
};

export default function PredictionGame() {
  const [prediction, setPrediction] = useState("");
  const [activeTab, setActiveTab] = useState<"accuracy" | "weekly">("accuracy");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<number | null>(null);

  // Leaderboard data
  const [accuracyLeaders, setAccuracyLeaders] = useState<AccuracyLeader[]>([]);
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [completedRounds, setCompletedRounds] = useState<RoundInfo[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundInfo | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Privy auth
  const { ready, authenticated, login, getAccessToken, user } = usePrivy();

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

  // Fetch user's existing prediction when authenticated
  useEffect(() => {
    const fetchExistingPrediction = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) {
            const { prediction } = await predictionsApi.getMyPrediction(token);
            if (prediction) {
              setExistingPrediction(prediction.predictedPrice);
              setPrediction(prediction.predictedPrice.toString());
            }
          }
        } catch (err) {
          // No existing prediction, that's fine
        }
      }
    };
    fetchExistingPrediction();
  }, [authenticated, getAccessToken]);

  // Handle prediction submission
  const handleSubmit = async () => {
    if (!authenticated) {
      login();
      return;
    }

    const priceValue = parseFloat(prediction);
    if (isNaN(priceValue) || priceValue <= 0) {
      setSubmitError("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      await predictionsApi.submit(token, priceValue);
      setSubmitSuccess(true);
      setExistingPrediction(priceValue);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit prediction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display address for logged in user
  const displayAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) {
      const addr = user.wallet.address;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    if (user.email?.address) {
      return user.email.address;
    }
    return "Connected";
  }, [user]);

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

  // Fetch leaderboard data and current round info
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLeaderboardLoading(true);
      try {
        // Fetch accuracy leaderboard, completed rounds, and current round in parallel
        const [accuracyRes, roundsRes, currentRoundRes] = await Promise.all([
          predictionsApi.getLeaderboard("accuracy"),
          predictionsApi.getCompletedRounds(10),
          predictionsApi.getCurrentRound(),
        ]);

        setAccuracyLeaders(accuracyRes.leaders as AccuracyLeader[]);
        setCompletedRounds(roundsRes.rounds);
        setCurrentRound(currentRoundRes.round);

        // Set default selected week to most recent completed round
        if (roundsRes.rounds.length > 0) {
          setSelectedWeek(roundsRes.rounds[0].weekIdentifier);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Fetch weekly winners when selected week changes
  useEffect(() => {
    const fetchWeeklyWinners = async () => {
      if (!selectedWeek) return;

      try {
        const res = await predictionsApi.getLeaderboard("weekly", selectedWeek);
        setWeeklyWinners(res.leaders as WeeklyWinner[]);
      } catch (err) {
        console.error("Failed to fetch weekly winners:", err);
        setWeeklyWinners([]);
      }
    };

    if (activeTab === "weekly") {
      fetchWeeklyWinners();
    }
  }, [selectedWeek, activeTab]);

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Status Notice - Fixed at top */}
      <div className={`fixed top-24 left-10 right-10 z-40 backdrop-blur-md rounded-xl p-4 ${
        authenticated
          ? "bg-green-500/10 border border-green-500/30"
          : "bg-blue-500/10 border border-blue-500/30"
      }`}>
        <div className="flex items-center justify-center gap-2">
          <svg
            className={`w-5 h-5 ${authenticated ? "text-green-400" : "text-blue-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {authenticated ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
          <p className={`text-sm font-medium ${authenticated ? "text-green-300" : "text-blue-300"}`}>
            {authenticated
              ? `Connected as ${displayAddress} - Submit your prediction below`
              : "Connect your wallet or sign in with email to participate"
            }
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
          <div className="max-w-md mx-auto text-center">
            {/* Title with Tooltip */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <h3 className="text-2xl font-bold text-white">
                Guess Silver Price, Win STT
              </h3>
              <div className="relative group">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center cursor-help">
                  <span className="text-xs text-blue-400 font-medium">i</span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-sm text-silver-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1a1a2e] border-r border-b border-white/10"></div>
                  Enter Your Prediction on {nextMonday} LBMA Silver Price per Ounce.
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-white/50">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder={currentPrice ? currentPrice.toFixed(2) : "73.50"}
                  className="w-full bg-background-primary/50 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-3xl font-bold text-white text-center focus:outline-none focus:border-blue-500/30 focus:bg-background-primary/80 transition-all placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                {existingPrediction ? "Prediction updated successfully!" : "Prediction submitted successfully!"}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !ready}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSubmitting
                  ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {!ready ? (
                "Loading..."
              ) : isSubmitting ? (
                "Submitting..."
              ) : authenticated ? (
                <span className="flex items-center justify-center gap-2">
                  {existingPrediction ? "Update Prediction" : "Submit Prediction"}
                  <span className="text-sm font-normal text-blue-200">({displayAddress})</span>
                </span>
              ) : (
                "Connect to Submit"
              )}
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 mb-16">
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
                {completedRounds.length === 0 ? (
                  <option value="">No completed rounds yet</option>
                ) : (
                  completedRounds.map((round) => (
                    <option key={round.weekIdentifier} value={round.weekIdentifier}>
                      {round.weekIdentifier}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Accuracy Leaderboard */}
          {activeTab === "accuracy" && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Rank</div>
                <div className="col-span-2">User</div>
                <div className="text-right">Predictions</div>
                <div className="text-right">Wins</div>
              </div>
              {/* Rows */}
              {leaderboardLoading ? (
                <div className="text-center py-8 text-silver-500">Loading leaderboard...</div>
              ) : accuracyLeaders.length === 0 ? (
                <div className="text-center py-8 text-silver-500">No predictions yet. Be the first!</div>
              ) : (
                accuracyLeaders.map((leader, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={leader._id}
                      className="grid grid-cols-5 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-blue-500/20 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {rank <= 3 ? (
                          <span className="text-lg">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          <span className="text-sm text-silver-500">#{rank}</span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-white font-mono">
                          {formatAddress(leader)}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-sm text-silver-300">
                          {leader.totalPredictions}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-sm text-blue-400 font-semibold">
                          {leader.totalWins}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Weekly Winners Leaderboard */}
          {activeTab === "weekly" && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Rank</div>
                <div className="col-span-2">User</div>
                <div className="text-right">Prediction</div>
                <div className="text-right">Error</div>
                <div className="text-right">Tier</div>
              </div>
              {/* Rows */}
              {completedRounds.length === 0 ? (
                <div className="text-center py-8 text-silver-500">No completed rounds yet</div>
              ) : weeklyWinners.length === 0 ? (
                <div className="text-center py-8 text-silver-500">No winners for this round</div>
              ) : (
                weeklyWinners.map((winner) => {
                  const rank = winner.rank || 0;
                  const tier = getTier(rank);
                  return (
                    <div
                      key={winner._id}
                      className="grid grid-cols-6 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-violet-500/20 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {rank <= 3 ? (
                          <span className="text-lg">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          <span className="text-sm text-silver-500">#{rank}</span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-white font-mono">
                          {winner.userId ? formatAddress(winner.userId) : "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-sm text-silver-300">
                          ${winner.predictedPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="text-sm text-violet-400 font-semibold">
                          ±${winner.error?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            tier === "Tier 1"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-silver-500/20 text-silver-300 border border-silver-500/30"
                          }`}
                        >
                          {tier}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Note */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-silver-600 text-center">
              {leaderboardLoading
                ? "Loading..."
                : accuracyLeaders.length === 0
                ? "Leaderboard will be populated once predictions are submitted"
                : "Live leaderboard data"}
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
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${date.getDate()} ${months[date.getMonth()]}`;
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
            <div className="text-4xl font-bold text-white">
              {currentRound?.totalParticipants || 0}
            </div>
            <div className="text-xs text-silver-500 mt-1">This Round</div>
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
      </div>
    </section>
  );
}
