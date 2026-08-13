// Mock data + pricing math for the Silver Yield secret page (/earn).
//
// Silver Yield is a covered-call product on STT (tokenized silver): you hold
// STT, pick a silver price you'd be happy to sell at, and collect USDT
// upfront today. Everything below is presentational mock data — no wallet,
// contract, or API is involved — but the numbers are internally consistent so
// the strike/amount controls recompute a believable preview client-side.

export const STT_SPOT = 54.2; // USDT per STT (mock spot)

export interface Strike {
  price: number; // USDT strike
  apr: number; // annualised upfront premium at this strike
}

// Covered call: prices ABOVE spot you'd be happy to sell your STT at.
// Nearer strikes pay a fatter premium (higher APR); further strikes pay less.
export const CALL_STRIKES: Strike[] = [
  { price: 56, apr: 41.2 },
  { price: 58, apr: 33.5 },
  { price: 61, apr: 26.8 },
  { price: 64, apr: 19.4 },
  { price: 68, apr: 11.7 },
  { price: 73, apr: 5.1 },
];

// Cash-secured put: prices BELOW spot you'd be happy to buy STT at.
export const PUT_STRIKES: Strike[] = [
  { price: 53, apr: 38.4 },
  { price: 51, apr: 30.7 },
  { price: 48, apr: 23.1 },
  { price: 45, apr: 16.2 },
  { price: 42, apr: 9.8 },
  { price: 38, apr: 4.2 },
];

// Default selection: the middle "balanced" strike (index 2), like RYSK.
export const DEFAULT_STRIKE_INDEX = 2;
export const DEFAULT_AMOUNT = 50; // STT

/** Upfront USDT premium: notional × APR pro-rated over the tenor. */
export function upfrontUsdt(
  amountStt: number,
  strike: Strike,
  days: number,
): number {
  const notional = amountStt * STT_SPOT;
  return notional * (strike.apr / 100) * (days / 365);
}

/** USDT that changes hands at the strike (sell for a call, buy for a put). */
export function strikeUsdt(amountStt: number, strike: Strike): number {
  return amountStt * strike.price;
}

/**
 * APR → accent colour. Fat premiums (near strikes) read warm/amber; slim
 * premiums (far strikes) read cool/teal — the site's own accent, not RYSK green.
 */
export function strikeAccent(index: number, total: number): string {
  const t = total <= 1 ? 0 : index / (total - 1);
  // amber (#F5B461) → sky (#90E0EF) across the row
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const r = lerp(0xf5, 0x90);
  const g = lerp(0xb4, 0xe0);
  const b = lerp(0x61, 0xef);
  return `rgb(${r} ${g} ${b})`;
}

export function fmtUsdt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export interface Vault {
  id: string;
  tenor: string;
  expiry: string; // "Sep 25"
  expiryShort: string; // "Sep_25"
  expiryLong: string; // "Sep 25th, 2026"
  days: number;
  type: "Covered call" | "Cash-secured put";
  maxApr: number;
  minApr: number;
}

export const COVERED_CALLS: Vault[] = [
  { id: "call-w", tenor: "Weekly", expiry: "Aug 22", expiryShort: "Aug_22", expiryLong: "Aug 22nd, 2026", days: 9, type: "Covered call", maxApr: 62.4, minApr: 5.1 },
  { id: "call-m", tenor: "Monthly", expiry: "Sep 25", expiryShort: "Sep_25", expiryLong: "Sep 25th, 2026", days: 43, type: "Covered call", maxApr: 41.2, minApr: 4.6 },
  { id: "call-q", tenor: "Quarterly", expiry: "Dec 26", expiryShort: "Dec_26", expiryLong: "Dec 26th, 2026", days: 135, type: "Covered call", maxApr: 33.8, minApr: 3.9 },
];

export const CASH_SECURED_PUTS: Vault[] = [
  { id: "put-w", tenor: "Weekly", expiry: "Aug 22", expiryShort: "Aug_22", expiryLong: "Aug 22nd, 2026", days: 9, type: "Cash-secured put", maxApr: 48.7, minApr: 4.2 },
  { id: "put-m", tenor: "Monthly", expiry: "Sep 25", expiryShort: "Sep_25", expiryLong: "Sep 25th, 2026", days: 43, type: "Cash-secured put", maxApr: 31.9, minApr: 3.4 },
];

/** The vault the page opens the builder on by default. */
export const DEFAULT_VAULT = COVERED_CALLS[1];

export const CAP_SOLD = 0.3438; // 34.38% of cap sold
