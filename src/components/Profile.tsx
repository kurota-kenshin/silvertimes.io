import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { predictionsApi, RoundInfo } from "../services/api";

export default function Profile() {
  const [existingPrediction, setExistingPrediction] = useState<number | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [_currentRound, setCurrentRound] = useState<RoundInfo | null>(null);

  const { ready, authenticated, login, getAccessToken, user, logout } = usePrivy();

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

  const fullAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) {
      return user.wallet.address;
    }
    if (user.email?.address) {
      return user.email.address;
    }
    return null;
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated) {
        setHistoryLoading(true);
        try {
          const token = await getAccessToken();
          if (token) {
            const [predictionRes, historyRes, roundRes] = await Promise.all([
              predictionsApi.getMyPrediction(token),
              predictionsApi.getMyHistory(token, 20),
              predictionsApi.getCurrentRound(),
            ]);

            if (predictionRes.prediction) {
              setExistingPrediction(predictionRes.prediction.predictedPrice);
            }

            setPredictionHistory(historyRes.predictions || []);
            setCurrentRound(roundRes.round);
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        } finally {
          setHistoryLoading(false);
        }
      }
    };
    fetchUserData();
  }, [authenticated, getAccessToken]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPredictions = predictionHistory.length;
    const completedPredictions = predictionHistory.filter(
      (p) => p.roundId?.status === "completed" && p.error !== undefined
    );
    const wins = completedPredictions.filter((p) => p.rank && p.rank <= 25);
    const totalPrize = wins.reduce((sum, p) => sum + (p.prize || 0), 0);

    // Calculate average error from completed predictions
    const totalError = completedPredictions.reduce((sum, p) => sum + (p.error || 0), 0);
    const avgError = completedPredictions.length > 0
      ? (totalError / completedPredictions.length).toFixed(2)
      : null;

    // Determine user tier based on best rank achieved
    const bestRank = completedPredictions.reduce((best, p) => {
      if (p.rank && (best === null || p.rank < best)) return p.rank;
      return best;
    }, null as number | null);

    let tier: string;
    let tierColor: string;
    if (bestRank !== null && bestRank <= 10) {
      tier = "Tier 1";
      tierColor = "text-yellow-400";
    } else if (bestRank !== null && bestRank <= 25) {
      tier = "Tier 2";
      tierColor = "text-silver-300";
    } else {
      tier = "Unranked";
      tierColor = "text-silver-500";
    }

    return {
      totalPredictions,
      totalWins: wins.length,
      avgError,
      totalPrize: totalPrize.toFixed(2),
      tier,
      tierColor,
      bestRank,
    };
  }, [predictionHistory]);

  if (!ready) {
    return (
      <section className="relative bg-background-primary py-32 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-silver-400">Loading...</p>
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="relative bg-background-primary py-32 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-silver-400 mb-8">Please connect your wallet or sign in to view your profile</p>
          <button
            onClick={login}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-silver-400">View your predictions and stats</p>
          </div>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-2xl text-silver-400 font-bold">
                {displayAddress ? displayAddress.slice(0, 2).toUpperCase() : "U"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{displayAddress}</h2>
              {fullAddress && fullAddress !== displayAddress && (
                <p className="text-sm text-silver-500 font-mono break-all">{fullAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Only Tier and Avg Error */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-silver-500 uppercase tracking-wider mb-2">Your Tier</p>
            <p className={`text-3xl font-bold ${stats.tierColor}`}>{stats.tier}</p>
            {stats.bestRank && (
              <p className="text-xs text-silver-600 mt-1">Best rank: #{stats.bestRank}</p>
            )}
          </div>
          <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-silver-500 uppercase tracking-wider mb-2">Avg Error</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.avgError !== null ? `±$${stats.avgError}` : "-"}
            </p>
            <p className="text-xs text-silver-600 mt-1">
              {stats.totalPredictions} prediction{stats.totalPredictions !== 1 ? 's' : ''} made
            </p>
          </div>
        </div>

        {/* Current Round Prediction */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500/60 to-emerald-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Current Round</h3>
          </div>

          {historyLoading ? (
            <div className="text-center py-8 text-silver-500">Loading...</div>
          ) : existingPrediction ? (
            <div className="bg-background-primary/50 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-silver-500 mb-1">Your Prediction for {nextMonday}</p>
                  <p className="text-4xl font-bold text-white">${existingPrediction.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-silver-500 mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Submitted
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <p className="text-xs text-silver-600">
                  You can update your prediction until Thursday 11:59 PM London time
                </p>
                <Link
                  to="/prediction"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Update Prediction →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-background-primary/50 border border-white/5 rounded-xl p-8 text-center">
              <p className="text-silver-400 mb-4">No prediction submitted for current round</p>
              <Link
                to="/prediction"
                className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
              >
                Make a Prediction
              </Link>
            </div>
          )}
        </div>

        {/* Prediction History */}
        <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">Prediction History</h3>
          </div>

          {historyLoading ? (
            <div className="text-center py-8 text-silver-500">Loading history...</div>
          ) : predictionHistory.length === 0 ? (
            <div className="bg-background-primary/50 border border-white/5 rounded-xl p-8 text-center">
              <p className="text-silver-400 mb-2">No prediction history yet</p>
              <p className="text-xs text-silver-600">Your past predictions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-silver-500 font-medium">
                <div>Week</div>
                <div className="text-right">Your Prediction</div>
                <div className="text-right">Actual Price</div>
                <div className="text-right">Error</div>
                <div className="text-right">Rank</div>
                <div className="text-right">Prize</div>
              </div>
              {/* Rows */}
              {predictionHistory.map((pred) => {
                const round = pred.roundId;
                const hasResult = round?.status === "completed";
                return (
                  <div
                    key={pred._id}
                    className="grid grid-cols-6 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-blue-500/20 transition-colors"
                  >
                    <div className="text-sm text-white">
                      {round?.weekIdentifier || "N/A"}
                    </div>
                    <div className="text-sm text-silver-300 text-right">
                      ${pred.predictedPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-silver-300 text-right">
                      {hasResult ? `$${round.actualPrice?.toFixed(2)}` : "Pending"}
                    </div>
                    <div className="text-sm text-right">
                      {hasResult && pred.error !== undefined ? (
                        <span className="text-blue-400">±${pred.error.toFixed(2)}</span>
                      ) : (
                        <span className="text-silver-600">-</span>
                      )}
                    </div>
                    <div className="text-sm text-right">
                      {hasResult ? (
                        pred.rank ? (
                          <span className={pred.rank <= 3 ? "text-yellow-400 font-semibold" : "text-silver-400"}>
                            #{pred.rank}
                          </span>
                        ) : (
                          <span className="text-silver-600">-</span>
                        )
                      ) : (
                        <span className="text-yellow-500/70 text-xs">Pending</span>
                      )}
                    </div>
                    <div className="text-sm text-right">
                      {pred.prize ? (
                        <span className="text-emerald-400 font-semibold">{pred.prize} oz</span>
                      ) : (
                        <span className="text-silver-600">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
