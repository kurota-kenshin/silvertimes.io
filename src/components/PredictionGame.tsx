import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
  AccuracyLeader,
  WeeklyWinner,
  RoundInfo,
  UserStats,
  Badge,
  ChartPrediction,
  RecentWinners,
} from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8182";

// Calculate Simple Moving Average
function calculateSMA(
  data: { price: number }[],
  period: number,
): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, d) => acc + d.price, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(
  data: { price: number }[],
  period = 14,
): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }

    const change = data[i].price - data[i - 1].price;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      }
    }
  }
  return result;
}

// Helper to format address/email for display
const formatAddress = (user: { walletAddress?: string; email?: string }) => {
  if (user.walletAddress) {
    return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(
      -4,
    )}`;
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

// Countdown timer hook
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Silver Rain / Confetti celebration component
const SilverRainCelebration = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate silver particles
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 16,
      rotation: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-silver-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div
            className="rounded-full bg-gradient-to-br from-silver-200 via-silver-300 to-silver-400 shadow-lg"
            style={{
              width: particle.size,
              height: particle.size,
              transform: `rotate(${particle.rotation}deg)`,
              boxShadow: "0 0 10px rgba(192, 192, 192, 0.5)",
            }}
          />
        </div>
      ))}
      {/* Center celebration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-bounce-in">
          <div className="text-2xl font-bold text-white mb-2">
            Prediction Locked
          </div>
          <div className="text-silver-400">Good luck, Oracle</div>
        </div>
      </div>
    </div>
  );
};

// Minting animation component
const MintingAnimation = ({
  price,
  onComplete,
}: {
  price: string;
  onComplete: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Spinning coin */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-silver-300 to-silver-500 animate-spin-slow shadow-2xl shadow-silver-500/30">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-silver-200 to-silver-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-background-primary">
                ${price}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xl font-bold text-white mb-2">
          Minting Your Prediction
        </p>
        <p className="text-silver-400 text-sm">
          Locking in your oracle forecast...
        </p>
        <div className="mt-4 flex justify-center gap-1">
          <div
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Share overlay component
const ShareOverlay = ({
  price,
  onClose,
  userName,
  onShare,
}: {
  price: string;
  onClose: () => void;
  userName: string;
  onShare: () => void;
}) => {
  const shareText = `I just predicted Silver at $${price} on SilverTimes. Think you can beat me? 🥈`;
  const shareUrl = "https://silvertimes.io/prediction";

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText,
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl,
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        onShare(); // Track share
        return;
    }
    if (url) {
      window.open(url, "_blank");
      onShare(); // Track share
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background-secondary border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Share Card Preview */}
        <div className="bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-xs text-silver-500 uppercase tracking-wider mb-2">
              My Prediction
            </div>
            <div className="text-4xl font-bold text-white mb-2">${price}</div>
            <div className="text-sm text-silver-400">Silver Price Forecast</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-blue-400">
                {userName} on SilverTimes
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-white font-semibold mb-4">
          Share Your Prediction
        </p>

        {/* Share buttons */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => handleShare("twitter")}
            className="flex items-center gap-2 px-4 py-3 bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-xl text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-medium">X</span>
          </button>
          <button
            onClick={() => handleShare("telegram")}
            className="flex items-center gap-2 px-4 py-3 bg-[#0088cc]/20 border border-[#0088cc]/30 rounded-xl text-[#0088cc] hover:bg-[#0088cc]/30 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span className="text-sm font-medium">Telegram</span>
          </button>
          <button
            onClick={() => handleShare("copy")}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium">Copy</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-background-primary/50 border border-white/10 rounded-xl text-silver-400 hover:text-white transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Sentiment Gauge Component
const SentimentGauge = ({
  avgPrediction,
  currentPrice,
}: {
  avgPrediction: number | null;
  currentPrice: number;
}) => {
  const sentiment = useMemo(() => {
    if (!avgPrediction)
      return { label: "Neutral", color: "text-silver-400", angle: 0 };
    const diff = ((avgPrediction - currentPrice) / currentPrice) * 100;
    if (diff > 3)
      return { label: "Very Bullish", color: "text-emerald-400", angle: 70 };
    if (diff > 1)
      return { label: "Bullish", color: "text-emerald-300", angle: 40 };
    if (diff < -3)
      return { label: "Very Bearish", color: "text-rose-400", angle: -70 };
    if (diff < -1)
      return { label: "Bearish", color: "text-rose-300", angle: -40 };
    return { label: "Neutral", color: "text-silver-400", angle: 0 };
  }, [avgPrediction, currentPrice]);

  return (
    <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      <div className="text-xs text-silver-500 uppercase tracking-wider mb-3">
        Community Sentiment
      </div>

      {/* Gauge visualization */}
      <div className="relative h-16 mb-4">
        <div className="absolute inset-x-0 bottom-0 h-8 overflow-hidden">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-4 border-gradient rounded-t-full"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          ></div>
        </div>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-700"
          style={{
            transform: `translateX(-50%) rotate(${sentiment.angle}deg)`,
          }}
        >
          <div className="w-0.5 h-12 bg-gradient-to-t from-white to-white/50 rounded-full"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg"></div>
        </div>
        {/* Labels */}
        <div className="absolute bottom-0 left-2 text-xs text-rose-400">
          Bearish
        </div>
        <div className="absolute bottom-0 right-2 text-xs text-emerald-400">
          Bullish
        </div>
      </div>

      <div className="text-center">
        <span className={`text-lg font-bold ${sentiment.color}`}>
          {sentiment.label}
        </span>
        {avgPrediction && (
          <div className="text-xs text-silver-500 mt-1">
            Avg. Prediction:{" "}
            <span className="text-white">${avgPrediction.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Dynamic Timeline Component
// Shows: Open → Closed → Results/Open (spans ~10 days for full cycle visibility)
const DynamicTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for smooth animation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const now = currentTime;
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Get this week's Monday at 12:00 PM
    const thisMonday = new Date(now);
    const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    thisMonday.setDate(now.getDate() + daysFromMonday);
    thisMonday.setHours(12, 0, 0, 0);

    // This week's Thursday 23:59 (submission deadline)
    const thisThursday = new Date(thisMonday);
    thisThursday.setDate(thisMonday.getDate() + 3);
    thisThursday.setHours(23, 59, 59, 999);

    // Next Monday 12:00 PM (results + new round opens)
    const nextMonday = new Date(thisMonday);
    nextMonday.setDate(thisMonday.getDate() + 7);
    nextMonday.setHours(12, 0, 0, 0);

    // Next Thursday 23:59 (next submission deadline)
    const nextThursday = new Date(nextMonday);
    nextThursday.setDate(nextMonday.getDate() + 3);
    nextThursday.setHours(23, 59, 59, 999);

    // Timeline spans from this Monday to next Thursday (10.5 days)
    const timelineStart = thisMonday;
    const timelineEnd = nextThursday;
    const totalSpan = timelineEnd.getTime() - timelineStart.getTime();

    // Key positions as percentages
    const thisThursdayPercent =
      ((thisThursday.getTime() - timelineStart.getTime()) / totalSpan) * 100;
    const nextMondayPercent =
      ((nextMonday.getTime() - timelineStart.getTime()) / totalSpan) * 100;

    // Current position as percentage
    const elapsed = now.getTime() - timelineStart.getTime();
    const progressPercent = Math.max(
      0,
      Math.min(100, (elapsed / totalSpan) * 100),
    );

    // Is submission currently open?
    const isSubmissionOpen =
      (now >= thisMonday && now <= thisThursday) ||
      (now >= nextMonday && now <= nextThursday);

    // Generate day markers
    const dayMarkers: {
      label: string;
      date: number;
      position: number;
      isOpen: boolean;
      isResultDay: boolean;
      isDeadline: boolean;
    }[] = [];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i <= 10; i++) {
      const date = new Date(thisMonday);
      date.setDate(thisMonday.getDate() + i);
      const dayIndex = (1 + i) % 7; // Monday = 1
      const actualDayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to 0-indexed Mon-Sun

      const position =
        ((date.getTime() - timelineStart.getTime()) / totalSpan) * 100;

      // Determine if this day is in an open period
      const isOpen =
        (i >= 0 && i <= 3) || // Mon-Thu of this week
        (i >= 7 && i <= 10); // Mon-Thu of next week

      // Is this a result/new round day (Monday)?
      const isResultDay = i === 7;

      // Is this the deadline day (Thursday)?
      const isDeadline = i === 3;

      if (position >= 0 && position <= 100) {
        dayMarkers.push({
          label: days[actualDayIndex],
          date: date.getDate(),
          position,
          isOpen,
          isResultDay,
          isDeadline,
        });
      }
    }

    return {
      progressPercent,
      thisThursdayPercent,
      nextMondayPercent,
      isSubmissionOpen,
      dayMarkers,
      thisMonday,
      thisThursday,
      nextMonday,
      nextThursday,
    };
  }, [currentTime]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-8 bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              timelineData.isSubmissionOpen
                ? "bg-emerald-400 animate-pulse"
                : "bg-rose-400"
            }`}
          ></div>
          <span className="text-sm font-medium text-white">
            {timelineData.isSubmissionOpen
              ? "Submissions Open"
              : "Submissions Closed - Awaiting Results"}
          </span>
        </div>
        <span className="text-xs text-silver-500">
          {formatDate(timelineData.thisMonday)} -{" "}
          {formatDate(timelineData.nextThursday)}
        </span>
      </div>

      {/* Timeline Bar */}
      <div className="relative h-3 mb-2">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-background-primary/60 border border-white/5"></div>

        {/* This week: Open period (Mon-Thu) */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/50"
          style={{ width: `${timelineData.thisThursdayPercent}%` }}
        ></div>

        {/* Closed period (Fri-Sun) */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-rose-500/30 to-rose-400/20"
          style={{
            left: `${timelineData.thisThursdayPercent}%`,
            width: `${timelineData.nextMondayPercent - timelineData.thisThursdayPercent}%`,
          }}
        ></div>

        {/* Next week: Open period (Mon-Thu) */}
        <div
          className="absolute top-0 h-full rounded-r-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/50"
          style={{
            left: `${timelineData.nextMondayPercent}%`,
            width: `${100 - timelineData.nextMondayPercent}%`,
          }}
        ></div>

        {/* Thursday deadline marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `${timelineData.thisThursdayPercent}%` }}
        >
          <div className="w-0.5 h-5 -ml-px bg-gradient-to-b from-yellow-400 to-yellow-400/20"></div>
        </div>

        {/* Next Monday - Results Day marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `${timelineData.nextMondayPercent}%` }}
        >
          <div className="w-0.5 h-5 -ml-px bg-gradient-to-b from-blue-400 to-blue-400/20"></div>
        </div>

        {/* Current position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000"
          style={{ left: `${timelineData.progressPercent}%` }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-white/20 rounded-full blur-md"></div>
          {/* Marker */}
          <div className="relative w-4 h-4 -ml-2 bg-white rounded-full border-2 border-blue-400 shadow-lg shadow-blue-500/30"></div>
          {/* "Now" label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-medium text-blue-400 bg-background-secondary/90 px-1.5 py-0.5 rounded border border-blue-400/30">
              Now
            </span>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="relative h-10 mt-4">
        {timelineData.dayMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute -translate-x-1/2 text-center"
            style={{ left: `${marker.position}%` }}
          >
            {/* Special label for Deadline/Results */}
            {(marker.isDeadline || marker.isResultDay) && (
              <div
                className={`text-[8px] font-medium mb-0.5 ${
                  marker.isDeadline ? "text-yellow-400" : "text-blue-400"
                }`}
              >
                {marker.isDeadline ? "Deadline" : "Results"}
              </div>
            )}
            <div
              className={`text-[10px] font-medium ${
                marker.isResultDay
                  ? "text-blue-400"
                  : marker.isDeadline
                    ? "text-yellow-400"
                    : marker.isOpen
                      ? "text-emerald-400/80"
                      : "text-silver-500"
              }`}
            >
              {marker.label}
            </div>
            <div className="text-[9px] text-silver-600">{marker.date}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 pt-3 border-t border-white/5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-emerald-500/60 to-emerald-400/50"></div>
          <span className="text-[10px] text-silver-400">Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-rose-500/30 to-rose-400/20"></div>
          <span className="text-[10px] text-silver-400">Closed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-yellow-400"></div>
          <span className="text-[10px] text-silver-400">
            Deadline (Thu 23:59)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-blue-400"></div>
          <span className="text-[10px] text-silver-400">
            Results (Mon 12:00)
          </span>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<number | null>(
    null,
  );
  const [showMinting, setShowMinting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [avgPrediction, setAvgPrediction] = useState<number | null>(null);

  // Technical indicators state
  const [dailyPriceData, setDailyPriceData] = useState<
    { date: string; price: number }[]
  >([]);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Leaderboard data
  const [accuracyLeaders, setAccuracyLeaders] = useState<AccuracyLeader[]>([]);
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [completedRounds, setCompletedRounds] = useState<RoundInfo[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundInfo | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // User stats for personal stats bar
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Chart predictions (dots showing what people predicted)
  const [chartPredictions, setChartPredictions] = useState<ChartPrediction[]>(
    [],
  );

  // Recent winners for announcement
  const [recentWinners, setRecentWinners] = useState<RecentWinners | null>(
    null,
  );

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

  // Calculate next Thursday deadline (11:59 PM London time)
  const nextDeadline = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    let daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    if (daysUntilThursday === 0 && now.getHours() >= 23) {
      daysUntilThursday = 7;
    }
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + daysUntilThursday);
    thursday.setHours(23, 59, 0, 0);
    return thursday;
  }, []);

  const countdown = useCountdown(nextDeadline);

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch daily price data for technical indicators
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const response = await fetch(`${API_URL}/price/silver/daily?days=90`);
        if (response.ok) {
          const data = await response.json();
          if (data.dailyData) {
            setDailyPriceData(data.dailyData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily price data:", err);
      }
    };
    fetchDailyData();
  }, []);

  // Fetch user's existing prediction and stats when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          if (token) {
            // Fetch prediction and stats in parallel
            const [predictionRes, statsRes] = await Promise.all([
              predictionsApi.getMyPrediction(token),
              predictionsApi.getMyStats(token),
            ]);

            if (predictionRes.prediction) {
              setExistingPrediction(predictionRes.prediction.predictedPrice);
              setPrediction(predictionRes.prediction.predictedPrice.toString());
            }

            if (statsRes.stats) {
              setUserStats(statsRes.stats);
            }
          }
        } catch {
          // No existing prediction or stats
        }
      } else {
        setExistingPrediction(null);
        setPrediction("");
        setUserStats(null);
      }
    };
    fetchUserData();
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
    setShowMinting(true);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      await predictionsApi.submit(token, priceValue);
      setSubmitSuccess(true);
      setExistingPrediction(priceValue);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit prediction");
      setShowMinting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMintingComplete = useCallback(() => {
    setShowMinting(false);
    if (submitSuccess) {
      setShowCelebration(true);
    }
  }, [submitSuccess]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setShowShare(true);
  }, []);

  // Get display address for logged in user
  const displayAddress = useMemo(() => {
    if (!user) return null;
    if (user.wallet?.address) {
      const addr = user.wallet.address;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    if (user.email?.address) return user.email.address;
    return "Connected";
  }, [user]);

  // Fetch leaderboard data, current round info, and recent winners
  // Refresh every 5 minutes (synced with price updates)
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLeaderboardLoading(true);
      try {
        const [accuracyRes, roundsRes, currentRoundRes, recentWinnersRes] =
          await Promise.all([
            predictionsApi.getLeaderboard("accuracy"),
            predictionsApi.getCompletedRounds(10),
            predictionsApi.getCurrentRound(),
            predictionsApi.getRecentWinners(),
          ]);

        setAccuracyLeaders(accuracyRes.leaders as AccuracyLeader[]);
        setCompletedRounds(roundsRes.rounds);
        setCurrentRound(currentRoundRes.round);
        setRecentWinners(recentWinnersRes.winners);

        // Calculate average prediction from current round data if available
        if (currentRoundRes.round?.avgPrediction) {
          setAvgPrediction(currentRoundRes.round.avgPrediction);
        }

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
    // Refresh every 5 minutes (synced with price updates)
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch predictions for chart - refresh every 10 seconds for live updates
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await predictionsApi.getRoundPredictions();
        setChartPredictions(res.predictions);
      } catch (err) {
        console.error("Failed to fetch predictions:", err);
      }
    };

    fetchPredictions();
    // Refresh every 10 seconds for exciting live updates
    const interval = setInterval(fetchPredictions, 10 * 1000);
    return () => clearInterval(interval);
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

    if (activeTab === "weekly") fetchWeeklyWinners();
  }, [selectedWeek, activeTab]);

  // Enhanced chart data with technical indicators
  const enhancedChartData = useMemo(() => {
    // Use daily data if available and indicators are enabled
    if (dailyPriceData.length > 0 && (showMA20 || showMA50 || showRSI)) {
      // Calculate indicators on full dataset first (includes extra days for MA50)
      const ma20Values = calculateSMA(dailyPriceData, 20);
      const ma50Values = calculateSMA(dailyPriceData, 50);
      const rsiValues = calculateRSI(dailyPriceData, 14);

      // Map indicators to full dataset
      const fullData = dailyPriceData.map((item, index) => ({
        ...item,
        ma20: showMA20 ? ma20Values[index] : undefined,
        ma50: showMA50 ? ma50Values[index] : undefined,
        rsi: showRSI ? rsiValues[index] : undefined,
      }));

      // Only display the last 90 days (indicators calculated on full data)
      return fullData.slice(-90);
    }

    // Otherwise use weekly data
    return lbmaSilverData.map((item) => ({
      ...item,
    }));
  }, [lbmaSilverData, dailyPriceData, showMA20, showMA50, showRSI]);

  // Get current RSI value for display
  const currentRSI = useMemo(() => {
    if (!showRSI || dailyPriceData.length === 0) return null;
    const rsiValues = calculateRSI(dailyPriceData, 14);
    const lastRSI = rsiValues[rsiValues.length - 1];
    return lastRSI;
  }, [dailyPriceData, showRSI]);

  // Prepare prediction dots data for the chart
  // Each prediction gets plotted at today's date with its predicted price
  const predictionDotsData = useMemo(() => {
    if (chartPredictions.length === 0) return [];
    const today = new Date().toISOString().split("T")[0];
    // Add small random X offset to prevent exact overlap, but keep them clustered
    return chartPredictions.map((p) => ({
      date: today,
      predictedPrice: p.price,
      // Small visual offset for scatter effect (±2 days visual spread)
      xOffset: (Math.random() - 0.5) * 4,
      isUserPrediction: existingPrediction === p.price,
    }));
  }, [chartPredictions, existingPrediction]);

  // Build histogram buckets for Volume Profile-style display
  const predictionHistogram = useMemo(() => {
    if (chartPredictions.length === 0) return [];
    const prices = chartPredictions.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    // Use ~20 buckets, minimum bucket size of $0.25
    const bucketSize = Math.max(0.25, range / 20);
    const bucketStart = Math.floor(min / bucketSize) * bucketSize;
    const bucketEnd = Math.ceil(max / bucketSize) * bucketSize;
    const buckets: {
      priceMin: number;
      priceMax: number;
      priceMid: number;
      count: number;
      hasUserPrediction: boolean;
    }[] = [];
    for (let b = bucketStart; b < bucketEnd; b += bucketSize) {
      const bMin = b;
      const bMax = b + bucketSize;
      const matching = prices.filter((p) => p >= bMin && p < bMax);
      const hasUser =
        existingPrediction !== null &&
        existingPrediction >= bMin &&
        existingPrediction < bMax;
      if (matching.length > 0) {
        buckets.push({
          priceMin: bMin,
          priceMax: bMax,
          priceMid: (bMin + bMax) / 2,
          count: matching.length,
          hasUserPrediction: hasUser,
        });
      }
    }
    return buckets;
  }, [chartPredictions, existingPrediction]);

  const silverPrice = currentPrice ?? 73.5;

  return (
    <section className="relative bg-background-primary min-h-screen overflow-hidden">
      {/* Minting Animation */}
      {showMinting && (
        <MintingAnimation
          price={prediction}
          onComplete={handleMintingComplete}
        />
      )}

      {/* Silver Rain Celebration */}
      {showCelebration && (
        <SilverRainCelebration onComplete={handleCelebrationComplete} />
      )}

      {/* Share Overlay */}
      {showShare && (
        <ShareOverlay
          price={prediction}
          onClose={() => setShowShare(false)}
          userName={displayAddress || "Anonymous"}
          onShare={async () => {
            try {
              const token = await getAccessToken();
              if (token) {
                await predictionsApi.trackShare(token);
              }
            } catch {
              // Silently fail share tracking
            }
          }}
        />
      )}

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* ===== HERO SECTION - The Oracle Header ===== */}
      <div className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent uppercase tracking-wider">
                The Silver Oracle
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Predict the Monday Price.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Earn Status. Win $STT.
              </span>
            </h1>
            <p className="text-base text-silver-400 max-w-2xl mx-auto">
              Join the community of silver oracles. Submit your prediction
              before Thursday 11:59 PM. Results locked Monday 12:00 PM using
              LBMA oracles.
            </p>
          </div>

          {/* Hero Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Live Price */}
            <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-silver-500 uppercase tracking-wider">
                  Current Spot Price
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLoading
                      ? "bg-yellow-500 animate-pulse"
                      : error
                        ? "bg-red-500"
                        : "bg-emerald-500 animate-pulse"
                  }`}
                ></div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                ${silverPrice.toFixed(2)}
              </div>
              <div className="text-xs text-silver-500 mt-1">USD/oz LBMA</div>
            </div>

            {/* Countdown */}
            <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="text-xs text-silver-500 uppercase tracking-wider mb-2">
                Prediction Lock-in
              </div>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-2xl md:text-3xl font-bold">
                  {String(countdown.days).padStart(2, "0")}
                </span>
                <span className="text-silver-500 text-sm">d</span>
                <span className="text-xl md:text-2xl font-bold ml-1">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-silver-500 text-sm">h</span>
                <span className="text-xl md:text-2xl font-bold ml-1">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-silver-500 text-sm">m</span>
              </div>
              <div className="text-xs text-silver-500 mt-1">
                Until Thursday 23:59 UTC
              </div>
            </div>

            {/* Participants */}
            <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="text-xs text-silver-500 uppercase tracking-wider mb-2">
                This Week's Oracles
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {currentRound?.totalParticipants || 0}
              </div>
              <div className="text-xs text-silver-500 mt-1">
                Predictions submitted
              </div>
            </div>

            {/* Sentiment Gauge */}
            <SentimentGauge
              avgPrediction={avgPrediction}
              currentPrice={silverPrice}
            />
          </div>

          {/* Dynamic Timeline */}
          <DynamicTimeline />
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="relative z-10 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* ===== LEFT: ANALYSIS ZONE (3 cols) ===== */}
            <div className="lg:col-span-3 space-y-6">
              {/* Interactive Chart */}
              <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      LBMA Silver Price
                    </h3>
                    <p className="text-xs text-silver-500">
                      {showMA20 || showMA50 || showRSI
                        ? "Daily data with technical indicators"
                        : "Weekly historical data"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-silver-500">Live Feed</span>
                  </div>
                </div>

                {/* Technical Indicators Toggle */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-silver-500 mr-2">
                    Indicators:
                  </span>
                  <button
                    onClick={() => setShowMA20(!showMA20)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showMA20
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
                    }`}
                  >
                    MA20
                  </button>
                  <button
                    onClick={() => setShowMA50(!showMA50)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showMA50
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
                    }`}
                  >
                    MA50
                  </button>
                  <button
                    onClick={() => setShowRSI(!showRSI)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      showRSI
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
                    }`}
                  >
                    RSI
                  </button>
                </div>

                {/* Main Price Chart */}
                <div className="h-80 md:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={enhancedChartData}
                      margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
                    >
                      <defs>
                        <linearGradient
                          id="silverGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#60a5fa"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#60a5fa"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        style={{ fontSize: "10px" }}
                        tickLine={false}
                        axisLine={false}
                        interval={
                          showMA20 || showMA50 || showRSI
                            ? 6
                            : "preserveStartEnd"
                        }
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          const months = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          return `${date.getDate()} ${months[date.getMonth()]}`;
                        }}
                      />
                      <YAxis
                        orientation="right"
                        stroke="#6b7280"
                        style={{ fontSize: "10px" }}
                        tickLine={false}
                        axisLine={false}
                        domain={["dataMin - 4", "dataMax + 6"]}
                        tickFormatter={(value) => `$${value}`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === "price")
                            return [`$${value.toFixed(2)}/oz`, "Price"];
                          if (name === "ma20")
                            return [`$${value.toFixed(2)}`, "MA20"];
                          if (name === "ma50")
                            return [`$${value.toFixed(2)}`, "MA50"];
                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString();
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        fill="url(#silverGradient)"
                      />
                      {showMA20 && (
                        <Line
                          type="monotone"
                          dataKey="ma20"
                          stroke="#10b981"
                          strokeWidth={1.5}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                      )}
                      {showMA50 && (
                        <Line
                          type="monotone"
                          dataKey="ma50"
                          stroke="#f97316"
                          strokeWidth={1.5}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                      )}
                      {/* Reference line for current price */}
                      <ReferenceLine
                        y={silverPrice}
                        stroke="#8b5cf6"
                        strokeDasharray="5 5"
                        label={{
                          value: "Current",
                          fill: "#8b5cf6",
                          fontSize: 10,
                        }}
                      />
                      {/* Prediction histogram - Volume Profile style bars on the right */}
                      {predictionHistogram.map((bucket, i) => {
                        const maxCount = Math.max(
                          ...predictionHistogram.map((b) => b.count),
                        );
                        const widthFraction = bucket.count / maxCount;
                        return (
                          <ReferenceArea
                            key={`hist-${i}`}
                            y1={bucket.priceMin}
                            y2={bucket.priceMax}
                            fill={
                              bucket.hasUserPrediction ? "#22c55e" : "#4ade80"
                            }
                            fillOpacity={bucket.hasUserPrediction ? 0.7 : 0.35}
                            stroke="none"
                            ifOverflow="hidden"
                            shape={(props: any) => {
                              const { x, y, width, height } = props;
                              if (!width || !height) return <rect />;
                              const barWidth = Math.max(
                                width * 0.2 * widthFraction,
                                2,
                              );
                              const barHeight = Math.max(
                                Math.abs(height) - 1,
                                2,
                              );
                              return (
                                <rect
                                  x={x + width - barWidth}
                                  y={y}
                                  width={barWidth}
                                  height={barHeight}
                                  fill={
                                    bucket.hasUserPrediction
                                      ? "#22c55e"
                                      : "#4ade80"
                                  }
                                  fillOpacity={
                                    bucket.hasUserPrediction ? 0.7 : 0.35
                                  }
                                  rx={2}
                                />
                              );
                            }}
                          />
                        );
                      })}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* RSI Chart - Separate Panel */}
                {showRSI && (
                  <div className="h-48 mt-2 border-t border-white/5 pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-silver-500">RSI (14)</span>
                      {currentRSI !== null && (
                        <span
                          className={`text-xs font-medium ${
                            currentRSI > 70
                              ? "text-rose-400"
                              : currentRSI < 30
                                ? "text-emerald-400"
                                : "text-silver-400"
                          }`}
                        >
                          {currentRSI.toFixed(1)}{" "}
                          {currentRSI > 70
                            ? "Overbought"
                            : currentRSI < 30
                              ? "Oversold"
                              : ""}
                        </span>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                      <ComposedChart data={enhancedChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.03)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          style={{ fontSize: "10px" }}
                          tickLine={false}
                          axisLine={false}
                          interval={6}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            const months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return `${date.getDate()} ${
                              months[date.getMonth()]
                            }`;
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: "10px" }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          ticks={[30, 50, 70]}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0a0a0a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                          formatter={(value: number) => [
                            value.toFixed(1),
                            "RSI",
                          ]}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return date.toLocaleDateString();
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rsi"
                          stroke="#8b5cf6"
                          strokeWidth={1.5}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        {/* Overbought/Oversold reference lines */}
                        <ReferenceLine
                          y={70}
                          stroke="#ef4444"
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                        <ReferenceLine
                          y={30}
                          stroke="#22c55e"
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                        <ReferenceLine
                          y={50}
                          stroke="#6b7280"
                          strokeDasharray="2 2"
                          strokeOpacity={0.3}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex items-center justify-between text-xs text-silver-500">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>
                      {isLoading
                        ? "Loading..."
                        : error
                          ? "Using fallback data"
                          : "Live data - Updates every 5 min"}
                    </span>
                    <div className="flex items-center gap-3">
                      {predictionDotsData.length > 0 && (
                        <>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-2 rounded-sm bg-green-400 opacity-40"></span>{" "}
                            Predictions ({predictionDotsData.length})
                          </span>
                          {existingPrediction && (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-2 rounded-sm bg-emerald-500 opacity-70"></span>{" "}
                              Your prediction
                            </span>
                          )}
                        </>
                      )}
                      {showMA20 && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-emerald-500"></span>{" "}
                          MA20
                        </span>
                      )}
                      {showMA50 && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-orange-500"></span> MA50
                        </span>
                      )}
                      {showRSI && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-violet-500"></span> RSI
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-emerald-400">
                    {!error && !isLoading && "Connected"}
                  </span>
                </div>
              </div>

              {/* Winners Announcement Section */}
              {recentWinners && recentWinners.winners.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                          <svg
                            className="w-5 h-5 text-black"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            Weekly Winners
                          </h3>
                          <p className="text-xs text-silver-400">
                            {recentWinners.weekIdentifier} • Actual Price:{" "}
                            <span className="text-yellow-400 font-semibold">
                              ${recentWinners.actualPrice.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-silver-500">
                          Participants
                        </div>
                        <div className="text-lg font-bold text-white">
                          {recentWinners.totalParticipants}
                        </div>
                      </div>
                    </div>

                    {/* Winners Grid - Top 5 */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {recentWinners.winners
                        .slice(0, 5)
                        .map((winner, index) => (
                          <div
                            key={index}
                            className={`relative p-4 rounded-2xl border transition-all ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-500/30 col-span-1 sm:col-span-1"
                                : "bg-background-primary/30 border-white/5"
                            }`}
                          >
                            {/* Rank Badge */}
                            <div
                              className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black"
                                  : index === 1
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
                                    : index === 2
                                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                                      : "bg-background-secondary text-silver-400 border border-white/10"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="pt-2">
                              {/* Oracle Name */}
                              <div className="text-xs text-silver-400 mb-1 truncate font-mono">
                                {winner.walletAddress
                                  ? `${winner.walletAddress.slice(0, 6)}...${winner.walletAddress.slice(-4)}`
                                  : winner.email
                                    ? winner.email.length > 12
                                      ? `${winner.email.slice(0, 10)}...`
                                      : winner.email
                                    : "Anonymous"}
                              </div>

                              {/* Prediction */}
                              <div
                                className={`text-lg font-bold ${
                                  index === 0 ? "text-yellow-400" : "text-white"
                                }`}
                              >
                                ${winner.predictedPrice.toFixed(2)}
                              </div>

                              {/* Error */}
                              <div className="text-xs text-emerald-400">
                                ±${winner.error.toFixed(2)}
                              </div>

                              {/* Prize */}
                              <div className="mt-2 text-xs text-silver-500">
                                Prize:{" "}
                                <span className="text-amber-400 font-semibold">
                                  {winner.prize.toFixed(2)} oz
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* See more link */}
                    {recentWinners.winners.length > 5 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => {
                            setActiveTab("weekly");
                            setSelectedWeek(recentWinners.weekIdentifier);
                          }}
                          className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          See all {recentWinners.winners.length} winners →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div className="bg-background-secondary/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-gradient-to-b from-yellow-500/60 to-yellow-600/70 rounded-full"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Leaderboard
                      </h3>
                      <p className="text-xs text-silver-500">
                        Top silver oracles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab("accuracy")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === "accuracy"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
                    }`}
                  >
                    Most Accurate
                  </button>
                  <button
                    onClick={() => setActiveTab("weekly")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === "weekly"
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "bg-background-primary/30 text-silver-400 hover:text-white border border-white/5"
                    }`}
                  >
                    Weekly Winners
                  </button>
                </div>

                {/* Week Selector */}
                {activeTab === "weekly" && (
                  <div className="mb-4">
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="bg-background-primary/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/30"
                    >
                      {completedRounds.length === 0 ? (
                        <option value="">No completed rounds yet</option>
                      ) : (
                        completedRounds.map((round) => (
                          <option
                            key={round.weekIdentifier}
                            value={round.weekIdentifier}
                          >
                            {round.weekIdentifier}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {/* Leaderboard Content */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-silver-500 font-medium sticky top-0 bg-background-secondary/80 backdrop-blur-sm rounded-lg">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Oracle</div>
                    <div className="col-span-2 text-right">
                      {activeTab === "accuracy" ? "Avg Error" : "Prediction"}
                    </div>
                    <div className="col-span-2 text-center">Streak</div>
                    <div className="col-span-2 text-right">Last Guess</div>
                    <div className="col-span-2 text-right">Tier</div>
                  </div>

                  {/* Accuracy Leaders */}
                  {activeTab === "accuracy" &&
                    (leaderboardLoading ? (
                      <div className="text-center py-8 text-silver-500">
                        Loading...
                      </div>
                    ) : accuracyLeaders.length === 0 ? (
                      <div className="text-center py-8 text-silver-500">
                        No predictions yet
                      </div>
                    ) : (
                      accuracyLeaders.map((leader, index) => {
                        const rank = index + 1;
                        const bestRank = leader.bestRank;
                        const tier =
                          bestRank && bestRank <= 10
                            ? "Tier 1"
                            : bestRank && bestRank <= 25
                              ? "Tier 2"
                              : "-";
                        const tierColor =
                          bestRank && bestRank <= 10
                            ? "text-yellow-400"
                            : bestRank && bestRank <= 25
                              ? "text-silver-300"
                              : "text-silver-600";
                        const streak = leader.currentStreak || 0;
                        return (
                          <div
                            key={leader._id}
                            className="grid grid-cols-12 gap-2 px-3 py-3 bg-background-primary/30 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all"
                          >
                            <div className="col-span-1 flex items-center">
                              {rank <= 3 ? (
                                <span
                                  className={`text-sm font-bold ${
                                    rank === 1
                                      ? "text-yellow-400"
                                      : rank === 2
                                        ? "text-silver-300"
                                        : "text-amber-600"
                                  }`}
                                >
                                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                </span>
                              ) : (
                                <span className="text-sm text-silver-500">
                                  {rank}
                                </span>
                              )}
                            </div>
                            <div className="col-span-3 flex items-center">
                              <span className="text-sm text-white font-mono truncate">
                                {formatAddress(leader)}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className="text-sm text-blue-400 font-medium">
                                ±${leader.avgError?.toFixed(2) || "-"}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                              {streak > 0 ? (
                                <span className="text-sm text-orange-400 font-medium">
                                  {streak}🔥
                                </span>
                              ) : (
                                <span className="text-sm text-silver-600">
                                  -
                                </span>
                              )}
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className="text-sm text-silver-400">
                                {leader.lastPredictedPrice
                                  ? `$${leader.lastPredictedPrice.toFixed(2)}`
                                  : "-"}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${tierColor} bg-white/5`}
                              >
                                {tier}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ))}

                  {/* Weekly Winners */}
                  {activeTab === "weekly" &&
                    (completedRounds.length === 0 ? (
                      <div className="text-center py-8 text-silver-500">
                        No completed rounds yet
                      </div>
                    ) : weeklyWinners.length === 0 ? (
                      <div className="text-center py-8 text-silver-500">
                        No winners for this round
                      </div>
                    ) : (
                      weeklyWinners.map((winner) => {
                        const rank = winner.rank || 0;
                        const tier = getTier(rank);
                        return (
                          <div
                            key={winner._id}
                            className="grid grid-cols-12 gap-2 px-3 py-3 bg-background-primary/30 rounded-xl border border-white/5 hover:border-violet-500/20 transition-all"
                          >
                            <div className="col-span-1 flex items-center">
                              {rank <= 3 ? (
                                <span className="text-sm">
                                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                </span>
                              ) : (
                                <span className="text-sm text-silver-500">
                                  {rank}
                                </span>
                              )}
                            </div>
                            <div className="col-span-3 flex items-center">
                              <span className="text-sm text-white font-mono truncate">
                                {winner.userId
                                  ? formatAddress(winner.userId)
                                  : "Anonymous"}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className="text-sm text-violet-400 font-medium">
                                ${winner.predictedPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                              <span className="text-sm text-silver-600">-</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span className="text-sm text-silver-600">-</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  tier === "Tier 1"
                                    ? "text-yellow-400 bg-yellow-500/10"
                                    : "text-silver-300 bg-silver-500/10"
                                }`}
                              >
                                {tier}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ))}
                </div>
              </div>
            </div>

            {/* ===== RIGHT: SUBMISSION WIDGET (2 cols) ===== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prediction Input Card */}
              <div className="bg-gradient-to-br from-background-secondary/60 to-background-secondary/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 sticky top-24">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Your Prediction
                  </h3>
                  <p className="text-sm text-silver-400">
                    Predict {nextMonday} LBMA Silver Price
                  </p>
                </div>

                {/* Connection Status */}
                {!authenticated && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <svg
                        className="w-4 h-4"
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
                      Connect wallet to participate
                    </div>
                  </div>
                )}

                {authenticated && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Connected
                      </div>
                      <span className="text-xs text-silver-400 font-mono">
                        {displayAddress}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Input */}
                <div className="mb-4">
                  <label className="block text-xs text-silver-500 mb-2 uppercase tracking-wider">
                    Your Price Prediction (USD/oz)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/50">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      placeholder={silverPrice.toFixed(2)}
                      className="w-full bg-background-primary/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-2xl font-bold text-white text-center focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Quick Adjust Buttons */}
                <div className="flex gap-2 mb-4">
                  {[-1, -0.5, 0.5, 1].map((adj) => (
                    <button
                      key={adj}
                      onClick={() => {
                        const current = parseFloat(prediction) || silverPrice;
                        setPrediction((current + adj).toFixed(2));
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        adj < 0
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      {adj > 0 ? "+" : ""}
                      {adj}
                    </button>
                  ))}
                </div>

                {/* Reasoning Field (Optional) */}
                <div className="mb-6">
                  <label className="block text-xs text-silver-500 mb-2 uppercase tracking-wider">
                    Your Reasoning (Optional)
                  </label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="What's driving your prediction?"
                    className="w-full bg-background-primary/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-silver-600 resize-none h-20"
                    maxLength={200}
                  />
                  <div className="text-right text-xs text-silver-600 mt-1">
                    {reasoning.length}/200
                  </div>
                </div>

                {/* Error/Success Messages */}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !ready}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isSubmitting
                      ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                      : authenticated
                        ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 shadow-lg shadow-blue-500/25"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {!ready ? (
                    "Loading..."
                  ) : isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Minting...
                    </span>
                  ) : authenticated ? (
                    existingPrediction ? (
                      "Update Prediction"
                    ) : (
                      "Lock In Prediction"
                    )
                  ) : (
                    "Connect to Predict"
                  )}
                </button>

                {/* Existing Prediction Notice */}
                {existingPrediction && (
                  <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-center">
                    <span className="text-xs text-silver-400">
                      Current prediction:{" "}
                    </span>
                    <span className="text-sm text-violet-400 font-bold">
                      ${existingPrediction.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Profile Link */}
                {authenticated && (
                  <Link
                    to="/profile"
                    className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View My Profile & History →
                  </Link>
                )}
              </div>

              {/* Tiered Rewards Card */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-silver-500 uppercase tracking-wider">
                      Tiered Rewards
                    </div>
                    <div className="text-lg font-bold text-white">
                      Weekly Prizes
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-silver-400">
                  <p>
                    <span className="text-yellow-400 font-semibold">
                      Top 10:
                    </span>{" "}
                    Share the weekly reward pool
                  </p>
                  <p>
                    <span className="text-violet-400 font-semibold">
                      All Participants:
                    </span>{" "}
                    "Silver Times Contributor" NFT badge (POAP)
                  </p>
                </div>
              </div>

              {/* Quick Rules */}
              <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-white mb-4">
                  Quick Rules
                </h4>
                <div className="space-y-3 text-xs text-silver-400">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>
                      Submissions: Mon 12:00 PM - Thu 11:59 PM (London)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Results: Monday 12:00 PM LBMA fixing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>One prediction per wallet, editable until lock</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>Ties break by earliest submission timestamp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BOTTOM: DETAILED RULES ===== */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {/* Game Rules */}
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500/60 to-blue-600/70 rounded-full"></div>
                <h3 className="text-base font-bold text-white">Game Rules</h3>
              </div>
              <div className="space-y-3 text-xs text-silver-400">
                <p>
                  <strong className="text-white">Benchmark:</strong> LBMA Silver
                  Price (USD/oz) at 12:00 PM London time, rounded to two
                  decimals.
                </p>
                <p>
                  <strong className="text-white">Scoring:</strong> Rank by
                  absolute error; ties break by earliest submission.
                </p>
                <p>
                  <strong className="text-white">Access:</strong> Connect an EVM
                  wallet; one submission per wallet per round.
                </p>
              </div>
            </div>

            {/* Prizes */}
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500/60 to-emerald-600/70 rounded-full"></div>
                <h3 className="text-base font-bold text-white">
                  Prizes & Rewards
                </h3>
              </div>
              <div className="space-y-3 text-xs text-silver-400">
                <p>
                  <strong className="text-white">Top 10:</strong> Share the
                  weekly reward pool.
                </p>
                <p>
                  <strong className="text-white">Participation:</strong> "Silver
                  Times Contributor" NFT badge (POAP).
                </p>
                <p>
                  <Link
                    to="/rewards-terms"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View full rewards T&C →
                  </Link>
                </p>
              </div>
            </div>

            {/* Data & Fairness */}
            <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-violet-500/60 to-violet-600/70 rounded-full"></div>
                <h3 className="text-base font-bold text-white">
                  Data & Fairness
                </h3>
              </div>
              <div className="space-y-3 text-xs text-silver-400">
                <p>
                  <strong className="text-white">Source:</strong> Licensed LBMA
                  feeds; rounds voided if benchmark unavailable.
                </p>
                <p>
                  <strong className="text-white">Compliance:</strong> Physical
                  deliveries may require KYC and regional restrictions.
                </p>
                <p>
                  <strong className="text-white">Rewards:</strong> Distributed
                  Q1 2026 after STT token issuance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stats Sticky Bar - Only show when authenticated */}
      {authenticated && userStats && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background-secondary/95 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-xs text-silver-500 uppercase tracking-wider">
                  Your Performance
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {userStats.currentRank
                        ? `#${userStats.currentRank}`
                        : "-"}
                    </div>
                    <div className="text-xs text-silver-500">Rank</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      ±${userStats.avgError?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-silver-500">Avg Error</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">
                      {userStats.currentStreak > 0
                        ? `${userStats.currentStreak}🔥`
                        : "-"}
                    </div>
                    <div className="text-xs text-silver-500">Streak</div>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {userStats.bestRank ? `#${userStats.bestRank}` : "-"}
                    </div>
                    <div className="text-xs text-silver-500">Best Rank</div>
                  </div>
                </div>
              </div>
              {/* Badges */}
              <div className="flex items-center gap-2">
                {userStats.badges.length > 0 ? (
                  userStats.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center"
                      title={getBadgeLabel(badge.type)}
                    >
                      <span className="text-sm">
                        {getBadgeIcon(badge.type)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-silver-500">No badges yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom animation styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1s ease-in-out infinite;
        }
        @keyframes silver-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-silver-fall {
          animation: silver-fall 3s ease-in forwards;
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}

// Helper functions for badge display
function getBadgeIcon(type: Badge["type"]): string {
  switch (type) {
    case "silver_tongue":
      return "🎯";
    case "moon_shot":
      return "🚀";
    case "steady_hand":
      return "💎";
    case "broadcaster":
      return "📢";
    case "contributor":
      return "🥈";
    default:
      return "🏅";
  }
}

function getBadgeLabel(type: Badge["type"]): string {
  switch (type) {
    case "silver_tongue":
      return "Silver Tongue - Predicted within 0.1% accuracy";
    case "moon_shot":
      return "Moon Shot - Highest bullish prediction that came true";
    case "steady_hand":
      return "Steady Hand - 5-week participation streak";
    case "broadcaster":
      return "The Broadcaster - Shared prediction 100 times";
    case "contributor":
      return "Silver Times Contributor - Participated in the game";
    default:
      return "Badge";
  }
}
