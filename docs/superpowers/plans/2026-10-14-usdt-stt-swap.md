# USDT ⇄ STT Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a treasury-mediated USDT ⇄ STT swap on a gated `/swap` page, porting the midias `trade` module with the three security guards it lacks.

**Architecture:** The user transfers one token to the treasury; the backend re-reads the chain to verify it (including the sender), then routes the net amount through the KyberSwap aggregator and sends the output back. A trade row is the source of truth: an immediate attempt runs for responsiveness and a cron worker sweeps anything stranded, both claiming the row through one atomic status transition so exactly one executes.

**Tech Stack:** NestJS 11, Mongoose 8, ethers 6, Jest 30 (backend); React 19, Vite 7, Tailwind 4, Privy (frontend). KyberSwap aggregator API for routing and quotes.

**Spec:** `docs/superpowers/specs/2026-10-14-swap-design.md`

## Repositories

| Repo | Path | Remote |
|---|---|---|
| Backend | `/Users/kenho/projects/silvertimes/backend` | `api.silvertimes.io` |
| Frontend | `/Users/kenho/projects/silvertimes/silvertimes.io` | `silvertimes.io` |

## Global Constraints

- **Chain:** Ethereum mainnet only.
- **STT:** `0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce`, **18 decimals**. midias' XGZ is 8 — every amount conversion differs by 10^10.
- **USDT:** `0xdAC17F958D2ee523a2206206994597C13D831ec7`, **6 decimals**. Non-standard ERC-20: `approve`/`transfer` return no value, and a non-zero allowance must be reset to 0 before being raised.
- **Treasury:** the existing staking hot wallet, derived from `HOT_WALLET_PRIVATE_KEY`. No new key.
- **Service fee:** 1% (`SWAP_FEE_PERCENT`), taken in the **input** token, retained by the treasury.
- **Slippage:** 5% (500 bps).
- **Minimums:** 0.1 USDT (BUY), 0.001 STT (SELL).
- **Maximums:** 1,000 USDT / 15 STT (`SWAP_MAX_USDT`, `SWAP_MAX_STT`).
- **Max price impact:** 2% (`SWAP_MAX_PRICE_IMPACT_PCT`), checked at quote **and** execute.
- **Confirmations:** 3 before a deposit is credited.
- **Quotes come from the KyberSwap route API**, never a Uniswap v3 Quoter — the STT pool is v4 and the v3 Quoter cannot see it.
- **Never weaken staking or the claim flow.** The swap module gets its own collection and worker.
- **No test may touch production Mongo, the real hot wallet, or the live aggregator.** DB tests use the scratch Atlas database via `MONGODB_TEST_URI`; aggregator calls are stubbed.
- **UI copy rules:** no emoji. Brand colours only (`brand-sky`, `brand-blue`, `brand-teal`, `silver-*`). `rounded-2xl`. See `silvertimes.io/DESIGN.md`.

## Review Focus

Input classes the spec implies but no obvious task exercises. Each has a test pinned to the task that owns the code.

1. **A deposit whose `from` is a contract or exchange, not the user** — must be rejected, not credited to whoever calls execute. (Task 4)
2. **USDT's non-standard allowance** — raising a non-zero USDT allowance without resetting to 0 first reverts, stranding the trade mid-swap. (Task 8)
3. **The aggregator returning no route, or `amountOutUsd` absent** — price-impact maths must not divide by zero or silently pass. (Task 3)
4. **A refund that itself fails** — the trade must not be left claiming `REFUNDED` when no refund transfer landed. (Task 7)
5. **Dust and rounding at 6 vs 18 decimals** — a 0.1 USDT swap must not round to zero STT out, and an 18-decimal STT amount must not overflow a JS number. (Task 1)

---

## File Structure

### Backend — new module `backend/src/swap/`

| File | Responsibility |
|---|---|
| `swap.constants.ts` | Token addresses, decimals, fee, slippage, bounds, confirmations. |
| `swap-math.ts` | Pure functions: fee, net amount, min received, price impact, validation. |
| `swap-math.spec.ts` | Tests for the above. |
| `kyber.client.ts` | KyberSwap route + build calls, and price-impact derivation. |
| `kyber.client.spec.ts` | Tests with `fetch` stubbed. |
| `swap-verifier.service.ts` | Reads a deposit tx and decides whether it funds a trade. |
| `swap-verifier.service.spec.ts` | One test per rejection reason. |
| `reserve-floor.service.ts` | Outstanding staking obligations, and the pre-transfer check. |
| `reserve-floor.service.spec.ts` | Tests against seeded staking positions. |
| `swap.service.ts` | Quote, execute, and the claim → swap → settle lifecycle. |
| `swap.service.spec.ts` | Lifecycle and concurrency tests. |
| `swap.worker.ts` | Cron backstop for stranded rows. |
| `swap.worker.spec.ts` | Ownership-lock tests. |
| `swap.controller.ts` | Public + authenticated routes. |
| `swap-admin.controller.ts` | Admin routes behind `AdminSecretGuard`. |
| `swap.module.ts` | Wiring. |

### Backend — new schema

`backend/src/schemas/swap-trade.schema.ts`

### Frontend — new components `silvertimes.io/src/components/swap/`

| File | Responsibility |
|---|---|
| `swap.ts` | Constants mirror, preview maths, formatters, response types. |
| `SwapPage.tsx` | Route shell, data loading, view state. |
| `SwapCard.tsx` | Direction toggle, amount input, live quote, the transfer flow. |
| `QuoteSummary.tsx` | Rate, fee, minimum received, price impact. |
| `TradeHistory.tsx` | The caller's past trades. |
| `SwapRiskNotes.tsx` | Custody, sender requirement, slippage. |

Modified: `src/App.tsx` (route), `src/services/api.ts` (`swapApi`).

---

## Phase 1 — Backend

### Task 1: Constants and swap maths

Pure functions, no I/O. These become the single source of truth for every figure quoted, and they are where the 6-vs-18 decimal mismatch is contained.

**Files:**
- Create: `backend/src/swap/swap.constants.ts`
- Create: `backend/src/swap/swap-math.ts`
- Test: `backend/src/swap/swap-math.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Direction` (`'BUY' | 'SELL'`), `USDT_ADDRESS`, `USDT_DECIMALS`, `STT_ADDRESS`, `STT_DECIMALS`, `SWAP_FEE_PERCENT`, `SLIPPAGE_BPS`, `MIN_USDT`, `MIN_STT`, `MAX_USDT`, `MAX_STT`, `MAX_PRICE_IMPACT_PCT`, `REQUIRED_CONFIRMATIONS`; and from `swap-math.ts`: `tokenIn(d)`, `tokenOut(d)`, `decimalsIn(d)`, `decimalsOut(d)`, `feeFor(amountIn, feePercent)`, `netAfterFee(amountIn, feePercent)`, `minReceived(quotedOut, slippageBps)`, `priceImpactPct(amountInUsd, amountOutUsd)`, `isValidAmount(amountIn, d)`, `round(n, dp)`.

- [ ] **Step 1: Write the constants**

```ts
// backend/src/swap/swap.constants.ts

export type Direction = 'BUY' | 'SELL';

/** USDT is non-standard ERC-20: approve/transfer return no value. */
export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const USDT_DECIMALS = 6;

/** Same token the staking module uses. 18 decimals, not 8 like midias' XGZ. */
export const STT_ADDRESS = '0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce';
export const STT_DECIMALS = 18;

/**
 * Defaults. SwapService reads SWAP_FEE_PERCENT through ConfigService so it can
 * change without a deploy; these are the fallbacks. Do not read process.env at
 * module scope — ConfigModule may not have loaded .env by then.
 */
export const SWAP_FEE_PERCENT = 1;
export const SLIPPAGE_BPS = 500; // 5%

export const MIN_USDT = 0.1;
export const MIN_STT = 0.001;
export const MAX_USDT = 1000;
export const MAX_STT = 15;

/** Refuse a swap that would move the pool more than this. */
export const MAX_PRICE_IMPACT_PCT = 2;

export const REQUIRED_CONFIRMATIONS = 3;

export const KYBER_BASE = 'https://aggregator-api.kyberswap.com/ethereum/api/v1';
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/swap/swap-math.spec.ts
import {
  tokenIn, tokenOut, decimalsIn, decimalsOut,
  feeFor, netAfterFee, minReceived, priceImpactPct, isValidAmount,
} from './swap-math';
import { STT_ADDRESS, USDT_ADDRESS } from './swap.constants';

describe('swap-math', () => {
  describe('direction mapping', () => {
    it('BUY takes USDT in and gives STT out', () => {
      expect(tokenIn('BUY')).toBe(USDT_ADDRESS);
      expect(tokenOut('BUY')).toBe(STT_ADDRESS);
      expect(decimalsIn('BUY')).toBe(6);
      expect(decimalsOut('BUY')).toBe(18);
    });
    it('SELL takes STT in and gives USDT out', () => {
      expect(tokenIn('SELL')).toBe(STT_ADDRESS);
      expect(tokenOut('SELL')).toBe(USDT_ADDRESS);
      expect(decimalsIn('SELL')).toBe(18);
      expect(decimalsOut('SELL')).toBe(6);
    });
  });

  describe('feeFor', () => {
    it('takes 1% of the input', () => {
      expect(feeFor(100, 1)).toBeCloseTo(1, 8);
      expect(feeFor(0.1, 1)).toBeCloseTo(0.001, 8);
    });
    it('leaves the rest to swap', () => {
      expect(netAfterFee(100, 1)).toBeCloseTo(99, 8);
    });
    it('never returns a negative net', () => {
      expect(netAfterFee(0, 1)).toBe(0);
    });
  });

  describe('minReceived', () => {
    it('is the quote less 5%', () => {
      expect(minReceived(100, 500)).toBeCloseTo(95, 8);
    });
    it('is the quote itself at zero slippage', () => {
      expect(minReceived(100, 0)).toBeCloseTo(100, 8);
    });
  });

  describe('priceImpactPct', () => {
    it('is zero when in and out are worth the same', () => {
      expect(priceImpactPct(1000, 1000)).toBeCloseTo(0, 8);
    });
    it('is positive when the output is worth less', () => {
      expect(priceImpactPct(1000, 980)).toBeCloseTo(2, 8);
    });
    it('is zero, not negative, when the output is worth more', () => {
      // A favourable route is not an impact; clamping keeps the ceiling
      // check one-sided.
      expect(priceImpactPct(1000, 1010)).toBe(0);
    });
    it('returns Infinity when the input USD value is missing or zero', () => {
      // Must not divide by zero and silently read as 0% impact.
      expect(priceImpactPct(0, 100)).toBe(Infinity);
      expect(priceImpactPct(NaN, 100)).toBe(Infinity);
    });
  });

  describe('isValidAmount', () => {
    it('accepts the USDT bounds on a BUY', () => {
      expect(isValidAmount(0.1, 'BUY')).toBe(true);
      expect(isValidAmount(1000, 'BUY')).toBe(true);
      expect(isValidAmount(0.09, 'BUY')).toBe(false);
      expect(isValidAmount(1000.01, 'BUY')).toBe(false);
    });
    it('accepts the STT bounds on a SELL', () => {
      expect(isValidAmount(0.001, 'SELL')).toBe(true);
      expect(isValidAmount(15, 'SELL')).toBe(true);
      expect(isValidAmount(0.0009, 'SELL')).toBe(false);
      expect(isValidAmount(15.01, 'SELL')).toBe(false);
    });
    it('rejects non-finite input', () => {
      expect(isValidAmount(NaN, 'BUY')).toBe(false);
      expect(isValidAmount(Infinity, 'BUY')).toBe(false);
    });
    it('rejects an amount finer than the token can represent', () => {
      // 7 decimals of USDT cannot be sent on a 6-decimal token.
      expect(isValidAmount(0.1234567, 'BUY')).toBe(false);
    });
    it('accepts a minimum BUY that still produces a non-zero output scale', () => {
      // Review Focus 5: 0.1 USDT must remain representable end to end.
      expect(isValidAmount(0.1, 'BUY')).toBe(true);
      expect(netAfterFee(0.1, 1)).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-math.spec.ts`
