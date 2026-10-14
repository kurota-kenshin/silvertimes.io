// Mirrors backend/src/swap/swap.constants.ts. The backend is the authority —
// these exist only so the page can preview before submitting.

export type Direction = "BUY" | "SELL";

export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDT_DECIMALS = 6;
export const STT_ADDRESS = "0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce";
export const STT_DECIMALS = 18;

export const FEE_PERCENT = 1;
export const MIN_USDT = 0.1;
export const MAX_USDT = 1000;
export const MIN_STT = 0.001;
export const MAX_STT = 15;

export const tokenIn = (d: Direction) => (d === "BUY" ? USDT_ADDRESS : STT_ADDRESS);
export const decimalsIn = (d: Direction) => (d === "BUY" ? USDT_DECIMALS : STT_DECIMALS);
export const tokenLabel = (d: Direction) => (d === "BUY" ? "USDT" : "STT");
export const outLabel = (d: Direction) => (d === "BUY" ? "STT" : "USDT");

export function previewFee(amountIn: number): number {
  if (!Number.isFinite(amountIn) || amountIn <= 0) return 0;
  return (amountIn * FEE_PERCENT) / 100;
}

export function isValidAmount(amountIn: number, d: Direction): boolean {
  if (!Number.isFinite(amountIn)) return false;
  const [min, max] = d === "BUY" ? [MIN_USDT, MAX_USDT] : [MIN_STT, MAX_STT];
  if (amountIn < min || amountIn > max) return false;
  return Number(amountIn.toFixed(decimalsIn(d))) === amountIn;
}

export function fmtUsdt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtStt(n: number, dp = 4): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/** Format in whichever token the direction implies. */
export const fmtIn = (d: Direction) => (d === "BUY" ? fmtUsdt : (n: number) => fmtStt(n));
export const fmtOut = (d: Direction) => (d === "BUY" ? (n: number) => fmtStt(n) : fmtUsdt);

/**
 * ERC-20 transfer calldata, scaled from the fixed-decimal string. Float
 * scaling misencodes at 18 decimals.
 */
export function encodeTransfer(to: string, amount: number, decimals: number): string {
  const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const [whole, frac = ""] = amount.toFixed(decimals).split(".");
  const units = BigInt(whole + frac.padEnd(decimals, "0"));
  return `0xa9059cbb${addr}${units.toString(16).padStart(64, "0")}`;
}

export interface SwapConfig {
  feePercent: number;
  slippageBps: number;
  maxPriceImpactPct: number;
  limits: Record<Direction, { min: number; max: number }>;
  treasuryAddress: string;
  enabled: boolean;
}

export interface Quote {
  direction: Direction;
  amountIn: number;
  fee: number;
  feePercent: number;
  netIn: number;
  quotedOut: number;
  minReceived: number;
  rate: number;
  priceImpactPct: number;
  treasuryAddress: string;
}

export interface Trade {
  _id: string;
  direction: Direction;
  amountIn: number;
  quotedOut: number;
  actualOut?: number;
  fee: number;
  status: "PENDING" | "SWAPPING" | "COMPLETED" | "FAILED" | "REFUNDING" | "REFUNDED";
  txHashIn: string;
  txHashOut?: string;
  refundTxHash?: string;
  createdAt: string;
}
