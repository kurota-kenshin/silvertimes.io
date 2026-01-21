const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8182';

const ACCESS_TOKEN_KEY = 'silvertimes_access_token';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

// Access token management
export const accessTokenManager = {
  get: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
};

// Badge types
export interface Badge {
  type: 'silver_tongue' | 'moon_shot' | 'steady_hand' | 'broadcaster' | 'contributor';
  earnedAt: string;
  metadata?: Record<string, unknown>;
}

// Types for leaderboard data
export interface AccuracyLeader {
  _id: string;
  walletAddress?: string;
  email?: string;
  totalPredictions: number;
  totalWins: number;
  avgError?: number;
  bestRank?: number;
  currentStreak?: number;
  lastPredictedPrice?: number;
  badges?: Badge[];
}

export interface WeeklyWinner {
  _id: string;
  userId: {
    _id: string;
    walletAddress?: string;
    email?: string;
  };
  predictedPrice: number;
  error?: number;
  rank?: number;
  prize?: number;
}

export interface RoundInfo {
  _id: string;
  weekIdentifier: string;
  submissionStartDate: string;
  submissionEndDate: string;
  resultDate: string;
  status: 'open' | 'locked' | 'completed' | 'voided';
  actualPrice?: number;
  totalParticipants: number;
  prizePool: number;
  winnersCount: number;
  avgPrediction?: number;
}

// Prediction for chart dots
export interface ChartPrediction {
  price: number;
}

// Recent winners announcement
export interface RecentWinners {
  weekIdentifier: string;
  actualPrice: number;
  resultDate: string;
  totalParticipants: number;
  winners: {
    rank: number;
    walletAddress?: string;
    email?: string;
    predictedPrice: number;
    error: number;
    prize: number;
  }[];
}

// User stats for personal stats bar
export interface UserStats {
  totalPredictions: number;
  totalWins: number;
  avgError: number;
  bestRank: number | null;
  currentStreak: number;
  longestStreak: number;
  lastPredictedPrice: number | null;
  badges: Badge[];
  currentRank: number | null;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add access token for protected endpoints
  const accessToken = accessTokenManager.get();
  if (accessToken) {
    headers['X-Access-Token'] = accessToken;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Access API (launch password protection)
export const accessApi = {
  verifyPassword: async (password: string) => {
    const response = await fetch(`${API_URL}/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid password' }));
      throw new Error(error.message || 'Invalid password');
    }
    const data = await response.json();
    if (data.accessToken) {
      accessTokenManager.set(data.accessToken);
    }
    return data as { success: boolean; accessToken: string; expiresAt: number };
  },

  validateToken: async () => {
    const token = accessTokenManager.get();
    if (!token) return { valid: false };
    try {
      const response = await fetch(`${API_URL}/access/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await response.json();
      if (!data.valid) {
        accessTokenManager.clear();
      }
      return data as { valid: boolean };
    } catch {
      accessTokenManager.clear();
      return { valid: false };
    }
  },
};

// Auth API
export const authApi = {
  getMe: (token: string) =>
    apiRequest<{ user: any; stats: any }>('/auth/me', { token }),

  verify: (token: string) =>
    apiRequest<{ valid: boolean; userId: string }>('/auth/verify', { token }),
};

// Predictions API
export const predictionsApi = {
  getCurrentRound: () =>
    apiRequest<{ round: RoundInfo; isOpen: boolean }>('/predictions/round/current'),

  submit: (token: string, predictedPrice: number) =>
    apiRequest<{ success: boolean; prediction: any }>('/predictions/submit', {
      method: 'POST',
      body: { predictedPrice },
      token,
    }),

  getMyPrediction: (token: string, roundId?: string) =>
    apiRequest<{ prediction: any }>(
      `/predictions/my-prediction${roundId ? `?roundId=${roundId}` : ''}`,
      { token }
    ),

  getMyHistory: (token: string, limit = 10) =>
    apiRequest<{ predictions: any[] }>(
      `/predictions/my-history?limit=${limit}`,
      { token }
    ),

  getLeaderboard: (type: 'accuracy' | 'weekly', weekId?: string) =>
    apiRequest<{ leaders: AccuracyLeader[] | WeeklyWinner[] }>(
      `/predictions/leaderboard?type=${type}${weekId ? `&weekId=${weekId}` : ''}`
    ),

  getCompletedRounds: (limit = 10) =>
    apiRequest<{ rounds: RoundInfo[] }>(`/predictions/rounds/completed?limit=${limit}`),

  getMyStats: (token: string) =>
    apiRequest<{ stats: UserStats }>('/predictions/my-stats', { token }),

  trackShare: (token: string) =>
    apiRequest<{ success: boolean; newShareCount: number; badgeEarned?: string }>(
      '/predictions/track-share',
      { method: 'POST', token }
    ),

  getRoundPredictions: (roundId?: string) =>
    apiRequest<{ predictions: ChartPrediction[] }>(
      `/predictions/round/predictions${roundId ? `?roundId=${roundId}` : ''}`
    ),

  getRecentWinners: () =>
    apiRequest<{ winners: RecentWinners | null }>('/predictions/recent-winners'),
};