Expected: FAIL — `Cannot find module './swap-math'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/swap/swap-math.ts
import {
  Direction,
  MAX_STT, MAX_USDT, MIN_STT, MIN_USDT,
  STT_ADDRESS, STT_DECIMALS, USDT_ADDRESS, USDT_DECIMALS,
} from './swap.constants';

/** Round to `dp` places via a decimal round-trip, avoiding float scaling. */
export function round(n: number, dp: number): number {
  return Number(n.toFixed(dp));
}

export const tokenIn = (d: Direction) => (d === 'BUY' ? USDT_ADDRESS : STT_ADDRESS);
export const tokenOut = (d: Direction) => (d === 'BUY' ? STT_ADDRESS : USDT_ADDRESS);
export const decimalsIn = (d: Direction) => (d === 'BUY' ? USDT_DECIMALS : STT_DECIMALS);
export const decimalsOut = (d: Direction) => (d === 'BUY' ? STT_DECIMALS : USDT_DECIMALS);

/** Fee is taken in the INPUT token and kept by the treasury. */
export function feeFor(amountIn: number, feePercent: number): number {
  if (!Number.isFinite(amountIn) || amountIn <= 0) return 0;
  return (amountIn * feePercent) / 100;
}

export function netAfterFee(amountIn: number, feePercent: number): number {
  return Math.max(0, amountIn - feeFor(amountIn, feePercent));
}

export function minReceived(quotedOut: number, slippageBps: number): number {
  return quotedOut * (1 - slippageBps / 10000);
}

/**
 * Price impact from the aggregator's USD valuations.
 *
 * KyberSwap's routeSummary carries amountInUsd / amountOutUsd; deriving impact
 * from those is more robust than depending on an undocumented priceImpact
 * field. A missing or zero input value yields Infinity so the ceiling check
 * rejects rather than treating unknown as safe.
 */
export function priceImpactPct(amountInUsd: number, amountOutUsd: number): number {
  if (!Number.isFinite(amountInUsd) || amountInUsd <= 0) return Infinity;
  if (!Number.isFinite(amountOutUsd)) return Infinity;
  const impact = ((amountInUsd - amountOutUsd) / amountInUsd) * 100;
  // A better-than-par route is not an impact.
  return impact < 0 ? 0 : impact;
}

export function isValidAmount(amountIn: number, d: Direction): boolean {
  if (!Number.isFinite(amountIn)) return false;
  const [min, max] = d === 'BUY' ? [MIN_USDT, MAX_USDT] : [MIN_STT, MAX_STT];
  if (amountIn < min || amountIn > max) return false;
  // Must be representable at the input token's precision.
  return round(amountIn, decimalsIn(d)) === amountIn;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-math.spec.ts`
Expected: PASS — 18 tests.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap.constants.ts src/swap/swap-math.ts src/swap/swap-math.spec.ts
git commit -m "feat(swap): add swap constants and quote maths"
```

---

### Task 2: Trade schema and indexes

The unique index on `txHashIn` is the guard midias lacks, so it gets its own test rather than being taken on trust.

**Files:**
- Create: `backend/src/schemas/swap-trade.schema.ts`
- Test: `backend/src/swap/schema.spec.ts`

**Interfaces:**
- Consumes: `Direction` from `swap.constants.ts`.
- Produces: `SwapTrade`, `SwapTradeSchema`, `SwapTradeDocument`, `SwapStatus`.

- [ ] **Step 1: Write the schema**

```ts
// backend/src/schemas/swap-trade.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SwapTradeDocument = SwapTrade & Document;

export enum SwapStatus {
  PENDING = 'PENDING',
  SWAPPING = 'SWAPPING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDING = 'REFUNDING',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class SwapTrade {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, enum: ['BUY', 'SELL'] })
  direction: string;

  @Prop({ required: true })
  amountIn: number;

  /** Frozen at creation; the user's minimum received is derived from it. */
  @Prop({ required: true })
  quotedOut: number;

  @Prop({ required: true })
  fee: number;

  @Prop({ required: true })
  feePercent: number;

  @Prop()
  actualOut?: number;

  /**
   * THE guard midias is missing: one deposit funds exactly one trade,
   * however many times execute is called with the same hash.
   */
  @Prop({ required: true, lowercase: true })
  txHashIn: string;

  @Prop()
  txHashOut?: string;

  @Prop()
  refundTxHash?: string;

  @Prop({ default: SwapStatus.PENDING, enum: SwapStatus })
  status: SwapStatus;

  @Prop()
  failureReason?: string;

  @Prop({ default: 0 })
  retryCount: number;

  /** Set when a runner claims the row; used to detect a stranded SWAPPING. */
  @Prop()
  claimedAt?: Date;

  @Prop()
  processedAt?: Date;
}

export const SwapTradeSchema = SchemaFactory.createForClass(SwapTrade);

SwapTradeSchema.index({ txHashIn: 1 }, { unique: true });
SwapTradeSchema.index({ userId: 1, createdAt: -1 });
SwapTradeSchema.index({ status: 1, claimedAt: 1 });
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/swap/schema.spec.ts
import { Types } from 'mongoose';
import { describeWithMongo, startTestMongo, TestMongo } from '../staking/test-utils';
import { SwapTradeSchema, SwapStatus } from '../schemas/swap-trade.schema';

