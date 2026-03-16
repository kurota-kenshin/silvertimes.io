import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { predictionsApi, authApi, RoundInfo, SocialHandles } from "../services/api";

export default function ProfileContent() {
  const [existingPrediction, setExistingPrediction] = useState<number | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [_currentRound, setCurrentRound] = useState<RoundInfo | null>(null);

  const [socials, setSocials] = useState<SocialHandles>({});
  const [editingSocials, setEditingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState<SocialHandles>({});
  const [savingSocials, setSavingSocials] = useState(false);

  const { authenticated, getAccessToken, user, logout } = usePrivy();

  const displayAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) {
      const addr = user.wallet.address;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    if (user.email?.address) return user.email.address;
    return "Connected";
  }, [user]);

  const fullAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) return user.wallet.address;
    if (user.email?.address) return user.email.address;
    return null;
  }, [user]);

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated) {
        setHistoryLoading(true);
        try {
          const token = await getAccessToken();
          if (token) {
            const [predictionRes, historyRes, roundRes, socialsRes] = await Promise.all([
              predictionsApi.getMyPrediction(token),
              predictionsApi.getMyHistory(token, 20),
              predictionsApi.getCurrentRound(),
              authApi.getSocials(token),
            ]);
            if (predictionRes.prediction) setExistingPrediction(predictionRes.prediction.predictedPrice);
            setPredictionHistory(historyRes.predictions || []);
            setCurrentRound(roundRes.round);
            if (socialsRes.socials) {
              setSocials(socialsRes.socials);
              setSocialForm(socialsRes.socials);
            }
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

  const handleSaveSocials = async () => {
    setSavingSocials(true);
    try {
      const token = await getAccessToken();
      if (token) {
        await authApi.updateSocials(token, socialForm);
        setSocials(socialForm);
        setEditingSocials(false);
      }
    } catch (err) {
      console.error("Failed to save socials:", err);
    } finally {
      setSavingSocials(false);
    }
  };

  const stats = useMemo(() => {
    const totalPredictions = predictionHistory.length;
    const completedPredictions = predictionHistory.filter(
      (p) => p.roundId?.status === "completed" && p.error !== undefined
    );
    const wins = completedPredictions.filter((p) => p.rank && p.rank <= 25);
    const totalPrize = wins.reduce((sum, p) => sum + (p.prize || 0), 0);
    const totalError = completedPredictions.reduce((sum, p) => sum + (p.error || 0), 0);
    const avgError = completedPredictions.length > 0
      ? (totalError / completedPredictions.length).toFixed(2)
      : null;

    const bestRank = completedPredictions.reduce((best, p) => {
      if (p.rank && (best === null || p.rank < best)) return p.rank;
      return best;
    }, null as number | null);

    let tier: string;
    if (bestRank === 1) tier = "Gold";
    else if (bestRank === 2) tier = "Silver";
    else if (bestRank === 3) tier = "Bronze";
    else if (bestRank !== null && bestRank <= 10) tier = "Tier 1";
    else if (bestRank !== null && bestRank <= 20) tier = "Tier 2";
    else tier = "Unranked";

    return { totalPredictions, totalWins: wins.length, avgError, totalPrize: totalPrize.toFixed(2), tier, bestRank };
  }, [predictionHistory]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">My Profile</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-silver-400 font-mono">{displayAddress}</span>
            {fullAddress && fullAddress !== displayAddress && (
              <span className="text-xs text-silver-400 font-mono hidden md:inline">{fullAddress}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Winnings Hero Card */}
      <div className="group relative mb-8">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-teal/50 via-brand-blue/30 to-brand-teal/50 rounded-2xl"></div>
        <div className="relative bg-gradient-to-br from-brand-teal/15 via-background-secondary/80 to-brand-blue/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-12 bg-gradient-to-b from-brand-teal/80 to-brand-teal/20 rounded-full"></div>
                <p className="text-xs text-silver-400 uppercase tracking-wider">Total Winnings</p>
              </div>
              <p className="text-5xl font-bold bg-gradient-to-r from-brand-teal to-brand-sky bg-clip-text text-transparent">
                {parseFloat(stats.totalPrize) > 0 ? `${stats.totalPrize} USDT` : "0 USDT"}
              </p>
              <p className="text-sm text-silver-300 mt-3">
                {stats.totalWins} win{stats.totalWins !== 1 ? "s" : ""} from {stats.totalPredictions} prediction{stats.totalPredictions !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1.5 bg-brand-blue/15 border border-brand-blue/25 rounded-full mb-2">
                <span className="text-xs text-brand-blue">Q2 2026 Distribution</span>
              </div>
              <div>
                <Link to="/rewards-terms" className="text-xs text-brand-blue hover:text-brand-teal transition-colors">
                  View Rewards T&C
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Tier", value: stats.tier, color: stats.tier === "Gold" ? "text-brand-sky" : stats.tier === "Silver" ? "text-silver-300" : stats.tier === "Bronze" ? "text-silver-400" : stats.tier === "Tier 1" ? "text-brand-blue" : stats.tier === "Tier 2" ? "text-brand-teal" : "text-silver-300", sub: stats.bestRank ? `Best: #${stats.bestRank}` : undefined, gradient: "from-brand-sky/60 to-brand-sky/20" },
          { label: "Avg Error", value: stats.avgError !== null ? `+/-$${stats.avgError}` : "-", color: "text-brand-blue", gradient: "from-brand-blue/60 to-brand-blue/20" },
          { label: "Predictions", value: String(stats.totalPredictions), color: "text-white", gradient: "from-brand-teal/60 to-brand-teal/20" },
        ].map((stat, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 group-hover:border-white/10 transition-all duration-300">
              <div className={`w-1 h-8 bg-gradient-to-b ${stat.gradient} rounded-full mb-4`}></div>
              <p className="text-xs text-silver-300 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.sub && <p className="text-xs text-silver-400 mt-1">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Social Handles */}
      <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-brand-blue/60 to-brand-blue/20 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Social Handles</h3>
          </div>
          {!editingSocials && (
            <button onClick={() => setEditingSocials(true)} className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-lg text-sm font-medium transition-colors">Edit</button>
          )}
        </div>

        {editingSocials ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-silver-300 uppercase tracking-wider mb-2">X (Twitter)</label>
                <div className="flex items-center gap-2">
                  <span className="text-silver-300">@</span>
                  <input type="text" value={socialForm.twitterHandle || ""} onChange={(e) => setSocialForm({ ...socialForm, twitterHandle: e.target.value })} placeholder="username" className="flex-1 bg-background-primary/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-silver-600 focus:outline-none focus:border-brand-blue/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-silver-300 uppercase tracking-wider mb-2">Telegram</label>
                <div className="flex items-center gap-2">
                  <span className="text-silver-300">@</span>
                  <input type="text" value={socialForm.telegramHandle || ""} onChange={(e) => setSocialForm({ ...socialForm, telegramHandle: e.target.value })} placeholder="username" className="flex-1 bg-background-primary/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-silver-600 focus:outline-none focus:border-brand-blue/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-silver-300 uppercase tracking-wider mb-2">LinkedIn</label>
                <input type="text" value={socialForm.linkedinHandle || ""} onChange={(e) => setSocialForm({ ...socialForm, linkedinHandle: e.target.value })} placeholder="linkedin.com/in/username" className="w-full bg-background-primary/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-silver-600 focus:outline-none focus:border-brand-blue/50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setSocialForm(socials); setEditingSocials(false); }} className="px-4 py-2 text-silver-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveSocials} disabled={savingSocials} className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">{savingSocials ? "Saving..." : "Save"}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-silver-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <span className="text-xs text-silver-300 uppercase">X</span>
              </div>
              {socials.twitterHandle ? <a href={`https://x.com/${socials.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-teal transition-colors">@{socials.twitterHandle}</a> : <span className="text-silver-400">Not set</span>}
            </div>
            <div className="bg-background-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-silver-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                <span className="text-xs text-silver-300 uppercase">Telegram</span>
              </div>
              {socials.telegramHandle ? <a href={`https://t.me/${socials.telegramHandle}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-teal transition-colors">@{socials.telegramHandle}</a> : <span className="text-silver-400">Not set</span>}
            </div>
            <div className="bg-background-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-silver-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                <span className="text-xs text-silver-300 uppercase">LinkedIn</span>
              </div>
              {socials.linkedinHandle ? <a href={socials.linkedinHandle.startsWith("http") ? socials.linkedinHandle : `https://linkedin.com/in/${socials.linkedinHandle}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-teal transition-colors truncate block">{socials.linkedinHandle}</a> : <span className="text-silver-400">Not set</span>}
            </div>
          </div>
        )}
      </div>

      {/* Current Round */}
      <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 mb-8 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-12 bg-gradient-to-b from-brand-teal/60 to-brand-teal/20 rounded-full"></div>
          <h3 className="text-xl font-bold text-white">Current Round</h3>
        </div>
        {historyLoading ? (
          <div className="text-center py-8 text-silver-300">Loading...</div>
        ) : existingPrediction ? (
          <div className="bg-background-primary/50 border border-brand-teal/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-silver-300 mb-1">Your Prediction for {nextMonday}</p>
                <p className="text-4xl font-bold text-white">${existingPrediction.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/15 text-brand-teal border border-brand-teal/20 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse"></span>
                  Submitted
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <p className="text-xs text-silver-400">Update until Thursday 11:59 PM London time</p>
            </div>
          </div>
        ) : (
          <div className="bg-background-primary/50 border border-white/5 rounded-xl p-8 text-center">
            <p className="text-silver-400">No prediction submitted for current round</p>
          </div>
        )}
      </div>

      {/* Prediction History */}
      <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-12 bg-gradient-to-b from-brand-blue/60 to-brand-blue/20 rounded-full"></div>
          <h3 className="text-xl font-bold text-white">Prediction History</h3>
        </div>
        {historyLoading ? (
          <div className="text-center py-8 text-silver-300">Loading history...</div>
        ) : predictionHistory.length === 0 ? (
          <div className="bg-background-primary/50 border border-white/5 rounded-xl p-8 text-center">
            <p className="text-silver-400 mb-2">No prediction history yet</p>
            <p className="text-xs text-silver-400">Your past predictions will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-silver-300 font-medium">
              <div>Week</div>
              <div className="text-right">Prediction</div>
              <div className="text-right">Actual</div>
              <div className="text-right">Error</div>
              <div className="text-right">Rank</div>
              <div className="text-right">Prize</div>
            </div>
            {predictionHistory.map((pred) => {
              const round = pred.roundId;
              const hasResult = round?.status === "completed";
              return (
                <div key={pred._id} className="grid grid-cols-6 gap-4 px-4 py-3 bg-background-primary/30 rounded-lg border border-white/5 hover:border-brand-blue/20 transition-colors">
                  <div className="text-sm text-white">{round?.weekIdentifier || "N/A"}</div>
                  <div className="text-sm text-silver-300 text-right">${pred.predictedPrice.toFixed(2)}</div>
                  <div className="text-sm text-silver-300 text-right">{hasResult ? `$${round.actualPrice?.toFixed(2)}` : "Pending"}</div>
                  <div className="text-sm text-right">
                    {hasResult && pred.error !== undefined ? <span className="text-brand-blue">+/-${pred.error.toFixed(2)}</span> : <span className="text-silver-400">-</span>}
                  </div>
                  <div className="text-sm text-right">
                    {hasResult ? (pred.rank ? <span className={pred.rank <= 3 ? "text-brand-sky font-semibold" : "text-silver-400"}>#{pred.rank}</span> : <span className="text-silver-400">-</span>) : <span className="text-brand-sky/70 text-xs">Pending</span>}
                  </div>
                  <div className="text-sm text-right">
                    {pred.prize ? <span className="text-brand-teal font-semibold">{pred.prize} USDT</span> : <span className="text-silver-400">-</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
