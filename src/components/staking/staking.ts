// Campaign constants mirrored from the backend. The backend is the authority —
// these exist so the page can preview a reward before submitting anything.

export const TERMS = [30, 90] as const;
export type TermDays = (typeof TERMS)[number];

export const APR_BPS: Record<TermDays, number> = { 30: 1000, 90: 1500 };
export const MIN_STAKE_STT = 1;
export const MAX_STAKE_PER_WALLET_STT = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Simple pro-rated interest. Deliberately not compounded — see the spec. */
export function previewReward(amountStt: number, termDays: TermDays): number {
  if (!Number.isFinite(amountStt) || amountStt <= 0) return 0;
  return (amountStt * (APR_BPS[termDays] / 10000) * termDays) / 365;
}

export function previewMaturity(termDays: TermDays, from = new Date()): Date {
  return new Date(from.getTime() + termDays * DAY_MS);
}

export function earlyExitPrincipal(amountStt: number): number {
  return amountStt * 0.8;
}

export function fmtStt(n: number, dp = 4): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtRate(aprBps: number): string {
  return `${(aprBps / 100).toFixed(1)}%`;
}

export function fmtDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days until maturity, rounded up. Never negative. */
export function daysRemaining(maturesAt: string | Date): number {
  const target = typeof maturesAt === "string" ? new Date(maturesAt) : maturesAt;
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / DAY_MS));
}

/** How far through its term a position is, 0-100. */
export function progressPct(
  stakedAt: string | Date,
  maturesAt: string | Date,
): number {
  const start = (typeof stakedAt === "string" ? new Date(stakedAt) : stakedAt).getTime();
  const end = (typeof maturesAt === "string" ? new Date(maturesAt) : maturesAt).getTime();
  if (end <= start) return 100;
  const pct = ((Date.now() - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, pct));
}

// ---- Types mirroring the backend responses ----

export interface PoolState {
  totalRewardStt: number;
  heldRewardStt: number;
  committedRewardStt: number;
  paidRewardStt: number;
  availableRewardStt: number;
  isOpen: boolean;
}

export interface StakingConfig {
  terms: { termDays: TermDays; aprBps: number }[];
  minStakeStt: number;
  maxStakePerWalletStt: number;
  treasuryAddress: string;
  pool: PoolState;
}

export type PositionStatus = "ACTIVE" | "CLOSING" | "CLOSED";

export interface Position {
  id: string;
  amountStt: number;
  termDays: TermDays;
  aprBps: number;
  rewardStt: number;
  stakedAt: string;
  maturesAt: string;
  status: PositionStatus;
  closeKind?: "MATURITY" | "EARLY";
  depositTxHash: string;
}

export interface Payout {
  id: string;
  positionId: string;
  principalStt: number;
  rewardStt: number;
  totalStt: number;
  kind: "MATURITY" | "EARLY";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  txHash?: string;
}

export interface MyStaking {
  positions: Position[];
  payouts: Payout[];
  stakedTotalStt: number;
  heldStt: number;
  remainingStt: number;
  canOpen: boolean;
  pool: PoolState;
}

export interface StakeIntentResponse {
  intentId: string;
  treasuryAddress: string;
  amountStt: number;
  termDays: TermDays;
  rewardStt: number;
  expiresAt: string;
}

/** Share of the reward pool already committed or held, 0-100. */
export function committedPct(pool: PoolState): number {
  const used = pool.committedRewardStt + pool.heldRewardStt;
  if (pool.totalRewardStt <= 0) return 0;
  return Math.min(100, (used / pool.totalRewardStt) * 100);
}