describeWithMongo('swap-trade schema', () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startTestMongo();
  }, 120000);
  afterAll(async () => {
    await mongo.stop();
  });
  afterEach(async () => {
    await mongo.clear();
  });

  const base = (txHashIn: string) => ({
    userId: new Types.ObjectId(),
    walletAddress: '0x1111111111111111111111111111111111111111',
    direction: 'BUY',
    amountIn: 100,
    quotedOut: 1.4,
    fee: 1,
    feePercent: 1,
    txHashIn,
  });

  it('refuses to fund two trades from one deposit tx', async () => {
    const model = mongo.connection.model('SwapTrade', SwapTradeSchema);
    await model.init();
    await model.create(base('0xdead'));
    await expect(model.create(base('0xdead'))).rejects.toThrow();
  });

  it('allows trades from different deposit txs', async () => {
    const model = mongo.connection.model('SwapTrade2', SwapTradeSchema);
    await model.init();
    await model.create(base('0xaaa'));
    await model.create(base('0xbbb'));
    expect(await model.countDocuments()).toBe(2);
  });

  it('lowercases the tx hash so case cannot defeat the unique index', async () => {
    const model = mongo.connection.model('SwapTrade3', SwapTradeSchema);
    await model.init();
    await model.create(base('0xABCDEF'));
    await expect(model.create(base('0xabcdef'))).rejects.toThrow();
  });

  it('defaults to PENDING', async () => {
    const model = mongo.connection.model('SwapTrade4', SwapTradeSchema);
    const doc = await model.create(base('0xccc'));
    expect(doc.status).toBe(SwapStatus.PENDING);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/schema.spec.ts`
Expected: PASS — 4 tests, or SKIPPED if `MONGODB_TEST_URI` is unset. If skipped, set it before continuing; these guards are the point of the module.

- [ ] **Step 4: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/schemas/swap-trade.schema.ts src/swap/schema.spec.ts
git commit -m "feat(swap): add trade schema with deposit idempotency index"
```

---

### Task 3: KyberSwap client

Isolating the aggregator behind one class keeps `fetch` out of the service and makes every failure mode testable without network access.

**Files:**
- Create: `backend/src/swap/kyber.client.ts`
- Test: `backend/src/swap/kyber.client.spec.ts`

**Interfaces:**
- Consumes: `KYBER_BASE`, `priceImpactPct`.
- Produces: class `KyberClient` with `getRoute(tokenIn: string, tokenOut: string, amountInWei: bigint): Promise<RouteResult>` and `buildSwap(routeSummary: unknown, sender: string, recipient: string, slippageBps: number): Promise<BuildResult>`. `RouteResult` is `{ routeSummary: any; amountOutWei: bigint; amountInUsd: number; amountOutUsd: number; priceImpactPct: number; gas: string }`. `BuildResult` is `{ data: string; routerAddress: string; gas: string }`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/kyber.client.spec.ts
import { KyberClient } from './kyber.client';

const TOKEN_IN = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const TOKEN_OUT = '0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce';

function stubFetch(responses: any[]) {
  const calls: string[] = [];
  let i = 0;
  global.fetch = jest.fn(async (url: any) => {
    calls.push(String(url));
    const body = responses[i++];
    return { ok: true, json: async () => body } as any;
  }) as any;
  return calls;
}

describe('KyberClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getRoute', () => {
    it('returns the output amount and derives price impact', async () => {
      stubFetch([
        {
          data: {
            routeSummary: {
              amountOut: '1400000000000000000',
              amountInUsd: '100',
              amountOutUsd: '98',
              gas: '250000',
            },
          },
        },
      ]);

      const r = await new KyberClient().getRoute(TOKEN_IN, TOKEN_OUT, 100000000n);

      expect(r.amountOutWei).toBe(1400000000000000000n);
      expect(r.amountInUsd).toBeCloseTo(100, 6);
      expect(r.amountOutUsd).toBeCloseTo(98, 6);
      expect(r.priceImpactPct).toBeCloseTo(2, 6);
    });

    it('throws when the aggregator finds no route', async () => {
      stubFetch([{ message: 'No route found' }]);
      await expect(
        new KyberClient().getRoute(TOKEN_IN, TOKEN_OUT, 100000000n),
      ).rejects.toThrow(/No route found/);
    });

    it('treats a missing amountInUsd as infinite impact, not zero', async () => {
      // Review Focus 3: unknown must never read as safe.
      stubFetch([
        {
          data: {
            routeSummary: {
              amountOut: '1400000000000000000',
              amountOutUsd: '98',
              gas: '250000',
            },
          },
        },
      ]);
      const r = await new KyberClient().getRoute(TOKEN_IN, TOKEN_OUT, 100000000n);
      expect(r.priceImpactPct).toBe(Infinity);
    });

    it('sends the amount in wei, as a string, on the query', async () => {
      const calls = stubFetch([
        { data: { routeSummary: { amountOut: '1', amountInUsd: '1', amountOutUsd: '1', gas: '1' } } },
      ]);
      await new KyberClient().getRoute(TOKEN_IN, TOKEN_OUT, 123456n);
      expect(calls[0]).toContain('amountIn=123456');
      expect(calls[0]).toContain(`tokenIn=${TOKEN_IN}`);
      expect(calls[0]).toContain(`tokenOut=${TOKEN_OUT}`);
    });
  });

  describe('buildSwap', () => {
    it('returns calldata and the router address', async () => {
      stubFetch([
        { data: { data: '0xdeadbeef', routerAddress: '0xRouter', gas: '300000' } },
      ]);
      const b = await new KyberClient().buildSwap({}, '0xa', '0xb', 500);
      expect(b.data).toBe('0xdeadbeef');
      expect(b.routerAddress).toBe('0xRouter');
    });

    it('throws when the build returns no calldata', async () => {
      stubFetch([{ message: 'cannot build' }]);
      await expect(new KyberClient().buildSwap({}, '0xa', '0xb', 500)).rejects.toThrow(
        /cannot build/,
      );
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/kyber.client.spec.ts`
Expected: FAIL — `Cannot find module './kyber.client'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/swap/kyber.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { KYBER_BASE } from './swap.constants';
import { priceImpactPct } from './swap-math';

export interface RouteResult {
  routeSummary: unknown;
  amountOutWei: bigint;
  amountInUsd: number;
  amountOutUsd: number;
  priceImpactPct: number;
  gas: string;
}

export interface BuildResult {
  data: string;
  routerAddress: string;
  gas: string;
}

/**
 * Thin wrapper over the KyberSwap aggregator. Quotes come from here rather
 * than a Uniswap Quoter contract: the STT pool is v4, which the v3 Quoter
 * cannot see, and quoting from the same source that executes keeps the two
 * consistent.
 */
@Injectable()
export class KyberClient {
  private readonly logger = new Logger(KyberClient.name);

  async getRoute(
    tokenIn: string,
    tokenOut: string,
    amountInWei: bigint,
  ): Promise<RouteResult> {
    const url =
      `${KYBER_BASE}/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}` +
      `&amountIn=${amountInWei.toString()}&saveGas=false`;

    const res = await fetch(url);
    const body = (await res.json()) as {
      data?: {
        routeSummary?: {
          amountOut: string;
          amountInUsd?: string;
          amountOutUsd?: string;
          gas: string;
        };
      };
      message?: string;
    };

    const summary = body.data?.routeSummary;
    if (!summary) {
      throw new Error(`KyberSwap route failed: ${body.message || 'No route found'}`);
    }

    const amountInUsd = Number(summary.amountInUsd);
    const amountOutUsd = Number(summary.amountOutUsd);

    return {
      routeSummary: summary,
      amountOutWei: BigInt(summary.amountOut),
      amountInUsd,
      amountOutUsd,
      priceImpactPct: priceImpactPct(amountInUsd, amountOutUsd),
      gas: summary.gas,
    };
  }

  async buildSwap(
    routeSummary: unknown,
    sender: string,
    recipient: string,
    slippageBps: number,
  ): Promise<BuildResult> {
    const res = await fetch(`${KYBER_BASE}/route/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routeSummary,
        sender,
        recipient,
        slippageTolerance: slippageBps,
      }),
    });
    const body = (await res.json()) as {
      data?: { data: string; routerAddress: string; gas: string };
      message?: string;
    };

    if (!body.data?.data) {
      throw new Error(`KyberSwap build failed: ${body.message || 'No TX data'}`);
    }
    return body.data;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/kyber.client.spec.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/kyber.client.ts src/swap/kyber.client.spec.ts
git commit -m "feat(swap): add kyberswap client with derived price impact"
```

---

**Remaining backend tasks (4–9) and frontend tasks (10–14) follow in the continuation section below.**

---

### Task 4: Deposit verifier

The security heart of the module. midias verifies that *a* transfer reached the treasury; this verifies that **the authenticated user's** transfer did. Each rejection reason gets its own test, because a single "it rejects bad input" test lets a real hole hide behind a passing suite.

**Files:**
- Create: `backend/src/swap/swap-verifier.service.ts`
- Test: `backend/src/swap/swap-verifier.service.spec.ts`

**Interfaces:**
- Consumes: `ConfigService`, constants from Task 1.
- Produces: class `SwapVerifierService` with `getTreasuryAddress(): string`, `isEnabled(): boolean`, and `verifyDeposit(txHash: string, expected: ExpectedDeposit): Promise<VerifyResult>`. `ExpectedDeposit` is `{ fromAddress: string; token: string; decimals: number; amount: number }`. `VerifyResult` is `{ ok: true; amount: number; blockNumber: number } | { ok: false; reason: Rejection }`, where `Rejection` is `'NOT_FOUND' | 'REVERTED' | 'INSUFFICIENT_CONFIRMATIONS' | 'NO_TRANSFER' | 'WRONG_RECIPIENT' | 'WRONG_SENDER' | 'WRONG_AMOUNT'`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/swap-verifier.service.spec.ts
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { SwapVerifierService, ExpectedDeposit } from './swap-verifier.service';
import { USDT_ADDRESS, USDT_DECIMALS } from './swap.constants';

const TREASURY = '0x2222222222222222222222222222222222222222';
const USER = '0x1111111111111111111111111111111111111111';
const OTHER = '0x3333333333333333333333333333333333333333';

const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');
const pad = (a: string) => ethers.zeroPadValue(a, 32);

function transferLog(o: { token?: string; from?: string; to?: string; amount?: number } = {}) {
  return {
    address: o.token ?? USDT_ADDRESS,
    topics: [TRANSFER_TOPIC, pad(o.from ?? USER), pad(o.to ?? TREASURY)],
    data: ethers.zeroPadValue(
      ethers.toBeHex(ethers.parseUnits(String(o.amount ?? 100), USDT_DECIMALS)),
      32,
    ),
  };
}

function build(receipt: any, head = 1000) {
  const provider = {
    getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
    getBlockNumber: jest.fn().mockResolvedValue(head),
  };
  const config = {
    get: (k: string) =>
      ({ ETH_RPC_URL: 'http://stub', HOT_WALLET_PRIVATE_KEY: undefined, SWAP_TREASURY_ADDRESS: TREASURY })[k],
  } as unknown as ConfigService;
  const svc = new SwapVerifierService(config);
  (svc as any).provider = provider;
  return svc;
}

const expected: ExpectedDeposit = {
  fromAddress: USER,
  token: USDT_ADDRESS,
  decimals: USDT_DECIMALS,
  amount: 100,
};

describe('SwapVerifierService', () => {
  it('accepts the user\'s own deposit', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog()] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({
      ok: true, amount: 100, blockNumber: 900,
    });
  });

  it('rejects a transaction that does not exist', async () => {
    expect(await build(null).verifyDeposit('0xabc', expected)).toEqual({
      ok: false, reason: 'NOT_FOUND',
    });
  });

  it('rejects a reverted transaction', async () => {
    const svc = build({ status: 0, blockNumber: 900, logs: [transferLog()] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({ ok: false, reason: 'REVERTED' });
  });

  it('rejects too few confirmations', async () => {
    const svc = build({ status: 1, blockNumber: 999, logs: [transferLog()] }, 1000);
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({
      ok: false, reason: 'INSUFFICIENT_CONFIRMATIONS',
    });
  });

  it('rejects a transfer of a different token', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog({ token: OTHER })] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({ ok: false, reason: 'NO_TRANSFER' });
  });

  it('rejects a transfer to somewhere other than the treasury', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog({ to: OTHER })] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({
      ok: false, reason: 'WRONG_RECIPIENT',
    });
  });

  it('rejects a deposit sent by somebody else — the midias hole', async () => {
    // Review Focus 1. A real transfer to the treasury, from a wallet that is
    // not the caller's. midias credits this to whoever calls execute.
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog({ from: OTHER })] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({ ok: false, reason: 'WRONG_SENDER' });
  });

  it('rejects a short amount', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog({ amount: 90 })] });
    expect(await svc.verifyDeposit('0xabc', expected)).toEqual({ ok: false, reason: 'WRONG_AMOUNT' });
  });

  it('accepts a 0.5% rounding shortfall, as midias does', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog({ amount: 99.7 })] });
    expect((await svc.verifyDeposit('0xabc', expected)).ok).toBe(true);
  });

  it('matches addresses case-insensitively', async () => {
    const svc = build({ status: 1, blockNumber: 900, logs: [transferLog()] });
    const r = await svc.verifyDeposit('0xabc', {
      ...expected,
      fromAddress: USER.toUpperCase().replace('0X', '0x'),
    });
    expect(r.ok).toBe(true);
  });

  it('sums only the user\'s transfers when a tx contains several', async () => {
    const svc = build({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({ from: OTHER, amount: 1000 }), transferLog({ amount: 100 })],
    });
    const r = await svc.verifyDeposit('0xabc', expected);
    expect(r).toEqual({ ok: true, amount: 100, blockNumber: 900 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-verifier.service.spec.ts`
Expected: FAIL — `Cannot find module './swap-verifier.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/swap/swap-verifier.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { REQUIRED_CONFIRMATIONS } from './swap.constants';

export type Rejection =
  | 'NOT_FOUND'
  | 'REVERTED'
  | 'INSUFFICIENT_CONFIRMATIONS'
  | 'NO_TRANSFER'
  | 'WRONG_RECIPIENT'
  | 'WRONG_SENDER'
  | 'WRONG_AMOUNT';

export interface ExpectedDeposit {
  fromAddress: string;
  token: string;
  decimals: number;
  amount: number;
}

export type VerifyResult =
  | { ok: true; amount: number; blockNumber: number }
  | { ok: false; reason: Rejection };

const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

@Injectable()
export class SwapVerifierService {
  private readonly logger = new Logger(SwapVerifierService.name);
  private provider?: ethers.JsonRpcProvider;
  private treasury: string;

  constructor(private configService: ConfigService) {
    const rpc = this.configService.get<string>('ETH_RPC_URL');
    if (rpc) this.provider = new ethers.JsonRpcProvider(rpc);
    this.treasury = this.resolveTreasury();
    if (!this.treasury) {
      this.logger.warn('No treasury address — swaps disabled');
    }
  }

  /** Same wallet as staking, so deposits and payouts share one balance. */
  private resolveTreasury(): string {
    const override = this.configService.get<string>('SWAP_TREASURY_ADDRESS');
    if (override && ethers.isAddress(override)) return override.toLowerCase();
    const pk = this.configService.get<string>('HOT_WALLET_PRIVATE_KEY');
    if (!pk) return '';
    try {
      return new ethers.Wallet(pk).address.toLowerCase();
    } catch {
      return '';
    }
  }

  isEnabled(): boolean {
    return !!this.provider && !!this.treasury;
  }

  getTreasuryAddress(): string {
    return this.treasury;
  }

  /**
   * Re-read the chain and decide whether this transaction funds a trade.
   *
   * Unlike the midias original, this requires the transfer's `from` to be the
   * authenticated user. Without that check anyone can quote a stranger's tx
   * hash and claim the output.
   */
  async verifyDeposit(txHash: string, expected: ExpectedDeposit): Promise<VerifyResult> {
    if (!this.provider) return { ok: false, reason: 'NOT_FOUND' };

    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt) return { ok: false, reason: 'NOT_FOUND' };
    if (receipt.status !== 1) return { ok: false, reason: 'REVERTED' };

    const head = await this.provider.getBlockNumber();
    if (head - receipt.blockNumber + 1 < REQUIRED_CONFIRMATIONS) {
      return { ok: false, reason: 'INSUFFICIENT_CONFIRMATIONS' };
    }

    const tokenLogs = (receipt.logs || []).filter(
      (l: any) =>
        (l.address || '').toLowerCase() === expected.token.toLowerCase() &&
        l.topics?.[0] === TRANSFER_TOPIC,
    );
    if (!tokenLogs.length) return { ok: false, reason: 'NO_TRANSFER' };

    const toTreasury = tokenLogs.filter(
      (l: any) => this.addr(l.topics[2]) === this.treasury,
    );
    if (!toTreasury.length) return { ok: false, reason: 'WRONG_RECIPIENT' };

    const fromUser = toTreasury.filter(
      (l: any) => this.addr(l.topics[1]) === expected.fromAddress.toLowerCase(),
    );
    if (!fromUser.length) return { ok: false, reason: 'WRONG_SENDER' };

    const received = fromUser.reduce((s: bigint, l: any) => s + BigInt(l.data), 0n);
    const wanted = ethers.parseUnits(expected.amount.toFixed(expected.decimals), expected.decimals);
    // 0.5% tolerance for rounding, matching midias.
    if (received < (wanted * 995n) / 1000n) return { ok: false, reason: 'WRONG_AMOUNT' };

    return {
      ok: true,
      amount: Number(ethers.formatUnits(received, expected.decimals)),
      blockNumber: receipt.blockNumber,
    };
  }

  private addr(topic: string): string {
    return ethers.getAddress('0x' + topic.slice(26)).toLowerCase();
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-verifier.service.spec.ts`
Expected: PASS — 11 tests.

"rejects a deposit sent by somebody else" is the one that must never regress. If it fails, stop.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap-verifier.service.ts src/swap/swap-verifier.service.spec.ts
git commit -m "feat(swap): verify deposits against chain, including sender"
```

---

### Task 5: Reserve floor

Swaps share the staking hot wallet. This refuses any STT transfer that would leave staking unable to pay out.

**Files:**
- Create: `backend/src/swap/reserve-floor.service.ts`
- Test: `backend/src/swap/reserve-floor.service.spec.ts`

**Interfaces:**
- Consumes: `StakingPosition` model, `ethers`, `ConfigService`.
- Produces: class `ReserveFloorService` with `outstandingSttObligation(): Promise<number>` and `canTransferStt(amountStt: number): Promise<{ ok: boolean; balance: number; obligation: number }>`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/reserve-floor.service.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { describeWithMongo, startTestMongo, TestMongo } from '../staking/test-utils';
import {
  StakingPosition, StakingPositionSchema, PositionStatus,
} from '../schemas/staking-position.schema';
import { ReserveFloorService } from './reserve-floor.service';

describeWithMongo('ReserveFloorService', () => {
  let mongo: TestMongo;
  let svc: ReserveFloorService;
  let model: any;
  let balance = 100;

  beforeAll(async () => {
    mongo = await startTestMongo();
    model = mongo.connection.model(StakingPosition.name, StakingPositionSchema);
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReserveFloorService,
        { provide: getModelToken(StakingPosition.name), useValue: model },
      ],
    }).compile();
    svc = moduleRef.get(ReserveFloorService);
    // Stub the on-chain balance read; the point under test is the arithmetic.
    (svc as any).readSttBalance = async () => balance;
  }, 120000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    balance = 100;
  });

  async function seed(amountStt: number, rewardStt: number, status: PositionStatus) {
    await model.create({
      userId: new Types.ObjectId(),
      walletAddress: '0x1111111111111111111111111111111111111111',
      amountStt, termDays: 90, aprBps: 1500, rewardStt,
      depositTxHash: `0x${new Types.ObjectId().toString()}`,
      stakedAt: new Date(), maturesAt: new Date(), status,
    });
  }

  it('is zero with no positions', async () => {
    expect(await svc.outstandingSttObligation()).toBeCloseTo(0, 6);
  });

  it('counts principal plus reward for ACTIVE positions', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    expect(await svc.outstandingSttObligation()).toBeCloseTo(10.37, 6);
  });

  it('counts CLOSING positions too — they are still owed', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    await seed(5, 0.18, PositionStatus.CLOSING);
    expect(await svc.outstandingSttObligation()).toBeCloseTo(15.55, 6);
  });

  it('ignores CLOSED positions', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    await seed(99, 9, PositionStatus.CLOSED);
    expect(await svc.outstandingSttObligation()).toBeCloseTo(10.37, 6);
  });

  it('allows a transfer that leaves the obligation covered', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    const r = await svc.canTransferStt(50);
    expect(r.ok).toBe(true);
  });

  it('refuses a transfer that would breach the obligation', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    balance = 20;
    const r = await svc.canTransferStt(15);
    expect(r.ok).toBe(false);
    expect(r.obligation).toBeCloseTo(10.37, 6);
  });

  it('refuses when the balance already sits below the obligation', async () => {
    await seed(10, 0.37, PositionStatus.ACTIVE);
    balance = 5;
    expect((await svc.canTransferStt(0.0001)).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/reserve-floor.service.spec.ts`
Expected: FAIL — `Cannot find module './reserve-floor.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/swap/reserve-floor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import {
  StakingPosition, StakingPositionDocument, PositionStatus,
} from '../schemas/staking-position.schema';
import { STT_ADDRESS, STT_DECIMALS } from './swap.constants';

const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'];

/**
 * Swaps and staking share one hot wallet. Staking positions are promises to
 * pay principal plus interest at maturity; a swap must never spend the STT
 * backing those promises.
 */
@Injectable()
export class ReserveFloorService {
  private readonly logger = new Logger(ReserveFloorService.name);
  private provider?: ethers.JsonRpcProvider;
  private treasury = '';

  constructor(
    @InjectModel(StakingPosition.name)
    private positionModel: Model<StakingPositionDocument>,
    configService?: ConfigService,
  ) {
    const rpc = configService?.get<string>('ETH_RPC_URL');
    if (rpc) this.provider = new ethers.JsonRpcProvider(rpc);
    const pk = configService?.get<string>('HOT_WALLET_PRIVATE_KEY');
    if (pk) {
      try {
        this.treasury = new ethers.Wallet(pk).address;
      } catch {
        this.treasury = '';
      }
    }
  }

  /** Every STT still owed to a staker. */
  async outstandingSttObligation(): Promise<number> {
    const rows = await this.positionModel
      .find({ status: { $in: [PositionStatus.ACTIVE, PositionStatus.CLOSING] } })
      .select('amountStt rewardStt')
      .lean();
    return rows.reduce((s: number, p: any) => s + p.amountStt + p.rewardStt, 0);
  }

  protected async readSttBalance(): Promise<number> {
    if (!this.provider || !this.treasury) return 0;
    const c = new ethers.Contract(STT_ADDRESS, ERC20_ABI, this.provider);
    const bal = await c.balanceOf(this.treasury);
    return Number(ethers.formatUnits(bal, STT_DECIMALS));
  }

  /** Checked immediately before any STT leaves the treasury for a swap. */
  async canTransferStt(
    amountStt: number,
  ): Promise<{ ok: boolean; balance: number; obligation: number }> {
    const [balance, obligation] = await Promise.all([
      this.readSttBalance(),
      this.outstandingSttObligation(),
    ]);
    const ok = balance - amountStt >= obligation;
    if (!ok) {
      this.logger.warn(
        `Reserve floor blocked a ${amountStt} STT transfer: balance ${balance}, obligation ${obligation}`,
      );
    }
    return { ok, balance, obligation };
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/reserve-floor.service.spec.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/reserve-floor.service.ts src/swap/reserve-floor.service.spec.ts
git commit -m "feat(swap): add reserve floor protecting staking obligations"
```

---

### Task 6: Quote and execute

Quoting applies the fee and the price-impact ceiling. Executing verifies the deposit and creates the row — the unique index makes that step idempotent, so a replayed call cannot create a second trade.

**Files:**
- Create: `backend/src/swap/swap.service.ts`
- Test: `backend/src/swap/swap.service.spec.ts`
- Create: `backend/src/swap/test-harness.ts`

**Interfaces:**
- Consumes: `KyberClient`, `SwapVerifierService`, `ReserveFloorService`, `SwapTrade` and `User` models, `TransferService`.
- Produces: class `SwapService` with `getQuote(amountIn: number, direction: Direction): Promise<Quote>` and `execute(userId: string, walletAddress: string, direction: Direction, amountIn: number, txHashIn: string): Promise<TradeResponse>`. `Quote` is `{ direction; amountIn; fee; feePercent; netIn; quotedOut; minReceived; rate; priceImpactPct; treasuryAddress }`.

- [ ] **Step 1: Write the shared harness**

```ts
// backend/src/swap/test-harness.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { startTestMongo, TestMongo } from '../staking/test-utils';
import { User, UserSchema } from '../schemas/user.schema';
import { SwapTrade, SwapTradeSchema } from '../schemas/swap-trade.schema';
import {
  StakingPosition, StakingPositionSchema,
} from '../schemas/staking-position.schema';
import { SwapService } from './swap.service';
import { KyberClient } from './kyber.client';
import { SwapVerifierService } from './swap-verifier.service';
import { ReserveFloorService } from './reserve-floor.service';
import { TransferService } from '../auth/transfer.service';

export const TREASURY = '0x2222222222222222222222222222222222222222';
export const WALLET = '0x1111111111111111111111111111111111111111';

export interface SwapHarness {
  mongo: TestMongo;
  models: Record<string, any>;
  swap: SwapService;
  kyber: { getRoute: jest.Mock; buildSwap: jest.Mock };
  verifier: { verifyDeposit: jest.Mock; getTreasuryAddress: jest.Mock; isEnabled: jest.Mock };
  floor: { canTransferStt: jest.Mock; outstandingSttObligation: jest.Mock };
  transfer: { transferStt: jest.Mock; transferUsdt: jest.Mock; isEnabled: jest.Mock };
}

/** Whole module wired against a scratch database, with chain and aggregator stubbed. */
export async function buildSwapHarness(): Promise<SwapHarness> {
  const mongo = await startTestMongo();
  const schemas: [string, any][] = [
    [User.name, UserSchema],
    [SwapTrade.name, SwapTradeSchema],
    [StakingPosition.name, StakingPositionSchema],
  ];
  const models: Record<string, any> = {};
  for (const [n, s] of schemas) models[n] = mongo.connection.model(n, s);
  await models[SwapTrade.name].init(); // the unique index is the point

  const kyber = { getRoute: jest.fn(), buildSwap: jest.fn() };
  const verifier = {
    verifyDeposit: jest.fn(),
    getTreasuryAddress: jest.fn().mockReturnValue(TREASURY),
    isEnabled: jest.fn().mockReturnValue(true),
  };
  const floor = {
    canTransferStt: jest.fn().mockResolvedValue({ ok: true, balance: 1000, obligation: 0 }),
    outstandingSttObligation: jest.fn().mockResolvedValue(0),
  };
  const transfer = {
    transferStt: jest.fn(),
    transferUsdt: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(true),
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      SwapService,
      { provide: KyberClient, useValue: kyber },
      { provide: SwapVerifierService, useValue: verifier },
      { provide: ReserveFloorService, useValue: floor },
      { provide: TransferService, useValue: transfer },
      ...Object.entries(models).map(([name, model]) => ({
        provide: getModelToken(name),
        useValue: model,
      })),
    ],
  }).compile();

  return { mongo, models, swap: moduleRef.get(SwapService), kyber, verifier, floor, transfer };
}

export async function resetSwapHarness(h: SwapHarness) {
  await h.mongo.clear();
  h.kyber.getRoute.mockReset();
  h.kyber.buildSwap.mockReset();
  h.verifier.verifyDeposit.mockReset();
  h.verifier.getTreasuryAddress.mockReturnValue(TREASURY);
  h.verifier.isEnabled.mockReturnValue(true);
  h.floor.canTransferStt.mockResolvedValue({ ok: true, balance: 1000, obligation: 0 });
  h.transfer.transferStt.mockReset();
  h.transfer.transferUsdt.mockReset();
  h.transfer.isEnabled.mockReturnValue(true);
}

/** A healthy KyberSwap route: 100 USDT in, 1.4 STT out, 1% impact. */
export function goodRoute() {
  return {
    routeSummary: { amountOut: '1400000000000000000' },
    amountOutWei: 1400000000000000000n,
    amountInUsd: 100,
    amountOutUsd: 99,
    priceImpactPct: 1,
    gas: '250000',
  };
}
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/swap/swap.service.spec.ts
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { describeWithMongo } from '../staking/test-utils';
import {
  buildSwapHarness, resetSwapHarness, goodRoute, SwapHarness, TREASURY, WALLET,
} from './test-harness';
import { User } from '../schemas/user.schema';
import { SwapTrade, SwapStatus } from '../schemas/swap-trade.schema';

describeWithMongo('SwapService — quote and execute', () => {
  let h: SwapHarness;
  let userId: string;

  beforeAll(async () => {
    h = await buildSwapHarness();
  }, 120000);
  afterAll(async () => {
    await h.mongo.stop();
  });

  beforeEach(async () => {
    await resetSwapHarness(h);
    const u = await h.models[User.name].create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    });
    userId = u._id.toString();
  });

  describe('getQuote', () => {
    it('takes a 1% fee in the input token and quotes the rest', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      const q = await h.swap.getQuote(100, 'BUY');
      expect(q.fee).toBeCloseTo(1, 8);
      expect(q.netIn).toBeCloseTo(99, 8);
      expect(q.quotedOut).toBeCloseTo(1.4, 8);
      expect(q.treasuryAddress).toBe(TREASURY);
    });

    it('quotes a minimum received 5% below the route', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      const q = await h.swap.getQuote(100, 'BUY');
      expect(q.minReceived).toBeCloseTo(1.4 * 0.95, 8);
    });

    it('rejects an amount below the minimum', async () => {
      await expect(h.swap.getQuote(0.05, 'BUY')).rejects.toThrow(BadRequestException);
    });

    it('rejects an amount above the maximum', async () => {
      await expect(h.swap.getQuote(1001, 'BUY')).rejects.toThrow(BadRequestException);
    });

    it('rejects a route whose price impact exceeds the ceiling', async () => {
      h.kyber.getRoute.mockResolvedValue({ ...goodRoute(), priceImpactPct: 2.5 });
      await expect(h.swap.getQuote(100, 'BUY')).rejects.toThrow(/price/i);
    });

    it('rejects when impact is unknown, rather than assuming it is safe', async () => {
      h.kyber.getRoute.mockResolvedValue({ ...goodRoute(), priceImpactPct: Infinity });
      await expect(h.swap.getQuote(100, 'BUY')).rejects.toThrow(/price/i);
    });
  });

  describe('execute', () => {
    const ok = { ok: true, amount: 100, blockNumber: 900 };

    it('creates a PENDING trade from a verified deposit', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      h.verifier.verifyDeposit.mockResolvedValue(ok);

      const t = await h.swap.execute(userId, WALLET, 'BUY', 100, '0xabc');

      expect(t.status).toBe(SwapStatus.PENDING);
      expect(t.quotedOut).toBeCloseTo(1.4, 8);
      expect(await h.models[SwapTrade.name].countDocuments()).toBe(1);
    });

    it('refuses a deposit the verifier rejects', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      h.verifier.verifyDeposit.mockResolvedValue({ ok: false, reason: 'WRONG_SENDER' });

      await expect(h.swap.execute(userId, WALLET, 'BUY', 100, '0xabc')).rejects.toThrow(
        /WRONG_SENDER/,
      );
      expect(await h.models[SwapTrade.name].countDocuments()).toBe(0);
    });

    it('creates exactly one trade when the same hash is submitted twice', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      h.verifier.verifyDeposit.mockResolvedValue(ok);

      const results = await Promise.allSettled([
        h.swap.execute(userId, WALLET, 'BUY', 100, '0xsame'),
        h.swap.execute(userId, WALLET, 'BUY', 100, '0xsame'),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await h.models[SwapTrade.name].countDocuments()).toBe(1);
    });

    it('refuses to reuse a hash that already funded a trade — the midias drain', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      h.verifier.verifyDeposit.mockResolvedValue(ok);
      await h.swap.execute(userId, WALLET, 'BUY', 100, '0xonce');

      await expect(h.swap.execute(userId, WALLET, 'BUY', 100, '0xonce')).rejects.toThrow(
        ConflictException,
      );
      expect(await h.models[SwapTrade.name].countDocuments()).toBe(1);
    });

    it('passes the caller\'s wallet to the verifier as the expected sender', async () => {
      h.kyber.getRoute.mockResolvedValue(goodRoute());
      h.verifier.verifyDeposit.mockResolvedValue(ok);
      await h.swap.execute(userId, WALLET, 'BUY', 100, '0xabc');

      expect(h.verifier.verifyDeposit).toHaveBeenCalledWith(
        '0xabc',
        expect.objectContaining({ fromAddress: WALLET }),
      );
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap.service.spec.ts`
Expected: FAIL — `Cannot find module './swap.service'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/swap/swap.service.ts
import {
  BadRequestException, ConflictException, Injectable, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers } from 'ethers';
import { Model, Types } from 'mongoose';
import {
  SwapTrade, SwapTradeDocument, SwapStatus,
} from '../schemas/swap-trade.schema';
import {
  Direction, MAX_PRICE_IMPACT_PCT, SLIPPAGE_BPS, SWAP_FEE_PERCENT,
} from './swap.constants';
import {
  decimalsIn, decimalsOut, feeFor, isValidAmount, minReceived, netAfterFee,
  tokenIn, tokenOut,
} from './swap-math';
import { KyberClient } from './kyber.client';
import { SwapVerifierService } from './swap-verifier.service';

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

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);

  private readonly feePercent: number;

  constructor(
    @InjectModel(SwapTrade.name) private tradeModel: Model<SwapTradeDocument>,
    private kyber: KyberClient,
    private verifier: SwapVerifierService,
    configService?: ConfigService,
  ) {
    // Config-driven per the spec; the constant is the fallback.
    const configured = Number(configService?.get<string>('SWAP_FEE_PERCENT'));
    this.feePercent =
      Number.isFinite(configured) && configured >= 0 ? configured : SWAP_FEE_PERCENT;
  }

  async getQuote(amountIn: number, direction: Direction): Promise<Quote> {
    if (!isValidAmount(amountIn, direction)) {
      throw new BadRequestException(
        `Amount is outside the allowed range for a ${direction}`,
      );
    }
    const treasuryAddress = this.verifier.getTreasuryAddress();
    if (!treasuryAddress) throw new BadRequestException('Swaps are not available');

    const fee = feeFor(amountIn, this.feePercent);
    const netIn = netAfterFee(amountIn, this.feePercent);

    const dIn = decimalsIn(direction);
    const dOut = decimalsOut(direction);
    const route = await this.kyber.getRoute(
      tokenIn(direction),
      tokenOut(direction),
      ethers.parseUnits(netIn.toFixed(dIn), dIn),
    );

    // Checked here AND again before execution: liquidity moves in between,
    // and an unknown impact (Infinity) must fail rather than pass.
    if (!(route.priceImpactPct <= MAX_PRICE_IMPACT_PCT)) {
      throw new BadRequestException(
        `This amount would move the price by more than ${MAX_PRICE_IMPACT_PCT}%. Try a smaller swap.`,
      );
    }

    const quotedOut = Number(ethers.formatUnits(route.amountOutWei, dOut));

    return {
      direction,
      amountIn,
      fee,
      feePercent: this.feePercent,
      netIn,
      quotedOut,
      minReceived: minReceived(quotedOut, SLIPPAGE_BPS),
      rate: quotedOut / amountIn,
      priceImpactPct: route.priceImpactPct,
      treasuryAddress,
    };
  }

  /**
   * Turn a verified on-chain deposit into a trade row.
   *
   * The unique index on txHashIn is what makes this idempotent: a replayed
   * call cannot create a second trade, however many times it is sent.
   */
  async execute(
    userId: string,
    walletAddress: string,
    direction: Direction,
    amountIn: number,
    txHashIn: string,
  ): Promise<SwapTradeDocument> {
    const quote = await this.getQuote(amountIn, direction);

    const result = await this.verifier.verifyDeposit(txHashIn, {
      fromAddress: walletAddress,
      token: tokenIn(direction),
      decimals: decimalsIn(direction),
      amount: amountIn,
    });
    if (!result.ok) {
      throw new BadRequestException(`Deposit not verified: ${result.reason}`);
    }

    try {
      return await this.tradeModel.create({
        userId: new Types.ObjectId(userId),
        walletAddress: walletAddress.toLowerCase(),
        direction,
        amountIn,
        quotedOut: quote.quotedOut,
        fee: quote.fee,
        feePercent: quote.feePercent,
        txHashIn: txHashIn.toLowerCase(),
        status: SwapStatus.PENDING,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('This transaction has already been used for a swap');
      }
      throw err;
    }
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap.service.spec.ts`
Expected: PASS — 11 tests.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap.service.ts src/swap/swap.service.spec.ts src/swap/test-harness.ts
git commit -m "feat(swap): add quote and idempotent execute"
```

---

### Task 7: Swap settlement and refund

The only code here that moves money. Everything funnels through one atomic claim, so the immediate attempt and the worker can never both execute a row.

> **This task leaves `settle` deliberately incomplete.** It obtains calldata from the aggregator but does not broadcast it — Task 8 adds that. Do not deploy between the two: at the end of this task the code would transfer output the treasury has not actually acquired. The tests pass because the executor is stubbed, which is not the same as the flow being correct.

**Files:**
- Modify: `backend/src/swap/swap.service.ts`
- Test: `backend/src/swap/swap-settle.spec.ts`

**Interfaces:**
- Consumes: everything from Task 6, plus `ReserveFloorService` and `TransferService`.
- Produces: on `SwapService` — `settle(tradeId: string): Promise<void>`, `refund(trade: SwapTradeDocument, reason: string): Promise<void>`, `getHistory(userId: string): Promise<SwapTradeDocument[]>`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/swap-settle.spec.ts
import { Types } from 'mongoose';
import { describeWithMongo } from '../staking/test-utils';
import {
  buildSwapHarness, resetSwapHarness, goodRoute, SwapHarness, WALLET,
} from './test-harness';
import { SwapTrade, SwapStatus } from '../schemas/swap-trade.schema';

describeWithMongo('SwapService — settlement', () => {
  let h: SwapHarness;

  beforeAll(async () => {
    h = await buildSwapHarness();
  }, 120000);
  afterAll(async () => {
    await h.mongo.stop();
  });
  beforeEach(async () => {
    await resetSwapHarness(h);
  });

  async function seed(direction: 'BUY' | 'SELL' = 'BUY') {
    const t = await h.models[SwapTrade.name].create({
      userId: new Types.ObjectId(),
      walletAddress: WALLET,
      direction,
      amountIn: 100,
      quotedOut: 1.4,
      fee: 1,
      feePercent: 1,
      txHashIn: `0x${new Types.ObjectId().toString()}`,
      status: SwapStatus.PENDING,
    });
    return t._id.toString();
  }

  it('swaps and sends the output, recording both hashes', async () => {
    const id = await seed();
    h.kyber.getRoute.mockResolvedValue(goodRoute());
    h.kyber.buildSwap.mockResolvedValue({ data: '0xd', routerAddress: '0xR', gas: '250000' });
    h.transfer.transferStt.mockResolvedValue({ txHash: '0xout' });

    await h.swap.settle(id);

    const t = await h.models[SwapTrade.name].findById(id);
    expect(t.status).toBe(SwapStatus.COMPLETED);
    expect(t.txHashOut).toBe('0xout');
    expect(t.actualOut).toBeGreaterThan(0);
  });

  it('settles exactly once when two runners race', async () => {
    const id = await seed();
    h.kyber.getRoute.mockResolvedValue(goodRoute());
    h.kyber.buildSwap.mockResolvedValue({ data: '0xd', routerAddress: '0xR', gas: '250000' });
    h.transfer.transferStt.mockImplementation(
      () => new Promise((r) => setTimeout(() => r({ txHash: '0xout' }), 40)),
    );

    await Promise.all([h.swap.settle(id), h.swap.settle(id)]);

    // The double-payout guard: one output transfer, never two.
    expect(h.transfer.transferStt).toHaveBeenCalledTimes(1);
  });

  it('refunds when the reserve floor blocks the output transfer', async () => {
    const id = await seed();
    h.kyber.getRoute.mockResolvedValue(goodRoute());
    h.kyber.buildSwap.mockResolvedValue({ data: '0xd', routerAddress: '0xR', gas: '250000' });
    h.floor.canTransferStt.mockResolvedValue({ ok: false, balance: 1, obligation: 100 });
    h.transfer.transferUsdt.mockResolvedValue({ txHash: '0xrefund' });

    await h.swap.settle(id);

    const t = await h.models[SwapTrade.name].findById(id);
    expect(t.status).toBe(SwapStatus.REFUNDED);
    expect(t.refundTxHash).toBe('0xrefund');
    expect(h.transfer.transferStt).not.toHaveBeenCalled();
  });

  it('refunds when price impact has risen above the ceiling since quoting', async () => {
    const id = await seed();
    h.kyber.getRoute.mockResolvedValue({ ...goodRoute(), priceImpactPct: 9 });
    h.transfer.transferUsdt.mockResolvedValue({ txHash: '0xrefund' });

    await h.swap.settle(id);

    const t = await h.models[SwapTrade.name].findById(id);
    expect(t.status).toBe(SwapStatus.REFUNDED);
  });

  it('refunds when the route disappears', async () => {
    const id = await seed();
    h.kyber.getRoute.mockRejectedValue(new Error('No route found'));
    h.transfer.transferUsdt.mockResolvedValue({ txHash: '0xrefund' });

    await h.swap.settle(id);
    expect((await h.models[SwapTrade.name].findById(id)).status).toBe(SwapStatus.REFUNDED);
  });

  it('leaves the trade REFUNDING, not REFUNDED, when the refund itself fails', async () => {
    // Review Focus 4: never claim money was returned when it was not.
    const id = await seed();
    h.kyber.getRoute.mockRejectedValue(new Error('No route found'));
    h.transfer.transferUsdt.mockRejectedValue(new Error('insufficient USDT'));

    await h.swap.settle(id);

    const t = await h.models[SwapTrade.name].findById(id);
    expect(t.status).toBe(SwapStatus.REFUNDING);
    expect(t.refundTxHash).toBeUndefined();
    expect(t.failureReason).toMatch(/insufficient USDT/);
  });

  it('refunds STT on a failed SELL, not USDT', async () => {
    const id = await seed('SELL');
    h.kyber.getRoute.mockRejectedValue(new Error('No route found'));
    h.transfer.transferStt.mockResolvedValue({ txHash: '0xrefundstt' });

    await h.swap.settle(id);

    expect(h.transfer.transferStt).toHaveBeenCalled();
    expect(h.transfer.transferUsdt).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-settle.spec.ts`
Expected: FAIL — `h.swap.settle is not a function`.

- [ ] **Step 3: Extend the service constructor**

Add to `SwapService`'s constructor, after `verifier`:

```ts
    private floor: ReserveFloorService,
    private transferService: TransferService,
```

and to the imports:

```ts
import { ReserveFloorService } from './reserve-floor.service';
import { TransferService } from '../auth/transfer.service';
import { SLIPPAGE_BPS } from './swap.constants';
```

- [ ] **Step 4: Add settlement and refund**

```ts
  /**
   * Execute one trade. Both the immediate attempt and the worker call this;
   * the atomic PENDING -> SWAPPING claim means only one proceeds.
   */
  async settle(tradeId: string): Promise<void> {
    const claimed = await this.tradeModel.findOneAndUpdate(
      { _id: tradeId, status: SwapStatus.PENDING },
      { status: SwapStatus.SWAPPING, claimedAt: new Date() },
      { new: true },
    );
    if (!claimed) {
      this.logger.warn(`Trade ${tradeId} already claimed by another runner`);
      return;
    }

    const direction = claimed.direction as Direction;
    const dIn = decimalsIn(direction);
    const dOut = decimalsOut(direction);

    try {
      const netIn = netAfterFee(claimed.amountIn, claimed.feePercent);
      const route = await this.kyber.getRoute(
        tokenIn(direction),
        tokenOut(direction),
        ethers.parseUnits(netIn.toFixed(dIn), dIn),
      );

      // Re-check impact: liquidity can move between quote and execution, and
      // this is the check that protects the user's money.
      if (!(route.priceImpactPct <= MAX_PRICE_IMPACT_PCT)) {
        throw new Error(
          `Price impact ${route.priceImpactPct}% exceeds ${MAX_PRICE_IMPACT_PCT}%`,
        );
      }

      const out = Number(ethers.formatUnits(route.amountOutWei, dOut));
      if (out < minReceived(claimed.quotedOut, SLIPPAGE_BPS)) {
        throw new Error(`Output ${out} below the quoted minimum`);
      }

      // Only a BUY sends STT out, so only a BUY can touch staking reserves.
      if (direction === 'BUY') {
        const floor = await this.floor.canTransferStt(out);
        if (!floor.ok) {
          throw new Error(
            `Reserve floor: balance ${floor.balance} STT cannot cover ${out} plus obligations ${floor.obligation}`,
          );
        }
      }

      await this.kyber.buildSwap(
        route.routeSummary,
        this.verifier.getTreasuryAddress(),
        this.verifier.getTreasuryAddress(),
        SLIPPAGE_BPS,
      );

      const { txHash } =
        direction === 'BUY'
          ? await this.transferService.transferStt(claimed.walletAddress, out)
          : await this.transferService.transferUsdt(claimed.walletAddress, out);

      await this.tradeModel.updateOne(
        { _id: claimed._id },
        {
          status: SwapStatus.COMPLETED,
          actualOut: out,
          txHashOut: txHash,
          processedAt: new Date(),
        },
      );
      this.logger.log(`Trade ${claimed._id} completed: ${out} out, tx ${txHash}`);
    } catch (err: any) {
      await this.refund(claimed, err?.message || 'Swap failed');
    }
  }

  /**
   * Return the user's input token. Gated on FAILED -> REFUNDING so it runs
   * once, and only marked REFUNDED once a transfer actually lands — a failed
   * refund must never read as a completed one.
   */
  async refund(trade: SwapTradeDocument, reason: string): Promise<void> {
    const claimed = await this.tradeModel.findOneAndUpdate(
      { _id: trade._id, status: { $in: [SwapStatus.SWAPPING, SwapStatus.FAILED] } },
      { status: SwapStatus.REFUNDING, failureReason: reason },
      { new: true },
    );
    if (!claimed) return;

    const direction = claimed.direction as Direction;
    try {
      const { txHash } =
        direction === 'BUY'
          ? await this.transferService.transferUsdt(claimed.walletAddress, claimed.amountIn)
          : await this.transferService.transferStt(claimed.walletAddress, claimed.amountIn);

      await this.tradeModel.updateOne(
        { _id: claimed._id },
        { status: SwapStatus.REFUNDED, refundTxHash: txHash, processedAt: new Date() },
      );
      this.logger.warn(`Trade ${claimed._id} refunded (${reason}): ${txHash}`);
    } catch (err: any) {
      // Stay REFUNDING. An operator must settle this by hand; the row is the
      // record that money is owed.
      await this.tradeModel.updateOne(
        { _id: claimed._id },
        {
          failureReason: `${reason} | refund failed: ${err?.message}`,
          $inc: { retryCount: 1 },
        },
      );
      this.logger.error(`Trade ${claimed._id} REFUND FAILED: ${err?.message}`);
    }
  }

  async getHistory(userId: string): Promise<SwapTradeDocument[]> {
    return this.tradeModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean() as unknown as Promise<SwapTradeDocument[]>;
  }
```

- [ ] **Step 5: Run both service specs**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap.service.spec.ts src/swap/swap-settle.spec.ts`
Expected: PASS — 11 + 7 tests.

"settles exactly once when two runners race" and "leaves the trade REFUNDING when the refund itself fails" are the two that must not regress.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap.service.ts src/swap/swap-settle.spec.ts
git commit -m "feat(swap): add settlement, reserve-floor check and refund path"
```

---

### Task 8: On-chain swap execution

Task 7 obtains calldata from the aggregator; this actually broadcasts it. Separated because it is the only part that signs with the treasury key, and because USDT's non-standard allowance behaviour needs its own tests.

**Files:**
- Create: `backend/src/swap/swap-executor.service.ts`
- Test: `backend/src/swap/swap-executor.service.spec.ts`
- Modify: `backend/src/swap/swap.service.ts` (call it from `settle`)

**Interfaces:**
- Consumes: `ConfigService`, `KyberClient`.
- Produces: class `SwapExecutorService` with `executeSwap(params: { tokenIn: string; amountInWei: bigint; routerAddress: string; calldata: string; gas: string }): Promise<string>` returning the swap tx hash, and `ensureAllowance(tokenIn: string, routerAddress: string, amountInWei: bigint): Promise<void>`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/swap-executor.service.spec.ts
import { ConfigService } from '@nestjs/config';
import { SwapExecutorService } from './swap-executor.service';
import { USDT_ADDRESS, STT_ADDRESS } from './swap.constants';

const ROUTER = '0x5555555555555555555555555555555555555555';

function build(opts: { allowance: bigint; approveSpy?: jest.Mock }) {
  const approve = opts.approveSpy ?? jest.fn().mockResolvedValue({ wait: async () => ({ status: 1 }) });
  const config = {
    get: (k: string) =>
      ({ ETH_RPC_URL: 'http://stub', HOT_WALLET_PRIVATE_KEY: '0x' + '1'.repeat(64) })[k],
  } as unknown as ConfigService;

  const svc = new SwapExecutorService(config);
  (svc as any).makeTokenContract = () => ({
    allowance: jest.fn().mockResolvedValue(opts.allowance),
    approve,
  });
  (svc as any).signer = {
    sendTransaction: jest.fn().mockResolvedValue({
      hash: '0xswap',
      wait: async () => ({ status: 1, hash: '0xswap' }),
    }),
  };
  return { svc, approve };
}

describe('SwapExecutorService', () => {
  describe('ensureAllowance', () => {
    it('does nothing when the allowance already covers the amount', async () => {
      const { svc, approve } = build({ allowance: 10_000n });
      await svc.ensureAllowance(STT_ADDRESS, ROUTER, 1_000n);
      expect(approve).not.toHaveBeenCalled();
    });

    it('approves when the allowance is short', async () => {
      const { svc, approve } = build({ allowance: 0n });
      await svc.ensureAllowance(STT_ADDRESS, ROUTER, 1_000n);
      expect(approve).toHaveBeenCalledTimes(1);
    });

    it('resets USDT to zero first when raising a non-zero allowance', async () => {
      // Review Focus 2: USDT reverts if a non-zero allowance is raised
      // directly. Without the reset the swap strands mid-flight.
      const { svc, approve } = build({ allowance: 5n });
      await svc.ensureAllowance(USDT_ADDRESS, ROUTER, 1_000n);

      expect(approve).toHaveBeenCalledTimes(2);
      expect(approve.mock.calls[0][1]).toBe(0);
      expect(approve.mock.calls[1][1]).toBeGreaterThan(0n);
    });

    it('does not reset a standard token with a non-zero allowance', async () => {
      const { svc, approve } = build({ allowance: 5n });
      await svc.ensureAllowance(STT_ADDRESS, ROUTER, 1_000n);
      expect(approve).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeSwap', () => {
    it('broadcasts the router calldata and returns the hash', async () => {
      const { svc } = build({ allowance: 10_000n });
      const hash = await svc.executeSwap({
        tokenIn: STT_ADDRESS,
        amountInWei: 1_000n,
        routerAddress: ROUTER,
        calldata: '0xdeadbeef',
        gas: '250000',
      });
      expect(hash).toBe('0xswap');
      const sent = (svc as any).signer.sendTransaction.mock.calls[0][0];
      expect(sent.to).toBe(ROUTER);
      expect(sent.data).toBe('0xdeadbeef');
    });

    it('adds a 30% gas buffer, as midias does', async () => {
      const { svc } = build({ allowance: 10_000n });
      await svc.executeSwap({
        tokenIn: STT_ADDRESS, amountInWei: 1_000n, routerAddress: ROUTER,
        calldata: '0xd', gas: '100000',
      });
      const sent = (svc as any).signer.sendTransaction.mock.calls[0][0];
      expect(sent.gasLimit).toBe(130000n);
    });

    it('throws when the swap reverts on-chain', async () => {
      const { svc } = build({ allowance: 10_000n });
      (svc as any).signer.sendTransaction = jest.fn().mockResolvedValue({
        hash: '0xbad',
        wait: async () => ({ status: 0 }),
      });
      await expect(
        svc.executeSwap({
          tokenIn: STT_ADDRESS, amountInWei: 1_000n, routerAddress: ROUTER,
          calldata: '0xd', gas: '100000',
        }),
      ).rejects.toThrow(/failed on-chain/i);
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap-executor.service.spec.ts`
Expected: FAIL — `Cannot find module './swap-executor.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/swap/swap-executor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { USDT_ADDRESS } from './swap.constants';

/** Standard ERC-20 — approve/transfer return bool. */
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

/** USDT returns nothing from approve, so the ABI must not expect a value. */
const USDT_ABI = [
  'function approve(address spender, uint256 amount)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

@Injectable()
export class SwapExecutorService {
  private readonly logger = new Logger(SwapExecutorService.name);
  private provider?: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpc = this.configService.get<string>('ETH_RPC_URL');
    const pk = this.configService.get<string>('HOT_WALLET_PRIVATE_KEY');
    if (!rpc || !pk) {
      this.logger.warn('RPC or hot wallet key missing — swap execution disabled');
      return;
    }
    this.provider = new ethers.JsonRpcProvider(rpc);
    this.signer = new ethers.Wallet(pk, this.provider);
  }

  private makeTokenContract(token: string): ethers.Contract {
    const isUsdt = token.toLowerCase() === USDT_ADDRESS.toLowerCase();
    return new ethers.Contract(token, isUsdt ? USDT_ABI : ERC20_ABI, this.signer!);
  }

  /**
   * USDT reverts when a non-zero allowance is raised directly, so it must be
   * reset to zero first. Standard tokens do not need the extra transaction.
   */
  async ensureAllowance(
    tokenIn: string,
    routerAddress: string,
    amountInWei: bigint,
  ): Promise<void> {
    const contract = this.makeTokenContract(tokenIn);
    const owner = this.signer!.address;
    const current: bigint = await contract.allowance(owner, routerAddress);
    if (current >= amountInWei) return;

    const isUsdt = tokenIn.toLowerCase() === USDT_ADDRESS.toLowerCase();
    if (isUsdt && current > 0n) {
      this.logger.log('Resetting USDT allowance to zero before raising it');
      const reset = await contract.approve(routerAddress, 0);
      await reset.wait();
    }

    // Approve generously so routine swaps do not each need an approval.
    const approve = await contract.approve(routerAddress, amountInWei * 10n);
    await approve.wait();
  }

  async executeSwap(params: {
    tokenIn: string;
    amountInWei: bigint;
    routerAddress: string;
    calldata: string;
    gas: string;
  }): Promise<string> {
    if (!this.signer) throw new Error('Swap execution is not configured');

    await this.ensureAllowance(params.tokenIn, params.routerAddress, params.amountInWei);

    const tx = await this.signer.sendTransaction({
      to: params.routerAddress,
      data: params.calldata,
      // 30% buffer, matching midias.
      gasLimit: (BigInt(params.gas) * 130n) / 100n,
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Swap transaction failed on-chain: ${tx.hash}`);
    }
    return receipt.hash;
  }
}
```

- [ ] **Step 4: Wire it into `settle`**

In `swap.service.ts`, add `private executor: SwapExecutorService,` to the constructor and the matching import, then replace the `buildSwap` call in `settle` with:

```ts
      const build = await this.kyber.buildSwap(
        route.routeSummary,
        this.verifier.getTreasuryAddress(),
        this.verifier.getTreasuryAddress(),
        SLIPPAGE_BPS,
      );

      // Actually perform the swap before any output leaves the treasury.
      const swapTxHash = await this.executor.executeSwap({
        tokenIn: tokenIn(direction),
        amountInWei: ethers.parseUnits(netIn.toFixed(dIn), dIn),
        routerAddress: build.routerAddress,
        calldata: build.data,
        gas: build.gas,
      });
      this.logger.log(`Swap executed for trade ${claimed._id}: ${swapTxHash}`);
```

Add `executor` to the test harness in `test-harness.ts`:

```ts
  const executor = { executeSwap: jest.fn().mockResolvedValue('0xswaptx'), ensureAllowance: jest.fn() };
```
provided as `{ provide: SwapExecutorService, useValue: executor }`, returned on the harness, and reset in `resetSwapHarness`.

- [ ] **Step 5: Run the executor and settlement specs**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/`
Expected: PASS — every swap spec, including the settlement tests now that the executor is stubbed.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap-executor.service.ts src/swap/swap-executor.service.spec.ts src/swap/swap.service.ts src/swap/test-harness.ts
git commit -m "feat(swap): execute the aggregator swap, handling USDT allowance"
```

---

### Task 9: Worker backstop

The immediate attempt covers the common case. This catches rows stranded by a restart, and anything stuck in `SWAPPING` past a timeout.

**Files:**
- Create: `backend/src/swap/swap.worker.ts`
- Test: `backend/src/swap/swap.worker.spec.ts`

**Interfaces:**
- Consumes: `SwapTrade` model, `SwapService`.
- Produces: class `SwapWorker` with `sweep(): Promise<number>` returning how many rows it processed.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/swap/swap.worker.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { describeWithMongo, startTestMongo, TestMongo } from '../staking/test-utils';
import { SwapTrade, SwapTradeSchema, SwapStatus } from '../schemas/swap-trade.schema';
import { SwapService } from './swap.service';
import { SwapWorker } from './swap.worker';

describeWithMongo('SwapWorker', () => {
  let mongo: TestMongo;
  let worker: SwapWorker;
  let model: any;
  let settle: jest.Mock;

  beforeAll(async () => {
    mongo = await startTestMongo();
    model = mongo.connection.model(SwapTrade.name, SwapTradeSchema);
    settle = jest.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [
        SwapWorker,
        { provide: SwapService, useValue: { settle } },
        { provide: getModelToken(SwapTrade.name), useValue: model },
      ],
    }).compile();
    worker = moduleRef.get(SwapWorker);
  }, 120000);

  afterAll(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await mongo.clear();
    settle.mockClear();
  });

  async function seed(status: SwapStatus, claimedAt?: Date) {
    return model.create({
      userId: new Types.ObjectId(),
      walletAddress: '0x1111111111111111111111111111111111111111',
      direction: 'BUY', amountIn: 100, quotedOut: 1.4, fee: 1, feePercent: 1,
      txHashIn: `0x${new Types.ObjectId().toString()}`,
      status, claimedAt,
    });
  }

  it('settles a PENDING trade the immediate attempt never reached', async () => {
    await seed(SwapStatus.PENDING);
    expect(await worker.sweep()).toBe(1);
    expect(settle).toHaveBeenCalledTimes(1);
  });

  it('leaves a COMPLETED trade alone', async () => {
    await seed(SwapStatus.COMPLETED);
    expect(await worker.sweep()).toBe(0);
    expect(settle).not.toHaveBeenCalled();
  });

  it('ignores a SWAPPING trade claimed moments ago', async () => {
    await seed(SwapStatus.SWAPPING, new Date());
    expect(await worker.sweep()).toBe(0);
  });

  it('recovers a SWAPPING trade stranded past the timeout', async () => {
    // A restart mid-swap leaves this row claimed forever in midias.
    await seed(SwapStatus.SWAPPING, new Date(Date.now() - 20 * 60 * 1000));
    expect(await worker.sweep()).toBe(1);
  });

  it('returns a stranded row to PENDING before settling it', async () => {
    const t = await seed(SwapStatus.SWAPPING, new Date(Date.now() - 20 * 60 * 1000));
    await worker.sweep();
    // settle() claims PENDING -> SWAPPING itself, so the sweep must reset it
    // or the claim would find nothing.
    expect(settle).toHaveBeenCalledWith(t._id.toString());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap.worker.spec.ts`
Expected: FAIL — `Cannot find module './swap.worker'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/swap/swap.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  SwapTrade, SwapTradeDocument, SwapStatus,
} from '../schemas/swap-trade.schema';
import { SwapService } from './swap.service';

/** A SWAPPING row older than this is presumed stranded by a restart. */
const STRANDED_AFTER_MS = 15 * 60 * 1000;

@Injectable()
export class SwapWorker {
  private readonly logger = new Logger(SwapWorker.name);
  private running = false;

  constructor(
    @InjectModel(SwapTrade.name) private tradeModel: Model<SwapTradeDocument>,
    private swapService: SwapService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scheduled() {
    if (this.running) return;
    this.running = true;
    try {
      await this.sweep();
    } finally {
      this.running = false;
    }
  }

  async sweep(): Promise<number> {
    // Return stranded rows to PENDING first; settle() claims from PENDING.
    const cutoff = new Date(Date.now() - STRANDED_AFTER_MS);
    const stranded = await this.tradeModel.updateMany(
      { status: SwapStatus.SWAPPING, claimedAt: { $lt: cutoff } },
      { status: SwapStatus.PENDING, $unset: { claimedAt: 1 } },
    );
    if (stranded.modifiedCount) {
      this.logger.warn(`Recovered ${stranded.modifiedCount} stranded swap(s)`);
    }

    const pending = await this.tradeModel.find({ status: SwapStatus.PENDING }).select('_id');
    let processed = 0;
    for (const row of pending) {
      await this.swapService.settle(row._id.toString());
      processed += 1;
    }
    return processed;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/swap/swap.worker.spec.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap.worker.ts src/swap/swap.worker.spec.ts
git commit -m "feat(swap): add worker recovering stranded swaps"
```

---

### Task 10: HTTP surface and module wiring

**Files:**
- Create: `backend/src/swap/swap.controller.ts`
- Create: `backend/src/swap/swap-admin.controller.ts`
- Create: `backend/src/swap/swap.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Write the authenticated controller**

```ts
// backend/src/swap/swap.controller.ts
import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsIn, IsNumber, IsString, Matches } from 'class-validator';
import { SwapService } from './swap.service';
import { SwapVerifierService } from './swap-verifier.service';
import {
  Direction, MAX_PRICE_IMPACT_PCT, MAX_STT, MAX_USDT, MIN_STT, MIN_USDT,
  SLIPPAGE_BPS, SWAP_FEE_PERCENT,
} from './swap.constants';

class ExecuteSwapDto {
  @IsIn(['BUY', 'SELL'])
  direction: Direction;

  @IsNumber()
  amountIn: number;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' })
  txHashIn: string;
}

@Controller('swap')
export class SwapController {
  constructor(
    private swapService: SwapService,
    private verifier: SwapVerifierService,
  ) {}

  @Get('config')
  getConfig() {
    return {
      feePercent: this.feePercent,
      slippageBps: SLIPPAGE_BPS,
      maxPriceImpactPct: MAX_PRICE_IMPACT_PCT,
      limits: {
        BUY: { min: MIN_USDT, max: MAX_USDT },
        SELL: { min: MIN_STT, max: MAX_STT },
      },
      treasuryAddress: this.verifier.getTreasuryAddress(),
      enabled: this.verifier.isEnabled(),
    };
  }

  @Get('quote')
  async quote(
    @Query('amount') amount: string,
    @Query('direction') direction: Direction = 'BUY',
  ) {
    return this.swapService.getQuote(Number(amount), direction);
  }

  @UseGuards(AuthGuard('privy'))
  @Post('execute')
  async execute(@Request() req, @Body() body: ExecuteSwapDto) {
    // The wallet comes from the verified session, never from the body — this
    // is what stops a caller claiming someone else's deposit.
    const wallet = req.user.walletAddress;
    const trade = await this.swapService.execute(
      req.user._id,
      wallet,
      body.direction,
      body.amountIn,
      body.txHashIn,
    );
    // Fire the immediate attempt; the worker is the backstop.
    this.swapService.settle(trade._id.toString()).catch(() => undefined);
    return { success: true, tradeId: trade._id, status: trade.status };
  }

  @UseGuards(AuthGuard('privy'))
  @Get('me')
  async me(@Request() req) {
    return { trades: await this.swapService.getHistory(req.user._id) };
  }
}
```

- [ ] **Step 2: Write the admin controller**

```ts
// backend/src/swap/swap-admin.controller.ts
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminSecretGuard } from '../staking/admin-secret.guard';
import { SwapService } from './swap.service';
import { SwapWorker } from './swap.worker';
import { ReserveFloorService } from './reserve-floor.service';

@UseGuards(AdminSecretGuard)
@Controller('swap/admin')
export class SwapAdminController {
  constructor(
    private swapService: SwapService,
    private worker: SwapWorker,
    private floor: ReserveFloorService,
  ) {}

  @Get('reserve')
  async reserve() {
    return this.floor.canTransferStt(0);
  }

  @Post('sweep')
  async sweep() {
    return { processed: await this.worker.sweep() };
  }

  @Post('trades/:id/retry')
  async retry(@Param('id') id: string) {
    await this.swapService.settle(id);
    return { success: true };
  }
}
```

- [ ] **Step 3: Write the module and register it**

```ts
// backend/src/swap/swap.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../schemas/user.schema';
import { SwapTrade, SwapTradeSchema } from '../schemas/swap-trade.schema';
import {
  StakingPosition, StakingPositionSchema,
} from '../schemas/staking-position.schema';
import { SwapService } from './swap.service';
import { KyberClient } from './kyber.client';
import { SwapVerifierService } from './swap-verifier.service';
import { SwapExecutorService } from './swap-executor.service';
import { ReserveFloorService } from './reserve-floor.service';
import { SwapWorker } from './swap.worker';
import { SwapController } from './swap.controller';
import { SwapAdminController } from './swap-admin.controller';
import { AdminSecretGuard } from '../staking/admin-secret.guard';

@Module({
  imports: [
    AuthModule, // TransferService and the Privy strategy
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SwapTrade.name, schema: SwapTradeSchema },
      // Read-only: the reserve floor needs staking obligations.
      { name: StakingPosition.name, schema: StakingPositionSchema },
    ]),
  ],
  controllers: [SwapController, SwapAdminController],
  providers: [
    SwapService, KyberClient, SwapVerifierService, SwapExecutorService,
    ReserveFloorService, SwapWorker, AdminSecretGuard,
  ],
})
export class SwapModule {}
```

In `backend/src/app.module.ts`, import `SwapModule` and add it to `imports` after `StakingModule`.

- [ ] **Step 4: Confirm the Privy session exposes a wallet address**

Run: `cd /Users/kenho/projects/silvertimes/backend && grep -n "walletAddress" src/auth/privy.strategy.ts src/schemas/user.schema.ts`

`req.user.walletAddress` must be populated for `execute` to work. If a user has no linked wallet the controller must reject with a clear message rather than passing `undefined` to the verifier — add that guard if the grep shows it can be absent.

- [ ] **Step 5: Verify the whole backend**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest && npm run build`
Expected: every swap spec passes, the pre-existing staking and prediction specs still pass, and `nest build` reports no TypeScript errors.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/swap/swap.controller.ts src/swap/swap-admin.controller.ts src/swap/swap.module.ts src/app.module.ts
git commit -m "feat(swap): expose swap endpoints and wire the module"
```

---

## Phase 2 — Frontend

All paths relative to `/Users/kenho/projects/silvertimes/silvertimes.io`.

### Task 11: API client and preview maths

The page quotes before the backend sees anything, so the preview must agree with the server exactly. The backend remains the authority.

**Files:**
- Create: `src/components/swap/swap.ts`
- Modify: `src/services/api.ts` (append `swapApi`)

**Interfaces:**
- Consumes: `apiRequest` from `src/services/api.ts`.
- Produces: `Direction`, `USDT_DECIMALS`, `STT_DECIMALS`, `MIN_USDT`, `MIN_STT`, `MAX_USDT`, `MAX_STT`, `FEE_PERCENT`, `previewFee`, `previewNet`, `fmtUsdt`, `fmtStt`, `tokenLabel`, `isValidAmount`, `encodeTransfer`; types `SwapConfig`, `Quote`, `Trade`; and `swapApi` with `getConfig`, `getQuote`, `execute`, `getMe`.

- [ ] **Step 1: Write the module**

```ts
// src/components/swap/swap.ts
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

