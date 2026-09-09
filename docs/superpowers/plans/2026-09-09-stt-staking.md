# STT Staking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a custodial fixed-term STT staking product on a secret `/staking` route, with a backend that holds user principal safely and a page that makes the terms unmistakable.

**Architecture:** Site-initiated staking with independent on-chain verification, plus an intent-matched backstop job. The user transfers STT to a treasury address from their Privy-authenticated wallet; the backend re-reads the chain to verify the transfer before creating a position; at maturity the user claims and the existing hot wallet returns principal plus interest through a payout state machine modelled on the proven `Claim` flow.

**Tech Stack:** NestJS 11, Mongoose 8, ethers 6, Jest 30 (backend); React 19, Vite 7, react-router 7, framer-motion, Tailwind 4, Privy (frontend).

**Spec:** `docs/superpowers/specs/2026-09-09-staking-design.md` (in the `silvertimes.io` repo)

## Repositories

This plan spans **two separate git repos**. Commit steps name the repo explicitly.

| Repo | Path | Remote |
|---|---|---|
| Backend | `/Users/kenho/projects/silvertimes/backend` | `api.silvertimes.io` |
| Frontend | `/Users/kenho/projects/silvertimes/silvertimes.io` | `silvertimes.io` |

## Global Constraints

- **Deposit asset:** STT, ERC-20 on Ethereum mainnet, `0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce`, 18 decimals. Already defined as `ETH_STT` in `backend/src/auth/transfer.service.ts`.
- **Terms:** 30 days at 1000 bps (10.0%), 90 days at 1500 bps (15.0%). No other terms.
- **Interest:** simple, pro-rated. `principal × aprBps / 10000 × days / 365`. Never compounded.
- **Minimum stake:** 1.00 STT per position. **Maximum:** 10.00 STT per wallet summed across all live positions.
- **Amount precision:** exactly 2 decimal places. Reject anything finer.
- **Reward pool:** 14.28 STT total.
- **Early exit:** 80% of principal returned, zero interest, reserved reward released to the pool.
- **Payout at maturity is user-initiated.** No unattended batch transfers.
- **Never weaken the existing claim flow** in `backend/src/auth/auth.service.ts`. Staking gets its own collections and its own worker.
- **No test may run against production Mongo or the real hot wallet.** Every Mongo-backed test uses an in-memory server; every chain test uses a stubbed provider.
- **UI copy rules:** no emoji anywhere. Brand colours only (`brand-sky` `#90E0EF`, `brand-blue` `#6596FE`, `brand-teal` `#77D6E3`, `silver-*`). `rounded-2xl`, never `rounded-3xl`. Max 3 accent colours per view. See `silvertimes.io/DESIGN.md`.
- **Rate wording:** always "Fixed rate (annualised)", never "APY". The maths is simple interest and the copy must agree.

---

## File Structure

### Backend — new module `backend/src/staking/`

| File | Responsibility |
|---|---|
| `staking-math.ts` | Pure functions: reward, maturity, validation, allowance. No I/O. |
| `staking-math.spec.ts` | Tests for the above. |
| `staking.constants.ts` | Terms, rates, bounds, pool size, confirmations, intent TTL. |
| `staking-pool.service.ts` | Atomic hold / commit / release on the singleton pool doc. |
| `staking-pool.service.spec.ts` | Concurrency tests for the pool. |
| `deposit-verifier.service.ts` | Reads a tx from chain and decides if it funds a position. |
| `deposit-verifier.service.spec.ts` | One test per rejection reason. |
| `staking.service.ts` | Intent, confirm, claim, unstake. Orchestration only. |
| `staking.service.spec.ts` | Lifecycle and concurrency tests. |
| `staking-payout.worker.ts` | Locks and processes pending payouts. |
| `staking-payout.worker.spec.ts` | Ownership-lock tests. |
| `staking-backstop.service.ts` | Scheduled scan: expiry sweeper, deposit matching, uncredited recording. |
| `staking.controller.ts` | Public + authenticated HTTP surface. |
| `staking-admin.controller.ts` | Admin reconcile / list / process. |
| `staking.module.ts` | Wiring. |
| `test-utils.ts` | In-memory Mongo helpers shared by the specs. |

### Backend — new schemas `backend/src/schemas/`

`stake-intent.schema.ts`, `staking-position.schema.ts`, `staking-payout.schema.ts`, `staking-pool.schema.ts`, `uncredited-deposit.schema.ts`.

### Frontend — new components `silvertimes.io/src/components/staking/`

| File | Responsibility |
|---|---|
| `staking.ts` | Constants mirror + preview maths + formatters. |
| `staking.test.ts` | Vitest tests for the preview maths. |
| `StakingPage.tsx` | Route shell, data loading, view state. |
| `StakingHero.tsx` | Cinematic hero + live pool meter. |
| `PoolMeter.tsx` | Committed-vs-total bar, reused in hero and stake panel. |
| `TermCards.tsx` | Two large 30D / 90D selection cards. |
| `StakePanel.tsx` | Amount input, preview, all empty/blocked states, transfer flow. |
| `PositionsPanel.tsx` | Active position cards with maturity rings. |
| `MaturityRing.tsx` | Circular SVG progress indicator. |
| `ParametersSheet.tsx` | Restyled technical-parameters spec sheet. |
| `RiskNotes.tsx` | Custody, sender-address requirement, penalty. |

Modified: `src/App.tsx` (route), `src/services/api.ts` (`stakingApi`).

---

## Phase 1 — Backend

### Task 1: Staking maths

Pure functions with no I/O, so they are testable in isolation and become the single source of truth for every figure the product quotes.

**Files:**
- Create: `backend/src/staking/staking.constants.ts`
- Create: `backend/src/staking/staking-math.ts`
- Test: `backend/src/staking/staking-math.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `TermDays` (`30 | 90`), `APR_BPS`, `MIN_STAKE_STT`, `MAX_STAKE_PER_WALLET_STT`, `REWARD_POOL_STT`, `MIN_POSSIBLE_REWARD_STT`, `INTENT_TTL_MS`, `REQUIRED_CONFIRMATIONS`, `rewardStt(amountStt: number, termDays: TermDays): number`, `maturityDate(stakedAt: Date, termDays: TermDays): Date`, `earlyExitPrincipalStt(amountStt: number): number`, `isValidStakeAmount(amountStt: number): boolean`, `isValidTerm(termDays: number): termDays is TermDays`, `remainingAllowanceStt(stakedTotalStt: number): number`, `canOpenPosition(stakedTotalStt: number): boolean`, `round6(n: number): number`.

- [ ] **Step 1: Write the constants file**

```ts
// backend/src/staking/staking.constants.ts

/** The only two lockup terms the campaign offers. */
export const TERMS = [30, 90] as const;
export type TermDays = (typeof TERMS)[number];

/** Fixed annualised rate per term, in basis points. 1000 bps = 10.00%. */
export const APR_BPS: Record<TermDays, number> = { 30: 1000, 90: 1500 };

export const MIN_STAKE_STT = 1;
export const MAX_STAKE_PER_WALLET_STT = 10;
export const AMOUNT_DECIMAL_PLACES = 2;

/** Total STT earmarked for rewards across the whole campaign. */
export const REWARD_POOL_STT = 14.28;

/** How long a stake intent holds pool capacity before it is released. */
export const INTENT_TTL_MS = 30 * 60 * 1000;

/** Confirmations required before a deposit is credited. */
export const REQUIRED_CONFIRMATIONS = 3;

/** STT contract on Ethereum mainnet. Mirrors ETH_STT in transfer.service.ts. */
export const STT_ADDRESS = '0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce';
export const STT_DECIMALS = 18;
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/staking-math.spec.ts
import {
  rewardStt,
  maturityDate,
  earlyExitPrincipalStt,
  isValidStakeAmount,
  isValidTerm,
  remainingAllowanceStt,
  canOpenPosition,
} from './staking-math';

