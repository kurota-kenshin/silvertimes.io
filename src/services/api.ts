const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8182';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

// Types for leaderboard data
export interface AccuracyLeader {
  _id: string;
  walletAddress?: string;
  email?: string;
  totalPredictions: number;
  totalWins: number;
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
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    apiRequest<{ round: any; isOpen: boolean }>('/predictions/round/current'),

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
};