export function previewNet(amountIn: number): number {
  return Math.max(0, amountIn - previewFee(amountIn));
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

/**
 * ERC-20 transfer(address,uint256) calldata, scaled via the fixed-decimal
 * string. Float scaling misencodes at 18 decimals.
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
```

- [ ] **Step 2: Verify the preview maths agrees with the backend**

Run:
```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io && node -e "
const fee=(a)=>(a*1)/100, net=(a)=>Math.max(0,a-fee(a));
const cases=[[100,1,99],[0.1,0.001,0.099],[1000,10,990]];
let ok=true;
for(const [a,f,n] of cases){
  const okRow = Math.abs(fee(a)-f)<1e-9 && Math.abs(net(a)-n)<1e-9;
  if(!okRow) ok=false;
  console.log(okRow?'PASS':'FAIL', a, '-> fee', fee(a), 'net', net(a));
}
console.log(ok?'preview fee maths matches the backend':'MISMATCH');
"
```
Expected: all PASS.

- [ ] **Step 3: Append the API client**

Add to the end of `src/services/api.ts`:

```ts
// Swap API (secret /swap page)
export const swapApi = {
  getConfig: () => apiRequest<any>('/swap/config'),

  getQuote: (amount: number, direction: 'BUY' | 'SELL') =>
    apiRequest<any>(`/swap/quote?amount=${amount}&direction=${direction}`),

  execute: (
    token: string,
    body: { direction: 'BUY' | 'SELL'; amountIn: number; txHashIn: string },
  ) => apiRequest<any>('/swap/execute', { method: 'POST', body, token }),

  getMe: (token: string) => apiRequest<any>('/swap/me', { token }),
};
```

- [ ] **Step 4: Verify the build**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build`
Expected: `tsc` and `vite build` both succeed.

- [ ] **Step 5: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/swap/swap.ts src/services/api.ts
git commit -m "feat(swap): add swap api client and preview maths"
```

---

### Task 12: Route, gate, and page shell

**Files:**
- Create: `src/components/swap/SwapPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the page shell**

```tsx
// src/components/swap/SwapPage.tsx
import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Grain } from "../v2/cinematic";
import FooterV2 from "../FooterV2";
import { swapApi } from "../../services/api";
import SwapCard from "./SwapCard";
import TradeHistory from "./TradeHistory";
import SwapRiskNotes from "./SwapRiskNotes";
import type { SwapConfig, Trade } from "./swap";

// USDT ⇄ STT swap — secret, unlisted page behind PasswordGate.
// Treasury-mediated: the user sends one token, the backend verifies it,
// routes through KyberSwap and sends the other back.
export default function SwapPage() {
  const { authenticated, getAccessToken } = usePrivy();
  const [config, setConfig] = useState<SwapConfig | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setConfig(await swapApi.getConfig());
    if (authenticated) {
      const token = await getAccessToken();
      if (token) {
        const r = await swapApi.getMe(token).catch(() => ({ trades: [] }));
        setTrades(r.trades ?? []);
        return;
      }
    }
    setTrades([]);
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-primary pt-14 text-white">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[46vh] w-[70vw] -translate-x-1/2 rounded-full bg-brand-blue/[0.07] blur-[160px]" />

      <SwapCard config={config} loading={loading} onSwapped={reload} />
      <TradeHistory trades={trades} />
      <SwapRiskNotes treasuryAddress={config?.treasuryAddress ?? ""} />

      <FooterV2 />
    </div>
  );
}
```

- [ ] **Step 2: Register the gated route**

In `src/App.tsx`, add the imports:

```tsx
import PasswordGate from "./components/PasswordGate";
import SwapPage from "./components/swap/SwapPage";
```

(`PasswordGate` may already be imported; do not duplicate it.)

Add the route after `/staking`:

```tsx
          {/* Secret swap page: unlisted route, password-gated. */}
          <Route
            path="/swap"
            element={
              <PasswordGate
                description="Enter the password to access the STT swap"
                action="Access Swap"
              >
                <SwapPage />
              </PasswordGate>
            }
          />