describe('staking-math', () => {
  describe('rewardStt', () => {
    it('pays 0.0822 STT on the 10 STT / 30D maximum', () => {
      expect(rewardStt(10, 30)).toBeCloseTo(0.082192, 6);
    });
    it('pays 0.3699 STT on the 10 STT / 90D maximum', () => {
      expect(rewardStt(10, 90)).toBeCloseTo(0.369863, 6);
    });
    it('pays 0.0082 STT on the 1 STT / 30D minimum', () => {
      expect(rewardStt(1, 30)).toBeCloseTo(0.008219, 6);
    });
    it('pays 0.0370 STT on the 1 STT / 90D minimum', () => {
      expect(rewardStt(1, 90)).toBeCloseTo(0.036986, 6);
    });
    it('is simple interest, not compounded: 90D pays exactly 3x the 30D rate ratio', () => {
      // 10 * 0.15 * 90/365 vs 10 * 0.10 * 30/365
      expect(rewardStt(10, 90) / rewardStt(10, 30)).toBeCloseTo(4.5, 6);
    });
    it('scales linearly with principal', () => {
      expect(rewardStt(2, 30)).toBeCloseTo(rewardStt(1, 30) * 2, 6);
    });
  });

  describe('maturityDate', () => {
    it('adds 30 days for the short term', () => {
      const start = new Date('2026-09-09T00:00:00.000Z');
      expect(maturityDate(start, 30).toISOString()).toBe(
        '2026-10-09T00:00:00.000Z',
      );
    });
    it('adds 90 days for the long term', () => {
      const start = new Date('2026-09-09T00:00:00.000Z');
      expect(maturityDate(start, 90).toISOString()).toBe(
        '2026-12-08T00:00:00.000Z',
      );
    });
  });

  describe('earlyExitPrincipalStt', () => {
    it('returns 80% of principal', () => {
      expect(earlyExitPrincipalStt(10)).toBeCloseTo(8, 6);
      expect(earlyExitPrincipalStt(1)).toBeCloseTo(0.8, 6);
      expect(earlyExitPrincipalStt(2.5)).toBeCloseTo(2, 6);
    });
  });

  describe('isValidStakeAmount', () => {
    it('accepts the bounds', () => {
      expect(isValidStakeAmount(1)).toBe(true);
      expect(isValidStakeAmount(10)).toBe(true);
      expect(isValidStakeAmount(2.5)).toBe(true);
      expect(isValidStakeAmount(9.99)).toBe(true);
    });
    it('rejects below the minimum', () => {
      expect(isValidStakeAmount(0.99)).toBe(false);
      expect(isValidStakeAmount(0)).toBe(false);
    });
    it('rejects above the maximum', () => {
      expect(isValidStakeAmount(10.01)).toBe(false);
    });
    it('rejects more than two decimal places', () => {
      expect(isValidStakeAmount(1.005)).toBe(false);
      expect(isValidStakeAmount(2.333)).toBe(false);
    });
    it('rejects non-finite input', () => {
      expect(isValidStakeAmount(NaN)).toBe(false);
      expect(isValidStakeAmount(Infinity)).toBe(false);
    });
  });

  describe('isValidTerm', () => {
    it('accepts only 30 and 90', () => {
      expect(isValidTerm(30)).toBe(true);
      expect(isValidTerm(90)).toBe(true);
      expect(isValidTerm(60)).toBe(false);
      expect(isValidTerm(0)).toBe(false);
    });
  });

  describe('remainingAllowanceStt', () => {
    it('is the full cap when nothing is staked', () => {
      expect(remainingAllowanceStt(0)).toBeCloseTo(10, 6);
    });
    it('shrinks by the staked total', () => {
      expect(remainingAllowanceStt(9.5)).toBeCloseTo(0.5, 6);
    });
    it('never goes negative', () => {
      expect(remainingAllowanceStt(12)).toBe(0);
    });
  });

  describe('canOpenPosition', () => {
    it('is true while at least the minimum remains', () => {
      expect(canOpenPosition(0)).toBe(true);
      expect(canOpenPosition(9)).toBe(true);
    });
    it('is false for a dust allowance below the 1 STT floor', () => {
      expect(canOpenPosition(9.5)).toBe(false);
      expect(canOpenPosition(10)).toBe(false);
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-math.spec.ts`
Expected: FAIL — `Cannot find module './staking-math'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/staking/staking-math.ts
import {
  AMOUNT_DECIMAL_PLACES,
  APR_BPS,
  MAX_STAKE_PER_WALLET_STT,
  MIN_STAKE_STT,
  TERMS,
  TermDays,
} from './staking.constants';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Round to 6 decimal places. Reward figures are money, and binary floats
 * accumulate dust that would otherwise leak into stored balances.
 */
export function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * Simple pro-rated interest — deliberately NOT compounded. The product copy
 * says "fixed rate (annualised)" to match this arithmetic.
 */
export function rewardStt(amountStt: number, termDays: TermDays): number {
  return round6((amountStt * (APR_BPS[termDays] / 10000) * termDays) / 365);
}

export function maturityDate(stakedAt: Date, termDays: TermDays): Date {
  return new Date(stakedAt.getTime() + termDays * DAY_MS);
}

/** Early exit forfeits all interest and 20% of principal. */
export function earlyExitPrincipalStt(amountStt: number): number {
  return round6(amountStt * 0.8);
}

export function isValidTerm(termDays: number): termDays is TermDays {
  return (TERMS as readonly number[]).includes(termDays);
}

export function isValidStakeAmount(amountStt: number): boolean {
  if (!Number.isFinite(amountStt)) return false;
  if (amountStt < MIN_STAKE_STT || amountStt > MAX_STAKE_PER_WALLET_STT) {
    return false;
  }
  const scaled = amountStt * 10 ** AMOUNT_DECIMAL_PLACES;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

export function remainingAllowanceStt(stakedTotalStt: number): number {
  return round6(Math.max(0, MAX_STAKE_PER_WALLET_STT - stakedTotalStt));
}

/**
 * A wallet under the cap can still be unable to stake: 9.5 staked leaves a
 * 0.5 allowance, which is below the 1 STT floor. The UI shows this state
 * explicitly rather than offering a button that fails validation.
 */
export function canOpenPosition(stakedTotalStt: number): boolean {
  return remainingAllowanceStt(stakedTotalStt) >= MIN_STAKE_STT;
}

/** The smallest reward any position can reserve — 1 STT on the 30D term. */
export const MIN_POSSIBLE_REWARD_STT = rewardStt(MIN_STAKE_STT, 30);
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-math.spec.ts`
Expected: PASS — 20 tests.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking.constants.ts src/staking/staking-math.ts src/staking/staking-math.spec.ts
git commit -m "feat(staking): add staking maths and campaign constants"
```

---

### Task 2: In-memory Mongo test harness

Every invariant that matters in this feature — unique indexes, `$expr`-guarded updates, ownership locks — is enforced *by Mongo*, not by TypeScript. Testing them requires a real server, and the global constraint forbids using production. This task installs one that runs in-process.

**Files:**
- Modify: `backend/package.json` (devDependencies)
- Create: `backend/src/staking/test-utils.ts`
- Test: `backend/src/staking/test-utils.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `startTestMongo(): Promise<TestMongo>` where `TestMongo` is `{ uri: string; connection: Connection; stop(): Promise<void>; clear(): Promise<void> }`.

- [ ] **Step 1: Install the dev dependency**

```bash
cd /Users/kenho/projects/silvertimes/backend
npm install --save-dev mongodb-memory-server@^10
```

Note: the first run downloads a `mongod` binary. If the machine is offline, set `MONGOMS_SYSTEM_BINARY` to a local `mongod` path instead.

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/test-utils.spec.ts
import { Schema } from 'mongoose';
import { startTestMongo } from './test-utils';

describe('startTestMongo', () => {
  it('gives a working connection that enforces unique indexes', async () => {
    const mongo = await startTestMongo();
    try {
      const model = mongo.connection.model(
        'Widget',
        new Schema({ code: { type: String, unique: true } }),
      );
      await model.init(); // build indexes before asserting on them

      await model.create({ code: 'abc' });
      await expect(model.create({ code: 'abc' })).rejects.toThrow();
    } finally {
      await mongo.stop();
    }
  }, 60000);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/test-utils.spec.ts`
Expected: FAIL — `Cannot find module './test-utils'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/staking/test-utils.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection } from 'mongoose';

export interface TestMongo {
  uri: string;
  connection: Connection;
  clear(): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Spin up an isolated in-process MongoDB. Staking's safety invariants are
 * enforced by the database (unique indexes, guarded atomic updates), so they
 * can only be tested against a real server — never the production one.
 */
export async function startTestMongo(): Promise<TestMongo> {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  const connection = mongoose.createConnection(uri);
  await connection.asPromise();

  return {
    uri,
    connection,
    async clear() {
      const collections = await connection.db!.collections();
      await Promise.all(collections.map((c) => c.deleteMany({})));
    },
    async stop() {
      await connection.destroy();
      await server.stop();
    },
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/test-utils.spec.ts`
Expected: PASS. First run may take up to a minute while the binary downloads.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add package.json package-lock.json src/staking/test-utils.ts src/staking/test-utils.spec.ts
git commit -m "test(staking): add in-memory mongo harness for invariant tests"
```

---

### Task 3: Schemas and indexes

The indexes here *are* the safety mechanism, so they get their own tests rather than being taken on trust.

**Files:**
- Create: `backend/src/schemas/stake-intent.schema.ts`
- Create: `backend/src/schemas/staking-position.schema.ts`
- Create: `backend/src/schemas/staking-payout.schema.ts`
- Create: `backend/src/schemas/staking-pool.schema.ts`
- Test: `backend/src/staking/schemas.spec.ts`

**Interfaces:**
- Consumes: `TermDays` from `staking.constants.ts`.
- Produces: `StakeIntent` / `StakeIntentSchema` / `IntentStatus`; `StakingPosition` / `StakingPositionSchema` / `PositionStatus` / `CloseKind`; `StakingPayout` / `StakingPayoutSchema` / `PayoutStatus` / `PayoutKind`; `StakingPool` / `StakingPoolSchema`.

- [ ] **Step 1: Write the four schema files**

```ts
// backend/src/schemas/stake-intent.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StakeIntentDocument = StakeIntent & Document;

export enum IntentStatus {
  OPEN = 'OPEN',
  CONSUMED = 'CONSUMED',
  EXPIRED = 'EXPIRED',
}

/**
 * A stake intent holds pool capacity and wallet quota for its lifetime.
 * Without the hold, several users could each pass the headroom check, all pay
 * gas, and the last few would land on an exhausted pool.
 */
@Schema({ timestamps: true })
export class StakeIntent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  amountStt: number;

  @Prop({ required: true, enum: [30, 90] })
  termDays: number;

  @Prop({ required: true })
  rewardStt: number;

  @Prop({ default: IntentStatus.OPEN, enum: IntentStatus })
  status: IntentStatus;

  @Prop({ required: true })
  expiresAt: Date;
}

export const StakeIntentSchema = SchemaFactory.createForClass(StakeIntent);

// The expiry sweeper scans open intents past their deadline.
StakeIntentSchema.index({ status: 1, expiresAt: 1 });
// The backstop job matches stray deposits by sender.
StakeIntentSchema.index({ walletAddress: 1, status: 1 });
```

```ts
// backend/src/schemas/staking-position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StakingPositionDocument = StakingPosition & Document;

export enum PositionStatus {
  ACTIVE = 'ACTIVE',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
}

export enum CloseKind {
  MATURITY = 'MATURITY',
  EARLY = 'EARLY',
}

@Schema({ timestamps: true })
export class StakingPosition {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  amountStt: number;

  @Prop({ required: true, enum: [30, 90] })
  termDays: number;

  @Prop({ required: true })
  aprBps: number;

  /**
   * Frozen at creation so a later config change can never retroactively alter
   * what a staker is owed.
   */
  @Prop({ required: true })
  rewardStt: number;

  @Prop({ required: true, lowercase: true })
  depositTxHash: string;

  @Prop({ required: true })
  stakedAt: Date;

  @Prop({ required: true })
  maturesAt: Date;

  @Prop({ default: PositionStatus.ACTIVE, enum: PositionStatus })
  status: PositionStatus;

  @Prop({ enum: CloseKind })
  closeKind?: CloseKind;

  @Prop()
  closedAt?: Date;
}

export const StakingPositionSchema =
  SchemaFactory.createForClass(StakingPosition);

// THE critical guard: one deposit transaction can never fund two positions.
// This makes the confirm endpoint idempotent and lets the backstop job run
// concurrently with it without risk.
StakingPositionSchema.index({ depositTxHash: 1 }, { unique: true });
StakingPositionSchema.index({ userId: 1, status: 1 });
```

```ts
// backend/src/schemas/staking-payout.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StakingPayoutDocument = StakingPayout & Document;

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PayoutKind {
  MATURITY = 'MATURITY',
  EARLY = 'EARLY',
}

/** Deliberately mirrors Claim so the proven state machine is reused in shape. */
@Schema({ timestamps: true })
export class StakingPayout {
  @Prop({ type: Types.ObjectId, ref: 'StakingPosition', required: true })
  positionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true })
  principalStt: number;

  @Prop({ required: true, default: 0 })
  rewardStt: number;

  @Prop({ required: true })
  totalStt: number;

  @Prop({ required: true, enum: PayoutKind })
  kind: PayoutKind;

  @Prop({ default: PayoutStatus.PENDING, enum: PayoutStatus })
  status: PayoutStatus;

  @Prop()
  txHash?: string;

  @Prop()
  failureReason?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  processedAt?: Date;
}

export const StakingPayoutSchema =
  SchemaFactory.createForClass(StakingPayout);

// One active payout per position, matching the existing claim index.
StakingPayoutSchema.index(
  { positionId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] },
    },
  },
);
```

```ts
// backend/src/schemas/staking-pool.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StakingPoolDocument = StakingPool & Document;

/** Singleton. `key` exists only so the one document can be found by name. */
@Schema({ timestamps: true })
export class StakingPool {
  @Prop({ required: true, unique: true, default: 'default' })
  key: string;

  @Prop({ required: true })
  totalRewardStt: number;

  /** Reserved by open intents. Released on expiry. */
  @Prop({ required: true, default: 0 })
  heldRewardStt: number;

  /** Reserved by live positions. Released on early exit. */
  @Prop({ required: true, default: 0 })
  committedRewardStt: number;

  @Prop({ required: true, default: 0 })
  paidRewardStt: number;

  @Prop({ default: true })
  isOpen: boolean;
}

export const StakingPoolSchema = SchemaFactory.createForClass(StakingPool);
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/schemas.spec.ts
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import {
  StakingPositionSchema,
  PositionStatus,
} from '../schemas/staking-position.schema';
import {
  StakingPayoutSchema,
  PayoutStatus,
  PayoutKind,
} from '../schemas/staking-payout.schema';

describe('staking schemas', () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startTestMongo();
  }, 60000);
  afterAll(async () => {
    await mongo.stop();
  });
  afterEach(async () => {
    await mongo.clear();
  });

  const basePosition = (txHash: string) => ({
    userId: new Types.ObjectId(),
    walletAddress: '0x1111111111111111111111111111111111111111',
    amountStt: 10,
    termDays: 30,
    aprBps: 1000,
    rewardStt: 0.082192,
    depositTxHash: txHash,
    stakedAt: new Date(),
    maturesAt: new Date(Date.now() + 30 * 86400000),
  });

  it('refuses to fund two positions from one deposit tx', async () => {
    const model = mongo.connection.model('StakingPosition', StakingPositionSchema);
    await model.init();

    await model.create(basePosition('0xdead'));
    await expect(model.create(basePosition('0xdead'))).rejects.toThrow();
  });

  it('allows two positions from different deposit txs', async () => {
    const model = mongo.connection.model('StakingPosition2', StakingPositionSchema);
    await model.init();

    await model.create(basePosition('0xaaa'));
    await model.create(basePosition('0xbbb'));
    expect(await model.countDocuments()).toBe(2);
  });

  it('refuses two active payouts for one position', async () => {
    const model = mongo.connection.model('StakingPayout', StakingPayoutSchema);
    await model.init();

    const positionId = new Types.ObjectId();
    const payout = {
      positionId,
      userId: new Types.ObjectId(),
      walletAddress: '0x1111111111111111111111111111111111111111',
      principalStt: 10,
      rewardStt: 0.082192,
      totalStt: 10.082192,
      kind: PayoutKind.MATURITY,
    };

    await model.create(payout);
    await expect(model.create(payout)).rejects.toThrow();
  });

  it('allows a new payout once the previous one is terminal', async () => {
    const model = mongo.connection.model('StakingPayout2', StakingPayoutSchema);
    await model.init();

    const positionId = new Types.ObjectId();
    const payout = {
      positionId,
      userId: new Types.ObjectId(),
      walletAddress: '0x1111111111111111111111111111111111111111',
      principalStt: 10,
      rewardStt: 0,
      totalStt: 10,
      kind: PayoutKind.EARLY,
    };

    const first = await model.create(payout);
    await model.updateOne({ _id: first._id }, { status: PayoutStatus.FAILED });
    await expect(model.create(payout)).resolves.toBeDefined();
  });

  it('defaults a position to ACTIVE', async () => {
    const model = mongo.connection.model('StakingPosition3', StakingPositionSchema);
    const doc = await model.create(basePosition('0xccc'));
    expect(doc.status).toBe(PositionStatus.ACTIVE);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/schemas.spec.ts`
Expected: FAIL — cannot resolve `../schemas/staking-position.schema` until Step 1's files exist. If Step 1 was already applied, this step is where you confirm the *indexes* work; run it and expect PASS only after Step 4.

- [ ] **Step 4: Verify all five tests pass**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/schemas.spec.ts`
Expected: PASS — 5 tests.

If "refuses to fund two positions" fails, the unique index is not being built. Confirm `await model.init()` runs before the first `create`.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/schemas/stake-intent.schema.ts src/schemas/staking-position.schema.ts src/schemas/staking-payout.schema.ts src/schemas/staking-pool.schema.ts src/staking/schemas.spec.ts
git commit -m "feat(staking): add staking schemas with idempotency and payout-lock indexes"
```

---

### Task 4: Pool service — atomic holds

The pool is where oversubscription would happen. Every mutation is a single guarded `findOneAndUpdate`; there is no read-then-write anywhere in this file.

**Files:**
- Create: `backend/src/staking/staking-pool.service.ts`
- Test: `backend/src/staking/staking-pool.service.spec.ts`

**Interfaces:**
- Consumes: `StakingPool` model, `MIN_POSSIBLE_REWARD_STT`, `REWARD_POOL_STT`, `round6`.
- Produces: class `StakingPoolService` with `ensurePool(): Promise<StakingPoolDocument>`, `getState(): Promise<PoolState>`, `tryHold(rewardStt: number): Promise<boolean>`, `releaseHold(rewardStt: number): Promise<void>`, `commitHold(rewardStt: number): Promise<boolean>`, `releaseCommitment(rewardStt: number): Promise<void>`, `markPaid(rewardStt: number): Promise<void>`. `PoolState` is `{ totalRewardStt: number; heldRewardStt: number; committedRewardStt: number; paidRewardStt: number; availableRewardStt: number; isOpen: boolean }`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/staking/staking-pool.service.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import {
  StakingPool,
  StakingPoolSchema,
  StakingPoolDocument,
} from '../schemas/staking-pool.schema';
import { StakingPoolService } from './staking-pool.service';

describe('StakingPoolService', () => {
  let mongo: TestMongo;
  let service: StakingPoolService;
  let model: Model<StakingPoolDocument>;

  beforeAll(async () => {
    mongo = await startTestMongo();
    model = mongo.connection.model(StakingPool.name, StakingPoolSchema) as any;
    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingPoolService,
        { provide: getModelToken(StakingPool.name), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(StakingPoolService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await service.ensurePool();
  });

  it('starts with the full pool available', async () => {
    const state = await service.getState();
    expect(state.totalRewardStt).toBeCloseTo(14.28, 6);
    expect(state.availableRewardStt).toBeCloseTo(14.28, 6);
    expect(state.isOpen).toBe(true);
  });

  it('takes a hold and reduces availability', async () => {
    expect(await service.tryHold(0.369863)).toBe(true);
    const state = await service.getState();
    expect(state.heldRewardStt).toBeCloseTo(0.369863, 6);
    expect(state.availableRewardStt).toBeCloseTo(14.28 - 0.369863, 6);
  });

  it('refuses a hold that would exceed the pool', async () => {
    expect(await service.tryHold(14.0)).toBe(true);
    expect(await service.tryHold(1.0)).toBe(false);
    const state = await service.getState();
    expect(state.heldRewardStt).toBeCloseTo(14.0, 6);
  });

  it('cannot be oversubscribed by concurrent holds', async () => {
    // 14.28 pool, 0.369863 per hold -> at most 38 can succeed.
    const results = await Promise.all(
      Array.from({ length: 60 }, () => service.tryHold(0.369863)),
    );
    const granted = results.filter(Boolean).length;
    expect(granted).toBe(38);

    const state = await service.getState();
    expect(state.heldRewardStt).toBeLessThanOrEqual(14.28);
    expect(state.heldRewardStt).toBeCloseTo(38 * 0.369863, 5);
  });

  it('releases a hold back into availability', async () => {
    await service.tryHold(1);
    await service.releaseHold(1);
    const state = await service.getState();
    expect(state.heldRewardStt).toBeCloseTo(0, 6);
    expect(state.availableRewardStt).toBeCloseTo(14.28, 6);
  });

  it('moves a hold to a commitment without changing availability', async () => {
    await service.tryHold(2);
    expect(await service.commitHold(2)).toBe(true);
    const state = await service.getState();
    expect(state.heldRewardStt).toBeCloseTo(0, 6);
    expect(state.committedRewardStt).toBeCloseTo(2, 6);
    expect(state.availableRewardStt).toBeCloseTo(12.28, 6);
  });

  it('refuses to commit more than is held', async () => {
    await service.tryHold(1);
    expect(await service.commitHold(2)).toBe(false);
  });

  it('releases a commitment on early exit', async () => {
    await service.tryHold(2);
    await service.commitHold(2);
    await service.releaseCommitment(2);
    const state = await service.getState();
    expect(state.committedRewardStt).toBeCloseTo(0, 6);
    expect(state.availableRewardStt).toBeCloseTo(14.28, 6);
  });

  it('closes staking when the remaining headroom is below the smallest reward', async () => {
    await service.tryHold(14.28 - 0.001);
    const state = await service.getState();
    expect(state.isOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-pool.service.spec.ts`
Expected: FAIL — `Cannot find module './staking-pool.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/staking/staking-pool.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StakingPool,
  StakingPoolDocument,
} from '../schemas/staking-pool.schema';
import { REWARD_POOL_STT } from './staking.constants';
import { MIN_POSSIBLE_REWARD_STT, round6 } from './staking-math';

export interface PoolState {
  totalRewardStt: number;
  heldRewardStt: number;
  committedRewardStt: number;
  paidRewardStt: number;
  availableRewardStt: number;
  isOpen: boolean;
}

const KEY = 'default';

@Injectable()
export class StakingPoolService {
  private readonly logger = new Logger(StakingPoolService.name);

  constructor(
    @InjectModel(StakingPool.name)
    private poolModel: Model<StakingPoolDocument>,
  ) {}

  async ensurePool(): Promise<StakingPoolDocument> {
    return this.poolModel.findOneAndUpdate(
      { key: KEY },
      {
        $setOnInsert: {
          key: KEY,
          totalRewardStt: REWARD_POOL_STT,
          heldRewardStt: 0,
          committedRewardStt: 0,
          paidRewardStt: 0,
          isOpen: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  async getState(): Promise<PoolState> {
    const pool = await this.ensurePool();
    const available = round6(
      pool.totalRewardStt - pool.heldRewardStt - pool.committedRewardStt,
    );
    return {
      totalRewardStt: pool.totalRewardStt,
      heldRewardStt: round6(pool.heldRewardStt),
      committedRewardStt: round6(pool.committedRewardStt),
      paidRewardStt: round6(pool.paidRewardStt),
      availableRewardStt: Math.max(0, available),
      // Staking closes once no possible stake could still be rewarded.
      isOpen: pool.isOpen && available >= MIN_POSSIBLE_REWARD_STT,
    };
  }

  /**
   * Reserve capacity for an intent. The guard and the increment are one
   * operation, so a read-then-write race cannot oversubscribe the pool.
   */
  async tryHold(rewardStt: number): Promise<boolean> {
    const updated = await this.poolModel.findOneAndUpdate(
      {
        key: KEY,
        isOpen: true,
        $expr: {
          $lte: [
            { $add: ['$heldRewardStt', '$committedRewardStt', rewardStt] },
            '$totalRewardStt',
          ],
        },
      },
      { $inc: { heldRewardStt: rewardStt } },
      { new: true },
    );
    return !!updated;
  }

  async releaseHold(rewardStt: number): Promise<void> {
    await this.poolModel.updateOne(
      { key: KEY },
      { $inc: { heldRewardStt: -rewardStt } },
    );
  }

  /** Move a hold to a commitment when the position is created. */
  async commitHold(rewardStt: number): Promise<boolean> {
    const updated = await this.poolModel.findOneAndUpdate(
      {
        key: KEY,
        $expr: { $gte: ['$heldRewardStt', rewardStt] },
      },
      {
        $inc: {
          heldRewardStt: -rewardStt,
          committedRewardStt: rewardStt,
        },
      },
      { new: true },
    );
    return !!updated;
  }

  /** Early exit forfeits the reward, so it returns to the pool. */
  async releaseCommitment(rewardStt: number): Promise<void> {
    await this.poolModel.updateOne(
      { key: KEY },
      { $inc: { committedRewardStt: -rewardStt } },
    );
  }

  async markPaid(rewardStt: number): Promise<void> {
    await this.poolModel.updateOne(
      { key: KEY },
      {
        $inc: {
          committedRewardStt: -rewardStt,
          paidRewardStt: rewardStt,
        },
      },
    );
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-pool.service.spec.ts`
Expected: PASS — 9 tests. The concurrency test granting exactly 38 holds is the one that matters most; if it grants more, the `$expr` guard is not inside the same `findOneAndUpdate` as the `$inc`.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking-pool.service.ts src/staking/staking-pool.service.spec.ts
git commit -m "feat(staking): add atomic reward-pool holds that cannot oversubscribe"
```

---

**Remaining backend tasks (5–11) and frontend tasks (12–18) are specified in the continuation section below.**

---

### Task 5: Wallet quota — atomic, held plus active

The 10 STT cap must survive the same race as the pool: two simultaneous stakes of 6 STT each must not both succeed. The counter lives on the `User` document so a single guarded update can enforce it, mirroring the existing `claimedWinnings` guard in `auth.service.ts:292`.

**Files:**
- Modify: `backend/src/schemas/user.schema.ts` (add two fields)
- Create: `backend/src/staking/staking-quota.service.ts`
- Test: `backend/src/staking/staking-quota.service.spec.ts`

**Interfaces:**
- Consumes: `User` model, `MAX_STAKE_PER_WALLET_STT`, `round6`, `remainingAllowanceStt`, `canOpenPosition`.
- Produces: class `StakingQuotaService` with `tryHold(userId: string, amountStt: number): Promise<boolean>`, `releaseHold(userId: string, amountStt: number): Promise<void>`, `commitHold(userId: string, amountStt: number): Promise<boolean>`, `releaseActive(userId: string, amountStt: number): Promise<void>`, `getQuota(userId: string): Promise<QuotaState>`. `QuotaState` is `{ stakedTotalStt: number; heldStt: number; remainingStt: number; canOpen: boolean }`.

- [ ] **Step 1: Add the two counters to the user schema**

Add these props to the `User` class in `backend/src/schemas/user.schema.ts`, alongside the existing fields. Do not touch or rename anything already there.

```ts
  /** STT reserved by open stake intents. Released when an intent expires. */
  @Prop({ default: 0 })
  stakingHeldStt: number;

  /** STT locked in live staking positions. Released when a position closes. */
  @Prop({ default: 0 })
  stakingActiveStt: number;
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/staking-quota.service.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import { User, UserSchema, UserDocument } from '../schemas/user.schema';
import { StakingQuotaService } from './staking-quota.service';

describe('StakingQuotaService', () => {
  let mongo: TestMongo;
  let service: StakingQuotaService;
  let model: Model<UserDocument>;
  let userId: string;

  beforeAll(async () => {
    mongo = await startTestMongo();
    model = mongo.connection.model(User.name, UserSchema) as any;
    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingQuotaService,
        { provide: getModelToken(User.name), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(StakingQuotaService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    const user = await model.create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    } as any);
    userId = user._id.toString();
  });

  it('starts with the full 10 STT allowance', async () => {
    const quota = await service.getQuota(userId);
    expect(quota.remainingStt).toBeCloseTo(10, 6);
    expect(quota.canOpen).toBe(true);
  });

  it('grants a hold within the cap', async () => {
    expect(await service.tryHold(userId, 6)).toBe(true);
    const quota = await service.getQuota(userId);
    expect(quota.heldStt).toBeCloseTo(6, 6);
    expect(quota.remainingStt).toBeCloseTo(4, 6);
  });

  it('refuses a hold that would breach the cap', async () => {
    expect(await service.tryHold(userId, 6)).toBe(true);
    expect(await service.tryHold(userId, 6)).toBe(false);
    const quota = await service.getQuota(userId);
    expect(quota.heldStt).toBeCloseTo(6, 6);
  });

  it('cannot exceed the cap under concurrent holds', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => service.tryHold(userId, 1)),
    );
    expect(results.filter(Boolean).length).toBe(10);

    const quota = await service.getQuota(userId);
    expect(quota.heldStt).toBeCloseTo(10, 6);
    expect(quota.remainingStt).toBeCloseTo(0, 6);
  });

  it('releases a hold', async () => {
    await service.tryHold(userId, 3);
    await service.releaseHold(userId, 3);
    const quota = await service.getQuota(userId);
    expect(quota.heldStt).toBeCloseTo(0, 6);
    expect(quota.remainingStt).toBeCloseTo(10, 6);
  });

  it('moves a hold into the active total without changing the allowance', async () => {
    await service.tryHold(userId, 4);
    expect(await service.commitHold(userId, 4)).toBe(true);
    const quota = await service.getQuota(userId);
    expect(quota.heldStt).toBeCloseTo(0, 6);
    expect(quota.stakedTotalStt).toBeCloseTo(4, 6);
    expect(quota.remainingStt).toBeCloseTo(6, 6);
  });

  it('refuses to commit more than is held', async () => {
    await service.tryHold(userId, 2);
    expect(await service.commitHold(userId, 5)).toBe(false);
  });

  it('frees the allowance when a position closes', async () => {
    await service.tryHold(userId, 4);
    await service.commitHold(userId, 4);
    await service.releaseActive(userId, 4);
    const quota = await service.getQuota(userId);
    expect(quota.remainingStt).toBeCloseTo(10, 6);
  });

  it('reports the dust-allowance state where the remainder is below the floor', async () => {
    await service.tryHold(userId, 9.5);
    await service.commitHold(userId, 9.5);
    const quota = await service.getQuota(userId);
    expect(quota.remainingStt).toBeCloseTo(0.5, 6);
    expect(quota.canOpen).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-quota.service.spec.ts`
Expected: FAIL — `Cannot find module './staking-quota.service'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/staking/staking-quota.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { MAX_STAKE_PER_WALLET_STT } from './staking.constants';
import { canOpenPosition, remainingAllowanceStt, round6 } from './staking-math';

export interface QuotaState {
  stakedTotalStt: number;
  heldStt: number;
  remainingStt: number;
  canOpen: boolean;
}

@Injectable()
export class StakingQuotaService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getQuota(userId: string): Promise<QuotaState> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const held = round6((user as any).stakingHeldStt || 0);
    const active = round6((user as any).stakingActiveStt || 0);
    const used = round6(held + active);

    return {
      stakedTotalStt: active,
      heldStt: held,
      remainingStt: remainingAllowanceStt(used),
      canOpen: canOpenPosition(used),
    };
  }

  /**
   * Reserve wallet quota. Guard and increment are one operation — the same
   * shape as the claimedWinnings guard that stopped the double-payout race.
   */
  async tryHold(userId: string, amountStt: number): Promise<boolean> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        $expr: {
          $lte: [
            {
              $add: [
                { $ifNull: ['$stakingHeldStt', 0] },
                { $ifNull: ['$stakingActiveStt', 0] },
                amountStt,
              ],
            },
            MAX_STAKE_PER_WALLET_STT,
          ],
        },
      },
      { $inc: { stakingHeldStt: amountStt } },
      { new: true },
    );
    return !!updated;
  }

  async releaseHold(userId: string, amountStt: number): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { stakingHeldStt: -amountStt } },
    );
  }

  async commitHold(userId: string, amountStt: number): Promise<boolean> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        $expr: { $gte: [{ $ifNull: ['$stakingHeldStt', 0] }, amountStt] },
      },
      {
        $inc: {
          stakingHeldStt: -amountStt,
          stakingActiveStt: amountStt,
        },
      },
      { new: true },
    );
    return !!updated;
  }

  async releaseActive(userId: string, amountStt: number): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { stakingActiveStt: -amountStt } },
    );
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-quota.service.spec.ts`
Expected: PASS — 9 tests.

If the concurrent test grants more than 10, the guard has drifted outside the `findOneAndUpdate`. If user creation fails, check the required fields on `User` in `backend/src/schemas/user.schema.ts` and add whatever is mandatory to the `model.create` call in `beforeEach`.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/schemas/user.schema.ts src/staking/staking-quota.service.ts src/staking/staking-quota.service.spec.ts
git commit -m "feat(staking): enforce the 10 STT wallet cap with atomic quota holds"
```

