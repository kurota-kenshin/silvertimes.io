import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const ProfileContent = lazy(() => import("./ProfileContent"));
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Line,
  ComposedChart,
  ReferenceArea,
} from "recharts";
import { usePrivy } from "@privy-io/react-auth";
import { useSilverPriceStore } from "../store/silverPriceStore";
import {
  predictionsApi,
  authApi,
  AccuracyLeader,
  WeeklyWinner,
  RoundInfo,
  UserStats,
  ChartPrediction,
  RecentWinners,
  SocialHandles,
} from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8182";

// Calculate Simple Moving Average
function calculateSMA(data: { price: number }[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.price, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate RSI
function calculateRSI(data: { price: number }[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(null); continue; }
    const change = data[i].price - data[i - 1].price;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
      if (avgLoss === 0) { result.push(100); }
      else { const rs = avgGain / avgLoss; result.push(100 - 100 / (1 + rs)); }
    }
  }
  return result;
}

const formatWeekDateRange = (weekIdentifier: string): string => {
  const match = weekIdentifier.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekIdentifier;
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  // ISO week: week 1 contains the first Thursday of the year
  // Monday of week 1 = Jan 4 adjusted to Monday
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Convert Sunday=0 to 7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${weekIdentifier} (${fmt(monday)} – ${fmt(sunday)})`;
};

const formatAddress = (user: { walletAddress?: string; email?: string }) => {
  if (user.walletAddress) return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
  if (user.email) return user.email.length > 20 ? `${user.email.slice(0, 17)}...` : user.email;
  return "Anonymous";
};

const getTier = (rank: number): string => {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  if (rank <= 10) return "Tier 1";
  if (rank <= 20) return "Tier 2";
  return "";
};

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
};

// Share overlay
const ShareOverlay = ({ price, onClose, userName, onShare }: { price: string; onClose: () => void; userName: string; onShare: () => void }) => {
  const shareText = `I just predicted Silver at $${price} on @SilvertimesSTT. Think you can beat me?`;
  const shareUrl = "https://silvertimes.io/prediction";

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        onShare();
        return;
    }
    if (url) { window.open(url, "_blank"); onShare(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-background-secondary/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-brand-blue/10" onClick={(e) => e.stopPropagation()}>
        {/* Glow effect behind modal */}
        <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue/20 to-brand-teal/20 rounded-2xl blur-xl opacity-50"></div>
        <div className="relative">
          {/* Share Card Preview */}
          <div className="bg-gradient-to-br from-brand-blue/20 to-brand-teal/10 border border-white/10 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-xs text-silver-300 uppercase tracking-wider mb-2">My Prediction</div>
              <div className="text-4xl font-bold text-white mb-2">${price}</div>
              <div className="text-sm text-silver-400">Silver Price Forecast</div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-brand-blue">{userName} on SilverTimes</span>
              </div>
            </div>
          </div>

          <p className="text-center text-white font-semibold mb-4">Share Your Prediction</p>

          <div className="flex gap-3 justify-center mb-6">
            <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              <span className="text-sm font-medium">X</span>
            </button>
            <button onClick={() => handleShare("telegram")} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              <span className="text-sm font-medium">Telegram</span>
            </button>
            <button onClick={() => handleShare("copy")} className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <span className="text-sm font-medium">Copy</span>
            </button>
          </div>

          <button onClick={onClose} className="w-full py-3 bg-background-primary/50 border border-white/10 rounded-xl text-silver-400 hover:text-white hover:border-white/20 transition-all duration-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Dynamic Timeline
const DynamicTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timelineData = useMemo(() => {
    const now = currentTime;
    const dayOfWeek = now.getDay();
    const thisMonday = new Date(now);
    const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    thisMonday.setDate(now.getDate() + daysFromMonday);
    thisMonday.setHours(12, 0, 0, 0);

    const thisSaturday = new Date(thisMonday);
    thisSaturday.setDate(thisMonday.getDate() + 5);
    thisSaturday.setHours(23, 59, 59, 999);

    const nextMonday = new Date(thisMonday);
    nextMonday.setDate(thisMonday.getDate() + 7);
    nextMonday.setHours(12, 0, 0, 0);

    const nextSaturday = new Date(nextMonday);
    nextSaturday.setDate(nextMonday.getDate() + 5);
    nextSaturday.setHours(23, 59, 59, 999);

    const timelineStart = thisMonday;
    const timelineEnd = nextSaturday;
    const totalSpan = timelineEnd.getTime() - timelineStart.getTime();

    const thisSaturdayPercent = ((thisSaturday.getTime() - timelineStart.getTime()) / totalSpan) * 100;
    const nextMondayPercent = ((nextMonday.getTime() - timelineStart.getTime()) / totalSpan) * 100;
    const elapsed = now.getTime() - timelineStart.getTime();
    const progressPercent = Math.max(0, Math.min(100, (elapsed / totalSpan) * 100));
    const isSubmissionOpen = (now >= thisMonday && now <= thisSaturday) || (now >= nextMonday && now <= nextSaturday);

    const dayMarkers: { label: string; date: number; position: number; isOpen: boolean; isResultDay: boolean; isDeadline: boolean }[] = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i <= 12; i++) {
      const date = new Date(thisMonday);
      date.setDate(thisMonday.getDate() + i);
      const dayIndex = (1 + i) % 7;
      const actualDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      const position = ((date.getTime() - timelineStart.getTime()) / totalSpan) * 100;
      const isOpen = (i >= 0 && i <= 5) || (i >= 7 && i <= 12);
      if (position >= 0 && position <= 100) {
        dayMarkers.push({ label: days[actualDayIndex], date: date.getDate(), position, isOpen, isResultDay: i === 7, isDeadline: i === 5 });
      }
    }

    return { progressPercent, thisSaturdayPercent, nextMondayPercent, isSubmissionOpen, dayMarkers, thisMonday, nextSaturday };
  }, [currentTime]);

  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="group relative mt-8">
      {/* Hover glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${timelineData.isSubmissionOpen ? "bg-brand-teal animate-pulse shadow-lg shadow-brand-teal/30" : "bg-silver-500"}`}></div>
            <span className="text-sm font-medium text-white">
              {timelineData.isSubmissionOpen ? "Submissions Open" : "Submissions Closed - Awaiting Results"}
            </span>
          </div>
          <span className="text-xs text-silver-300">{formatDate(timelineData.thisMonday)} - {formatDate(timelineData.nextSaturday)}</span>
        </div>

        {/* Timeline Bar */}
        <div className="relative h-3 mb-2">
          <div className="absolute inset-0 rounded-full bg-background-primary/60 border border-white/5"></div>
          <div className="absolute top-0 left-0 h-full rounded-l-full bg-gradient-to-r from-brand-teal/60 to-brand-teal/50" style={{ width: `${timelineData.thisSaturdayPercent}%` }}></div>
          <div className="absolute top-0 h-full bg-gradient-to-r from-silver-600/30 to-silver-500/20" style={{ left: `${timelineData.thisSaturdayPercent}%`, width: `${timelineData.nextMondayPercent - timelineData.thisSaturdayPercent}%` }}></div>
          <div className="absolute top-0 h-full rounded-r-full bg-gradient-to-r from-brand-teal/60 to-brand-teal/50" style={{ left: `${timelineData.nextMondayPercent}%`, width: `${100 - timelineData.nextMondayPercent}%` }}></div>

          <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{ left: `${timelineData.thisSaturdayPercent}%` }}>
            <div className="w-0.5 h-5 -ml-px bg-gradient-to-b from-brand-sky to-brand-sky/20"></div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{ left: `${timelineData.nextMondayPercent}%` }}>
            <div className="w-0.5 h-5 -ml-px bg-gradient-to-b from-brand-blue to-brand-blue/20"></div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000" style={{ left: `${timelineData.progressPercent}%` }}>
            <div className="absolute -inset-2 bg-white/20 rounded-full blur-md"></div>
            <div className="relative w-4 h-4 -ml-2 bg-white rounded-full border-2 border-brand-blue shadow-lg shadow-brand-blue/30"></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] font-medium text-brand-blue bg-background-secondary/90 px-1.5 py-0.5 rounded border border-brand-blue/30">Now</span>
            </div>
          </div>
        </div>

        <div className="relative h-10 mt-4">
          {timelineData.dayMarkers.map((marker, index) => (
            <div key={index} className="absolute -translate-x-1/2 text-center" style={{ left: `${marker.position}%` }}>
              {(marker.isDeadline || marker.isResultDay) && (
                <div className={`text-[8px] font-medium mb-0.5 ${marker.isDeadline ? "text-brand-sky" : "text-brand-blue"}`}>
                  {marker.isDeadline ? "Deadline" : "Results"}
                </div>
              )}
              <div className={`text-[10px] font-medium ${marker.isResultDay ? "text-brand-blue" : marker.isDeadline ? "text-brand-sky" : marker.isOpen ? "text-brand-teal/80" : "text-silver-300"}`}>
                {marker.label}
              </div>
              <div className="text-[9px] text-silver-400">{marker.date}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 pt-3 border-t border-white/5 flex-wrap">
          <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-sm bg-gradient-to-r from-brand-teal/60 to-brand-teal/50"></div><span className="text-[10px] text-silver-400">Open</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-sm bg-gradient-to-r from-silver-600/30 to-silver-500/20"></div><span className="text-[10px] text-silver-400">Closed</span></div>
          <div className="flex items-center gap-2"><div className="w-0.5 h-3 bg-brand-sky"></div><span className="text-[10px] text-silver-400">Deadline (Thu 23:59)</span></div>
          <div className="flex items-center gap-2"><div className="w-0.5 h-3 bg-brand-blue"></div><span className="text-[10px] text-silver-400">Results (Mon 12:00)</span></div>
        </div>
      </div>
    </div>
  );
};

export default function PredictionGame() {
  const [prediction, setPrediction] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [activeTab, setActiveTab] = useState<"accuracy" | "weekly">("accuracy");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [avgPrediction, setAvgPrediction] = useState<number | null>(null);

  // Page tab
  const [pageTab, setPageTab] = useState<"predict" | "chart" | "leaderboard" | "rules" | "profile">("predict");

  // Technical indicators
  const [dailyPriceData, setDailyPriceData] = useState<{ date: string; price: number }[]>([]);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Leaderboard data
  const [accuracyLeaders, setAccuracyLeaders] = useState<AccuracyLeader[]>([]);
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [completedRounds, setCompletedRounds] = useState<RoundInfo[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundInfo | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const [_userStats, setUserStats] = useState<UserStats | null>(null);
  const [chartPredictions, setChartPredictions] = useState<ChartPrediction[]>([]);
  const [_recentWinners, setRecentWinners] = useState<RecentWinners | null>(null);
  const [userSocials, setUserSocials] = useState<SocialHandles | null>(null);

  const { ready, authenticated, login, getAccessToken, user } = usePrivy();
  const { currentPrice, weeklyData: lbmaSilverData, isLoading, error, fetchData } = useSilverPriceStore();

  const nextDeadline = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    if (daysUntilSaturday === 0 && now.getHours() >= 23) daysUntilSaturday = 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    saturday.setHours(23, 59, 0, 0);
    return saturday;
  }, []);

  const countdown = useCountdown(nextDeadline);

  const nextMonday = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMon = new Date(today);
    nextMon.setDate(today.getDate() + daysUntilMonday);
    return `${String(nextMon.getDate()).padStart(2, "0")}/${String(nextMon.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(() => fetchData(), 5 * 60 * 1000); return () => clearInterval(i); }, [fetchData]);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const response = await fetch(`${API_URL}/price/silver/daily?days=90`);
        if (response.ok) { const data = await response.json(); if (data.dailyData) setDailyPriceData(data.dailyData); }
      } catch (err) { console.error("Failed to fetch daily price data:", err); }
    };
    fetchDailyData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) {
            const [predictionRes, statsRes, socialsRes] = await Promise.all([
              predictionsApi.getMyPrediction(token),
              predictionsApi.getMyStats(token),
              authApi.getSocials(token),
            ]);
            if (predictionRes.prediction) { setExistingPrediction(predictionRes.prediction.predictedPrice); setPrediction(predictionRes.prediction.predictedPrice.toString()); }
            if (statsRes.stats) setUserStats(statsRes.stats);
            if (socialsRes.socials) setUserSocials(socialsRes.socials);
          }
        } catch { /* No existing prediction */ }
      } else { setExistingPrediction(null); setPrediction(""); setUserStats(null); setUserSocials(null); }
    };
    fetchUserData();
  }, [authenticated, getAccessToken]);

  const handleSubmit = async () => {
    if (!authenticated) { login(); return; }
    const priceValue = parseFloat(prediction);
    if (isNaN(priceValue) || priceValue <= 0) { setSubmitError("Please enter a valid price"); return; }
    if (!reasoning.trim()) { setSubmitError("Please enter your reasoning"); return; }
    setIsSubmitting(true); setSubmitError(null); setSubmitSuccess(false);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await predictionsApi.submit(token, priceValue);
      setSubmitSuccess(true);
      setExistingPrediction(priceValue);
      // X conversion tracking
      if (typeof window !== 'undefined' && (window as any).twq) {
        (window as any).twq('event', 'tw-raht0-rb8y5', {});
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit prediction");
    } finally { setIsSubmitting(false); }
  };

  const displayAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) { const addr = user.wallet.address; return `${addr.slice(0, 6)}...${addr.slice(-4)}`; }
    if (user.email?.address) return user.email.address;
    return "Connected";
  }, [user]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLeaderboardLoading(true);
      try {
        const [accuracyRes, roundsRes, currentRoundRes, recentWinnersRes] = await Promise.all([
          predictionsApi.getLeaderboard("accuracy"),
          predictionsApi.getCompletedRounds(10),
          predictionsApi.getCurrentRound(),
          predictionsApi.getRecentWinners(),
        ]);
        setAccuracyLeaders(accuracyRes.leaders as AccuracyLeader[]);
        setCompletedRounds(roundsRes.rounds);
        setCurrentRound(currentRoundRes.round);
        setRecentWinners(recentWinnersRes.winners);
        if (currentRoundRes.round?.avgPrediction) setAvgPrediction(currentRoundRes.round.avgPrediction);
        if (roundsRes.rounds.length > 0) setSelectedWeek(roundsRes.rounds[0].weekIdentifier);
      } catch (err) { console.error("Failed to fetch leaderboard data:", err); }
      finally { setLeaderboardLoading(false); }
    };
    fetchLeaderboardData();
    const i = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      try { const res = await predictionsApi.getRoundPredictions(); setChartPredictions(res.predictions); }
      catch (err) { console.error("Failed to fetch predictions:", err); }
    };
    fetchPredictions();
    const i = setInterval(fetchPredictions, 10 * 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchWeeklyWinners = async () => {
      if (!selectedWeek) return;
      try { const res = await predictionsApi.getLeaderboard("weekly", selectedWeek, 20); setWeeklyWinners(res.leaders as WeeklyWinner[]); }
      catch { setWeeklyWinners([]); }
    };
    if (activeTab === "weekly") fetchWeeklyWinners();
  }, [selectedWeek, activeTab]);

  const enhancedChartData = useMemo(() => {
    if (dailyPriceData.length > 0 && (showMA20 || showMA50 || showRSI)) {
      const ma20Values = calculateSMA(dailyPriceData, 20);
      const ma50Values = calculateSMA(dailyPriceData, 50);
      const rsiValues = calculateRSI(dailyPriceData, 14);
      const fullData = dailyPriceData.map((item, index) => ({
        ...item,
        ma20: showMA20 ? ma20Values[index] : undefined,
        ma50: showMA50 ? ma50Values[index] : undefined,
        rsi: showRSI ? rsiValues[index] : undefined,
      }));
      return fullData.slice(-90);
    }
    return lbmaSilverData.map((item) => ({ ...item }));
  }, [lbmaSilverData, dailyPriceData, showMA20, showMA50, showRSI]);

  const currentRSI = useMemo(() => {
    if (!showRSI || dailyPriceData.length === 0) return null;
    return calculateRSI(dailyPriceData, 14)[dailyPriceData.length - 1];
  }, [dailyPriceData, showRSI]);

  const predictionHistogram = useMemo(() => {
    if (chartPredictions.length === 0) return [];
    const prices = chartPredictions.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const bucketSize = Math.max(0.25, range / 20);
    const bucketStart = Math.floor(min / bucketSize) * bucketSize;
    const bucketEnd = Math.ceil(max / bucketSize) * bucketSize;
    const buckets: { priceMin: number; priceMax: number; priceMid: number; count: number; hasUserPrediction: boolean }[] = [];
    for (let b = bucketStart; b < bucketEnd; b += bucketSize) {
      const matching = prices.filter((p) => p >= b && p < b + bucketSize);
      const hasUser = existingPrediction !== null && existingPrediction >= b && existingPrediction < b + bucketSize;
      if (matching.length > 0) buckets.push({ priceMin: b, priceMax: b + bucketSize, priceMid: (b + b + bucketSize) / 2, count: matching.length, hasUserPrediction: hasUser });
    }
    return buckets;
  }, [chartPredictions, existingPrediction]);

  const yAxisDomain = useMemo(() => {
    const chartPrices = enhancedChartData.map((d: any) => d.price).filter(Boolean);
    if (chartPrices.length === 0) return ["dataMin - 4", "dataMax + 6"];
    const chartMin = Math.min(...chartPrices);
    const chartMax = Math.max(...chartPrices);
    const range = chartMax - chartMin;
    const capMin = chartMin - range * 0.3;
    const capMax = chartMax + range * 0.3;
    const predPrices = chartPredictions.map((p) => p.price);
    const allPrices = [...chartPrices, ...predPrices.filter((p) => p >= capMin && p <= capMax)];
    return [Math.min(...allPrices) - 4, Math.max(...allPrices) + 6];
  }, [enhancedChartData, chartPredictions]);

  const silverPrice = currentPrice ?? 73.5;
  const currentStep = !authenticated ? 1 : submitSuccess ? 3 : 2;

  return (
    <section className="relative bg-background-primary min-h-screen overflow-hidden">
      {/* Share Overlay */}
      {showShare && (
        <ShareOverlay
          price={prediction}
          onClose={() => setShowShare(false)}
          userName={displayAddress || "Anonymous"}
          onShare={async () => {
            try { const token = await getAccessToken(); if (token) await predictionsApi.trackShare(token); } catch {}
          }}
        />
      )}

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue/[0.04] rounded-full blur-3xl"></div>
      </div>

      {/* Hero - clean, compact, centered */}
      <div className="relative z-10 pt-20 pb-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
            Predict the Monday Price.{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent">Win USDT.</span>
          </h1>
          <p className="text-silver-300 max-w-xl mx-auto mb-8">
            Submit before Saturday 11:59 PM. Results Monday 12:00 PM (LBMA).
          </p>

          {/* Stats - horizontal, like the home page hero bottom bar */}
          <div className="border-t border-b border-white/[0.06] py-5">
            <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">${silverPrice.toFixed(2)}</div>
                <div className="text-[11px] text-silver-400 mt-1 uppercase tracking-wider">Spot Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand-sky tabular-nums">
                  {String(countdown.days).padStart(2, "0")}d {String(countdown.hours).padStart(2, "0")}h {String(countdown.minutes).padStart(2, "0")}m
                </div>
                <div className="text-[11px] text-silver-400 mt-1 uppercase tracking-wider">Until Lock-in</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{currentRound?.totalParticipants || 0}</div>
                <div className="text-[11px] text-silver-400 mt-1 uppercase tracking-wider">Oracles</div>
              </div>
              {avgPrediction && (
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">${avgPrediction.toFixed(2)}</div>
                  <div className="text-[11px] text-silver-400 mt-1 uppercase tracking-wider">Community Avg</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="relative z-10 px-4">
        <div className="max-w-5xl mx-auto border-b border-white/[0.06]">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
            {(["predict", "chart", "leaderboard", "rules", ...(authenticated ? ["profile" as const] : [])] as const).map((tab) => {
              const hasRedDot =
                (tab === "predict" && authenticated && !existingPrediction) ||
                (tab === "profile" && authenticated);
              return (
                <button
                  key={tab}
                  onClick={() => setPageTab(tab)}
                  className={`relative px-4 md:px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                    pageTab === tab
                      ? "text-white border-brand-blue"
                      : "text-silver-400 border-transparent hover:text-white"
                  }`}
                >
                  {tab === "predict" ? "Predict" : tab === "chart" ? "Chart" : tab === "leaderboard" ? "Leaderboard" : tab === "rules" ? "Prizes" : "Profile"}
                  {hasRedDot && pageTab !== tab && (
                    <span className="absolute top-2.5 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* ===== PREDICT TAB ===== */}
          {pageTab === "predict" && (
            <div className="max-w-xl mx-auto">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-0 mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      currentStep > step
                        ? "bg-gradient-to-br from-brand-teal/30 to-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-lg shadow-brand-teal/15"
                        : currentStep === step
                          ? "bg-gradient-to-br from-brand-blue to-brand-teal text-white shadow-lg shadow-brand-blue/30"
                          : "bg-background-secondary/30 backdrop-blur-sm border border-white/10 text-silver-300"
                    }`}>
                      {/* Active step pulse ring */}
                      {currentStep === step && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal opacity-30 animate-ping"></div>
                      )}
                      <span className="relative z-10">
                        {currentStep > step ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : step}
                      </span>
                    </div>
                    {step < 3 && (
                      <div className={`w-20 h-0.5 transition-all duration-500 ${
                        currentStep > step
                          ? "bg-gradient-to-r from-brand-teal/60 to-brand-teal/30 shadow-sm shadow-brand-teal/20"
                          : currentStep === step
                            ? "bg-gradient-to-r from-brand-blue/40 to-white/10"
                            : "bg-white/10"
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-silver-300 mb-8 px-4">
                <span className={currentStep > 1 ? "text-brand-teal font-medium" : currentStep === 1 ? "text-white font-medium" : ""}>Connect</span>
                <span className={currentStep > 2 ? "text-brand-teal font-medium" : currentStep === 2 ? "text-white font-medium" : ""}>Predict</span>
                <span className={currentStep >= 3 ? "text-brand-teal font-medium" : ""}>Done</span>
              </div>

              {/* Step 1: Connect */}
              {currentStep === 1 && (
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue/20 to-brand-teal/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-background-secondary/50 to-background-secondary/30 backdrop-blur-sm border border-white/10 group-hover:border-white/15 rounded-2xl p-8 text-center transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-blue/5 border border-brand-blue/20 flex items-center justify-center mx-auto mb-5">
                      <svg className="w-7 h-7 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Connect to Predict</h3>
                    <p className="text-sm text-silver-400 mb-6 leading-relaxed">Sign in with your wallet or email to submit a prediction.</p>
                    <button
                      onClick={login}
                      className="px-8 py-3.5 bg-gradient-to-r from-brand-blue to-brand-teal text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Predict */}
              {currentStep === 2 && (
                <div className="group relative">
                  {/* Card glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue/15 to-brand-teal/15 rounded-2xl blur-xl opacity-50"></div>
                  {/* Gradient border effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-brand-blue/20 via-white/10 to-brand-teal/20 rounded-2xl"></div>
                  <div className="relative bg-gradient-to-br from-background-secondary/80 to-background-secondary/60 backdrop-blur-sm rounded-2xl p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-1 h-12 bg-gradient-to-b from-brand-blue/60 to-brand-teal/30 rounded-full mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-white mb-1">Your Prediction</h3>
                      <p className="text-sm text-silver-400">Predict {nextMonday} LBMA Silver Price</p>
                    </div>

                    {/* Connected Status */}
                    <div className="mb-6 p-4 bg-brand-teal/15 border border-brand-teal/25 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-teal text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Connected
                        </div>
                        <span className="text-xs text-silver-400 font-mono">{displayAddress}</span>
                      </div>
                    </div>

                    {/* Price Input */}
                    <div className="mb-4">
                      <label className="block text-xs text-silver-400 mb-2 uppercase tracking-wider font-medium">Price Prediction (USD/oz)</label>
                      <div className="relative group/input">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-white/30">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={prediction}
                          onChange={(e) => setPrediction(e.target.value)}
                          placeholder={silverPrice.toFixed(2)}
                          className="w-full bg-background-primary/60 border border-white/10 rounded-xl pl-14 pr-4 py-5 text-3xl font-bold text-white text-center focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 focus:shadow-lg focus:shadow-brand-blue/10 transition-all duration-300 placeholder:text-white/15"
                        />
                      </div>
                    </div>

                    {/* Quick Adjust */}
                    <div className="flex gap-2 mb-4">
                      {[-1, -0.5, 0.5, 1].map((adj) => (
                        <button
                          key={adj}
                          onClick={() => { const current = parseFloat(prediction) || silverPrice; setPrediction((current + adj).toFixed(2)); }}
                          className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                            adj < 0
                              ? "bg-gradient-to-b from-silver-500/15 to-silver-500/5 text-silver-300 border border-silver-500/20 hover:border-silver-500/30 hover:from-silver-500/20 hover:to-silver-500/10 hover:shadow-sm"
                              : "bg-gradient-to-b from-brand-teal/15 to-brand-teal/5 text-brand-teal border border-brand-teal/20 hover:border-brand-teal/30 hover:from-brand-teal/25 hover:to-brand-teal/10 hover:shadow-sm hover:shadow-brand-teal/10"
                          }`}
                        >
                          {adj > 0 ? "+" : ""}{adj}
                        </button>
                      ))}
                    </div>

                    {/* Reasoning */}
                    <div className="mb-6">
                      <label className="block text-xs text-silver-400 mb-2 uppercase tracking-wider font-medium">
                        Your Reasoning <span className="text-brand-blue">*</span>
                      </label>
                      <textarea
                        value={reasoning}
                        onChange={(e) => setReasoning(e.target.value)}
                        placeholder="What's driving your prediction?"
                        className="w-full bg-background-primary/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300 placeholder:text-silver-400 resize-none h-24"
                        maxLength={200}
                        required
                      />
                      <div className="text-right text-xs text-silver-400 mt-1">{reasoning.length}/200</div>
                    </div>

                    {/* Community Follow */}
                    <div className="mb-6 p-4 bg-background-primary/40 border border-white/8 rounded-xl">
                      <p className="text-xs text-silver-400 mb-3 uppercase tracking-wider font-medium">Follow us to be eligible for rewards</p>
                      <div className="flex flex-wrap gap-2">
                        <a href="https://t.me/SilverTimesToken" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-brand-teal/12 to-brand-teal/5 border border-brand-teal/20 rounded-xl text-brand-teal text-sm font-medium hover:border-brand-teal/30 hover:shadow-sm hover:shadow-brand-teal/10 transition-all duration-300">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                          Telegram
                        </a>
                        <a href="https://x.com/SilvertimesSTT" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-white/8 to-white/3 border border-white/15 rounded-xl text-white text-sm font-medium hover:border-white/25 hover:shadow-sm transition-all duration-300">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                          Follow on X
                        </a>
                      </div>
                    </div>

                    {/* Error */}
                    {submitError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {submitError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !ready}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isSubmitting
                          ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-brand-blue to-brand-teal text-white shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 hover:scale-[1.01] active:scale-[0.99]"
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : existingPrediction ? "Update Prediction" : "Lock In Prediction"}
                    </button>

                    {/* Existing prediction notice */}
                    {existingPrediction && !submitSuccess && (
                      <div className="mt-4 p-3 bg-brand-blue/15 border border-brand-blue/25 rounded-xl text-center">
                        <span className="text-xs text-silver-400">Current prediction: </span>
                        <span className="text-sm text-brand-blue font-bold">${existingPrediction.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Profile Link */}
                    {authenticated && (
                      <Link to="/profile" className="mt-4 block text-center text-sm text-brand-blue hover:text-brand-teal transition-colors duration-300">
                        View My Profile & History
                      </Link>
                    )}

                    {/* Social handles suggestion */}
                    {authenticated && userSocials && !userSocials.twitterHandle && !userSocials.telegramHandle && (
                      <Link to="/profile" className="mt-4 block p-3 bg-gradient-to-r from-brand-blue/8 to-brand-teal/5 border border-brand-blue/25 rounded-xl hover:border-brand-blue/25 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-brand-blue/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-brand-blue font-medium">Add your social handles</p>
                            <p className="text-[10px] text-silver-300">Connect X or Telegram</p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {currentStep === 3 && (
                <div className="relative">
                  {/* Celebration glow */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-brand-teal/20 to-brand-blue/15 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-gradient-to-br from-brand-teal/12 to-brand-blue/8 backdrop-blur-sm border border-brand-teal/20 rounded-2xl p-8 text-center">
                    {/* Accent bar */}
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-teal/80 to-brand-blue/40 rounded-full mx-auto mb-5"></div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-teal/5 border border-brand-teal/25 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-teal/15">
                      <svg className="w-8 h-8 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Prediction Locked</h3>
                    <p className="text-4xl font-bold bg-gradient-to-r from-brand-teal to-brand-sky bg-clip-text text-transparent mb-2">${prediction}</p>
                    <p className="text-sm text-silver-400 mb-6">Good luck! Results announced Monday 12:00 PM.</p>

                    <div className="flex gap-3 justify-center mb-5">
                      <button
                        onClick={() => setShowShare(true)}
                        className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-teal text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 hover:scale-[1.02]"
                      >
                        Share Prediction
                      </button>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="px-6 py-3 bg-background-secondary/30 backdrop-blur-sm border border-white/10 text-silver-300 hover:text-white hover:border-white/20 rounded-xl transition-all duration-300"
                      >
                        Edit Prediction
                      </button>
                    </div>

                    <div className="flex gap-4 justify-center text-sm">
                      <button onClick={() => setPageTab("leaderboard")} className="text-brand-blue hover:text-brand-teal transition-colors duration-300">View Leaderboard</button>
                      <Link to="/profile" className="text-brand-blue hover:text-brand-teal transition-colors duration-300">My Profile</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <DynamicTimeline />
            </div>
          )}

          {/* ===== CHART TAB ===== */}
          {pageTab === "chart" && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-blue/60 to-brand-blue/20 rounded-full"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">LBMA Silver Price</h3>
                      <p className="text-xs text-silver-300">
                        {showMA20 || showMA50 || showRSI ? "Daily data with technical indicators" : "Weekly historical data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/15 border border-brand-blue/25 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse shadow-sm shadow-brand-blue/50"></div>
                    <span className="text-xs text-brand-blue font-medium">Live Feed</span>
                  </div>
                </div>

                {/* Indicators Toggle */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-xs text-silver-400 mr-2 uppercase tracking-wider font-medium">Indicators:</span>
                  <button onClick={() => setShowMA20(!showMA20)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${showMA20 ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30 shadow-sm shadow-brand-teal/10" : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5 hover:border-white/10"}`}>MA20</button>
                  <button onClick={() => setShowMA50(!showMA50)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${showMA50 ? "bg-brand-sky/20 text-brand-sky border border-brand-sky/30 shadow-sm shadow-brand-sky/10" : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5 hover:border-white/10"}`}>MA50</button>
                  <button onClick={() => setShowRSI(!showRSI)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${showRSI ? "bg-brand-blue/20 text-brand-blue border border-brand-blue/30 shadow-sm shadow-brand-blue/10" : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5 hover:border-white/10"}`}>RSI</button>
                </div>

                {/* Main Chart */}
                <div className="h-80 md:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enhancedChartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6596FE" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6596FE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "10px" }} tickLine={false} axisLine={false}
                        interval={showMA20 || showMA50 || showRSI ? 6 : "preserveStartEnd"}
                        tickFormatter={(value) => { const d = new Date(value); const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${d.getDate()} ${m[d.getMonth()]}`; }}
                      />
                      <YAxis orientation="right" stroke="#6b7280" style={{ fontSize: "10px" }} tickLine={false} axisLine={false} domain={yAxisDomain as any} tickFormatter={(v) => `$${v}`} width={50} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px" }}
                        formatter={(value: number, name: string) => {
                          if (name === "price") return [`$${value.toFixed(2)}/oz`, "Price"];
                          if (name === "ma20") return [`$${value.toFixed(2)}`, "MA20"];
                          if (name === "ma50") return [`$${value.toFixed(2)}`, "MA50"];
                          return [value, name];
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area type="monotone" dataKey="price" stroke="#6596FE" strokeWidth={2} fill="url(#silverGradient)" />
                      {showMA20 && <Line type="monotone" dataKey="ma20" stroke="#77D6E3" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />}
                      {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#90E0EF" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />}
                      <ReferenceLine y={silverPrice} stroke="#6596FE" strokeDasharray="5 5" label={{ value: "Current", fill: "#6596FE", fontSize: 10 }} />
                      {predictionHistogram.map((bucket, i) => {
                        const maxCount = Math.max(...predictionHistogram.map((b) => b.count));
                        const widthFraction = bucket.count / maxCount;
                        return (
                          <ReferenceArea key={`hist-${i}`} y1={bucket.priceMin} y2={bucket.priceMax}
                            fill="#77D6E3" fillOpacity={bucket.hasUserPrediction ? 0.6 : 0.25}
                            stroke="none" ifOverflow="hidden"
                            shape={(props: any) => {
                              const { x, y, width, height } = props;
                              if (!width || !height) return <rect />;
                              return <rect x={x + width - Math.max(width * 0.2 * widthFraction, 2)} y={y} width={Math.max(width * 0.2 * widthFraction, 2)} height={Math.max(Math.abs(height) - 1, 2)} fill="#77D6E3" fillOpacity={bucket.hasUserPrediction ? 0.6 : 0.25} rx={2} />;
                            }}
                          />
                        );
                      })}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* RSI Panel */}
                {showRSI && (
                  <div className="h-48 mt-2 border-t border-white/5 pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-silver-300">RSI (14)</span>
                      {currentRSI !== null && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentRSI > 70 ? "text-silver-300 bg-silver-300/10" : currentRSI < 30 ? "text-brand-teal bg-brand-teal/10" : "text-silver-400"}`}>
                          {currentRSI.toFixed(1)} {currentRSI > 70 ? "Overbought" : currentRSI < 30 ? "Oversold" : ""}
                        </span>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                      <ComposedChart data={enhancedChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "10px" }} tickLine={false} axisLine={false} interval={6}
                          tickFormatter={(value) => { const d = new Date(value); const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${d.getDate()} ${m[d.getMonth()]}`; }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[30, 50, 70]} />
                        <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px" }}
                          formatter={(value: number) => [value.toFixed(1), "RSI"]} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                        <Line type="monotone" dataKey="rsi" stroke="#6596FE" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
                        <ReferenceLine y={70} stroke="#A8A8A8" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <ReferenceLine y={30} stroke="#77D6E3" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" strokeOpacity={0.3} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex items-center justify-between text-xs text-silver-300 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>{isLoading ? "Loading..." : error ? "Using fallback data" : "Live data - Updates every 5 min"}</span>
                    <div className="flex items-center gap-3">
                      {chartPredictions.length > 0 && (
                        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-brand-teal opacity-40"></span>Predictions ({chartPredictions.length})</span>
                      )}
                      {showMA20 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-brand-teal"></span>MA20</span>}
                      {showMA50 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-brand-sky"></span>MA50</span>}
                      {showRSI && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-brand-blue"></span>RSI</span>}
                    </div>
                  </div>
                  <span className="text-brand-teal">{!error && !isLoading && "Connected"}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== LEADERBOARD TAB ===== */}
          {pageTab === "leaderboard" && (
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-sky/10 to-brand-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-sky/60 to-brand-sky/20 rounded-full"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                      <p className="text-xs text-silver-300">Top silver oracles</p>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-1.5 bg-brand-sky/8 border border-brand-sky/15 rounded-full">
                    <span className="text-xs font-medium text-brand-sky uppercase tracking-wider">Rankings</span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6">
                  <button onClick={() => setActiveTab("accuracy")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "accuracy" ? "bg-brand-blue/20 text-brand-blue border border-brand-blue/30 shadow-sm shadow-brand-blue/10" : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5 hover:border-white/10"}`}>
                    Most Accurate
                  </button>
                  <button onClick={() => setActiveTab("weekly")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "weekly" ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30 shadow-sm shadow-brand-teal/10" : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5 hover:border-white/10"}`}>
                    Weekly Winners
                  </button>
                </div>

                {/* Week Selector */}
                {activeTab === "weekly" && (
                  <div className="mb-4 relative">
                    <button
                      onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
                      onBlur={() => setTimeout(() => setWeekDropdownOpen(false), 150)}
                      className="flex items-center justify-between gap-3 bg-background-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:border-white/20 focus:outline-none focus:border-brand-teal/30 focus:ring-2 focus:ring-brand-teal/10 transition-all duration-300 min-w-[280px]"
                    >
                      <span>{selectedWeek ? formatWeekDateRange(selectedWeek) : "No completed rounds yet"}</span>
                      <svg className={`w-4 h-4 text-silver-400 transition-transform duration-200 ${weekDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {weekDropdownOpen && completedRounds.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-background-secondary border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto">
                          {completedRounds.map((round) => (
                            <button
                              key={round.weekIdentifier}
                              onClick={() => { setSelectedWeek(round.weekIdentifier); setWeekDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                                selectedWeek === round.weekIdentifier
                                  ? "bg-brand-teal/15 text-brand-teal"
                                  : "text-silver-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {formatWeekDateRange(round.weekIdentifier)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Table */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs text-silver-400 font-medium uppercase tracking-wider sticky top-0 bg-background-secondary/90 backdrop-blur-sm rounded-xl border border-white/5">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Oracle</div>
                    <div className="col-span-2 text-right">{activeTab === "accuracy" ? "Avg Error" : "Prediction"}</div>
                    <div className="col-span-2 text-center">Streak</div>
                    <div className="col-span-2 text-right">Last Guess</div>
                    <div className="col-span-2 text-right">Tier</div>
                  </div>

                  {activeTab === "accuracy" && (
                    leaderboardLoading ? <div className="text-center py-8 text-silver-300">Loading...</div> :
                    accuracyLeaders.length === 0 ? <div className="text-center py-8 text-silver-300">No predictions yet</div> :
                    accuracyLeaders.map((leader, index) => {
                      const rank = index + 1;
                      const tier = getTier(rank);
                      const tierColor = rank === 1 ? "text-brand-sky" : rank === 2 ? "text-silver-300" : rank === 3 ? "text-silver-400" : rank <= 10 ? "text-brand-blue" : rank <= 20 ? "text-brand-teal" : "text-silver-400";
                      const streak = leader.currentStreak || 0;
                      return (
                        <div key={leader._id} className={`grid grid-cols-12 gap-2 px-4 py-3.5 rounded-xl border transition-all duration-300 ${
                          rank === 1
                            ? "bg-gradient-to-r from-brand-sky/8 to-brand-blue/5 border-brand-sky/15 hover:border-brand-sky/30 shadow-sm shadow-brand-sky/5"
                            : rank === 2
                              ? "bg-gradient-to-r from-silver-300/5 to-transparent border-white/8 hover:border-silver-300/20"
                              : rank === 3
                                ? "bg-gradient-to-r from-silver-400/5 to-transparent border-white/8 hover:border-silver-400/20"
                                : "bg-background-primary/30 border-white/5 hover:border-brand-blue/20 hover:bg-background-primary/40"
                        }`}>
                          <div className="col-span-1 flex items-center">
                            <span className={`text-sm font-bold ${rank <= 3 ? (rank === 1 ? "text-brand-sky" : rank === 2 ? "text-silver-300" : "text-silver-400") : "text-silver-300"}`}>
                              {rank <= 3 ? (
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                  rank === 1 ? "bg-brand-sky/15 border border-brand-sky/25" : rank === 2 ? "bg-silver-300/10 border border-silver-300/20" : "bg-silver-400/10 border border-silver-400/15"
                                }`}>#{rank}</span>
                              ) : rank}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-center"><span className="text-sm text-white font-mono truncate">{formatAddress(leader)}</span></div>
                          <div className="col-span-2 flex items-center justify-end"><span className="text-sm text-brand-blue font-medium">+/-${leader.avgError?.toFixed(2) || "-"}</span></div>
                          <div className="col-span-2 flex items-center justify-center">
                            {streak > 0 ? <span className="text-sm text-brand-teal font-medium">{streak}x</span> : <span className="text-sm text-silver-400">-</span>}
                          </div>
                          <div className="col-span-2 flex items-center justify-end"><span className="text-sm text-silver-400">{leader.lastPredictedPrice ? `$${leader.lastPredictedPrice.toFixed(2)}` : "-"}</span></div>
                          <div className="col-span-2 flex items-center justify-end">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tierColor} ${
                              tier === "Gold" ? "bg-brand-sky/10 border border-brand-sky/15" : tier === "Silver" ? "bg-silver-300/10 border border-silver-300/15" : tier === "Bronze" ? "bg-silver-400/10 border border-silver-400/10" : tier === "Tier 1" ? "bg-brand-blue/10 border border-brand-blue/25" : tier === "Tier 2" ? "bg-brand-teal/10 border border-brand-teal/25" : "bg-white/5"
                            }`}>{tier}</span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {activeTab === "weekly" && (
                    completedRounds.length === 0 ? <div className="text-center py-8 text-silver-300">No completed rounds yet</div> :
                    weeklyWinners.length === 0 ? <div className="text-center py-8 text-silver-300">No winners for this round</div> :
                    weeklyWinners.map((winner) => {
                      const rank = winner.rank || 0;
                      const tier = getTier(rank);
                      return (
                        <div key={winner._id} className={`grid grid-cols-12 gap-2 px-4 py-3.5 rounded-xl border transition-all duration-300 ${
                          rank === 1
                            ? "bg-gradient-to-r from-brand-sky/8 to-brand-teal/5 border-brand-sky/15 hover:border-brand-sky/30 shadow-sm shadow-brand-sky/5"
                            : rank === 2
                              ? "bg-gradient-to-r from-silver-300/5 to-transparent border-white/8 hover:border-silver-300/20"
                              : rank === 3
                                ? "bg-gradient-to-r from-silver-400/5 to-transparent border-white/8 hover:border-silver-400/20"
                                : "bg-background-primary/30 border-white/5 hover:border-brand-teal/20 hover:bg-background-primary/40"
                        }`}>
                          <div className="col-span-1 flex items-center">
                            <span className={`text-sm font-bold ${rank <= 3 ? (rank === 1 ? "text-brand-sky" : rank === 2 ? "text-silver-300" : "text-silver-400") : "text-silver-300"}`}>
                              {rank <= 3 ? (
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                  rank === 1 ? "bg-brand-sky/15 border border-brand-sky/25" : rank === 2 ? "bg-silver-300/10 border border-silver-300/20" : "bg-silver-400/10 border border-silver-400/15"
                                }`}>#{rank}</span>
                              ) : rank}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-center"><span className="text-sm text-white font-mono truncate">{winner.userId ? formatAddress(winner.userId) : "Anonymous"}</span></div>
                          <div className="col-span-2 flex items-center justify-end"><span className="text-sm text-brand-teal font-medium">${winner.predictedPrice.toFixed(2)}</span></div>
                          <div className="col-span-2 flex items-center justify-center"><span className="text-sm text-silver-400">-</span></div>
                          <div className="col-span-2 flex items-center justify-end"><span className="text-sm text-silver-400">-</span></div>
                          <div className="col-span-2 flex items-center justify-end">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              tier === "Gold" ? "text-brand-sky bg-brand-sky/10 border border-brand-sky/15" : tier === "Silver" ? "text-silver-300 bg-silver-300/10 border border-silver-300/15" : tier === "Bronze" ? "text-silver-400 bg-silver-400/10 border border-silver-400/10" : tier === "Tier 1" ? "text-brand-blue bg-brand-blue/10 border border-brand-blue/25" : "text-brand-teal bg-brand-teal/10 border border-brand-teal/25"
                            }`}>{tier}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== RULES & PRIZES TAB ===== */}
          {pageTab === "rules" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* How It Works */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-blue/60 to-brand-blue/20 rounded-full"></div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-brand-blue/15 border border-brand-blue/25 rounded-full mb-2">
                        <span className="text-[10px] font-medium text-brand-blue uppercase tracking-wider">Guide</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">How It Works</h3>
                    </div>
                  </div>
                  <div className="space-y-5 text-sm text-silver-300">
                    <div className="flex items-start gap-4 group/item">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 text-brand-blue text-xs font-bold flex items-center justify-center flex-shrink-0 border border-brand-blue/20 group-hover/item:shadow-sm group-hover/item:shadow-brand-blue/10 transition-all duration-300">1</span>
                      <span className="pt-1">Submit your prediction Mon 12:00 PM - Sat 11:59 PM (London time)</span>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 text-brand-blue text-xs font-bold flex items-center justify-center flex-shrink-0 border border-brand-blue/20 group-hover/item:shadow-sm group-hover/item:shadow-brand-blue/10 transition-all duration-300">2</span>
                      <span className="pt-1">Results locked Monday 12:00 PM using LBMA silver fixing (USD/oz)</span>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 text-brand-blue text-xs font-bold flex items-center justify-center flex-shrink-0 border border-brand-blue/20 group-hover/item:shadow-sm group-hover/item:shadow-brand-blue/10 transition-all duration-300">3</span>
                      <span className="pt-1">Ranked by absolute error. Ties broken by earliest submission.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prizes */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-teal/15 to-brand-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="relative bg-gradient-to-br from-brand-teal/8 to-brand-blue/5 backdrop-blur-sm border border-brand-teal/25 group-hover:border-brand-teal/25 rounded-2xl p-6 md:p-8 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-teal/60 to-brand-teal/20 rounded-full"></div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-brand-teal/15 border border-brand-teal/25 rounded-full mb-2">
                        <span className="text-[10px] font-medium text-brand-teal uppercase tracking-wider">Rewards</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Prizes & Rewards</h3>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-silver-300">
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <span className="text-brand-sky font-bold">1st Place</span>
                      <span className="text-white font-semibold">20 USDT</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <span className="text-brand-sky font-bold">2nd Place</span>
                      <span className="text-white font-semibold">15 USDT</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <span className="text-brand-sky font-bold">3rd Place</span>
                      <span className="text-white font-semibold">10 USDT</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <div>
                        <span className="text-brand-teal font-bold">4th - 10th Place</span>
                        <span className="text-xs text-silver-400 ml-2">(7 winners)</span>
                      </div>
                      <span className="text-white font-semibold">5 USDT each</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <div>
                        <span className="text-brand-teal font-bold">11th - 20th Place</span>
                        <span className="text-xs text-silver-400 ml-2">(10 winners)</span>
                      </div>
                      <span className="text-white font-semibold">2 USDT each</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-silver-400 font-medium">Total Weekly Prize Pool</span>
                      <span className="text-brand-teal font-bold">100 USDT</span>
                    </div>
                    <div className="flex items-start gap-4 p-3 bg-background-primary/30 rounded-xl border border-white/5">
                      <span className="text-brand-teal font-bold w-16 flex-shrink-0">All</span>
                      <span>"Silver Times Contributor" NFT badge (POAP)</span>
                    </div>
                    <p className="text-xs text-silver-300 pt-3 border-t border-white/5">
                      Rewards distributed Q2 2026 when STT is minted. Check winnings in your{" "}
                      <Link to="/profile" className="text-brand-blue hover:text-brand-teal transition-colors duration-300">profile</Link>.{" "}
                      <Link to="/rewards-terms" className="text-brand-blue hover:text-brand-teal transition-colors duration-300">Full T&C</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue/10 to-brand-sky/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-blue/60 to-brand-blue/20 rounded-full"></div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-brand-blue/15 border border-brand-blue/25 rounded-full mb-2">
                        <span className="text-[10px] font-medium text-brand-blue uppercase tracking-wider">Requirements</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Eligibility</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-silver-300">
                    <p>To receive rewards, you must:</p>
                    <ul className="space-y-2 pl-4 list-disc list-inside text-silver-400">
                      <li>Connect an EVM wallet (one submission per wallet per round)</li>
                      <li>Join <a href="https://t.me/SilverTimesToken" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-teal transition-colors duration-300">Telegram</a></li>
                      <li>Follow <a href="https://x.com/SilvertimesSTT" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-brand-teal transition-colors duration-300">@SilvertimesSTT</a> on X</li>
                    </ul>
                    <p className="text-xs text-silver-300 italic pt-2">Silver Times may verify eligibility at any time.</p>
                  </div>
                </div>
              </div>

              {/* Data & Fairness */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-teal/10 to-brand-sky/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="relative bg-background-secondary/30 backdrop-blur-sm border border-white/5 group-hover:border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-12 bg-gradient-to-b from-brand-teal/60 to-brand-teal/20 rounded-full"></div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-brand-teal/15 border border-brand-teal/25 rounded-full mb-2">
                        <span className="text-[10px] font-medium text-brand-teal uppercase tracking-wider">Transparency</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Data & Fairness</h3>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-silver-300">
                    <p><strong className="text-white">Source:</strong> Licensed LBMA feeds. Rounds voided if benchmark unavailable.</p>
                    <p><strong className="text-white">Compliance:</strong> Physical deliveries may require KYC and regional restrictions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PROFILE TAB ===== */}
          {pageTab === "profile" && authenticated && (
            <Suspense fallback={<div className="text-center py-16 text-silver-300">Loading profile...</div>}>
              <ProfileContent />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