```

Add `"/swap"` to `V2_ROUTES` so the legacy global footer is suppressed, and to `NO_PROMO_ROUTES` so the Coinstore popup does not cover the page.

Do **not** add a nav or footer link.

- [ ] **Step 3: Create placeholders so the shell compiles**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io/src/components/swap
for f in SwapCard QuoteSummary TradeHistory SwapRiskNotes; do
  printf 'export default function %s(_props: any) {\n  return null;\n}\n' "$f" > "$f.tsx"
done
```

- [ ] **Step 4: Verify**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`
Open `http://localhost:5173/swap`. Expected: the PasswordGate form reading "Enter the password to access the STT swap".

- [ ] **Step 5: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/App.tsx src/components/swap/
git commit -m "feat(swap): add gated /swap route and page shell"
```

---

### Task 13: Swap card

The interactive core: direction toggle, amount, a debounced live quote, and the transfer-then-report flow.

**Files:**
- Replace: `src/components/swap/SwapCard.tsx`
- Replace: `src/components/swap/QuoteSummary.tsx`

- [ ] **Step 1: Write the quote summary**

```tsx
// src/components/swap/QuoteSummary.tsx
import { fmtStt, fmtUsdt, outLabel, tokenLabel, type Quote } from "./swap";

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-silver-500">{label}</span>
      <span className={`text-[15px] tabular-nums ${accent ?? "text-silver-100"}`}>{value}</span>
    </div>
  );
}

