import { useEffect, useState } from "react";

/**
 * STT cutover — 21 Jul 2026 19:00 GMT+8 (11:00 UTC, the round lock time).
 * Before this instant every prediction surface shows USDT; from the instant
 * onward everything flips to STT automatically, with no redeploy. The round
 * that locks at the cutover still pays USDT (backend keeps booking USDT
 * until the payout migration).
 */
export const STT_CUTOVER_AT = Date.UTC(2026, 6, 21, 11, 0, 0);

export const STT_PER_WIN = 0.1;
const USDT_PER_WIN = 5;

export function sttLive(now = Date.now()): boolean {
  return now >= STT_CUTOVER_AT;
}

/** Re-renders the component at the exact cutover instant. */
export function useSttLive(): boolean {
  const [live, setLive] = useState(sttLive());
  useEffect(() => {
    if (live) return;
    const t = setTimeout(
      () => setLive(true),
      Math.max(50, STT_CUTOVER_AT - Date.now() + 50),
    );
    return () => clearTimeout(t);
  }, [live]);
  return live;
}

/**
 * Prize label for winnings booked in USDT (5 per win): "5 USDT" before the
 * cutover, "0.1 STT" after. Multi-win amounts scale (10 -> "0.2 STT").
 */
export function prizeLabel(
  prizeUsdt?: number | null,
  live: boolean = sttLive(),
): string {
  const usdt = prizeUsdt ?? USDT_PER_WIN;
  if (!live) return `${usdt} USDT`;
  const wins = Math.max(1, Math.round(usdt / USDT_PER_WIN));
  return `${Number((wins * STT_PER_WIN).toFixed(1))} STT`;
}

/** Display conversion for a USDT-booked balance when viewing as STT. */
export function usdtToStt(usdt: number): number {
  return Number(((usdt / USDT_PER_WIN) * STT_PER_WIN).toFixed(1));
}