---

### Task 6: Deposit verification

The backend never believes the client's account of what happened on chain. It fetches the transaction itself and applies seven independent checks. Each rejection reason gets its own test, because a single "it rejects bad input" test would let a real hole hide behind a passing suite.

**Files:**
- Create: `backend/src/staking/deposit-verifier.service.ts`
- Test: `backend/src/staking/deposit-verifier.service.spec.ts`

**Interfaces:**
- Consumes: `ConfigService`, `STT_ADDRESS`, `STT_DECIMALS`, `REQUIRED_CONFIRMATIONS`.
- Produces: class `DepositVerifierService` with `verifyDeposit(txHash: string, expected: ExpectedDeposit): Promise<VerifyResult>` and `getTreasuryAddress(): string`. `ExpectedDeposit` is `{ fromAddress: string; amountStt: number }`. `VerifyResult` is `{ ok: true; amountStt: number; blockNumber: number } | { ok: false; reason: DepositRejection }`. `DepositRejection` is the union `'NOT_FOUND' | 'REVERTED' | 'INSUFFICIENT_CONFIRMATIONS' | 'NO_STT_TRANSFER' | 'WRONG_RECIPIENT' | 'WRONG_SENDER' | 'WRONG_AMOUNT'`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/staking/deposit-verifier.service.spec.ts
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import {
  DepositVerifierService,
  ExpectedDeposit,
} from './deposit-verifier.service';
import { STT_ADDRESS, STT_DECIMALS } from './staking.constants';

const TREASURY = '0x2222222222222222222222222222222222222222';
const STAKER = '0x1111111111111111111111111111111111111111';
const OTHER = '0x3333333333333333333333333333333333333333';

const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');
const pad = (addr: string) => ethers.zeroPadValue(addr, 32);

/** Build a receipt log that looks like a real ERC-20 Transfer. */
function transferLog(opts: {
  token?: string;
  from?: string;
  to?: string;
  amountStt?: number;
}) {
  return {
    address: opts.token ?? STT_ADDRESS,
    topics: [
      TRANSFER_TOPIC,
      pad(opts.from ?? STAKER),
      pad(opts.to ?? TREASURY),
    ],
    data: ethers.zeroPadValue(
      ethers.toBeHex(
        ethers.parseUnits(String(opts.amountStt ?? 10), STT_DECIMALS),
      ),
      32,
    ),
  };
}

function buildService(receipt: any, currentBlock = 1000) {
  const provider = {
    getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
    getBlockNumber: jest.fn().mockResolvedValue(currentBlock),
  };
  const config = {
    get: (key: string) =>
      ({
        ETH_RPC_URL: 'http://stub',
        STAKING_TREASURY_ADDRESS: TREASURY,
      })[key],
  } as unknown as ConfigService;

  const service = new DepositVerifierService(config);
  // Inject the stub provider — no network access in tests, ever.
  (service as any).provider = provider;
  return service;
}

const expected: ExpectedDeposit = { fromAddress: STAKER, amountStt: 10 };