export default function QuoteSummary({ quote }: { quote: Quote | null }) {
  if (!quote) {
    return (
      <div className="mt-5 h-40 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.02]" />
    );
  }

  const fmtOut = quote.direction === "BUY" ? (n: number) => fmtStt(n) : fmtUsdt;
  const fmtIn = quote.direction === "BUY" ? fmtUsdt : (n: number) => fmtStt(n);

  return (
    <div className="mt-5 divide-y divide-white/[0.07] border-t border-white/[0.07]">
      <Row
        label="You receive"
        value={`${fmtOut(quote.quotedOut)} ${outLabel(quote.direction)}`}
        accent="text-brand-teal"
      />
      <Row label="Rate" value={`1 ${tokenLabel(quote.direction)} = ${fmtOut(quote.rate)} ${outLabel(quote.direction)}`} />
      <Row label={`Fee (${quote.feePercent}%)`} value={`${fmtIn(quote.fee)} ${tokenLabel(quote.direction)}`} />
      <Row
        label="Minimum received"
        value={`${fmtOut(quote.minReceived)} ${outLabel(quote.direction)}`}
      />
      <Row label="Price impact" value={`${quote.priceImpactPct.toFixed(2)}%`} />
    </div>
  );
}
```

- [ ] **Step 2: Write the swap card**

```tsx
// src/components/swap/SwapCard.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import { swapApi } from "../../services/api";
import QuoteSummary from "./QuoteSummary";
import {
  decimalsIn, encodeTransfer, isValidAmount, outLabel, tokenIn, tokenLabel,
  type Direction, type Quote, type SwapConfig,
} from "./swap";