describe('DepositVerifierService', () => {
  it('accepts a correct deposit', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({})],
    });
    const result = await service.verifyDeposit('0xabc', expected);
    expect(result).toEqual({ ok: true, amountStt: 10, blockNumber: 900 });
  });

  it('rejects a transaction that does not exist', async () => {
    const service = buildService(null);
    const result = await service.verifyDeposit('0xabc', expected);
    expect(result).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('rejects a reverted transaction', async () => {
    const service = buildService({
      status: 0,
      blockNumber: 900,
      logs: [transferLog({})],
    });
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'REVERTED',
    });
  });

  it('rejects a transaction with too few confirmations', async () => {
    // Mined at 999, head at 1000 -> 2 confirmations, below the required 3.
    const service = buildService(
      { status: 1, blockNumber: 999, logs: [transferLog({})] },
      1000,
    );
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'INSUFFICIENT_CONFIRMATIONS',
    });
  });

  it('rejects a transfer of a different token', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({ token: OTHER })],
    });
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'NO_STT_TRANSFER',
    });
  });

  it('rejects a transfer sent to the wrong recipient', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({ to: OTHER })],
    });
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'WRONG_RECIPIENT',
    });
  });

  it('rejects a transfer from an unregistered wallet', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({ from: OTHER })],
    });
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'WRONG_SENDER',
    });
  });

  it('rejects a transfer of the wrong amount', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({ amountStt: 9 })],
    });
    expect(await service.verifyDeposit('0xabc', expected)).toEqual({
      ok: false,
      reason: 'WRONG_AMOUNT',
    });
  });

  it('matches case-insensitively on addresses', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [transferLog({})],
    });
    const result = await service.verifyDeposit('0xabc', {
      fromAddress: STAKER.toUpperCase().replace('0X', '0x'),
      amountStt: 10,
    });
    expect(result.ok).toBe(true);
  });

  it('finds the STT transfer among unrelated logs', async () => {
    const service = buildService({
      status: 1,
      blockNumber: 900,
      logs: [
        transferLog({ token: OTHER, amountStt: 5 }),
        transferLog({}),
      ],
    });
    expect((await service.verifyDeposit('0xabc', expected)).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/deposit-verifier.service.spec.ts`
Expected: FAIL — `Cannot find module './deposit-verifier.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/staking/deposit-verifier.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import {
  REQUIRED_CONFIRMATIONS,
  STT_ADDRESS,
  STT_DECIMALS,
} from './staking.constants';

export type DepositRejection =
  | 'NOT_FOUND'
  | 'REVERTED'
  | 'INSUFFICIENT_CONFIRMATIONS'
  | 'NO_STT_TRANSFER'
  | 'WRONG_RECIPIENT'
  | 'WRONG_SENDER'
  | 'WRONG_AMOUNT';

export interface ExpectedDeposit {
  fromAddress: string;
  amountStt: number;
}

export type VerifyResult =
  | { ok: true; amountStt: number; blockNumber: number }
  | { ok: false; reason: DepositRejection };

const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

@Injectable()
export class DepositVerifierService {
  private readonly logger = new Logger(DepositVerifierService.name);
  private provider?: ethers.JsonRpcProvider;
  private treasury: string;

  constructor(private configService: ConfigService) {
    const rpc = this.configService.get<string>('ETH_RPC_URL');
    this.treasury = (
      this.configService.get<string>('STAKING_TREASURY_ADDRESS') || ''
    ).toLowerCase();

    if (!rpc) {
      this.logger.warn('ETH_RPC_URL not set — deposit verification disabled');
    } else {
      this.provider = new ethers.JsonRpcProvider(rpc);
    }
    if (!this.treasury) {
      this.logger.warn('STAKING_TREASURY_ADDRESS not set — staking disabled');
    }
  }

  isEnabled(): boolean {
    return !!this.provider && !!this.treasury;
  }

  getTreasuryAddress(): string {
    return this.treasury;
  }

  /**
   * Re-read the chain and decide whether this transaction funds a position.
   * The client's claim about what it did is never trusted; only the receipt is.
   */
  async verifyDeposit(
    txHash: string,
    expected: ExpectedDeposit,
  ): Promise<VerifyResult> {
    if (!this.provider) return { ok: false, reason: 'NOT_FOUND' };

    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt) return { ok: false, reason: 'NOT_FOUND' };
    if (receipt.status !== 1) return { ok: false, reason: 'REVERTED' };

    const head = await this.provider.getBlockNumber();
    const confirmations = head - receipt.blockNumber + 1;
    if (confirmations < REQUIRED_CONFIRMATIONS) {
      return { ok: false, reason: 'INSUFFICIENT_CONFIRMATIONS' };
    }

    const sttLogs = (receipt.logs || []).filter(
      (log: any) =>
        (log.address || '').toLowerCase() === STT_ADDRESS.toLowerCase() &&
        log.topics?.[0] === TRANSFER_TOPIC,
    );
    if (sttLogs.length === 0) return { ok: false, reason: 'NO_STT_TRANSFER' };

    const toTreasury = sttLogs.filter(
      (log: any) => this.topicToAddress(log.topics[2]) === this.treasury,
    );
    if (toTreasury.length === 0) return { ok: false, reason: 'WRONG_RECIPIENT' };

    const fromExpected = toTreasury.filter(
      (log: any) =>
        this.topicToAddress(log.topics[1]) === expected.fromAddress.toLowerCase(),
    );
    if (fromExpected.length === 0) return { ok: false, reason: 'WRONG_SENDER' };

    const total = fromExpected.reduce(
      (sum: bigint, log: any) => sum + BigInt(log.data),
      0n,
    );
    const wanted = ethers.parseUnits(
      expected.amountStt.toFixed(2),
      STT_DECIMALS,
    );
    if (total !== wanted) return { ok: false, reason: 'WRONG_AMOUNT' };

    return {
      ok: true,
      amountStt: Number(ethers.formatUnits(total, STT_DECIMALS)),
      blockNumber: receipt.blockNumber,
    };
  }

  private topicToAddress(topic: string): string {
    return ethers.getAddress('0x' + topic.slice(26)).toLowerCase();
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/deposit-verifier.service.spec.ts`
Expected: PASS — 10 tests.

- [ ] **Step 5: Add the treasury address to the environment template**

Document the new variable so deployment does not silently run with staking disabled. Add to `backend/.env.example` if it exists, otherwise note it in `backend/README.md`:

```
# Address users send STT to when staking. Staking is disabled if unset.
STAKING_TREASURY_ADDRESS=
```

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/deposit-verifier.service.ts src/staking/deposit-verifier.service.spec.ts
git commit -m "feat(staking): verify deposits against chain with per-reason rejection"
```

---

### Task 7: Staking service — intent and confirm

Orchestration only: this file makes no atomic decisions of its own, it sequences the guarded operations built in Tasks 4–6. Ordering matters and is justified in comments, because getting it wrong is how principal goes missing.

**Files:**
- Create: `backend/src/staking/staking.service.ts`
- Test: `backend/src/staking/staking.service.spec.ts`

**Interfaces:**
- Consumes: `StakingPoolService`, `StakingQuotaService`, `DepositVerifierService`, models for `StakeIntent`, `StakingPosition`, `StakingPayout`, `User`.
- Produces: class `StakingService` with `createIntent(userId: string, walletAddress: string, amountStt: number, termDays: number): Promise<IntentResponse>` and `confirmDeposit(userId: string, intentId: string, txHash: string): Promise<PositionResponse>`. `IntentResponse` is `{ intentId: string; treasuryAddress: string; amountStt: number; termDays: number; rewardStt: number; expiresAt: Date }`. `PositionResponse` is `{ id: string; amountStt: number; termDays: number; aprBps: number; rewardStt: number; stakedAt: Date; maturesAt: Date; status: PositionStatus }`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/staking/staking.service.spec.ts
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import { User, UserSchema } from '../schemas/user.schema';
import {
  StakeIntent,
  StakeIntentSchema,
  IntentStatus,
} from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionSchema,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingService } from './staking.service';

const WALLET = '0x1111111111111111111111111111111111111111';
const TREASURY = '0x2222222222222222222222222222222222222222';

describe('StakingService — intent and confirm', () => {
  let mongo: TestMongo;
  let service: StakingService;
  let pool: StakingPoolService;
  let quota: StakingQuotaService;
  let verifier: { verifyDeposit: jest.Mock; getTreasuryAddress: jest.Mock };
  let userId: string;
  let models: Record<string, any>;

  beforeAll(async () => {
    mongo = await startTestMongo();
    models = {
      [User.name]: mongo.connection.model(User.name, UserSchema),
      [StakeIntent.name]: mongo.connection.model(
        StakeIntent.name,
        StakeIntentSchema,
      ),
      [StakingPosition.name]: mongo.connection.model(
        StakingPosition.name,
        StakingPositionSchema,
      ),
      [StakingPayout.name]: mongo.connection.model(
        StakingPayout.name,
        StakingPayoutSchema,
      ),
      [StakingPool.name]: mongo.connection.model(
        StakingPool.name,
        StakingPoolSchema,
      ),
    };
    await models[StakingPosition.name].init();
    await models[StakingPayout.name].init();

    verifier = {
      verifyDeposit: jest.fn(),
      getTreasuryAddress: jest.fn().mockReturnValue(TREASURY),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingService,
        StakingPoolService,
        StakingQuotaService,
        { provide: DepositVerifierService, useValue: verifier },
        ...Object.entries(models).map(([name, model]) => ({
          provide: getModelToken(name),
          useValue: model,
        })),
      ],
    }).compile();

    service = moduleRef.get(StakingService);
    pool = moduleRef.get(StakingPoolService);
    quota = moduleRef.get(StakingQuotaService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await pool.ensurePool();
    const user = await models[User.name].create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    });
    userId = user._id.toString();
    verifier.verifyDeposit.mockReset();
    verifier.getTreasuryAddress.mockReturnValue(TREASURY);
  });

  describe('createIntent', () => {
    it('returns the treasury address and the exact reward on offer', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      expect(intent.treasuryAddress).toBe(TREASURY);
      expect(intent.rewardStt).toBeCloseTo(0.369863, 6);
      expect(intent.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('holds both pool capacity and wallet quota', async () => {
      await service.createIntent(userId, WALLET, 10, 90);
      expect((await pool.getState()).heldRewardStt).toBeCloseTo(0.369863, 6);
      expect((await quota.getQuota(userId)).heldStt).toBeCloseTo(10, 6);
    });

    it('rejects an amount below the 1 STT floor', async () => {
      await expect(
        service.createIntent(userId, WALLET, 0.5, 30),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an amount above the 10 STT cap', async () => {
      await expect(
        service.createIntent(userId, WALLET, 11, 30),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects more than two decimal places', async () => {
      await expect(
        service.createIntent(userId, WALLET, 1.005, 30),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an unsupported term', async () => {
      await expect(service.createIntent(userId, WALLET, 5, 60)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuses a second intent that would breach the wallet cap', async () => {
      await service.createIntent(userId, WALLET, 6, 30);
      await expect(service.createIntent(userId, WALLET, 6, 30)).rejects.toThrow(
        /allowance/i,
      );
    });

    it('releases the quota hold when the pool has no headroom', async () => {
      // Drain the pool, then attempt an intent.
      await pool.tryHold(14.28);
      await expect(service.createIntent(userId, WALLET, 10, 90)).rejects.toThrow(
        /pool/i,
      );
      // The quota hold taken moments earlier must not be left stranded.
      expect((await quota.getQuota(userId)).heldStt).toBeCloseTo(0, 6);
    });
  });

  describe('confirmDeposit', () => {
    const goodVerify = { ok: true, amountStt: 10, blockNumber: 900 };

    it('creates a position from a verified deposit', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue(goodVerify);

      const position = await service.confirmDeposit(userId, intent.intentId, '0xabc');
      expect(position.amountStt).toBeCloseTo(10, 6);
      expect(position.rewardStt).toBeCloseTo(0.369863, 6);
      expect(position.aprBps).toBe(1500);
      expect(position.maturesAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('converts holds into commitments', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue(goodVerify);
      await service.confirmDeposit(userId, intent.intentId, '0xabc');

      const poolState = await pool.getState();
      expect(poolState.heldRewardStt).toBeCloseTo(0, 6);
      expect(poolState.committedRewardStt).toBeCloseTo(0.369863, 6);

      const quotaState = await quota.getQuota(userId);
      expect(quotaState.heldStt).toBeCloseTo(0, 6);
      expect(quotaState.stakedTotalStt).toBeCloseTo(10, 6);
    });

    it('marks the intent consumed', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue(goodVerify);
      await service.confirmDeposit(userId, intent.intentId, '0xabc');

      const stored = await models[StakeIntent.name].findById(intent.intentId);
      expect(stored.status).toBe(IntentStatus.CONSUMED);
    });

    it('rejects an unverifiable deposit and leaves the intent reusable', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue({
        ok: false,
        reason: 'WRONG_SENDER',
      });

      await expect(
        service.confirmDeposit(userId, intent.intentId, '0xabc'),
      ).rejects.toThrow(/WRONG_SENDER/);

      const stored = await models[StakeIntent.name].findById(intent.intentId);
      expect(stored.status).toBe(IntentStatus.OPEN);
      expect(await models[StakingPosition.name].countDocuments()).toBe(0);
    });

    it('creates exactly one position when the same confirm is sent twice concurrently', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue(goodVerify);

      const results = await Promise.allSettled([
        service.confirmDeposit(userId, intent.intentId, '0xabc'),
        service.confirmDeposit(userId, intent.intentId, '0xabc'),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await models[StakingPosition.name].countDocuments()).toBe(1);

      // And the pool must reflect exactly one commitment, not two.
      expect((await pool.getState()).committedRewardStt).toBeCloseTo(
        0.369863,
        6,
      );
    });

    it('refuses to reuse a deposit tx that already funded a position', async () => {
      const first = await service.createIntent(userId, WALLET, 5, 30);
      verifier.verifyDeposit.mockResolvedValue({
        ok: true,
        amountStt: 5,
        blockNumber: 900,
      });
      await service.confirmDeposit(userId, first.intentId, '0xsame');

      const second = await service.createIntent(userId, WALLET, 5, 30);
      await expect(
        service.confirmDeposit(userId, second.intentId, '0xsame'),
      ).rejects.toThrow(/already/i);

      expect(await models[StakingPosition.name].countDocuments()).toBe(1);
      // The second intent's holds must be released, not stranded.
      expect((await quota.getQuota(userId)).heldStt).toBeCloseTo(0, 6);
    });

    it('rejects an expired intent', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      await models[StakeIntent.name].updateOne(
        { _id: intent.intentId },
        { expiresAt: new Date(Date.now() - 1000) },
      );
      verifier.verifyDeposit.mockResolvedValue(goodVerify);

      await expect(
        service.confirmDeposit(userId, intent.intentId, '0xabc'),
      ).rejects.toThrow(/expired/i);
    });

    it('rejects an intent belonging to another user', async () => {
      const intent = await service.createIntent(userId, WALLET, 10, 90);
      const other = await models[User.name].create({
        privyId: `privy-${new Types.ObjectId().toString()}`,
      });
      verifier.verifyDeposit.mockResolvedValue(goodVerify);

      await expect(
        service.confirmDeposit(other._id.toString(), intent.intentId, '0xabc'),
      ).rejects.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking.service.spec.ts`
Expected: FAIL — `Cannot find module './staking.service'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/staking/staking.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StakeIntent,
  StakeIntentDocument,
  IntentStatus,
} from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionDocument,
  PositionStatus,
} from '../schemas/staking-position.schema';
import { APR_BPS, INTENT_TTL_MS, TermDays } from './staking.constants';
import {
  isValidStakeAmount,
  isValidTerm,
  maturityDate,
  rewardStt as computeReward,
} from './staking-math';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';

export interface IntentResponse {
  intentId: string;
  treasuryAddress: string;
  amountStt: number;
  termDays: number;
  rewardStt: number;
  expiresAt: Date;
}

export interface PositionResponse {
  id: string;
  amountStt: number;
  termDays: number;
  aprBps: number;
  rewardStt: number;
  stakedAt: Date;
  maturesAt: Date;
  status: PositionStatus;
}

@Injectable()
export class StakingService {
  private readonly logger = new Logger(StakingService.name);

  constructor(
    @InjectModel(StakeIntent.name)
    private intentModel: Model<StakeIntentDocument>,
    @InjectModel(StakingPosition.name)
    private positionModel: Model<StakingPositionDocument>,
    private poolService: StakingPoolService,
    private quotaService: StakingQuotaService,
    private verifier: DepositVerifierService,
  ) {}

  async createIntent(
    userId: string,
    walletAddress: string,
    amountStt: number,
    termDays: number,
  ): Promise<IntentResponse> {
    if (!isValidTerm(termDays)) {
      throw new BadRequestException('Term must be 30 or 90 days');
    }
    if (!isValidStakeAmount(amountStt)) {
      throw new BadRequestException(
        'Stake must be between 1.00 and 10.00 STT, to two decimal places',
      );
    }

    const treasuryAddress = this.verifier.getTreasuryAddress();
    if (!treasuryAddress) {
      throw new BadRequestException('Staking is not currently available');
    }

    const reward = computeReward(amountStt, termDays as TermDays);

    // Quota first: it is the cheaper check and the one users hit most often.
    const gotQuota = await this.quotaService.tryHold(userId, amountStt);
    if (!gotQuota) {
      const quota = await this.quotaService.getQuota(userId);
      throw new BadRequestException(
        `Exceeds your 10 STT allowance. You have ${quota.remainingStt} STT remaining.`,
      );
    }

    // Pool second. If it fails, the quota hold above must be handed back or
    // the user is locked out of an allowance they never got to use.
    const gotPool = await this.poolService.tryHold(reward);
    if (!gotPool) {
      await this.quotaService.releaseHold(userId, amountStt);
      throw new BadRequestException(
        'The reward pool is fully subscribed. Staking is closed.',
      );
    }

    const intent = await this.intentModel.create({
      userId: new Types.ObjectId(userId),
      walletAddress: walletAddress.toLowerCase(),
      amountStt,
      termDays,
      rewardStt: reward,
      status: IntentStatus.OPEN,
      expiresAt: new Date(Date.now() + INTENT_TTL_MS),
    });

    return {
      intentId: intent._id.toString(),
      treasuryAddress,
      amountStt,
      termDays,
      rewardStt: reward,
      expiresAt: intent.expiresAt,
    };
  }

  async confirmDeposit(
    userId: string,
    intentId: string,
    txHash: string,
  ): Promise<PositionResponse> {
    const intent = await this.intentModel.findOne({
      _id: intentId,
      userId: new Types.ObjectId(userId),
    });
    if (!intent) throw new NotFoundException('Stake intent not found');
    if (intent.status !== IntentStatus.OPEN) {
      throw new ConflictException('This stake intent has already been used');
    }
    if (intent.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'This stake intent has expired. Start a new stake.',
      );
    }

    // Verify BEFORE consuming, so a failed verification leaves the intent
    // reusable and the user can retry without re-reserving capacity.
    const result = await this.verifier.verifyDeposit(txHash, {
      fromAddress: intent.walletAddress,
      amountStt: intent.amountStt,
    });
    if (!result.ok) {
      throw new BadRequestException(`Deposit not verified: ${result.reason}`);
    }

    // Atomically take ownership of the intent. Only one concurrent confirm can
    // win this, and winning it also stops the expiry sweeper releasing the
    // holds out from under us.
    const claimed = await this.intentModel.findOneAndUpdate(
      { _id: intent._id, status: IntentStatus.OPEN },
      { status: IntentStatus.CONSUMED },
      { new: true },
    );
    if (!claimed) {
      throw new ConflictException('This stake intent has already been used');
    }

    const stakedAt = new Date();
    const term = intent.termDays as TermDays;

    let position: StakingPositionDocument;
    try {
      // The unique index on depositTxHash is the real idempotency guard: a
      // transaction can never fund two positions, whichever path gets here.
      position = await this.positionModel.create({
        userId: intent.userId,
        walletAddress: intent.walletAddress,
        amountStt: intent.amountStt,
        termDays: term,
        aprBps: APR_BPS[term],
        rewardStt: intent.rewardStt,
        depositTxHash: txHash.toLowerCase(),
        stakedAt,
        maturesAt: maturityDate(stakedAt, term),
        status: PositionStatus.ACTIVE,
      });
    } catch (err: any) {
      // Duplicate deposit hash. Hand back everything this intent reserved.
      await this.poolService.releaseHold(intent.rewardStt);
      await this.quotaService.releaseHold(userId, intent.amountStt);
      if (err?.code === 11000) {
        throw new ConflictException(
          'This transaction has already been used for a stake',
        );
      }
      throw err;
    }

    await this.poolService.commitHold(intent.rewardStt);
    await this.quotaService.commitHold(userId, intent.amountStt);

    this.logger.log(
      `Staked ${intent.amountStt} STT for ${term}D by user=${userId} tx=${txHash}`,
    );

    return this.toResponse(position);
  }

  private toResponse(p: StakingPositionDocument): PositionResponse {
    return {
      id: p._id.toString(),
      amountStt: p.amountStt,
      termDays: p.termDays,
      aprBps: p.aprBps,
      rewardStt: p.rewardStt,
      stakedAt: p.stakedAt,
      maturesAt: p.maturesAt,
      status: p.status,
    };
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking.service.spec.ts`
Expected: PASS — 16 tests.

The two that matter most: "creates exactly one position when the same confirm is sent twice concurrently" and "refuses to reuse a deposit tx". If either fails, stop and fix before continuing — every later task assumes deposits are idempotent.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking.service.ts src/staking/staking.service.spec.ts
git commit -m "feat(staking): add stake intent and idempotent deposit confirmation"
```

---

### Task 8: Claim at maturity and early unstake

Both paths funnel through the same `ACTIVE → CLOSING` transition, which is what makes them mutually exclusive. A position can be claimed or unstaked, never both, and never twice.

**Files:**
- Modify: `backend/src/staking/staking.service.ts` (add methods)
- Test: `backend/src/staking/staking-exit.spec.ts`

**Interfaces:**
- Consumes: everything from Task 7, plus the `StakingPayout` model.
- Produces: on `StakingService` — `claimMatured(userId: string, positionId: string): Promise<PayoutResponse>`, `unstakeEarly(userId: string, positionId: string): Promise<PayoutResponse>`, `getMyStaking(userId: string): Promise<MyStakingResponse>`. `PayoutResponse` is `{ id: string; positionId: string; principalStt: number; rewardStt: number; totalStt: number; kind: PayoutKind; status: PayoutStatus }`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/staking/staking-exit.spec.ts
// Shares the module setup from staking.service.spec.ts. If that setup is
// extracted into a helper later, both files should use it.
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import { User, UserSchema } from '../schemas/user.schema';
import { StakeIntent, StakeIntentSchema } from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionSchema,
  PositionStatus,
  CloseKind,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
  PayoutKind,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingService } from './staking.service';

const WALLET = '0x1111111111111111111111111111111111111111';

describe('StakingService — exits', () => {
  let mongo: TestMongo;
  let service: StakingService;
  let pool: StakingPoolService;
  let quota: StakingQuotaService;
  let verifier: any;
  let models: Record<string, any>;
  let userId: string;

  beforeAll(async () => {
    mongo = await startTestMongo();
    models = {
      [User.name]: mongo.connection.model(User.name, UserSchema),
      [StakeIntent.name]: mongo.connection.model(StakeIntent.name, StakeIntentSchema),
      [StakingPosition.name]: mongo.connection.model(
        StakingPosition.name,
        StakingPositionSchema,
      ),
      [StakingPayout.name]: mongo.connection.model(
        StakingPayout.name,
        StakingPayoutSchema,
      ),
      [StakingPool.name]: mongo.connection.model(StakingPool.name, StakingPoolSchema),
    };
    await models[StakingPosition.name].init();
    await models[StakingPayout.name].init();

    verifier = {
      verifyDeposit: jest.fn(),
      getTreasuryAddress: jest.fn().mockReturnValue(WALLET),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingService,
        StakingPoolService,
        StakingQuotaService,
        { provide: DepositVerifierService, useValue: verifier },
        ...Object.entries(models).map(([name, model]) => ({
          provide: getModelToken(name),
          useValue: model,
        })),
      ],
    }).compile();

    service = moduleRef.get(StakingService);
    pool = moduleRef.get(StakingPoolService);
    quota = moduleRef.get(StakingQuotaService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await pool.ensurePool();
    const user = await models[User.name].create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    });
    userId = user._id.toString();
  });

  /** Create a live position directly, bypassing the deposit flow. */
  async function seedPosition(opts: { matured: boolean; amountStt?: number }) {
    const amountStt = opts.amountStt ?? 10;
    const rewardStt = 0.369863;
    const stakedAt = opts.matured
      ? new Date(Date.now() - 91 * 86400000)
      : new Date();
    const maturesAt = new Date(stakedAt.getTime() + 90 * 86400000);

    await pool.tryHold(rewardStt);
    await pool.commitHold(rewardStt);
    await quota.tryHold(userId, amountStt);
    await quota.commitHold(userId, amountStt);

    const position = await models[StakingPosition.name].create({
      userId: new Types.ObjectId(userId),
      walletAddress: WALLET,
      amountStt,
      termDays: 90,
      aprBps: 1500,
      rewardStt,
      depositTxHash: `0x${new Types.ObjectId().toString()}`,
      stakedAt,
      maturesAt,
      status: PositionStatus.ACTIVE,
    });
    return position._id.toString();
  }

  describe('claimMatured', () => {
    it('queues principal plus reward for a matured position', async () => {
      const positionId = await seedPosition({ matured: true });
      const payout = await service.claimMatured(userId, positionId);

      expect(payout.principalStt).toBeCloseTo(10, 6);
      expect(payout.rewardStt).toBeCloseTo(0.369863, 6);
      expect(payout.totalStt).toBeCloseTo(10.369863, 6);
      expect(payout.kind).toBe(PayoutKind.MATURITY);
    });

    it('moves the position to CLOSING', async () => {
      const positionId = await seedPosition({ matured: true });
      await service.claimMatured(userId, positionId);
      const stored = await models[StakingPosition.name].findById(positionId);
      expect(stored.status).toBe(PositionStatus.CLOSING);
      expect(stored.closeKind).toBe(CloseKind.MATURITY);
    });

    it('frees the wallet allowance so the user can stake again', async () => {
      const positionId = await seedPosition({ matured: true });
      await service.claimMatured(userId, positionId);
      expect((await quota.getQuota(userId)).remainingStt).toBeCloseTo(10, 6);
    });

    it('refuses to claim before maturity', async () => {
      const positionId = await seedPosition({ matured: false });
      await expect(service.claimMatured(userId, positionId)).rejects.toThrow(
        /not yet matured/i,
      );
    });

    it('creates exactly one payout under concurrent claims', async () => {
      const positionId = await seedPosition({ matured: true });
      const results = await Promise.allSettled([
        service.claimMatured(userId, positionId),
        service.claimMatured(userId, positionId),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await models[StakingPayout.name].countDocuments()).toBe(1);
    });

    it('refuses to claim another user’s position', async () => {
      const positionId = await seedPosition({ matured: true });
      const other = await models[User.name].create({
        privyId: `privy-${new Types.ObjectId().toString()}`,
      });
      await expect(
        service.claimMatured(other._id.toString(), positionId),
      ).rejects.toThrow();
    });
  });

  describe('unstakeEarly', () => {
    it('returns 80% of principal and no interest', async () => {
      const positionId = await seedPosition({ matured: false });
      const payout = await service.unstakeEarly(userId, positionId);

      expect(payout.principalStt).toBeCloseTo(8, 6);
      expect(payout.rewardStt).toBe(0);
      expect(payout.totalStt).toBeCloseTo(8, 6);
      expect(payout.kind).toBe(PayoutKind.EARLY);
    });

    it('returns the forfeited reward to the pool', async () => {
      const positionId = await seedPosition({ matured: false });
      const before = await pool.getState();
      await service.unstakeEarly(userId, positionId);
      const after = await pool.getState();

      expect(after.committedRewardStt).toBeCloseTo(0, 6);
      expect(after.availableRewardStt).toBeCloseTo(
        before.availableRewardStt + 0.369863,
        6,
      );
    });

    it('refuses to unstake a matured position', async () => {
      const positionId = await seedPosition({ matured: true });
      await expect(service.unstakeEarly(userId, positionId)).rejects.toThrow(
        /matured/i,
      );
    });

    it('cannot be combined with a claim on the same position', async () => {
      const positionId = await seedPosition({ matured: false });
      await service.unstakeEarly(userId, positionId);
      await expect(service.claimMatured(userId, positionId)).rejects.toThrow();
      expect(await models[StakingPayout.name].countDocuments()).toBe(1);
    });

    it('releases the reward exactly once under concurrent unstakes', async () => {
      const positionId = await seedPosition({ matured: false });
      const results = await Promise.allSettled([
        service.unstakeEarly(userId, positionId),
        service.unstakeEarly(userId, positionId),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const state = await pool.getState();
      expect(state.committedRewardStt).toBeCloseTo(0, 6);
      expect(state.availableRewardStt).toBeCloseTo(14.28, 6);
    });
  });

  describe('getMyStaking', () => {
    it('reports positions and the remaining allowance', async () => {
      await seedPosition({ matured: false, amountStt: 4 });
      const me = await service.getMyStaking(userId);
      expect(me.positions).toHaveLength(1);
      expect(me.stakedTotalStt).toBeCloseTo(4, 6);
      expect(me.remainingStt).toBeCloseTo(6, 6);
      expect(me.canOpen).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-exit.spec.ts`
Expected: FAIL — `service.claimMatured is not a function`.

- [ ] **Step 3: Add the payout model to the constructor**

Add this parameter to `StakingService`'s constructor in `backend/src/staking/staking.service.ts`, after `positionModel`:

```ts
    @InjectModel(StakingPayout.name)
    private payoutModel: Model<StakingPayoutDocument>,
```

And extend the imports at the top of the file:

```ts
import {
  StakingPayout,
  StakingPayoutDocument,
  PayoutKind,
  PayoutStatus,
} from '../schemas/staking-payout.schema';
import { CloseKind } from '../schemas/staking-position.schema';
import { earlyExitPrincipalStt, round6 } from './staking-math';
```

- [ ] **Step 4: Add the exit methods**

Append these to the `StakingService` class:

```ts
  /**
   * Both exits share this transition. ACTIVE -> CLOSING happens exactly once,
   * which is what makes claim and unstake mutually exclusive and non-repeatable.
   */
  private async beginClose(
    userId: string,
    positionId: string,
    kind: CloseKind,
    maturityGuard: Record<string, unknown>,
  ): Promise<StakingPositionDocument> {
    const position = await this.positionModel.findOneAndUpdate(
      {
        _id: positionId,
        userId: new Types.ObjectId(userId),
        status: PositionStatus.ACTIVE,
        ...maturityGuard,
      },
      { status: PositionStatus.CLOSING, closeKind: kind, closedAt: new Date() },
      { new: true },
    );

    if (!position) {
      // Distinguish "wrong state" from "wrong time" so the error is useful.
      const existing = await this.positionModel.findOne({
        _id: positionId,
        userId: new Types.ObjectId(userId),
      });
      if (!existing) throw new NotFoundException('Position not found');
      if (existing.status !== PositionStatus.ACTIVE) {
        throw new ConflictException('This position is already being closed');
      }
      throw new BadRequestException(
        kind === CloseKind.MATURITY
          ? 'This position has not yet matured'
          : 'This position has already matured — claim it instead',
      );
    }
    return position;
  }

  async claimMatured(
    userId: string,
    positionId: string,
  ): Promise<PayoutResponse> {
    const position = await this.beginClose(
      userId,
      positionId,
      CloseKind.MATURITY,
      { maturesAt: { $lte: new Date() } },
    );

    const totalStt = round6(position.amountStt + position.rewardStt);
    const payout = await this.payoutModel.create({
      positionId: position._id,
      userId: position.userId,
      walletAddress: position.walletAddress,
      principalStt: position.amountStt,
      rewardStt: position.rewardStt,
      totalStt,
      kind: PayoutKind.MATURITY,
      status: PayoutStatus.PENDING,
    });

    // The stake no longer occupies the wallet's allowance.
    await this.quotaService.releaseActive(userId, position.amountStt);

    return this.toPayoutResponse(payout);
  }

  async unstakeEarly(
    userId: string,
    positionId: string,
  ): Promise<PayoutResponse> {
    const position = await this.beginClose(
      userId,
      positionId,
      CloseKind.EARLY,
      { maturesAt: { $gt: new Date() } },
    );

    const principalStt = earlyExitPrincipalStt(position.amountStt);
    const payout = await this.payoutModel.create({
      positionId: position._id,
      userId: position.userId,
      walletAddress: position.walletAddress,
      principalStt,
      rewardStt: 0,
      totalStt: principalStt,
      kind: PayoutKind.EARLY,
      status: PayoutStatus.PENDING,
    });

    // Interest is forfeited, so the reward returns to the pool for others.
    // Gated on the ACTIVE -> CLOSING transition above, so it happens once.
    await this.poolService.releaseCommitment(position.rewardStt);
    await this.quotaService.releaseActive(userId, position.amountStt);

    return this.toPayoutResponse(payout);
  }

  async getMyStaking(userId: string) {
    const [positions, payouts, quota, pool] = await Promise.all([
      this.positionModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .lean(),
      this.payoutModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .lean(),
      this.quotaService.getQuota(userId),
      this.poolService.getState(),
    ]);

    return {
      positions: positions.map((p: any) => ({
        id: p._id.toString(),
        amountStt: p.amountStt,
        termDays: p.termDays,
        aprBps: p.aprBps,
        rewardStt: p.rewardStt,
        stakedAt: p.stakedAt,
        maturesAt: p.maturesAt,
        status: p.status,
        closeKind: p.closeKind,
        depositTxHash: p.depositTxHash,
      })),
      payouts: payouts.map((p: any) => ({
        id: p._id.toString(),
        positionId: p.positionId.toString(),
        principalStt: p.principalStt,
        rewardStt: p.rewardStt,
        totalStt: p.totalStt,
        kind: p.kind,
        status: p.status,
        txHash: p.txHash,
      })),
      stakedTotalStt: quota.stakedTotalStt,
      heldStt: quota.heldStt,
      remainingStt: quota.remainingStt,
      canOpen: quota.canOpen && pool.isOpen,
      pool,
    };
  }

  private toPayoutResponse(p: StakingPayoutDocument): PayoutResponse {
    return {
      id: p._id.toString(),
      positionId: p.positionId.toString(),
      principalStt: p.principalStt,
      rewardStt: p.rewardStt,
      totalStt: p.totalStt,
      kind: p.kind,
      status: p.status,
    };
  }
```

Add the response type near the other interfaces at the top of the file:

```ts
export interface PayoutResponse {
  id: string;
  positionId: string;
  principalStt: number;
  rewardStt: number;
  totalStt: number;
  kind: PayoutKind;
  status: PayoutStatus;
}
```

- [ ] **Step 5: Run both service test files to verify they pass**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking.service.spec.ts src/staking/staking-exit.spec.ts`
Expected: PASS — 16 + 12 tests.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking.service.ts src/staking/staking-exit.spec.ts
git commit -m "feat(staking): add maturity claim and early unstake with exclusive close transition"
```

---

### Task 9: Payout worker

This is the only code in the feature that moves real money, so it is the code the July 2026 incident is about. The ownership lock is copied in shape from `auth.service.ts:518` — take the row before broadcasting, skip if another runner already has it.

**Files:**
- Create: `backend/src/staking/staking-payout.worker.ts`
- Test: `backend/src/staking/staking-payout.worker.spec.ts`

**Interfaces:**
- Consumes: `StakingPayout` and `StakingPosition` models, `StakingPoolService`, `TransferService` (existing, from `auth/transfer.service.ts`).
- Produces: class `StakingPayoutWorker` with `processPendingPayouts(): Promise<void>` and `failPayout(payoutId: string, reason: string): Promise<void>`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/staking/staking-payout.worker.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import {
  StakingPosition,
  StakingPositionSchema,
  PositionStatus,
  CloseKind,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
  PayoutKind,
  PayoutStatus,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import { StakingPoolService } from './staking-pool.service';
import { TransferService } from '../auth/transfer.service';
import { StakingPayoutWorker } from './staking-payout.worker';

const WALLET = '0x1111111111111111111111111111111111111111';

describe('StakingPayoutWorker', () => {
  let mongo: TestMongo;
  let worker: StakingPayoutWorker;
  let pool: StakingPoolService;
  let transfer: { transferStt: jest.Mock; isEnabled: jest.Mock };
  let models: Record<string, any>;

  beforeAll(async () => {
    mongo = await startTestMongo();
    models = {
      [StakingPosition.name]: mongo.connection.model(
        StakingPosition.name,
        StakingPositionSchema,
      ),
      [StakingPayout.name]: mongo.connection.model(
        StakingPayout.name,
        StakingPayoutSchema,
      ),
      [StakingPool.name]: mongo.connection.model(StakingPool.name, StakingPoolSchema),
    };
    await models[StakingPayout.name].init();

    transfer = {
      transferStt: jest.fn(),
      isEnabled: jest.fn().mockReturnValue(true),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingPayoutWorker,
        StakingPoolService,
        { provide: TransferService, useValue: transfer },
        ...Object.entries(models).map(([name, model]) => ({
          provide: getModelToken(name),
          useValue: model,
        })),
      ],
    }).compile();

    worker = moduleRef.get(StakingPayoutWorker);
    pool = moduleRef.get(StakingPoolService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await pool.ensurePool();
    transfer.transferStt.mockReset();
    transfer.isEnabled.mockReturnValue(true);
  });

  async function seedPayout(kind = PayoutKind.MATURITY) {
    const position = await models[StakingPosition.name].create({
      userId: new Types.ObjectId(),
      walletAddress: WALLET,
      amountStt: 10,
      termDays: 90,
      aprBps: 1500,
      rewardStt: 0.369863,
      depositTxHash: `0x${new Types.ObjectId().toString()}`,
      stakedAt: new Date(),
      maturesAt: new Date(),
      status: PositionStatus.CLOSING,
      closeKind:
        kind === PayoutKind.MATURITY ? CloseKind.MATURITY : CloseKind.EARLY,
    });

    const payout = await models[StakingPayout.name].create({
      positionId: position._id,
      userId: position.userId,
      walletAddress: WALLET,
      principalStt: kind === PayoutKind.MATURITY ? 10 : 8,
      rewardStt: kind === PayoutKind.MATURITY ? 0.369863 : 0,
      totalStt: kind === PayoutKind.MATURITY ? 10.369863 : 8,
      kind,
      status: PayoutStatus.PENDING,
    });

    return { positionId: position._id.toString(), payoutId: payout._id.toString() };
  }

  it('sends the total and records the tx hash', async () => {
    const { payoutId } = await seedPayout();
    transfer.transferStt.mockResolvedValue({ txHash: '0xpaid' });

    await worker.processPendingPayouts();

    expect(transfer.transferStt).toHaveBeenCalledWith(WALLET, 10.369863);
    const stored = await models[StakingPayout.name].findById(payoutId);
    expect(stored.status).toBe(PayoutStatus.COMPLETED);
    expect(stored.txHash).toBe('0xpaid');
  });

  it('closes the position once paid', async () => {
    const { positionId } = await seedPayout();
    transfer.transferStt.mockResolvedValue({ txHash: '0xpaid' });

    await worker.processPendingPayouts();

    const stored = await models[StakingPosition.name].findById(positionId);
    expect(stored.status).toBe(PositionStatus.CLOSED);
  });

  it('moves the reward from committed to paid on a maturity payout', async () => {
    await seedPayout(PayoutKind.MATURITY);
    await pool.tryHold(0.369863);
    await pool.commitHold(0.369863);
    transfer.transferStt.mockResolvedValue({ txHash: '0xpaid' });

    await worker.processPendingPayouts();

    const state = await pool.getState();
    expect(state.committedRewardStt).toBeCloseTo(0, 6);
    expect(state.paidRewardStt).toBeCloseTo(0.369863, 6);
  });

  it('does not touch the pool on an early-exit payout', async () => {
    // The reward was already released back when the user unstaked early.
    await seedPayout(PayoutKind.EARLY);
    transfer.transferStt.mockResolvedValue({ txHash: '0xpaid' });

    await worker.processPendingPayouts();

    const state = await pool.getState();
    expect(state.paidRewardStt).toBeCloseTo(0, 6);
  });

  it('broadcasts exactly once when two runners overlap', async () => {
    await seedPayout();
    transfer.transferStt.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ txHash: '0xpaid' }), 50),
        ),
    );

    await Promise.all([
      worker.processPendingPayouts(),
      worker.processPendingPayouts(),
    ]);

    // This is the double-payout guard. One transfer, never two.
    expect(transfer.transferStt).toHaveBeenCalledTimes(1);
  });

  it('marks a payout FAILED when the transfer throws', async () => {
    const { payoutId } = await seedPayout();
    transfer.transferStt.mockRejectedValue(new Error('Insufficient STT'));

    await worker.processPendingPayouts();

    const stored = await models[StakingPayout.name].findById(payoutId);
    expect(stored.status).toBe(PayoutStatus.FAILED);
    expect(stored.failureReason).toMatch(/Insufficient/);
  });

  it('leaves the position CLOSING when the payout fails, so it can be retried', async () => {
    const { positionId } = await seedPayout();
    transfer.transferStt.mockRejectedValue(new Error('boom'));

    await worker.processPendingPayouts();

    const stored = await models[StakingPosition.name].findById(positionId);
    expect(stored.status).toBe(PositionStatus.CLOSING);
  });

  it('does nothing when transfers are disabled', async () => {
    const { payoutId } = await seedPayout();
    transfer.isEnabled.mockReturnValue(false);

    await worker.processPendingPayouts();

    const stored = await models[StakingPayout.name].findById(payoutId);
    expect(stored.status).toBe(PayoutStatus.PENDING);
    expect(transfer.transferStt).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-payout.worker.spec.ts`
Expected: FAIL — `Cannot find module './staking-payout.worker'`.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/staking/staking-payout.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  StakingPayout,
  StakingPayoutDocument,
  PayoutKind,
  PayoutStatus,
} from '../schemas/staking-payout.schema';
import {
  StakingPosition,
  StakingPositionDocument,
  PositionStatus,
} from '../schemas/staking-position.schema';
import { StakingPoolService } from './staking-pool.service';
import { TransferService } from '../auth/transfer.service';

@Injectable()
export class StakingPayoutWorker {
  private readonly logger = new Logger(StakingPayoutWorker.name);
  private runActive = false;

  constructor(
    @InjectModel(StakingPayout.name)
    private payoutModel: Model<StakingPayoutDocument>,
    @InjectModel(StakingPosition.name)
    private positionModel: Model<StakingPositionDocument>,
    private poolService: StakingPoolService,
    private transferService: TransferService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledRun() {
    if (this.runActive) return;
    this.runActive = true;
    try {
      await this.processPendingPayouts();
    } finally {
      this.runActive = false;
    }
  }

  async processPendingPayouts(): Promise<void> {
    if (!this.transferService.isEnabled('ethereum')) {
      this.logger.warn('STT transfers disabled — skipping staking payouts');
      return;
    }

    const pending = await this.payoutModel.find({
      status: PayoutStatus.PENDING,
    });
    if (pending.length === 0) return;

    this.logger.log(`Processing ${pending.length} staking payouts`);

    for (const payout of pending) {
      // Atomically take ownership. If another runner (overlapping cron, admin
      // trigger, second instance) got here first, skip. This is the guard that
      // prevents the same payout being broadcast twice.
      const locked = await this.payoutModel.findOneAndUpdate(
        { _id: payout._id, status: PayoutStatus.PENDING },
        { status: PayoutStatus.PROCESSING },
        { new: true },
      );
      if (!locked) {
        this.logger.warn(
          `Staking payout ${payout._id} skipped: already taken by another runner.`,
        );
        continue;
      }

      try {
        const { txHash } = await this.transferService.transferStt(
          locked.walletAddress,
          locked.totalStt,
        );

        await this.payoutModel.updateOne(
          { _id: locked._id },
          {
            status: PayoutStatus.COMPLETED,
            txHash,
            processedAt: new Date(),
          },
        );

        await this.positionModel.updateOne(
          { _id: locked.positionId, status: PositionStatus.CLOSING },
          { status: PositionStatus.CLOSED },
        );

        // Only a maturity payout consumes pool reward. An early exit already
        // released its reward back into the pool at unstake time.
        if (locked.kind === PayoutKind.MATURITY && locked.rewardStt > 0) {
          await this.poolService.markPaid(locked.rewardStt);
        }

        this.logger.log(
          `Paid ${locked.totalStt} STT to ${locked.walletAddress}: ${txHash}`,
        );
      } catch (err: any) {
        await this.failPayout(
          locked._id.toString(),
          err?.message || 'Transfer failed',
        );
      }
    }
  }

  async failPayout(payoutId: string, reason: string): Promise<void> {
    await this.payoutModel.updateOne(
      {
        _id: payoutId,
        status: { $in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] },
      },
      {
        status: PayoutStatus.FAILED,
        failureReason: reason,
        $inc: { retryCount: 1 },
        processedAt: new Date(),
      },
    );
    this.logger.error(`Staking payout ${payoutId} failed: ${reason}`);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-payout.worker.spec.ts`
Expected: PASS — 8 tests.

"broadcasts exactly once when two runners overlap" is the one that must never be allowed to fail. If it does, do not proceed.

- [ ] **Step 5: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking-payout.worker.ts src/staking/staking-payout.worker.spec.ts
git commit -m "feat(staking): add payout worker with single-broadcast ownership lock"
```

---

### Task 10: Intent expiry sweeper and deposit backstop

Two scheduled jobs. The sweeper hands back capacity from abandoned intents. The backstop catches the user who sent STT and then closed the tab.

**Files:**
- Create: `backend/src/staking/staking-backstop.service.ts`
- Test: `backend/src/staking/staking-backstop.service.spec.ts`

**Interfaces:**
- Consumes: `StakeIntent` model, `StakingService`, `StakingPoolService`, `StakingQuotaService`, `DepositVerifierService`.
- Produces: class `StakingBackstopService` with `sweepExpiredIntents(): Promise<number>` and `reconcileDeposits(): Promise<number>`. The verifier gains `findDepositsToTreasury(fromBlock: number): Promise<ChainDeposit[]>` where `ChainDeposit` is `{ txHash: string; fromAddress: string; amountStt: number; blockNumber: number }`.

- [ ] **Step 1: Add the log-scanning method to the verifier**

Append to `DepositVerifierService` in `backend/src/staking/deposit-verifier.service.ts`:

```ts
  /**
   * All STT transfers into the treasury since `fromBlock`. Used only by the
   * backstop job, which matches them against intents the user actually created.
   */
  async findDepositsToTreasury(fromBlock: number): Promise<ChainDeposit[]> {
    if (!this.provider || !this.treasury) return [];

    const logs = await this.provider.getLogs({
      address: STT_ADDRESS,
      topics: [
        TRANSFER_TOPIC,
        null,
        ethers.zeroPadValue(this.treasury, 32),
      ],
      fromBlock,
      toBlock: 'latest',
    });

    return logs.map((log) => ({
      txHash: log.transactionHash.toLowerCase(),
      fromAddress: this.topicToAddress(log.topics[1]),
      amountStt: Number(ethers.formatUnits(BigInt(log.data), STT_DECIMALS)),
      blockNumber: log.blockNumber,
    }));
  }
```

And export the type alongside the others:

```ts
export interface ChainDeposit {
  txHash: string;
  fromAddress: string;
  amountStt: number;
  blockNumber: number;
}
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/staking-backstop.service.spec.ts
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import { User, UserSchema } from '../schemas/user.schema';
import {
  StakeIntent,
  StakeIntentSchema,
  IntentStatus,
} from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionSchema,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingService } from './staking.service';
import { StakingBackstopService } from './staking-backstop.service';

const WALLET = '0x1111111111111111111111111111111111111111';
const TREASURY = '0x2222222222222222222222222222222222222222';

describe('StakingBackstopService', () => {
  let mongo: TestMongo;
  let backstop: StakingBackstopService;
  let staking: StakingService;
  let pool: StakingPoolService;
  let quota: StakingQuotaService;
  let verifier: any;
  let models: Record<string, any>;
  let userId: string;

  beforeAll(async () => {
    mongo = await startTestMongo();
    models = {
      [User.name]: mongo.connection.model(User.name, UserSchema),
      [StakeIntent.name]: mongo.connection.model(StakeIntent.name, StakeIntentSchema),
      [StakingPosition.name]: mongo.connection.model(
        StakingPosition.name,
        StakingPositionSchema,
      ),
      [StakingPayout.name]: mongo.connection.model(
        StakingPayout.name,
        StakingPayoutSchema,
      ),
      [StakingPool.name]: mongo.connection.model(StakingPool.name, StakingPoolSchema),
    };
    await models[StakingPosition.name].init();
    await models[StakingPayout.name].init();

    verifier = {
      verifyDeposit: jest.fn(),
      getTreasuryAddress: jest.fn().mockReturnValue(TREASURY),
      findDepositsToTreasury: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingBackstopService,
        StakingService,
        StakingPoolService,
        StakingQuotaService,
        { provide: DepositVerifierService, useValue: verifier },
        ...Object.entries(models).map(([name, model]) => ({
          provide: getModelToken(name),
          useValue: model,
        })),
      ],
    }).compile();

    backstop = moduleRef.get(StakingBackstopService);
    staking = moduleRef.get(StakingService);
    pool = moduleRef.get(StakingPoolService);
    quota = moduleRef.get(StakingQuotaService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await pool.ensurePool();
    const user = await models[User.name].create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    });
    userId = user._id.toString();
    verifier.verifyDeposit.mockReset();
    verifier.findDepositsToTreasury.mockReset().mockResolvedValue([]);
    verifier.getTreasuryAddress.mockReturnValue(TREASURY);
  });

  describe('sweepExpiredIntents', () => {
    it('releases pool and quota holds from an abandoned intent', async () => {
      const intent = await staking.createIntent(userId, WALLET, 10, 90);
      await models[StakeIntent.name].updateOne(
        { _id: intent.intentId },
        { expiresAt: new Date(Date.now() - 1000) },
      );

      const swept = await backstop.sweepExpiredIntents();

      expect(swept).toBe(1);
      expect((await pool.getState()).heldRewardStt).toBeCloseTo(0, 6);
      expect((await quota.getQuota(userId)).heldStt).toBeCloseTo(0, 6);
    });

    it('marks the intent EXPIRED', async () => {
      const intent = await staking.createIntent(userId, WALLET, 10, 90);
      await models[StakeIntent.name].updateOne(
        { _id: intent.intentId },
        { expiresAt: new Date(Date.now() - 1000) },
      );
      await backstop.sweepExpiredIntents();

      const stored = await models[StakeIntent.name].findById(intent.intentId);
      expect(stored.status).toBe(IntentStatus.EXPIRED);
    });

    it('leaves a live intent alone', async () => {
      await staking.createIntent(userId, WALLET, 10, 90);
      expect(await backstop.sweepExpiredIntents()).toBe(0);
      expect((await pool.getState()).heldRewardStt).toBeCloseTo(0.369863, 6);
    });

    it('releases each expired intent exactly once across overlapping runs', async () => {
      const intent = await staking.createIntent(userId, WALLET, 10, 90);
      await models[StakeIntent.name].updateOne(
        { _id: intent.intentId },
        { expiresAt: new Date(Date.now() - 1000) },
      );

      const [a, b] = await Promise.all([
        backstop.sweepExpiredIntents(),
        backstop.sweepExpiredIntents(),
      ]);

      expect(a + b).toBe(1);
      // Never negative: a double release would push held below zero.
      expect((await pool.getState()).heldRewardStt).toBeCloseTo(0, 6);
    });
  });

  describe('reconcileDeposits', () => {
    it('creates a position for a deposit whose sender and amount match an open intent', async () => {
      await staking.createIntent(userId, WALLET, 10, 90);
      verifier.findDepositsToTreasury.mockResolvedValue([
        { txHash: '0xstray', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
      ]);
      verifier.verifyDeposit.mockResolvedValue({
        ok: true,
        amountStt: 10,
        blockNumber: 900,
      });

      const created = await backstop.reconcileDeposits();

      expect(created).toBe(1);
      expect(await models[StakingPosition.name].countDocuments()).toBe(1);
    });

    it('ignores a deposit with no matching intent', async () => {
      verifier.findDepositsToTreasury.mockResolvedValue([
        { txHash: '0xstray', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
      ]);

      expect(await backstop.reconcileDeposits()).toBe(0);
      expect(await models[StakingPosition.name].countDocuments()).toBe(0);
    });

    it('ignores a deposit whose amount does not match the intent', async () => {
      await staking.createIntent(userId, WALLET, 10, 90);
      verifier.findDepositsToTreasury.mockResolvedValue([
        { txHash: '0xstray', fromAddress: WALLET, amountStt: 7, blockNumber: 900 },
      ]);

      expect(await backstop.reconcileDeposits()).toBe(0);
    });

    it('does not duplicate a position already created by the confirm endpoint', async () => {
      const intent = await staking.createIntent(userId, WALLET, 10, 90);
      verifier.verifyDeposit.mockResolvedValue({
        ok: true,
        amountStt: 10,
        blockNumber: 900,
      });
      await staking.confirmDeposit(userId, intent.intentId, '0xsame');

      verifier.findDepositsToTreasury.mockResolvedValue([
        { txHash: '0xsame', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
      ]);

      expect(await backstop.reconcileDeposits()).toBe(0);
      expect(await models[StakingPosition.name].countDocuments()).toBe(1);
    });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-backstop.service.spec.ts`
Expected: FAIL — `Cannot find module './staking-backstop.service'`.

- [ ] **Step 4: Write the implementation**

```ts
// backend/src/staking/staking-backstop.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  StakeIntent,
  StakeIntentDocument,
  IntentStatus,
} from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionDocument,
} from '../schemas/staking-position.schema';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingService } from './staking.service';

/** How far back the reconciliation job scans. ~2 days of Ethereum blocks. */
const BACKSTOP_BLOCK_WINDOW = 14400;

@Injectable()
export class StakingBackstopService {
  private readonly logger = new Logger(StakingBackstopService.name);

  constructor(
    @InjectModel(StakeIntent.name)
    private intentModel: Model<StakeIntentDocument>,
    @InjectModel(StakingPosition.name)
    private positionModel: Model<StakingPositionDocument>,
    private poolService: StakingPoolService,
    private quotaService: StakingQuotaService,
    private verifier: DepositVerifierService,
    private stakingService: StakingService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledSweep() {
    await this.sweepExpiredIntents();
    await this.reconcileDeposits();
  }

  /**
   * Hand back capacity from intents nobody funded. The status transition is
   * the guard: only the runner that flips OPEN -> EXPIRED releases the holds,
   * so overlapping runs cannot double-credit the pool.
   */
  async sweepExpiredIntents(): Promise<number> {
    const candidates = await this.intentModel.find({
      status: IntentStatus.OPEN,
      expiresAt: { $lt: new Date() },
    });

    let swept = 0;
    for (const intent of candidates) {
      const claimed = await this.intentModel.findOneAndUpdate(
        { _id: intent._id, status: IntentStatus.OPEN },
        { status: IntentStatus.EXPIRED },
        { new: true },
      );
      if (!claimed) continue;

      await this.poolService.releaseHold(intent.rewardStt);
      await this.quotaService.releaseHold(
        intent.userId.toString(),
        intent.amountStt,
      );
      swept += 1;
    }

    if (swept > 0) this.logger.log(`Swept ${swept} expired stake intents`);
    return swept;
  }

  /**
   * Catch the user who sent STT and then closed the tab. Only deposits that
   * match an intent the user explicitly created are credited, so there is no
   * open-ended unattributable-deposit queue and no guessing.
   */
  async reconcileDeposits(): Promise<number> {
    if (!this.verifier.getTreasuryAddress()) return 0;

    try {
      // Scan a bounded recent window rather than all of history. The unique
      // depositTxHash index makes re-scanning the same blocks harmless.
      const head = await this.verifier.getBlockNumber();
      const fromBlock = Math.max(0, head - BACKSTOP_BLOCK_WINDOW);
      const deposits = await this.verifier.findDepositsToTreasury(fromBlock);
      let created = 0;

      for (const deposit of deposits) {
        // Already credited? The unique index would reject it anyway, but
        // checking first keeps the logs clean.
        const existing = await this.positionModel.findOne({
          depositTxHash: deposit.txHash,
        });
        if (existing) continue;

        const intent = await this.intentModel.findOne({
          walletAddress: deposit.fromAddress.toLowerCase(),
          status: IntentStatus.OPEN,
          amountStt: deposit.amountStt,
        });
        if (!intent) continue;

        try {
          await this.stakingService.confirmDeposit(
            intent.userId.toString(),
            intent._id.toString(),
            deposit.txHash,
          );
          created += 1;
          this.logger.log(
            `Backstop credited deposit ${deposit.txHash} to intent ${intent._id}`,
          );
        } catch (err: any) {
          this.logger.warn(
            `Backstop could not credit ${deposit.txHash}: ${err?.message}`,
          );
        }
      }

      return created;
    } catch (err: any) {
      this.logger.error(`Deposit reconciliation failed: ${err?.message}`);
      return 0;
    }
  }
}
```

This needs one more passthrough on the verifier. Add it to `DepositVerifierService` alongside `findDepositsToTreasury`:

```ts
  /** Current chain head, or 0 when no provider is configured. */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) return 0;
    return this.provider.getBlockNumber();
  }
```

The test stub in Step 2 must return it too — add `getBlockNumber: jest.fn().mockResolvedValue(1000)` to the `verifier` object, and reset it in `beforeEach` alongside the others.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-backstop.service.spec.ts`
Expected: PASS — 7 tests.

- [ ] **Step 6: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking-backstop.service.ts src/staking/deposit-verifier.service.ts src/staking/staking-backstop.service.spec.ts
git commit -m "feat(staking): add intent expiry sweeper and intent-matched deposit backstop"
```

---

### Task 11: HTTP surface and module wiring

**Files:**
- Create: `backend/src/staking/staking.controller.ts`
- Create: `backend/src/staking/staking-admin.controller.ts`
- Create: `backend/src/staking/staking.module.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `StakingService`, `StakingPoolService`, `StakingPayoutWorker`, `StakingBackstopService`, and the existing Privy guard used by `auth.controller.ts`.
- Produces: the routes listed in the spec.

- [ ] **Step 1: Check how the existing controller authenticates**

Run: `cd /Users/kenho/projects/silvertimes/backend && sed -n '1,40p' src/auth/auth.controller.ts`

Copy the exact guard decorator and the way `userId` is read off the request. The staking controller must use the same mechanism — do not invent a new one.

- [ ] **Step 2: Write the public and authenticated controller**

```ts
// backend/src/staking/staking.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StakingService } from './staking.service';
import { StakingPoolService } from './staking-pool.service';
import {
  APR_BPS,
  MAX_STAKE_PER_WALLET_STT,
  MIN_STAKE_STT,
  TERMS,
} from './staking.constants';
import { DepositVerifierService } from './deposit-verifier.service';

@Controller('staking')
export class StakingController {
  constructor(
    private stakingService: StakingService,
    private poolService: StakingPoolService,
    private verifier: DepositVerifierService,
  ) {}

  /** Public campaign parameters. The frontend mirrors these, never invents them. */
  @Get('config')
  async getConfig() {
    const pool = await this.poolService.getState();
    return {
      terms: TERMS.map((termDays) => ({
        termDays,
        aprBps: APR_BPS[termDays],
      })),
      minStakeStt: MIN_STAKE_STT,
      maxStakePerWalletStt: MAX_STAKE_PER_WALLET_STT,
      treasuryAddress: this.verifier.getTreasuryAddress(),
      pool,
    };
  }

  @UseGuards(AuthGuard('privy'))
  @Get('me')
  async getMe(@Req() req: any) {
    return this.stakingService.getMyStaking(req.user.userId);
  }

  @UseGuards(AuthGuard('privy'))
  @Post('intent')
  async createIntent(
    @Req() req: any,
    @Body() body: { amountStt: number; termDays: number; walletAddress: string },
  ) {
    return this.stakingService.createIntent(
      req.user.userId,
      body.walletAddress,
      body.amountStt,
      body.termDays,
    );
  }

  @UseGuards(AuthGuard('privy'))
  @Post('confirm')
  async confirm(
    @Req() req: any,
    @Body() body: { intentId: string; txHash: string },
  ) {
    return this.stakingService.confirmDeposit(
      req.user.userId,
      body.intentId,
      body.txHash,
    );
  }

  @UseGuards(AuthGuard('privy'))
  @Post('positions/:id/claim')
  async claim(@Req() req: any, @Param('id') id: string) {
    return this.stakingService.claimMatured(req.user.userId, id);
  }

  @UseGuards(AuthGuard('privy'))
  @Post('positions/:id/unstake')
  async unstake(@Req() req: any, @Param('id') id: string) {
    return this.stakingService.unstakeEarly(req.user.userId, id);
  }
}
```

Replace `AuthGuard('privy')` with whatever Step 1 showed the existing controller uses, and read the user id the same way that controller does.

- [ ] **Step 3: Write the admin controller**

```ts
// backend/src/staking/staking-admin.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StakingPayoutWorker } from './staking-payout.worker';
import { StakingBackstopService } from './staking-backstop.service';
import { StakingPoolService } from './staking-pool.service';

// Guard this exactly as auth-admin.controller.ts guards its routes.
@Controller('staking/admin')
export class StakingAdminController {
  constructor(
    private worker: StakingPayoutWorker,
    private backstop: StakingBackstopService,
    private pool: StakingPoolService,
  ) {}

  @Get('pool')
  async getPool() {
    return this.pool.getState();
  }

  @Post('process-payouts')
  async processPayouts() {
    await this.worker.processPendingPayouts();
    return { success: true };
  }

  @Post('reconcile')
  async reconcile() {
    const swept = await this.backstop.sweepExpiredIntents();
    const created = await this.backstop.reconcileDeposits();
    return { swept, created };
  }
}
```

Open `backend/src/auth/auth-admin.controller.ts` and apply the identical guard. An unguarded admin route here can move funds.

- [ ] **Step 4: Write the module**

```ts
// backend/src/staking/staking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../schemas/user.schema';
import { StakeIntent, StakeIntentSchema } from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionSchema,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import { StakingService } from './staking.service';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingPayoutWorker } from './staking-payout.worker';
import { StakingBackstopService } from './staking-backstop.service';
import { StakingController } from './staking.controller';
import { StakingAdminController } from './staking-admin.controller';

@Module({
  imports: [
    AuthModule, // provides TransferService and the Privy strategy
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StakeIntent.name, schema: StakeIntentSchema },
      { name: StakingPosition.name, schema: StakingPositionSchema },
      { name: StakingPayout.name, schema: StakingPayoutSchema },
      { name: StakingPool.name, schema: StakingPoolSchema },
    ]),
  ],
  controllers: [StakingController, StakingAdminController],
  providers: [
    StakingService,
    StakingPoolService,
    StakingQuotaService,
    DepositVerifierService,
    StakingPayoutWorker,
    StakingBackstopService,
  ],
})
export class StakingModule {}
```

If `AuthModule` does not export `TransferService`, add it to that module's `exports` array — do not construct a second instance.

- [ ] **Step 5: Register the module**

In `backend/src/app.module.ts`, add the import and list `StakingModule` in `imports`, after `AnalyticsModule`:

```ts
import { StakingModule } from './staking/staking.module';
```

- [ ] **Step 6: Verify the whole backend suite and the build**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking && npm run build`
Expected: all staking specs PASS, `nest build` completes with no TypeScript errors.

Then confirm nothing existing regressed:

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest`
Expected: the pre-existing prediction specs still PASS.

- [ ] **Step 7: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/staking/staking.controller.ts src/staking/staking-admin.controller.ts src/staking/staking.module.ts src/app.module.ts
git commit -m "feat(staking): expose staking endpoints and wire the module"
```

---

## Phase 2 — Frontend

All paths below are relative to `/Users/kenho/projects/silvertimes/silvertimes.io`.

### Task 12: API client and preview maths

The page quotes reward figures before the backend has seen the request, so the preview maths must agree with the backend exactly. It gets its own tests for that reason — the rest of the frontend is verified by typecheck and browser.

**Files:**
- Create: `src/components/staking/staking.ts`
- Test: `src/components/staking/staking.test.ts`
- Modify: `src/services/api.ts` (append `stakingApi`)
- Modify: `package.json` (add vitest)
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: `apiRequest` (existing, `src/services/api.ts:101`).
- Produces: `TERMS`, `APR_BPS`, `MIN_STAKE_STT`, `MAX_STAKE_PER_WALLET_STT`, `previewReward(amountStt, termDays)`, `previewMaturity(termDays)`, `earlyExitPrincipal(amountStt)`, `fmtStt(n, dp?)`, `fmtRate(aprBps)`, `daysRemaining(maturesAt)`, `progressPct(stakedAt, maturesAt)`; and `stakingApi` with `getConfig`, `getMe`, `createIntent`, `confirmDeposit`, `claim`, `unstake`.

- [ ] **Step 1: Add vitest**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
npm install --save-dev vitest@^3
```

Add the script to `package.json`, alongside the existing ones:

```json
    "test": "vitest run",
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing test**

```ts
// src/components/staking/staking.test.ts
import { describe, it, expect } from 'vitest';
import {
  previewReward,
  earlyExitPrincipal,
  fmtStt,
  fmtRate,
  progressPct,
  daysRemaining,
} from './staking';

describe('staking preview maths', () => {
  it('matches the backend at the 10 STT / 30D maximum', () => {
    expect(previewReward(10, 30)).toBeCloseTo(0.082192, 6);
  });
  it('matches the backend at the 10 STT / 90D maximum', () => {
    expect(previewReward(10, 90)).toBeCloseTo(0.369863, 6);
  });
  it('matches the backend at the 1 STT minimum', () => {
    expect(previewReward(1, 30)).toBeCloseTo(0.008219, 6);
    expect(previewReward(1, 90)).toBeCloseTo(0.036986, 6);
  });
  it('is simple interest, never compounded', () => {
    expect(previewReward(2, 90)).toBeCloseTo(previewReward(1, 90) * 2, 6);
  });

  it('returns 80% of principal on early exit', () => {
    expect(earlyExitPrincipal(10)).toBeCloseTo(8, 6);
    expect(earlyExitPrincipal(2.5)).toBeCloseTo(2, 6);
  });

  it('formats STT without trailing noise', () => {
    expect(fmtStt(10)).toBe('10.0000');
    expect(fmtStt(0.369863)).toBe('0.3699');
    expect(fmtStt(10, 2)).toBe('10.00');
  });

  it('formats the rate from basis points', () => {
    expect(fmtRate(1000)).toBe('10.0%');
    expect(fmtRate(1500)).toBe('15.0%');
  });

  it('reports elapsed progress through a term', () => {
    const staked = new Date(Date.now() - 45 * 86400000).toISOString();
    const matures = new Date(Date.now() + 45 * 86400000).toISOString();
    expect(progressPct(staked, matures)).toBeCloseTo(50, 0);
  });

  it('clamps progress to the 0-100 range', () => {
    const staked = new Date(Date.now() - 200 * 86400000).toISOString();
    const matures = new Date(Date.now() - 100 * 86400000).toISOString();
    expect(progressPct(staked, matures)).toBe(100);
  });

  it('counts whole days remaining and never goes negative', () => {
    expect(daysRemaining(new Date(Date.now() + 5.4 * 86400000).toISOString())).toBe(6);
    expect(daysRemaining(new Date(Date.now() - 86400000).toISOString())).toBe(0);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npx vitest run src/components/staking/staking.test.ts`
Expected: FAIL — cannot resolve `./staking`.

- [ ] **Step 4: Write the module**

```ts
// src/components/staking/staking.ts
// Campaign constants mirrored from the backend. The backend is the authority —
// these exist so the page can preview a reward before submitting anything.
// If they drift, the preview lies to the user, so they are unit-tested.

export const TERMS = [30, 90] as const;
export type TermDays = (typeof TERMS)[number];

export const APR_BPS: Record<TermDays, number> = { 30: 1000, 90: 1500 };
export const MIN_STAKE_STT = 1;
export const MAX_STAKE_PER_WALLET_STT = 10;
export const AMOUNT_STEP = 0.01;

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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npx vitest run src/components/staking/staking.test.ts`
Expected: PASS — 10 tests.

- [ ] **Step 6: Append the API client**

Add to the end of `src/services/api.ts`, following the shape of the existing `authApi`:

```ts
// Staking API (secret /staking campaign)
export const stakingApi = {
  getConfig: () => apiRequest<any>('/staking/config'),

  getMe: (token: string) => apiRequest<any>('/staking/me', { token }),

  createIntent: (
    token: string,
    body: { amountStt: number; termDays: number; walletAddress: string },
  ) => apiRequest<any>('/staking/intent', { method: 'POST', body, token }),

  confirmDeposit: (token: string, body: { intentId: string; txHash: string }) =>
    apiRequest<any>('/staking/confirm', { method: 'POST', body, token }),

  claim: (token: string, positionId: string) =>
    apiRequest<any>(`/staking/positions/${positionId}/claim`, {
      method: 'POST',
      token,
    }),

  unstake: (token: string, positionId: string) =>
    apiRequest<any>(`/staking/positions/${positionId}/unstake`, {
      method: 'POST',
      token,
    }),
};
```

- [ ] **Step 7: Verify the build**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build`
Expected: `tsc` and `vite build` both succeed.

- [ ] **Step 8: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add package.json package-lock.json vitest.config.ts src/components/staking/staking.ts src/components/staking/staking.test.ts src/services/api.ts
git commit -m "feat(staking): add staking api client and tested preview maths"
```

---

### Task 13: Route, gate, and page shell

**Files:**
- Create: `src/components/staking/StakingPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `stakingApi`, `PasswordGate`, `usePrivy`, `FooterV2`, `Grain`.
- Produces: default-exported `StakingPage`, and a `StakingData` context shape `{ config, me, reload, loading, error }` consumed by Tasks 14–17.

- [ ] **Step 1: Write the page shell**

```tsx
// src/components/staking/StakingPage.tsx
import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Grain } from "../v2/cinematic";
import FooterV2 from "../FooterV2";
import { stakingApi } from "../../services/api";
import type { MyStaking, StakingConfig } from "./staking";
import StakingHero from "./StakingHero";
import TermCards from "./TermCards";
import StakePanel from "./StakePanel";
import PositionsPanel from "./PositionsPanel";
import ParametersSheet from "./ParametersSheet";
import RiskNotes from "./RiskNotes";
import type { TermDays } from "./staking";

// STT Staking — secret, unlisted product page (/staking), behind PasswordGate.
// Distinct product from Silver Yield (/earn): a fixed-term deposit paying STT
// interest at maturity, not a covered call paying a USDT premium upfront.
export default function StakingPage() {
  const { authenticated, getAccessToken } = usePrivy();

  const [config, setConfig] = useState<StakingConfig | null>(null);
  const [me, setMe] = useState<MyStaking | null>(null);
  const [term, setTerm] = useState<TermDays>(90);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const cfg = await stakingApi.getConfig();
    setConfig(cfg);

    if (authenticated) {
      const token = await getAccessToken();
      if (token) {
        setMe(await stakingApi.getMe(token).catch(() => null));
        return;
      }
    }
    setMe(null);
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
      <div className="pointer-events-none absolute right-0 top-[46vh] h-[36vh] w-[40vw] rounded-full bg-brand-teal/[0.05] blur-[150px]" />

      <StakingHero pool={config?.pool ?? null} loading={loading} />
      <TermCards term={term} onSelect={setTerm} />
      <StakePanel
        config={config}
        me={me}
        term={term}
        onStaked={reload}
      />
      <PositionsPanel me={me} onChanged={reload} />
      <ParametersSheet />
      <RiskNotes treasuryAddress={config?.treasuryAddress ?? ""} />

      <FooterV2 />
    </div>
  );
}
```

- [ ] **Step 2: Register the gated route**

In `src/App.tsx`, uncomment the `PasswordGate` import and add the staking import:

```tsx
import PasswordGate from "./components/PasswordGate";
import StakingPage from "./components/staking/StakingPage";
```

Add the route inside `<Routes>`, after the `/earn` route. The page is both unlisted and password-gated, as agreed:

```tsx
          <Route
            path="/staking"
            element={
              <PasswordGate>
                <StakingPage />
              </PasswordGate>
            }
          />
```

Add `"/staking"` to the `V2_ROUTES` array so the legacy global footer is suppressed — `StakingPage` ships its own `FooterV2`:

```tsx
const V2_ROUTES = ["/", "/transparency", "/prediction", "/earn", "/staking"];
```

Do **not** add any nav or footer link to `/staking`.

- [ ] **Step 3: Verify the route renders**

The remaining components do not exist yet, so the build will fail until Tasks 14–18 land. Create the five files as one-line placeholders now so the shell compiles, and replace each in its own task:

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io/src/components/staking
for f in StakingHero TermCards StakePanel PositionsPanel ParametersSheet RiskNotes; do
  printf 'export default function %s(_props: any) {\n  return null;\n}\n' "$f" > "$f.tsx"
done
```

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build`
Expected: build succeeds.

Then run the dev server and confirm the gate appears:

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run dev`
Open `http://localhost:5173/staking`. Expected: the PasswordGate form, not the page.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/App.tsx src/components/staking/
git commit -m "feat(staking): add gated /staking route and page shell"
```

---

### Task 14: Hero and pool meter

The hero's job is to make the offer legible in one glance and to show honestly how much of the campaign is left. The pool meter is the proof element, and it is a committed-rewards bar — never a "spots remaining" count, because a 1 STT floor makes the participant range span 38 to 1,737.

**Files:**
- Create: `src/components/staking/PoolMeter.tsx`
- Replace: `src/components/staking/StakingHero.tsx`

**Interfaces:**
- Consumes: `PoolState`, `Eyebrow`, `Reveal`, `FadeUp`, `fmtStt`.
- Produces: `PoolMeter({ pool, compact }: { pool: PoolState | null; compact?: boolean })` and `StakingHero({ pool, loading }: { pool: PoolState | null; loading: boolean })`.

- [ ] **Step 1: Write the pool meter**

```tsx
// src/components/staking/PoolMeter.tsx
import { motion } from "framer-motion";
import { EASE } from "../v2/cinematic";
import { fmtStt, type PoolState } from "./staking";

/**
 * Committed rewards against the pool. Shown as value, not seats: the 1 STT
 * floor means the participant count could be anywhere from 38 to ~1,737, so a
 * "spots left" counter would be meaningless.
 */
export default function PoolMeter({
  pool,
  compact = false,
}: {
  pool: PoolState | null;
  compact?: boolean;
}) {
  if (!pool) {
    return (
      <div className="h-9 w-full animate-pulse rounded-lg border border-white/10 bg-white/[0.02]" />
    );
  }

  const used = pool.committedRewardStt + pool.heldRewardStt;
  const pct = Math.min(100, (used / pool.totalRewardStt) * 100);
  const exhausted = !pool.isOpen;

  return (
    <div className={compact ? "w-full" : "w-full max-w-md"}>
      <div className="relative h-9 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
        <motion.div
          className={`absolute inset-y-0 left-0 ${
            exhausted
              ? "bg-gradient-to-r from-silver-600/50 to-silver-500/40"
              : "bg-gradient-to-r from-brand-blue/40 to-brand-teal/50"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs tracking-tight text-silver-200">
          {exhausted
            ? "Reward pool fully subscribed"
            : `${fmtStt(pool.availableRewardStt)} STT of rewards remaining`}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-silver-500">
        <span>{pct.toFixed(1)}% committed</span>
        <span>{fmtStt(pool.totalRewardStt, 2)} STT pool</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the hero**

```tsx
// src/components/staking/StakingHero.tsx
import { Eyebrow, FadeUp, Reveal } from "../v2/cinematic";
import PoolMeter from "./PoolMeter";
import { fmtRate, type PoolState } from "./staking";

export default function StakingHero({
  pool,
  loading,
}: {
  pool: PoolState | null;
  loading: boolean;
}) {
  const closed = !loading && pool && !pool.isOpen;

  return (
    <section className="relative px-6 pt-24 pb-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp>
          <Eyebrow>STT Staking · Fixed term</Eyebrow>
        </FadeUp>

        <h1 className="mt-7 text-[clamp(2.6rem,6.5vw,5.25rem)] font-semibold leading-[0.98] tracking-tight text-white">
          <Reveal scroll={false}>Lock silver.</Reveal>
          <Reveal scroll={false} delay={0.08} className="text-silver-400">
            Earn silver.
          </Reveal>
        </h1>

        <FadeUp delay={0.15} scroll={false}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-silver-300">
            Stake <span className="text-white">STT</span> for a fixed term and
            take back your principal plus interest at maturity — paid in{" "}
            <span className="text-brand-teal">STT</span>, from a finite reward
            pool. No price exposure beyond the silver you already hold.
          </p>
        </FadeUp>

        <FadeUp delay={0.24} scroll={false}>
          <div className="mt-8 flex flex-wrap items-end gap-8">
            <div>
              <div className="font-mono text-4xl leading-none text-brand-teal">
                {fmtRate(1000)}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-silver-500">
                30-day fixed rate
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <div className="font-mono text-4xl leading-none text-brand-sky">
                {fmtRate(1500)}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-silver-500">
                90-day fixed rate
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.32} scroll={false}>
          <div className="mt-10">
            <PoolMeter pool={pool} />
          </div>
        </FadeUp>

        {closed && (
          <FadeUp delay={0.4} scroll={false}>
            <p className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-silver-300">
              This campaign is fully subscribed — every reward in the pool has
              been allocated. Existing positions are unaffected and will pay out
              on their maturity dates as agreed.
            </p>
          </FadeUp>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`

Open `/staking`, pass the gate, and check: the two rate figures read 10.0% and 15.0%; the pool bar animates in; no emoji; only brand colours. Narrow the browser to 375px and confirm nothing overflows horizontally.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/staking/StakingHero.tsx src/components/staking/PoolMeter.tsx
git commit -m "feat(staking): add staking hero with live reward-pool meter"
```

---

### Task 15: Term cards

Two large selection cards rather than a table row — this is the page's first decision point and deserves the weight. Layout deliberately differs from the sections above and below it, per the project's "vary section layouts" convention.

**Files:**
- Replace: `src/components/staking/TermCards.tsx`

**Interfaces:**
- Consumes: `TERMS`, `APR_BPS`, `fmtRate`, `fmtDate`, `previewMaturity`, `previewReward`, `FadeUp`, `Reveal`.
- Produces: `TermCards({ term, onSelect }: { term: TermDays; onSelect: (t: TermDays) => void })`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/staking/TermCards.tsx
import { motion } from "framer-motion";
import { EASE, FadeUp, Reveal } from "../v2/cinematic";
import {
  APR_BPS,
  TERMS,
  fmtDate,
  fmtRate,
  fmtStt,
  previewMaturity,
  previewReward,
  type TermDays,
} from "./staking";

const COPY: Record<TermDays, { label: string; blurb: string }> = {
  30: {
    label: "Short term",
    blurb: "A one-month lock. Lower rate, your silver back sooner.",
  },
  90: {
    label: "Long term",
    blurb: "A three-month lock at the campaign's best rate.",
  },
};

export default function TermCards({
  term,
  onSelect,
}: {
  term: TermDays;
  onSelect: (t: TermDays) => void;
}) {
  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Choose your term</Reveal>
        </h2>
        <FadeUp delay={0.08}>
          <p className="mt-4 max-w-lg text-silver-400">
            Interest is fixed at the rate below and paid in full on the maturity
            date. It is simple interest, pro-rated over the term — not
            compounded.
          </p>
        </FadeUp>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {TERMS.map((t, i) => {
            const selected = term === t;
            // Show the reward on a full 10 STT stake so the two cards compare.
            const example = previewReward(10, t);

            return (
              <motion.button
                key={t}
                type="button"
                onClick={() => onSelect(t)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
                aria-pressed={selected}
                className={`group relative overflow-hidden rounded-2xl border p-7 text-left transition-colors ${
                  selected
                    ? "border-brand-teal/40 bg-gradient-to-br from-brand-blue/10 to-brand-teal/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-silver-500">
                      {COPY[t].label}
                    </div>
                    <div className="mt-2 font-mono text-[2.75rem] leading-none text-white">
                      {t}
                      <span className="ml-1 text-lg text-silver-400">days</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono text-3xl leading-none ${
                        t === 90 ? "text-brand-sky" : "text-brand-teal"
                      }`}
                    >
                      {fmtRate(APR_BPS[t])}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-silver-500">
                      fixed rate
                      <br />
                      (annualised)
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-silver-400">
                  {COPY[t].blurb}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
                  <div>
                    <div className="font-mono text-sm text-silver-200">
                      {fmtStt(example)} STT
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      interest on 10 STT
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-sm text-silver-200">
                      {fmtDate(previewMaturity(t))}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      matures if started today
                    </div>
                  </div>
                </div>

                {selected && (
                  <span className="absolute right-5 top-5 rounded-full bg-brand-teal/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-brand-teal">
                    Selected
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`

On `/staking`: clicking either card moves the "Selected" badge; 90D is selected by default; the maturity date is today plus the term; the two cards stack on a narrow viewport.

- [ ] **Step 3: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/staking/TermCards.tsx
git commit -m "feat(staking): add 30D/90D term selection cards"
```

---

### Task 16: Stake panel

The interactive core, and the place where users get hurt if the UI is vague. Every blocked state is explicit rather than being a button that fails validation, and the sender-address requirement is stated *before* the user pays gas.

**Files:**
- Replace: `src/components/staking/StakePanel.tsx`

**Interfaces:**
- Consumes: `stakingApi`, `usePrivy`, `useWallets` (`@privy-io/react-auth`), `ethers`-free ERC-20 encoding via the wallet's `eth_sendTransaction`, `previewReward`, `previewMaturity`, `fmtStt`, `fmtDate`.
- Produces: `StakePanel({ config, me, term, onStaked }: { config: StakingConfig | null; me: MyStaking | null; term: TermDays; onStaked: () => Promise<void> })`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/staking/StakePanel.tsx
import { useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { FadeUp, Reveal } from "../v2/cinematic";
import { stakingApi } from "../../services/api";
import {
  MAX_STAKE_PER_WALLET_STT,
  MIN_STAKE_STT,
  fmtDate,
  fmtStt,
  previewMaturity,
  previewReward,
  type MyStaking,
  type StakingConfig,
  type TermDays,
} from "./staking";

const STT_ADDRESS = "0x9f13a262ac5be07a8e6eac09d01daf00be5e0fce";
const STT_DECIMALS = 18;

/** ERC-20 transfer(address,uint256) calldata, hand-encoded to avoid a dependency. */
function encodeTransfer(to: string, amountStt: number): string {
  const selector = "a9059cbb";
  const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  // Two decimal places of STT, scaled to 18 decimals, without float error.
  const units = BigInt(Math.round(amountStt * 100)) * 10n ** BigInt(STT_DECIMALS - 2);
  return `0x${selector}${addr}${units.toString(16).padStart(64, "0")}`;
}

type Phase = "idle" | "intent" | "sending" | "verifying" | "done";

export default function StakePanel({
  config,
  me,
  term,
  onStaked,
}: {
  config: StakingConfig | null;
  me: MyStaking | null;
  term: TermDays;
  onStaked: () => Promise<void>;
}) {
  const { authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const [amount, setAmount] = useState(10);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const wallet = wallets[0];
  const remaining = me?.remainingStt ?? MAX_STAKE_PER_WALLET_STT;
  const poolOpen = config?.pool.isOpen ?? true;

  // The cap for this stake is the smaller of the campaign max and what is
  // left of this wallet's allowance.
  const maxForThisStake = Math.min(MAX_STAKE_PER_WALLET_STT, remaining);
  const dustAllowance = remaining > 0 && remaining < MIN_STAKE_STT;

  const reward = useMemo(() => previewReward(amount, term), [amount, term]);
  const maturity = useMemo(() => previewMaturity(term), [term]);

  const amountValid =
    amount >= MIN_STAKE_STT &&
    amount <= maxForThisStake &&
    Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-9;

  async function handleStake() {
    setError(null);
    if (!wallet) {
      setError("Connect a wallet to stake.");
      return;
    }

    try {
      setPhase("intent");
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");

      const intent = await stakingApi.createIntent(token, {
        amountStt: amount,
        termDays: term,
        walletAddress: wallet.address,
      });

      setPhase("sending");
      const provider = await wallet.getEthereumProvider();
      const txHash: string = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: STT_ADDRESS,
            data: encodeTransfer(intent.treasuryAddress, amount),
          },
        ],
      });

      setPhase("verifying");
      // The backend re-reads the chain; it needs confirmations before it will
      // credit. Poll rather than failing the first time it says "too early".
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          await stakingApi.confirmDeposit(token, {
            intentId: intent.intentId,
            txHash,
          });
          setPhase("done");
          await onStaked();
          return;
        } catch (err: any) {
          if (!/INSUFFICIENT_CONFIRMATIONS|NOT_FOUND/.test(err?.message || "")) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 6000));
        }
      }
      throw new Error(
        "Your transfer was sent but is still confirming. It will be credited automatically — check back shortly.",
      );
    } catch (err: any) {
      setError(err?.message || "Staking failed. Please try again.");
      setPhase("idle");
    }
  }

  const busy = phase !== "idle" && phase !== "done";

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Stake your STT</Reveal>
        </h2>

        <FadeUp delay={0.08}>
          <div className="mt-8 rounded-2xl border border-white/10 bg-background-secondary/40 p-7 backdrop-blur-sm">
            {!poolOpen ? (
              <p className="text-sm leading-relaxed text-silver-300">
                The reward pool is fully subscribed, so new stakes are closed.
                Existing positions are unaffected.
              </p>
            ) : !authenticated ? (
              <div>
                <p className="text-sm leading-relaxed text-silver-300">
                  Connect the wallet holding your STT to stake. Rewards and
                  principal return to that same wallet.
                </p>
                <button
                  onClick={login}
                  className="mt-6 w-full rounded-lg bg-brand-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
                >
                  Connect wallet
                </button>
              </div>
            ) : dustAllowance ? (
              <p className="text-sm leading-relaxed text-silver-300">
                You have{" "}
                <span className="font-mono text-white">
                  {fmtStt(remaining, 2)} STT
                </span>{" "}
                of allowance remaining, which is below the{" "}
                {MIN_STAKE_STT.toFixed(2)} STT minimum. You cannot open another
                position until one of your current positions closes.
              </p>
            ) : remaining <= 0 ? (
              <p className="text-sm leading-relaxed text-silver-300">
                You have reached the {MAX_STAKE_PER_WALLET_STT} STT per-wallet
                cap. You can stake again once a position closes.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="stake-amount"
                    className="text-[11px] uppercase tracking-[0.18em] text-silver-500"
                  >
                    Amount to stake
                  </label>
                  <span className="font-mono text-xs text-silver-500">
                    {fmtStt(remaining, 2)} STT allowance left
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <input
                    id="stake-amount"
                    type="number"
                    inputMode="decimal"
                    min={MIN_STAKE_STT}
                    max={maxForThisStake}
                    step={0.01}
                    value={amount}
                    disabled={busy}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-40 rounded-lg border border-white/10 bg-background-primary px-4 py-3 font-mono text-2xl text-white focus:border-brand-blue focus:outline-none"
                  />
                  <span className="font-mono text-lg text-silver-400">STT</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setAmount(Math.floor(maxForThisStake * 100) / 100)}
                    className="ml-auto rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Max
                  </button>
                </div>

                <input
                  type="range"
                  min={MIN_STAKE_STT}
                  max={maxForThisStake}
                  step={0.01}
                  value={amount}
                  disabled={busy}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-5 w-full accent-[#6596FE]"
                  aria-label="Stake amount"
                />

                <div className="mt-7 grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-3">
                  <div>
                    <div className="font-mono text-lg text-brand-teal">
                      {fmtStt(reward)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      interest earned
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-lg text-white">
                      {fmtStt(amount + reward)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      total at maturity
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-lg text-silver-200">
                      {fmtDate(maturity)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                      maturity date
                    </div>
                  </div>
                </div>

                {/*
                  Stated BEFORE the user pays gas. A deposit sent from an
                  exchange or an unregistered wallet cannot be attributed and
                  is the highest-risk mistake in this whole flow.
                */}
                <p className="mt-6 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.06] p-4 text-xs leading-relaxed text-silver-300">
                  Your STT must be sent from{" "}
                  <span className="font-mono text-white">
                    {wallet
                      ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                      : "your connected wallet"}
                  </span>
                  . Transfers from an exchange or any other address cannot be
                  matched to your account and will not be credited.
                </p>

                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}

                <button
                  onClick={handleStake}
                  disabled={!amountValid || busy}
                  className="mt-6 w-full rounded-lg bg-brand-blue py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "intent" && "Preparing..."}
                  {phase === "sending" && "Confirm in your wallet..."}
                  {phase === "verifying" && "Verifying on-chain..."}
                  {(phase === "idle" || phase === "done") &&
                    `Stake ${fmtStt(amount, 2)} STT for ${term} days`}
                </button>

                {phase === "verifying" && (
                  <p className="mt-3 text-center text-xs text-silver-500">
                    Waiting for 3 confirmations. Keep this page open — closing it
                    is recoverable, but slower.
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

- [ ] **Step 2: Verify each state renders**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`

Walk all five states on `/staking`:
1. Signed out — "Connect wallet".
2. Signed in, full allowance — slider 1.00 to 10.00, live preview updating.
3. Dust allowance — temporarily return `remainingStt: 0.5` from a stubbed `stakingApi.getMe` and confirm the explicit message appears with no stake button.
4. Cap reached — stub `remainingStt: 0`.
5. Pool exhausted — stub `pool.isOpen: false`.

Revert any stubs before committing.

- [ ] **Step 3: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/staking/StakePanel.tsx
git commit -m "feat(staking): add stake panel with explicit blocked and verifying states"
```

---

### Task 17: Positions panel

**Files:**
- Create: `src/components/staking/MaturityRing.tsx`
- Replace: `src/components/staking/PositionsPanel.tsx`

**Interfaces:**
- Consumes: `stakingApi`, `usePrivy`, `progressPct`, `daysRemaining`, `earlyExitPrincipal`, `fmtStt`, `fmtDate`.
- Produces: `MaturityRing({ pct, size? })` and `PositionsPanel({ me, onChanged })`.

- [ ] **Step 1: Write the maturity ring**

```tsx
// src/components/staking/MaturityRing.tsx
/** Circular progress through a staking term. Inline SVG — no chart library. */
export default function MaturityRing({
  pct,
  size = 56,
}: {
  pct: number;
  size?: number;
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const complete = pct >= 100;

  return (
    <svg width={size} height={size} className="shrink-0" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={complete ? "#90E0EF" : "#6596FE"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 900ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-silver-200 font-mono"
        style={{ fontSize: size * 0.24 }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Write the positions panel**

```tsx
// src/components/staking/PositionsPanel.tsx
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FadeUp, Reveal } from "../v2/cinematic";
import { stakingApi } from "../../services/api";
import MaturityRing from "./MaturityRing";
import {
  daysRemaining,
  earlyExitPrincipal,
  fmtDate,
  fmtRate,
  fmtStt,
  progressPct,
  type MyStaking,
  type Position,
} from "./staking";

export default function PositionsPanel({
  me,
  onChanged,
}: {
  me: MyStaking | null;
  onChanged: () => Promise<void>;
}) {
  const { getAccessToken } = usePrivy();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const positions = (me?.positions ?? []).filter((p) => p.status !== "CLOSED");
  if (positions.length === 0) return null;

  async function act(
    position: Position,
    kind: "claim" | "unstake",
  ): Promise<void> {
    setError(null);
    setBusyId(position.id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — sign in again.");
      if (kind === "claim") await stakingApi.claim(token, position.id);
      else await stakingApi.unstake(token, position.id);
      setConfirmingId(null);
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "That did not go through. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="relative px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Your positions</Reveal>
        </h2>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-8 space-y-4">
          {positions.map((p, i) => {
            const pct = progressPct(p.stakedAt, p.maturesAt);
            const days = daysRemaining(p.maturesAt);
            const matured = days === 0;
            const closing = p.status === "CLOSING";
            const busy = busyId === p.id;

            return (
              <FadeUp key={p.id} delay={i * 0.06}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <MaturityRing pct={pct} />

                    <div className="min-w-[9rem]">
                      <div className="font-mono text-2xl leading-none text-white">
                        {fmtStt(p.amountStt, 2)}{" "}
                        <span className="text-sm text-silver-400">STT</span>
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        {p.termDays}-day term · {fmtRate(p.aprBps)}
                      </div>
                    </div>

                    <div className="min-w-[8rem]">
                      <div className="font-mono text-lg text-brand-teal">
                        +{fmtStt(p.rewardStt)}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        interest at maturity
                      </div>
                    </div>

                    <div className="min-w-[8rem]">
                      <div className="font-mono text-sm text-silver-200">
                        {fmtDate(p.maturesAt)}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-silver-500">
                        {matured ? "matured" : `${days} days remaining`}
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      {closing ? (
                        <span className="rounded-full border border-white/15 px-4 py-2 text-xs text-silver-400">
                          Payout in progress
                        </span>
                      ) : matured ? (
                        <button
                          onClick={() => act(p, "claim")}
                          disabled={busy}
                          className="rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
                        >
                          {busy ? "Claiming..." : "Claim"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(p.id)}
                          disabled={busy}
                          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-silver-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                        >
                          Unstake early
                        </button>
                      )}
                    </div>
                  </div>

                  {/*
                    The penalty is quoted as a concrete STT figure, never as a
                    bare percentage — the user should see exactly what they lose.
                  */}
                  {confirmingId === p.id && (
                    <div className="mt-5 rounded-lg border border-white/10 bg-background-primary/60 p-5">
                      <p className="text-sm leading-relaxed text-silver-300">
                        Unstaking now returns{" "}
                        <span className="font-mono text-white">
                          {fmtStt(earlyExitPrincipal(p.amountStt), 2)} STT
                        </span>{" "}
                        of your {fmtStt(p.amountStt, 2)} STT principal. You give
                        up{" "}
                        <span className="font-mono text-white">
                          {fmtStt(p.amountStt - earlyExitPrincipal(p.amountStt), 2)} STT
                        </span>{" "}
                        to the 20% early redemption fee and forfeit all{" "}
                        <span className="font-mono text-white">
                          {fmtStt(p.rewardStt)} STT
                        </span>{" "}
                        of interest. This cannot be undone.
                      </p>
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => act(p, "unstake")}
                          disabled={busy}
                          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
                        >
                          {busy ? "Unstaking..." : "Yes, unstake early"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-silver-300 transition-colors hover:border-white/30 hover:text-white"
                        >
                          Keep staking
                        </button>
                      </div>
                    </div>
                  )}
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

- [ ] **Step 3: Verify**

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run build && npm run dev`

With a seeded position: the ring fills proportionally; a future maturity shows "Unstake early"; the confirmation quotes concrete STT figures; a past maturity shows "Claim"; a CLOSING position shows "Payout in progress" with no action.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/staking/PositionsPanel.tsx src/components/staking/MaturityRing.tsx
git commit -m "feat(staking): add positions panel with maturity rings and explicit penalty confirmation"
```

---

### Task 18: Parameters sheet and risk notes

The source table, restyled as a dark spec sheet with a left accent rule rather than a bordered grid, plus the plain-language risk section. Layout differs again from every section above it.

**Files:**
- Replace: `src/components/staking/ParametersSheet.tsx`
- Replace: `src/components/staking/RiskNotes.tsx`

**Interfaces:**
- Consumes: `FadeUp`, `Reveal`, `fmtStt`.
- Produces: `ParametersSheet()` and `RiskNotes({ treasuryAddress }: { treasuryAddress: string })`.

- [ ] **Step 1: Write the parameters sheet**

```tsx
// src/components/staking/ParametersSheet.tsx
import { FadeUp, Reveal } from "../v2/cinematic";

const ROWS: { parameter: string; spec: string; detail: string }[] = [
  {
    parameter: "Deposit asset",
    spec: "STT (ERC-20)",
    detail: "Ethereum mainnet",
  },
  {
    parameter: "Fixed rate",
    spec: "10.0% (30D) or 15.0% (90D)",
    detail: "Annualised, simple interest pro-rated over the term",
  },
  {
    parameter: "Lockup term",
    spec: "30 days or 90 days",
    detail: "Interest and principal released on the maturity date",
  },
  {
    parameter: "Reward pool",
    spec: "14.28 STT",
    detail: "Approximately $1,000 in value across the whole campaign",
  },
  {
    parameter: "Allocation",
    spec: "First come, first served",
    detail: "Rewards are reserved when you stake; staking closes when the pool is committed",
  },
  {
    parameter: "Quota per wallet",
    spec: "1.00 – 10.00 STT",
    detail: "Summed across all your open positions",
  },
  {
    parameter: "Early unstaking",
    spec: "80% of principal returned",
    detail: "Available any time before maturity. All interest is forfeited",
  },
];

export default function ParametersSheet() {
  return (
    <section className="relative px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>Technical parameters</Reveal>
        </h2>

        <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-white/10">
          {ROWS.map((row, i) => (
            <FadeUp key={row.parameter} delay={i * 0.04}>
              <div className="grid gap-2 border-l-2 border-brand-blue/40 bg-white/[0.02] px-6 py-5 sm:grid-cols-[1fr_1.2fr_1.6fr] sm:gap-6 sm:items-baseline">
                <div className="text-[11px] uppercase tracking-[0.16em] text-silver-500">
                  {row.parameter}
                </div>
                <div className="font-mono text-sm text-white">{row.spec}</div>
                <div className="text-sm leading-relaxed text-silver-400">
                  {row.detail}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the risk notes**

```tsx
// src/components/staking/RiskNotes.tsx
import { FadeUp, Reveal } from "../v2/cinematic";

export default function RiskNotes({
  treasuryAddress,
}: {
  treasuryAddress: string;
}) {
  const notes: { title: string; body: string }[] = [
    {
      title: "Your STT is held by SilverTimes",
      body: "This is a custodial product. When you stake, your STT is transferred to a SilverTimes treasury address and returned, with interest, when your position closes. There is no staking smart contract.",
    },
    {
      title: "Stake from your connected wallet only",
      body: `Deposits are matched to your account by sender address${
        treasuryAddress
          ? ` and must arrive at ${treasuryAddress.slice(0, 6)}...${treasuryAddress.slice(-4)}`
          : ""
      }. STT sent from an exchange, or from any wallet other than the one you signed in with, cannot be credited automatically.`,
    },
    {
      title: "Early exit costs 20% of principal",
      body: "You can unstake before maturity at any time, but you receive 80% of your principal and no interest. The interest you give up returns to the reward pool for other stakers.",
    },
    {
      title: "The reward pool is finite",
      body: "Rewards are reserved the moment you stake. Once the 14.28 STT pool is fully committed, staking closes. Positions already open are unaffected and pay out as agreed.",
    },
  ];

  return (
    <section className="relative px-6 pb-20 pt-4 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight tracking-tight text-white">
          <Reveal>What you should know</Reveal>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {notes.map((note, i) => (
            <FadeUp key={note.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-sm font-semibold text-white">
                  {note.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">
                  {note.body}
                </p>
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

Run: `cd /Users/kenho/projects/silvertimes/silvertimes.io && npm run test && npm run build`
Expected: vitest passes, build succeeds.

Then a full visual pass on `/staking` at 375px, 768px and 1440px. Confirm:
- No emoji anywhere on the page.
- Only `brand-sky`, `brand-blue`, `brand-teal` and `silver-*` are used; no emerald, amber, violet or rose.
- Every card uses `rounded-2xl`.
- No horizontal scrolling at 375px.
- Section layouts genuinely differ: full-bleed hero, two-up cards, narrow centred panel, wide list rows, left-ruled spec sheet, two-column notes.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd /Users/kenho/projects/silvertimes/silvertimes.io
git add src/components/staking/ParametersSheet.tsx src/components/staking/RiskNotes.tsx
git commit -m "feat(staking): add technical parameters sheet and risk notes"
```

---

### Task 19: Uncredited deposits and admin visibility

Closes the last spec requirement. A deposit can arrive after its intent has already been swept — a slow transfer, or a user who sent STT and came back an hour later. That principal is real and must not silently vanish, but it also must not be credited at a rate the pool can no longer honour. It is recorded, surfaced to an admin, and refunded in full.

The refund is **admin-triggered, not automatic**. This deviates from the letter of the spec ("refunded in full") only in who presses the button: an automatic refund path would let any address that sends STT to the treasury cause an unattended hot-wallet spend, which is exactly the blast radius the rest of this design works to avoid. The amount and the obligation are unchanged.

**Files:**
- Create: `backend/src/schemas/uncredited-deposit.schema.ts`
- Modify: `backend/src/staking/staking-backstop.service.ts`
- Modify: `backend/src/staking/staking-admin.controller.ts`
- Modify: `backend/src/staking/staking.module.ts`
- Test: `backend/src/staking/staking-uncredited.spec.ts`

**Interfaces:**
- Consumes: `StakeIntent` model, `StakingPosition` model, `DepositVerifierService`.
- Produces: `UncreditedDeposit` / `UncreditedDepositSchema` / `UncreditedStatus`; on `StakingBackstopService` — `recordUncredited(deposit: ChainDeposit, reason: string): Promise<boolean>`; on `StakingAdminController` — `GET /staking/admin/positions` and `GET /staking/admin/uncredited`.

- [ ] **Step 1: Write the schema**

```ts
// backend/src/schemas/uncredited-deposit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UncreditedDepositDocument = UncreditedDeposit & Document;

export enum UncreditedStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  REFUNDED = 'REFUNDED',
  RESOLVED = 'RESOLVED',
}

/**
 * STT that reached the treasury but could not become a position — usually a
 * transfer that landed after its intent was swept. The principal is owed back
 * in full; an admin releases it.
 */
@Schema({ timestamps: true })
export class UncreditedDeposit {
  @Prop({ required: true, lowercase: true, unique: true })
  txHash: string;

  @Prop({ required: true, lowercase: true })
  fromAddress: string;

  @Prop({ required: true })
  amountStt: number;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: UncreditedStatus.PENDING_REVIEW, enum: UncreditedStatus })
  status: UncreditedStatus;

  @Prop()
  refundTxHash?: string;
}

export const UncreditedDepositSchema =
  SchemaFactory.createForClass(UncreditedDeposit);
```

- [ ] **Step 2: Write the failing test**

```ts
// backend/src/staking/staking-uncredited.spec.ts
// Reuses the module setup from staking-backstop.service.spec.ts, with the
// UncreditedDeposit model added to `models` and to the providers list.
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { startTestMongo, TestMongo } from './test-utils';
import { User, UserSchema } from '../schemas/user.schema';
import {
  StakeIntent,
  StakeIntentSchema,
  IntentStatus,
} from '../schemas/stake-intent.schema';
import {
  StakingPosition,
  StakingPositionSchema,
} from '../schemas/staking-position.schema';
import {
  StakingPayout,
  StakingPayoutSchema,
} from '../schemas/staking-payout.schema';
import { StakingPool, StakingPoolSchema } from '../schemas/staking-pool.schema';
import {
  UncreditedDeposit,
  UncreditedDepositSchema,
  UncreditedStatus,
} from '../schemas/uncredited-deposit.schema';
import { StakingPoolService } from './staking-pool.service';
import { StakingQuotaService } from './staking-quota.service';
import { DepositVerifierService } from './deposit-verifier.service';
import { StakingService } from './staking.service';
import { StakingBackstopService } from './staking-backstop.service';

const WALLET = '0x1111111111111111111111111111111111111111';
const TREASURY = '0x2222222222222222222222222222222222222222';

describe('uncredited deposits', () => {
  let mongo: TestMongo;
  let backstop: StakingBackstopService;
  let staking: StakingService;
  let pool: StakingPoolService;
  let verifier: any;
  let models: Record<string, any>;
  let userId: string;

  beforeAll(async () => {
    mongo = await startTestMongo();
    models = {
      [User.name]: mongo.connection.model(User.name, UserSchema),
      [StakeIntent.name]: mongo.connection.model(StakeIntent.name, StakeIntentSchema),
      [StakingPosition.name]: mongo.connection.model(
        StakingPosition.name,
        StakingPositionSchema,
      ),
      [StakingPayout.name]: mongo.connection.model(
        StakingPayout.name,
        StakingPayoutSchema,
      ),
      [StakingPool.name]: mongo.connection.model(StakingPool.name, StakingPoolSchema),
      [UncreditedDeposit.name]: mongo.connection.model(
        UncreditedDeposit.name,
        UncreditedDepositSchema,
      ),
    };
    await models[StakingPosition.name].init();
    await models[StakingPayout.name].init();
    await models[UncreditedDeposit.name].init();

    verifier = {
      verifyDeposit: jest.fn(),
      getTreasuryAddress: jest.fn().mockReturnValue(TREASURY),
      findDepositsToTreasury: jest.fn().mockResolvedValue([]),
      getBlockNumber: jest.fn().mockResolvedValue(1000),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingBackstopService,
        StakingService,
        StakingPoolService,
        StakingQuotaService,
        { provide: DepositVerifierService, useValue: verifier },
        ...Object.entries(models).map(([name, model]) => ({
          provide: getModelToken(name),
          useValue: model,
        })),
      ],
    }).compile();

    backstop = moduleRef.get(StakingBackstopService);
    staking = moduleRef.get(StakingService);
    pool = moduleRef.get(StakingPoolService);
  }, 60000);

  afterAll(async () => {
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongo.clear();
    await pool.ensurePool();
    const user = await models[User.name].create({
      privyId: `privy-${new Types.ObjectId().toString()}`,
    });
    userId = user._id.toString();
    verifier.verifyDeposit.mockReset();
    verifier.findDepositsToTreasury.mockReset().mockResolvedValue([]);
    verifier.getBlockNumber.mockResolvedValue(1000);
    verifier.getTreasuryAddress.mockReturnValue(TREASURY);
  });

  it('records a deposit whose intent was already swept', async () => {
    const intent = await staking.createIntent(userId, WALLET, 10, 90);
    // The intent expires and is swept before the transfer lands.
    await models[StakeIntent.name].updateOne(
      { _id: intent.intentId },
      { expiresAt: new Date(Date.now() - 1000) },
    );
    await backstop.sweepExpiredIntents();

    verifier.findDepositsToTreasury.mockResolvedValue([
      { txHash: '0xlate', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
    ]);

    await backstop.reconcileDeposits();

    const record = await models[UncreditedDeposit.name].findOne({
      txHash: '0xlate',
    });
    expect(record).toBeTruthy();
    expect(record.amountStt).toBeCloseTo(10, 6);
    expect(record.fromAddress).toBe(WALLET);
    expect(record.status).toBe(UncreditedStatus.PENDING_REVIEW);
    expect(await models[StakingPosition.name].countDocuments()).toBe(0);
  });

  it('records the full amount owed, not a penalised one', async () => {
    await models[StakeIntent.name].create({
      userId: new Types.ObjectId(userId),
      walletAddress: WALLET,
      amountStt: 10,
      termDays: 90,
      rewardStt: 0.369863,
      status: IntentStatus.EXPIRED,
      expiresAt: new Date(Date.now() - 1000),
    });
    verifier.findDepositsToTreasury.mockResolvedValue([
      { txHash: '0xlate', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
    ]);

    await backstop.reconcileDeposits();

    const record = await models[UncreditedDeposit.name].findOne({
      txHash: '0xlate',
    });
    // Full principal. This was never a position, so no early-exit penalty.
    expect(record.amountStt).toBeCloseTo(10, 6);
  });

  it('does not record a deposit that became a position', async () => {
    const intent = await staking.createIntent(userId, WALLET, 10, 90);
    verifier.verifyDeposit.mockResolvedValue({
      ok: true,
      amountStt: 10,
      blockNumber: 900,
    });
    await staking.confirmDeposit(userId, intent.intentId, '0xgood');

    verifier.findDepositsToTreasury.mockResolvedValue([
      { txHash: '0xgood', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
    ]);
    await backstop.reconcileDeposits();

    expect(await models[UncreditedDeposit.name].countDocuments()).toBe(0);
  });

  it('does not record a deposit from an address that never staked', async () => {
    verifier.findDepositsToTreasury.mockResolvedValue([
      {
        txHash: '0xstranger',
        fromAddress: '0x9999999999999999999999999999999999999999',
        amountStt: 3,
        blockNumber: 900,
      },
    ]);

    await backstop.reconcileDeposits();
    expect(await models[UncreditedDeposit.name].countDocuments()).toBe(0);
  });

  it('records each deposit only once across repeated runs', async () => {
    await models[StakeIntent.name].create({
      userId: new Types.ObjectId(userId),
      walletAddress: WALLET,
      amountStt: 10,
      termDays: 90,
      rewardStt: 0.369863,
      status: IntentStatus.EXPIRED,
      expiresAt: new Date(Date.now() - 1000),
    });
    verifier.findDepositsToTreasury.mockResolvedValue([
      { txHash: '0xlate', fromAddress: WALLET, amountStt: 10, blockNumber: 900 },
    ]);

    await backstop.reconcileDeposits();
    await backstop.reconcileDeposits();

    expect(await models[UncreditedDeposit.name].countDocuments()).toBe(1);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking/staking-uncredited.spec.ts`
Expected: FAIL — `Cannot find module '../schemas/uncredited-deposit.schema'` until Step 1 lands, then failing assertions because nothing records anything.

- [ ] **Step 4: Extend the backstop service**

Add the model to the constructor of `StakingBackstopService`:

```ts
    @InjectModel(UncreditedDeposit.name)
    private uncreditedModel: Model<UncreditedDepositDocument>,
```

with the import:

```ts
import {
  UncreditedDeposit,
  UncreditedDepositDocument,
  UncreditedStatus,
} from '../schemas/uncredited-deposit.schema';
import type { ChainDeposit } from './deposit-verifier.service';
```

Add the recording method:

```ts
  /**
   * Money arrived that cannot become a position. Record it so it is visible
   * and owed, rather than sitting silently in the treasury. The unique index
   * on txHash makes repeated scans idempotent.
   */
  async recordUncredited(
    deposit: ChainDeposit,
    reason: string,
  ): Promise<boolean> {
    try {
      await this.uncreditedModel.create({
        txHash: deposit.txHash,
        fromAddress: deposit.fromAddress.toLowerCase(),
        amountStt: deposit.amountStt,
        blockNumber: deposit.blockNumber,
        reason,
        status: UncreditedStatus.PENDING_REVIEW,
      });
      this.logger.warn(
        `Uncredited deposit ${deposit.txHash}: ${deposit.amountStt} STT from ${deposit.fromAddress} (${reason})`,
      );
      return true;
    } catch (err: any) {
      if (err?.code === 11000) return false; // already recorded
      throw err;
    }
  }
```

Then, inside `reconcileDeposits`, replace the `if (!intent) continue;` line with:

```ts
        if (!intent) {
          // No open intent. If this sender ever created one, the transfer
          // arrived too late — the principal is owed back in full.
          const hadIntent = await this.intentModel.findOne({
            walletAddress: deposit.fromAddress.toLowerCase(),
          });
          if (hadIntent) {
            const alreadyLogged = await this.uncreditedModel.findOne({
              txHash: deposit.txHash,
            });
            if (!alreadyLogged) {
              await this.recordUncredited(
                deposit,
                'Deposit arrived after its stake intent expired',
              );
            }
          }
          continue;
        }
```

- [ ] **Step 5: Add the admin routes**

Add to `StakingAdminController`, with the same guard as the other routes on it:

```ts
  @Get('positions')
  async listPositions() {
    return this.backstop.listPositionsForAdmin();
  }

  @Get('uncredited')
  async listUncredited() {
    return this.backstop.listUncreditedForAdmin();
  }
```

And the two read methods on `StakingBackstopService`:

```ts
  async listPositionsForAdmin() {
    return this.positionModel.find().sort({ createdAt: -1 }).limit(500).lean();
  }

  async listUncreditedForAdmin() {
    return this.uncreditedModel
      .find({ status: UncreditedStatus.PENDING_REVIEW })
      .sort({ createdAt: -1 })
      .lean();
  }
```

- [ ] **Step 6: Register the schema in the module**

Add to the `MongooseModule.forFeature([...])` array in `backend/src/staking/staking.module.ts`:

```ts
      { name: UncreditedDeposit.name, schema: UncreditedDepositSchema },
```

with the matching import.

- [ ] **Step 7: Run the full staking suite**

Run: `cd /Users/kenho/projects/silvertimes/backend && npx jest src/staking && npm run build`
Expected: every staking spec PASSES and the build succeeds.

- [ ] **Step 8: Commit (backend repo)**

```bash
cd /Users/kenho/projects/silvertimes/backend
git add src/schemas/uncredited-deposit.schema.ts src/staking/staking-backstop.service.ts src/staking/staking-admin.controller.ts src/staking/staking.module.ts src/staking/staking-uncredited.spec.ts
git commit -m "feat(staking): record uncredited deposits and add admin visibility"
```

---

## Deployment notes

Do **not** deploy the backend with a funded treasury until every staking spec passes and the payout worker has been exercised against a testnet or a hot wallet holding a token amount you are willing to lose.

Required new environment variable on the backend:

```
STAKING_TREASURY_ADDRESS=
```

Staking disables itself cleanly if it is unset — `getConfig` returns an empty treasury address and `createIntent` refuses — so deploying the code before setting it is safe.

Check `GET /staking/admin/uncredited` after launch. Anything listed there is principal SilverTimes owes back in full and must be refunded manually.

The existing `HOT_WALLET_PRIVATE_KEY` and `ETH_RPC_URL` are reused. The hot wallet must hold enough STT to cover principal plus interest for every open position, not just the rewards; the treasury and the hot wallet may be the same address, in which case deposits fund their own repayment.

Frontend deploys with `npm run deploy` as usual. `/staking` is unlisted and password-gated; do not add it to nav, footer, or the sitemap.