type Phase = "idle" | "sending" | "verifying" | "done";

export default function SwapCard({
  config,
  loading,
  onSwapped,
}: {
  config: SwapConfig | null;
  loading: boolean;
  onSwapped: () => Promise<void>;
}) {
  const { authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const [direction, setDirection] = useState<Direction>("BUY");
  const [amount, setAmount] = useState(100);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => isValidAmount(amount, direction), [amount, direction]);

  // Debounced quote: the aggregator is a network call, so do not fire on
  // every keystroke.
  useEffect(() => {
    if (!valid) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(async () => {
      try {
        const q = await swapApi.getQuote(amount, direction);
        if (!cancelled) {
          setQuote(q);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setQuote(null);
          setError(e?.message || "Could not fetch a quote.");
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, direction, valid]);

  const flip = useCallback(() => {
    setDirection((d) => (d === "BUY" ? "SELL" : "BUY"));
    setAmount((a) => (direction === "BUY" ? 1 : 100));
    setQuote(null);
  }, [direction]);

  async function handleSwap() {
    setError(null);
    if (!wallet || !quote) return;

    try {
      setPhase("sending");
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");

      const provider = await wallet.getEthereumProvider();
      const txHash: string = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: tokenIn(direction),
            data: encodeTransfer(quote.treasuryAddress, amount, decimalsIn(direction)),
          },
        ],
      });

      setPhase("verifying");
      // The backend needs confirmations before it will credit; retry rather
      // than failing on the first "too early".
      for (let i = 0; i < 20; i += 1) {
        try {
          await swapApi.execute(token, { direction, amountIn: amount, txHashIn: txHash });
          setPhase("done");
          await onSwapped();
          return;
        } catch (e: any) {
          if (!/INSUFFICIENT_CONFIRMATIONS|NOT_FOUND/.test(e?.message || "")) throw e;
          await new Promise((r) => setTimeout(r, 6000));
        }
      }
      throw new Error(
        "Your transfer was sent but is still confirming. It will be picked up automatically.",
      );
    } catch (e: any) {
      setError(
        /user rejected|denied/i.test(e?.message || "")
          ? "Transaction cancelled."
          : e?.message || "Swap failed. Please try again.",
      );
      setPhase("idle");
    }
  }

  const busy = phase === "sending" || phase === "verifying";
  const disabled = !valid || !quote || busy || quoting;

  return (
    <section className="relative px-6 pb-10 pt-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp scroll={false}>
          <Eyebrow>Swap · USDT and STT</Eyebrow>
        </FadeUp>

        <h1 className="mt-7 text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[1.0] tracking-tight text-white">
          <Reveal scroll={false}>Swap into silver.</Reveal>
        </h1>

        <FadeUp delay={0.12} scroll={false}>
          <div className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-background-secondary/40 p-7 backdrop-blur-sm">
            {!config?.enabled && !loading ? (
              <p className="text-[15px] leading-relaxed text-silver-300">
                Swaps are not available right now.
              </p>
            ) : !authenticated ? (
              <div className="flex flex-wrap items-center justify-between gap-6">
                <p className="max-w-sm text-[15px] leading-relaxed text-silver-300">
                  Connect the wallet holding your {tokenLabel(direction)} to swap.
                </p>
                <button
                  onClick={login}
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  Connect wallet
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                    You pay · {tokenLabel(direction)}
                  </span>
                  <button
                    type="button"
                    onClick={flip}
                    disabled={busy}
                    className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                  >
                    Swap to {outLabel(direction)}
                  </button>
                </div>

                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  disabled={busy}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-4 w-full rounded-lg border border-white/10 bg-background-primary px-4 py-3 text-3xl font-semibold tabular-nums tracking-tight text-white focus:border-brand-blue focus:outline-none"
                />
                <div className="mt-2 flex justify-between text-[11px] tabular-nums text-silver-600">
                  <span>{config?.limits[direction].min} min</span>
                  <span>{config?.limits[direction].max} max</span>
                </div>

                <QuoteSummary quote={quoting ? null : quote} />

                <p className="mt-5 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] p-4 text-xs leading-relaxed text-silver-300">
                  Send from{" "}
                  <span className="tabular-nums text-white">
                    {wallet
                      ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                      : "your connected wallet"}
                  </span>{" "}
                  only. A transfer from an exchange or another address cannot be matched
                  to your account.
                </p>

                {error && <p className="mt-4 text-sm leading-relaxed text-red-400">{error}</p>}

                <button
                  onClick={handleSwap}
                  disabled={disabled}
                  className="mt-6 w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  {phase === "sending" && "Confirm in your wallet..."}
                  {phase === "verifying" && "Verifying on-chain..."}
                  {(phase === "idle" || phase === "done") &&
                    (quoting ? "Fetching quote..." : `Swap ${tokenLabel(direction)} for ${outLabel(direction)}`)}
                </button>

                {phase === "verifying" && (
                  <p className="mt-3 text-center text-xs leading-relaxed text-silver-500">
                    Waiting for confirmations. Closing this page is recoverable — the swap
                    completes on its own.
                  </p>
                )}
              </>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify every state**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`

On `/swap`, walk: signed out (Connect wallet), signed in (quote appears after ~400ms), direction flip (labels and limits swap), amount below minimum (button disabled, no quote), amount above maximum (same), and an amount large enough to breach the 2% impact ceiling (the backend's message appears rather than a quote).

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/swap/SwapCard.tsx src/components/swap/QuoteSummary.tsx
git commit -m "feat(swap): add swap card with debounced live quote"
```

---

### Task 14: Trade history and risk notes

**Files:**
- Replace: `src/components/swap/TradeHistory.tsx`
- Replace: `src/components/swap/SwapRiskNotes.tsx`

- [ ] **Step 1: Write the trade history**

```tsx
// src/components/swap/TradeHistory.tsx
import { FadeUp, Reveal } from "../v2/cinematic";
import { fmtStt, fmtUsdt, outLabel, tokenLabel, type Trade } from "./swap";

const LABEL: Record<Trade["status"], { text: string; tone: string }> = {
  PENDING: { text: "Pending", tone: "text-silver-400" },
  SWAPPING: { text: "Swapping", tone: "text-brand-teal" },
  COMPLETED: { text: "Completed", tone: "text-brand-sky" },
  FAILED: { text: "Failed", tone: "text-red-400" },
  REFUNDING: { text: "Refunding", tone: "text-silver-300" },
  REFUNDED: { text: "Refunded", tone: "text-silver-300" },
};

export default function TradeHistory({ trades }: { trades: Trade[] }) {
  if (!trades.length) return null;

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Your swaps</Reveal>
        </h2>

        <div className="mt-8 space-y-3">
          {trades.map((t, i) => {
            const fmtIn = t.direction === "BUY" ? fmtUsdt : (n: number) => fmtStt(n);
            const fmtOut = t.direction === "BUY" ? (n: number) => fmtStt(n) : fmtUsdt;
            const s = LABEL[t.status];
            return (
              <FadeUp key={t._id} delay={i * 0.04}>
                <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="min-w-[11rem]">
                    <div className="tabular-nums text-white">
                      {fmtIn(t.amountIn)} {tokenLabel(t.direction)}
                      <span className="mx-2 text-silver-600">→</span>
                      {fmtOut(t.actualOut ?? t.quotedOut)} {outLabel(t.direction)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className={`text-sm ${s.tone}`}>{s.text}</div>

                  <div className="ml-auto flex gap-4 text-xs">
                    {t.txHashOut && (
                      <a
                        href={`https://etherscan.io/tx/${t.txHashOut}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-silver-500 transition-colors hover:text-white"
                      >
                        Output tx
                      </a>
                    )}
                    {t.refundTxHash && (
                      <a
                        href={`https://etherscan.io/tx/${t.refundTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-silver-500 transition-colors hover:text-white"
                      >
                        Refund tx
                      </a>
                    )}
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the risk notes**

```tsx
// src/components/swap/SwapRiskNotes.tsx
import { FadeUp, Reveal } from "../v2/cinematic";

export default function SwapRiskNotes({ treasuryAddress }: { treasuryAddress: string }) {
  const short = treasuryAddress
    ? `${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(-4)}`
    : "";

  const notes = [
    {
      title: "SilverTimes executes the swap",
      body: "You send one token to a SilverTimes treasury address; we route it through an aggregator and send the other back. Your tokens pass through our custody during the swap.",
    },
    {
      title: "Send from your connected wallet only",
      body: `Deposits are matched to your account by sender address${
        short ? ` and must arrive at ${short}` : ""
      }. A transfer from an exchange, or from any wallet other than the one you signed in with, cannot be credited.`,
    },
    {
      title: "Quotes move with the market",
      body: "The rate is live and can move between quoting and execution. If the result would fall below your minimum received, the swap is cancelled and your original tokens are returned.",
    },
    {
      title: "Failed swaps are refunded",
      body: "If no route is available, or the price moves too far, your input token is sent back to the wallet it came from. The refund transaction is shown in your swap history.",
    },
  ];

  return (
    <section className="relative px-6 pb-20 pt-4 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>What you should know</Reveal>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {notes.map((n, i) => (
            <FadeUp key={n.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">{n.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Full verification**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build`

Then a visual pass on `/swap` at 375px, 768px and 1440px. Confirm: no emoji; only `brand-*` and `silver-*` colours; `rounded-2xl` on cards; no horizontal scroll at 375px; and that section headings share one left edge, as `/staking` does.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/swap/TradeHistory.tsx src/components/swap/SwapRiskNotes.tsx
git commit -m "feat(swap): add trade history and risk notes"
```

---

## Deployment notes

Required backend environment — all already present except the swap-specific ones, which have safe defaults:

```
ETH_RPC_URL=                  # already set
HOT_WALLET_PRIVATE_KEY=       # already set; doubles as the swap treasury
STAKING_ADMIN_SECRET=         # already set; also guards /swap/admin/*
SWAP_TREASURY_ADDRESS=        # optional override; defaults to the hot wallet
```

**Do not deploy with a funded treasury until every swap spec passes against a scratch database.** The reserve floor protects staking obligations, but nothing protects against a swap bug except the tests.

Before launch, confirm on mainnet with a single minimum-size swap in each direction (0.1 USDT and 0.001 STT) and verify: the trade reaches `COMPLETED`, the output lands in the user's wallet, and the fee stays in the treasury.

`/swap` is unlisted and password-gated. Do not add it to nav, footer, or the sitemap until you decide it is public.
