# ForexMentor AI - Product Requirements Document (MVP v1.0)

**Version:** 1.0\
**Date:** October 19, 2025\
**Start:** October 20, 2025\
**Target Launch:** 30 days from start\
**Status:** Ready for Development

---

## Executive Summary

### Product Vision

ForexMentor AI is a beginner-focused Forex paper trading platform that provides instant AI-powered trade analysis. Unlike traditional demo accounts that offer zero feedback, ForexMentor AI evaluates every trade and provides specific, actionable improvement suggestions.

### MVP Scope (v1.0)

**In Scope:**

- Web-based paper trading simulator for 5 major Forex pairs
- Real-time trade execution with virtual $10,000 account
- AI-powered trade analysis after each closed trade
- Trading dashboard with performance metrics
- User authentication and account management
- Free tier: 25 trades per month

**Out of Scope (Post-MVP):**

- Social features (accountability partners, challenges)
- Trading journal
- Educational content/courses
- Psychology training modules
- Mobile native apps
- Paid subscription tiers (infrastructure ready, not launched)

### Success Metrics (30 Days Post-Launch)

- 100 user signups
- 50 active traders (completed 3+ trades)
- 200+ trades executed
- Average AI analysis rating: 4+ stars (user feedback)
- 70%+ of users return within 7 days

---

## Goals & Objectives

### Primary Goal

Validate product-market fit for AI-powered Forex education by proving beginners will use and value instant trade feedback.

### User Goals

1. Practice Forex trading without financial risk
2. Understand why their trades succeed or fail
3. Improve trading skills through specific, actionable feedback
4. Build confidence before trading with real money

### Business Goals

1. Launch functional MVP in 30 days
2. Validate AI trade analysis provides genuine value
3. Build email list of engaged traders
4. Gather user feedback for social/journal/education features
5. Establish technical foundation for paid features

---

## User Personas

### Primary Persona: "Curious Chris"

**Demographics:**

- Age: 25-35
- Occupation: Employed full-time (tech, finance, or service industry)
- Income: $40k-$80k/year
- Location: US, UK, Canada, Australia

**Background:**

- Discovered Forex through YouTube or social media
- Has $500-$2,000 saved, wants to trade eventually
- Downloaded MT4 demo but felt overwhelmed and abandoned it
- Tried 1-2 YouTube "strategies" with paper trading but saw no improvement
- No formal trading education

**Needs:**

- Clear, simple interface (not MT4 complexity)
- Immediate feedback on trade quality
- Understand WHY trades fail, not just that they failed
- Practice without fear of losing real money
- Confidence before risking savings

**Pain Points:**

- Information overload from YouTube/Reddit
- No idea if they're improving or just guessing
- Lonely learning experience
- Don't know when they're "ready" for live trading
- Afraid of making expensive mistakes

**Quote:** *"I've been paper trading for 2 months but I have no idea if I'm doing this right. I need someone to tell me what I'm doing wrong."*

---

## Core User Flows

### 1\. New User Onboarding Flow

```
Landing Page
    ↓
Sign Up (Email + Password or Google OAuth via BetterAuth)
    ↓
Email Verification
    ↓
Welcome Screen
    - "You have $10,000 virtual balance"
    - "You get 25 free trades this month"
    - "Start your first trade on EUR/USD"
    ↓
Dashboard (Empty State)
    - Quick tutorial overlay (skippable)
    - "Place your first trade" CTA button
    ↓
Trading Interface
```

**Acceptance Criteria:**

- [ ] User can sign up in &lt; 60 seconds

- [ ] Email verification sent immediately

- [ ] User lands on dashboard after verification

- [ ] Welcome message explains virtual balance and trade limit

- [ ] Clear CTA to place first trade

---

### 2\. Place Trade Flow (With Intelligent Guidance)

```
Dashboard
    ↓
Click "New Trade" button
    ↓
Trade Entry Modal Opens
    ↓
Step 1: Select Pair & Direction
    - User selects pair (dropdown: 5 majors)
    - User selects direction (BUY or SELL buttons)
    - Shows current price and spread
    ↓
Step 2: Risk Management Setup (NEW - CRITICAL)
    - "How much are you willing to risk on this trade?"
    - Input: Risk Amount ($) OR Risk % (of account)
    - Default: 2% (recommended, shown in green)
    - Live calculation shows both $ and %
    - WARNING if >2%: "⚠️ You're risking 5% - professionals risk 1-2%"
    ↓
Step 3: Stop Loss (REQUIRED)
    - "Where will you exit if the trade goes against you?"
    - Input: Stop Loss price OR pips from entry
    - RED ALERT if no SL: "🚫 Trading without stop-loss is extremely risky"
    - AI Suggestion: "Based on recent price action, consider SL at 1.0820 (30 pips)"
    - Shows potential loss if SL hit
    ↓
Step 4: Take Profit (Recommended)
    - "Where will you take profit?"
    - Input: Take Profit price OR pips from entry
    - Shows potential profit if TP hit
    - Shows Risk:Reward ratio (color coded)
      - Red: < 1:1 ("Not recommended")
      - Yellow: 1:1 to 1:2 ("Acceptable")
      - Green: > 1:2 ("Good risk:reward")
    ↓
[System Auto-Calculates Position Size]
    Based on:
    - Risk amount (from Step 2)
    - Stop loss distance (from Step 3)
    - Account balance
    Formula: Position Size = Risk Amount ÷ (Stop Loss Distance in pips × Pip Value)
    ↓
Pre-Trade Summary Panel (NEW)
    ┌─────────────────────────────────────┐
    │ Trade Summary                       │
    ├─────────────────────────────────────┤
    │ EUR/USD LONG at 1.0850             │
    │                                     │
    │ Position Size: 0.5 lots            │
    │ (Auto-calculated for 2% risk)      │
    │                                     │
    │ Stop Loss: 1.0820 (-30 pips)       │
    │ Take Profit: 1.0910 (+60 pips)     │
    │                                     │
    │ Risk:Reward: 1:2 ✅                │
    │                                     │
    │ Max Risk: $100 (2.0% of account)   │
    │ Potential Profit: $200             │
    │                                     │
    │ Required Margin: $542              │
    │ Available: $9,458 ✅               │
    └─────────────────────────────────────┘
    ↓
[Psychology Check - Beginner Mode] (NEW)
    "Before you trade, quick check:"
    1. "Why are you taking this trade?"
       - [ ] I see a clear setup
       - [ ] Just trying something
       - [ ] Following someone's signal
       - [ ] Feeling lucky
    
    2. "How confident are you (1-10)?"
       [Slider: 1-10]
       - If < 6: "⚠️ Low confidence = higher chance of early exit"
    
    3. "Have you lost money today?"
       - [ ] Yes [If yes: "Consider taking a break"]
       - [ ] No
    ↓
[Real-Time Warnings System] (NEW)
    - 🚫 BLOCKING ERRORS (can't trade):
      - "No stop-loss set - required for beginners"
      - "Insufficient margin"
      - "Monthly trade limit reached (25/25)"
    
    - ⚠️ STRONG WARNINGS (can proceed but discouraged):
      - "Risking >2% - professionals risk 1-2%"
      - "Risk:Reward <1:2 - you need higher win rate"
      - "Position size too large for account"
      - "You've already traded this pair today"
      - "Low confidence score - consider waiting"
    
    - ℹ️ SOFT GUIDANCE (informational):
      - "First trade of the day - good luck!"
      - "Great risk:reward ratio (1:3)"
      - "Stop-loss aligns with support level"
    ↓
User clicks "Execute Trade"
    ↓
[Final Confirmation if Warnings Present]
    "Are you sure? ⚠️"
    - Lists any warnings
    - "I understand the risks" checkbox required
    - [Go Back] or [Execute Anyway]
    ↓
Trade Executed
    ↓
Success Toast: "Long position opened on EUR/USD"
    + Educational tip: "Remember: Let your winners run, cut losses short"
    ↓
Trade appears in "Open Positions" panel
    ↓
Live P&L updates in real-time
```

**Acceptance Criteria:**

- [ ] Risk % defaults to 2% and highlights this is recommended

- [ ] Position size auto-calculates based on risk + stop-loss

- [ ] Cannot place trade without stop-loss (hard requirement for beginners)

- [ ] Warning shown if risk &gt;2% of account

- [ ] Warning shown if R:R ratio &lt;1:2

- [ ] Psychology check appears before execution

- [ ] All warnings clearly visible and color-coded

- [ ] User can override warnings but must acknowledge

- [ ] Educational tooltips on every field (? icon)

- [ ] Summary panel updates in real-time as user inputs change

- [ ] Trade executes within 1 second after confirmation

- [ ] Trade appears immediately in open positions list

---

### 3\. Close Trade & AI Analysis Flow

```
Open Positions Panel
    ↓
User clicks "Close" on a position
    ↓
Confirmation Modal
    - "Close 0.5 lots EUR/USD Long?"
    - Shows current P&L
    - "Close Position" button
    ↓
User confirms
    ↓
[System:]
    - Closes position at current market price
    - Calculates final P&L
    - Updates account balance
    - Increments trade count
    ↓
[Inngest triggered: "trade.closed" event]
    ↓
Loading State: "AI is analyzing your trade..."
    ↓
[Inngest Function:]
    1. Fetch price data from Polygon.io (last 100 candles)
    2. Calculate technical indicators
    3. Build analysis prompt with trade context
    4. Call Claude API via Vercel AI SDK
    5. Parse AI response (JSON schema)
    6. Save analysis to Convex
    ↓
[Frontend polling or real-time subscription detects new analysis]
    ↓
AI Analysis Modal Opens (auto-opens)
    ↓
Display:
    - Overall Score (1-5 stars with color)
    - Risk Management Rating + feedback
    - Entry Timing Rating + feedback
    - Exit Decision Rating + feedback
    - 3 Key Improvement Tips
    - "View Full Analysis" link to details page
    ↓
User can:
    - Rate the analysis (helpful Y/N)
    - Close modal
    - Share feedback
```

**Acceptance Criteria:**

- [ ] Trade closes immediately at market price

- [ ] AI analysis appears within 10 seconds

- [ ] Analysis includes all required sections

- [ ] User can dismiss modal and view analysis later

- [ ] Analysis saved to trade history

- [ ] If AI fails, user sees graceful error: "Analysis unavailable, try again"

---

### 4\. View Dashboard & History Flow

```
User navigates to Dashboard
    ↓
Dashboard displays:
    ┌─────────────────────────────────┐
    │ Account Summary Card            │
    │ - Current Balance: $10,247      │
    │ - P&L: +$247 (+2.47%)          │
    │ - Trades This Month: 12/25      │
    └─────────────────────────────────┘
    
    ┌─────────────────────────────────┐
    │ Open Positions (Live)           │
    │ EUR/USD Long | +$45 | Close btn │
    │ GBP/USD Short | -$12 | Close btn│
    └─────────────────────────────────┘
    
    ┌─────────────────────────────────┐
    │ Recent Trades (Closed)          │
    │ Trade 1 | EUR/USD | +$50 | ★★★★ │
    │ Trade 2 | GBP/USD | -$25 | ★★★  │
    │ [Click trade to see AI analysis]│
    └─────────────────────────────────┘
    
    ┌─────────────────────────────────┐
    │ Performance Chart                │
    │ [Line chart of balance over time]│
    └─────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Dashboard loads in &lt; 2 seconds

- [ ] All metrics calculated correctly

- [ ] Open positions update in real-time

- [ ] Click closed trade → Opens AI analysis modal

- [ ] Chart shows last 30 days of performance

- [ ] Mobile responsive (stacked cards)

---

## Detailed Feature Specifications

### Feature 1: Paper Trading Simulator

**Description:**\
Web-based Forex trading simulator allowing users to practice trading with virtual money on 5 major currency pairs.

**Supported Currency Pairs:**

1. EUR/USD (Euro / US Dollar)
2. GBP/USD (British Pound / US Dollar)
3. USD/JPY (US Dollar / Japanese Yen)
4. USD/CHF (US Dollar / Swiss Franc)
5. AUD/USD (Australian Dollar / US Dollar)

**Trading Parameters:**

- Starting virtual balance: $10,000
- Lot sizes: 0.01 (micro) to 10.0 (standard)
- Leverage: 1:100 (standard for retail Forex)
- Spread: Use Polygon.io bid/ask spread (realistic)
- Order types: Market orders only (MVP - no pending orders)
- Stop Loss / Take Profit: Optional, user-specified price levels

**Business Rules:**

- Users cannot trade if insufficient margin
- Max 25 trades per calendar month (free tier)
- Trade counter resets 1st of each month
- Virtual balance resets to $10,000 on request (max 1x per month)
- No shorting restrictions (can sell pairs freely)

**Price Data:**

- Source: Polygon.io Forex API
- Update frequency: Real-time via websocket OR 5-second polling
- Execution price: Current bid (for sells) or ask (for buys)
- Historical data: Fetch last 100 candles for AI analysis

**Real-Time P&L Calculation:**

```
For Long Position (BUY):
P&L = (Current Bid - Entry Price) × Position Size × Contract Size

For Short Position (SELL):
P&L = (Entry Price - Current Ask) × Position Size × Contract Size

Contract Size (standard lot):
- EUR/USD, GBP/USD, AUD/USD: 100,000 units
- USD/JPY, USD/CHF: 100,000 units

Example:
Long 0.1 lots EUR/USD at 1.0850
Current price: 1.0900
P&L = (1.0900 - 1.0850) × 0.1 × 100,000 = $50
```

**UI Components:**

**1. Trade Entry Form**

```
┌─────────────────────────────────────┐
│ New Trade                       [X] │
├─────────────────────────────────────┤
│ Currency Pair:                      │
│ [EUR/USD ▼]                         │
│                                     │
│ Direction:                          │
│ [BUY] [SELL]                        │
│                                     │
│ Lot Size:                           │
│ [0.01] [0.05] [0.1] [0.5] [1.0]    │
│ Custom: [___] lots                  │
│                                     │
│ Stop Loss (Optional):               │
│ [_______] pips below/above entry    │
│                                     │
│ Take Profit (Optional):             │
│ [_______] pips above/below entry    │
│                                     │
│ ─────────────────────────────────   │
│ Current Price: 1.0850               │
│ Required Margin: $108.50            │
│ Available Margin: $9,500            │
│ Risk:Reward: 1:2 (if SL/TP set)     │
│                                     │
│         [Execute Trade]             │
└─────────────────────────────────────┘
```

**2. Open Positions Table**

```
┌──────────────────────────────────────────────────────────┐
│ Open Positions (2)                                       │
├──────────┬─────────┬────────┬────────┬────────┬──────────┤
│ Pair     │ Dir     │ Size   │ Entry  │ P&L    │ Action   │
├──────────┼─────────┼────────┼────────┼────────┼──────────┤
│ EUR/USD  │ Long    │ 0.5    │ 1.0850 │ +$45   │ [Close]  │
│ GBP/USD  │ Short   │ 0.3    │ 1.2700 │ -$12   │ [Close]  │
└──────────┴─────────┴────────┴────────┴────────┴──────────┘
```

**Technical Implementation:**

**Database Schema (Convex):**

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    authId: v.string(), // BetterAuth user ID
    virtualBalance: v.float64(),
    tradesThisMonth: v.number(),
    monthlyTradeLimit: v.number(),
    lastMonthReset: v.string(), // ISO date
    createdAt: v.number(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"]),

  trades: defineTable({
    userId: v.id("users"),
    pair: v.string(), // "EUR/USD"
    direction: v.union(v.literal("long"), v.literal("short")),
    lotSize: v.float64(),
    entryPrice: v.float64(),
    exitPrice: v.optional(v.float64()),
    stopLoss: v.optional(v.float64()),
    takeProfit: v.optional(v.float64()),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("stopped_out"),
      v.literal("take_profit_hit")
    ),
    openedAt: v.number(),
    closedAt: v.optional(v.number()),
    profitLoss: v.optional(v.float64()),
    aiAnalysisId: v.optional(v.id("analyses")),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_opened", ["userId", "openedAt"]),

  analyses: defineTable({
    tradeId: v.id("trades"),
    userId: v.id("users"),
    overallScore: v.number(), // 1-5
    riskManagementScore: v.number(),
    riskManagementFeedback: v.string(),
    entryTimingScore: v.number(),
    entryTimingFeedback: v.string(),
    exitDecisionScore: v.number(),
    exitDecisionFeedback: v.string(),
    improvementTips: v.array(v.string()),
    rawAiResponse: v.string(), // Store full AI response
    createdAt: v.number(),
    userRating: v.optional(v.number()), // User rates the analysis
  })
    .index("by_trade", ["tradeId"])
    .index("by_user", ["userId"]),

  priceData: defineTable({
    pair: v.string(),
    timestamp: v.number(),
    open: v.float64(),
    high: v.float64(),
    low: v.float64(),
    close: v.float64(),
    volume: v.optional(v.float64()),
  })
    .index("by_pair_timestamp", ["pair", "timestamp"]),
});
```

**Convex Mutations:**

```typescript
// convex/trades.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const openTrade = mutation({
  args: {
    pair: v.string(),
    direction: v.union(v.literal("long"), v.literal("short")),
    lotSize: v.float64(),
    entryPrice: v.float64(),
    stopLoss: v.optional(v.float64()),
    takeProfit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check monthly trade limit
    if (user.tradesThisMonth >= user.monthlyTradeLimit) {
      throw new Error("Monthly trade limit reached");
    }

    // Calculate required margin (simplified)
    const contractSize = 100000;
    const leverage = 100;
    const requiredMargin = (args.lotSize * contractSize * args.entryPrice) / leverage;

    if (requiredMargin > user.virtualBalance) {
      throw new Error("Insufficient margin");
    }

    // Insert trade
    const tradeId = await ctx.db.insert("trades", {
      userId: user._id,
      pair: args.pair,
      direction: args.direction,
      lotSize: args.lotSize,
      entryPrice: args.entryPrice,
      stopLoss: args.stopLoss,
      takeProfit: args.takeProfit,
      status: "open",
      openedAt: Date.now(),
    });

    // Increment trade counter
    await ctx.db.patch(user._id, {
      tradesThisMonth: user.tradesThisMonth + 1,
    });

    return tradeId;
  },
});

export const closeTrade = mutation({
  args: {
    tradeId: v.id("trades"),
    exitPrice: v.float64(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const trade = await ctx.db.get(args.tradeId);
    if (!trade) throw new Error("Trade not found");

    const user = await ctx.db.get(trade.userId);
    if (!user) throw new Error("User not found");

    // Calculate P&L
    const contractSize = 100000;
    let profitLoss: number;

    if (trade.direction === "long") {
      profitLoss = (args.exitPrice - trade.entryPrice) * trade.lotSize * contractSize;
    } else {
      profitLoss = (trade.entryPrice - args.exitPrice) * trade.lotSize * contractSize;
    }

    // Update trade
    await ctx.db.patch(args.tradeId, {
      exitPrice: args.exitPrice,
      profitLoss,
      status: "closed",
      closedAt: Date.now(),
    });

    // Update user balance
    await ctx.db.patch(user._id, {
      virtualBalance: user.virtualBalance + profitLoss,
    });

    // Trigger Inngest event for AI analysis
    await ctx.scheduler.runAfter(0, "inngest:trade-closed", {
      tradeId: args.tradeId,
      userId: trade.userId,
    });

    return { profitLoss, newBalance: user.virtualBalance + profitLoss };
  },
});

export const getOpenTrades = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("trades")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", user._id).eq("status", "open")
      )
      .collect();
  },
});
```

**Price Data Integration (Polygon.io):**

```typescript
// lib/polygon.ts
export async function getCurrentPrice(pair: string) {
  const ticker = pair.replace("/", ""); // EUR/USD → EURUSD
  const response = await fetch(
    `https://api.polygon.io/v2/last/nbbo/C:${ticker}?apiKey=${process.env.POLYGON_API_KEY}`
  );
  const data = await response.json();
  return {
    bid: data.results.p, // Bid price
    ask: data.results.P, // Ask price
    timestamp: data.results.t,
  };
}

export async function getHistoricalCandles(
  pair: string,
  timeframe: string = "15",
  limit: number = 100
) {
  const ticker = pair.replace("/", "");
  const to = Date.now();
  const from = to - (limit * 15 * 60 * 1000); // 15-min candles

  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/C:${ticker}/range/15/minute/${from}/${to}?apiKey=${process.env.POLYGON_API_KEY}`
  );
  const data = await response.json();
  
  return data.results.map((candle: any) => ({
    timestamp: candle.t,
    open: candle.o,
    high: candle.h,
    low: candle.l,
    close: candle.c,
    volume: candle.v,
  }));
}
```

---

### Feature 2: Intelligent Trade Guidance System (NEW - CRITICAL)

**Description:**\
Real-time coaching and validation during trade setup that prevents common beginner mistakes before they happen. This is your key differentiator - teaching good habits from trade #1.

**Core Principles:**

1. **Make stop-loss mandatory** (not optional)
2. **Auto-calculate position size** based on risk percentage
3. **Warn about risky decisions** before execution
4. **Educate inline** with tooltips and guidance
5. **Psychology check** before committing capital

---

#### Component 2.1: Smart Risk Calculator

**Purpose:** Calculate correct position size based on account risk tolerance and stop-loss distance.

**The Formula:**

```
Position Size (lots) = (Risk Amount in $) ÷ (Stop Loss Distance in pips × Pip Value)

Where:
- Risk Amount = Account Balance × Risk %
- Pip Value = (Lot Size × Contract Size × Pip Size) ÷ Exchange Rate
- For EUR/USD: Pip Value = $10 per pip for 1 standard lot

Example:
Account: $10,000
Risk: 2% = $200
Stop Loss: 30 pips below entry
Pip Value: $10/pip for 1 lot

Position Size = $200 ÷ (30 pips × $10/pip) = 0.67 lots
```

**UI Implementation:**

```typescript
// components/trade/RiskCalculator.tsx
"use client";

interface RiskCalculatorProps {
  accountBalance: number;
  pair: string;
  entryPrice: number;
  onChange: (result: RiskCalculation) => void;
}

export function RiskCalculator({ accountBalance, pair, entryPrice, onChange }: RiskCalculatorProps) {
  const [riskPercent, setRiskPercent] = useState(2); // Default 2%
  const [stopLossPips, setStopLossPips] = useState<number>();
  
  const riskAmount = accountBalance * (riskPercent / 100);
  const pipValue = 10; // Simplified for majors
  const positionSize = stopLossPips 
    ? riskAmount / (stopLossPips * pipValue)
    : 0;

  const warnings = [];
  if (riskPercent > 2) {
    warnings.push({
      level: 'warning',
      message: `Risking ${riskPercent}% is aggressive. Professionals typically risk 1-2% per trade.`
    });
  }
  if (riskPercent > 5) {
    warnings.push({
      level: 'error',
      message: `⚠️ Risking ${riskPercent}% could wipe out your account in ${Math.floor(100/riskPercent)} losing trades.`
    });
  }

  useEffect(() => {
    onChange({
      riskAmount,
      riskPercent,
      positionSize,
      stopLossPips,
      warnings
    });
  }, [riskPercent, stopLossPips]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        Risk Management
        <Tooltip content="This determines how much you'll lose if stopped out">
          <InfoIcon className="w-4 h-4 text-gray-400" />
        </Tooltip>
      </h3>

      {/* Risk Percentage Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          How much are you willing to risk?
        </label>
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 5].map(pct => (
            <button
              key={pct}
              onClick={() => setRiskPercent(pct)}
              className={`px-4 py-2 rounded ${
                riskPercent === pct 
                  ? pct <= 2 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                  : 'bg-white border'
              }`}
            >
              {pct}%
              {pct === 2 && <span className="ml-1 text-xs">✓ Recommended</span>}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={riskPercent}
          onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Conservative (1%)</span>
          <span className="font-semibold">{riskPercent}% = ${riskAmount.toFixed(2)}</span>
          <span>Aggressive (10%)</span>
        </div>
      </div>

      {/* Stop Loss Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Stop Loss Distance (pips) *
          <span className="text-red-500 ml-1">Required</span>
        </label>
        <input
          type="number"
          value={stopLossPips || ''}
          onChange={(e) => setStopLossPips(parseFloat(e.target.value))}
          placeholder="e.g., 30 pips"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Place stop-loss below recent support (for longs) or above resistance (for shorts)
        </p>
      </div>

      {/* Calculated Position Size */}
      {positionSize > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-gray-600">Calculated Position Size:</div>
          <div className="text-2xl font-bold text-blue-600">
            {positionSize.toFixed(2)} lots
          </div>
          <div className="text-xs text-gray-600 mt-1">
            This ensures you only lose ${riskAmount.toFixed(2)} if stopped out
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.map((warning, idx) => (
        <div
          key={idx}
          className={`p-3 rounded ${
            warning.level === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}
        >
          {warning.message}
        </div>
      ))}
    </div>
  );
}
```

---

#### Component 2.2: Risk:Reward Analyzer

**Purpose:** Ensure traders set profitable risk:reward ratios (minimum 1:2 recommended).

**Calculation:**

```
Risk = Entry Price - Stop Loss (for longs)
Reward = Take Profit - Entry Price (for longs)
Risk:Reward Ratio = Reward ÷ Risk

Example:
Entry: 1.0850
Stop Loss: 1.0820 (30 pips risk)
Take Profit: 1.0910 (60 pips reward)
R:R = 60 ÷ 30 = 1:2 ✅ Good!
```

**Visual Indicator:**

```typescript
function RiskRewardIndicator({ ratio }: { ratio: number }) {
  const getColor = () => {
    if (ratio >= 2) return 'text-green-600 bg-green-50';
    if (ratio >= 1) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMessage = () => {
    if (ratio >= 2) return '✅ Excellent risk:reward';
    if (ratio >= 1) return '⚠️ Acceptable but aim for 1:2+';
    return '🚫 Poor risk:reward - not recommended';
  };

  return (
    <div className={`p-4 rounded-lg ${getColor()}`}>
      <div className="text-sm font-medium">Risk:Reward Ratio</div>
      <div className="text-3xl font-bold">1:{ratio.toFixed(1)}</div>
      <div className="text-sm mt-1">{getMessage()}</div>
      {ratio < 1.5 && (
        <div className="text-xs mt-2">
          💡 With this ratio, you need to win {Math.ceil(100/(1+ratio))}% of trades to break even
        </div>
      )}
    </div>
  );
}
```

---

#### Component 2.3: Pre-Trade Warning System

**Purpose:** Flag risky decisions before execution with color-coded severity.

**Warning Levels:**

**🚫 BLOCKING (Red) - Cannot Execute:**

- No stop-loss set
- Insufficient margin
- Monthly trade limit reached
- Position size &gt; 10% of account

**⚠️ STRONG WARNING (Yellow) - Can Proceed But Discouraged:**

- Risk &gt;2% of account
- Risk:Reward &lt;1:2
- Trading same pair 3+ times today (overtrading)
- Confidence score &lt;6/10 (from psychology check)
- Stop-loss &gt;100 pips away (too loose)
- Take profit &lt;10 pips (too tight, likely to get stopped by spread)

**ℹ️ GUIDANCE (Blue) - Educational:**

- First trade of the day
- Good risk:reward (&gt;1:2)
- Stop-loss aligns with technical level
- Position size appropriate for account

**Implementation:**

```typescript
// lib/trade-validation.ts
export function validateTrade(params: {
  accountBalance: number;
  riskPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  entryPrice: number;
  tradesThisMonth: number;
  tradesOnPairToday: number;
  confidenceScore?: number;
}): ValidationResult {
  const errors: Warning[] = [];
  const warnings: Warning[] = [];
  const info: Warning[] = [];

  // BLOCKING ERRORS
  if (!params.stopLoss) {
    errors.push({
      type: 'error',
      message: 'Stop-loss is required for all trades',
      recommendation: 'Set a stop-loss to protect your account from large losses'
    });
  }

  if (params.tradesThisMonth >= 25) {
    errors.push({
      type: 'error',
      message: 'Monthly trade limit reached (25/25)',
      recommendation: 'Wait until next month or upgrade to unlimited trades'
    });
  }

  const riskAmount = params.accountBalance * (params.riskPercent / 100);
  if (riskAmount > params.accountBalance * 0.1) {
    errors.push({
      type: 'error',
      message: `Risking ${riskAmount.toFixed(2)} (${params.riskPercent}%) is too high`,
      recommendation: 'Maximum risk per trade should be 10% of account'
    });
  }

  // WARNINGS
  if (params.riskPercent > 2) {
    warnings.push({
      type: 'warning',
      message: `Risking ${params.riskPercent}% per trade is aggressive`,
      recommendation: 'Professional traders typically risk 1-2% per trade. Consider reducing risk.'
    });
  }

  if (params.stopLoss && params.takeProfit) {
    const risk = Math.abs(params.entryPrice - params.stopLoss);
    const reward = Math.abs(params.takeProfit - params.entryPrice);
    const ratio = reward / risk;

    if (ratio < 1.5) {
      warnings.push({
        type: 'warning',
        message: `Risk:Reward ratio of 1:${ratio.toFixed(1)} is low`,
        recommendation: `Aim for minimum 1:2. With this ratio, you need ${Math.ceil(100/(1+ratio))}% win rate to break even.`
      });
    }
  }

  if (params.tradesOnPairToday >= 3) {
    warnings.push({
      type: 'warning',
      message: `You've already traded this pair ${params.tradesOnPairToday} times today`,
      recommendation: 'Overtrading reduces win rate. Consider waiting for clearer setups.'
    });
  }

  if (params.confidenceScore && params.confidenceScore < 6) {
    warnings.push({
      type: 'warning',
      message: 'Your confidence score is low for this trade',
      recommendation: 'Low confidence often leads to early exits. Wait for higher conviction setups.'
    });
  }

  // POSITIVE GUIDANCE
  if (params.stopLoss && params.takeProfit) {
    const risk = Math.abs(params.entryPrice - params.stopLoss);
    const reward = Math.abs(params.takeProfit - params.entryPrice);
    const ratio = reward / risk;

    if (ratio >= 2) {
      info.push({
        type: 'info',
        message: `Excellent risk:reward ratio of 1:${ratio.toFixed(1)}! 👍`,
        recommendation: ''
      });
    }
  }

  if (params.riskPercent <= 2) {
    info.push({
      type: 'info',
      message: 'Good risk management - staying within 2% risk',
      recommendation: ''
    });
  }

  return {
    canExecute: errors.length === 0,
    errors,
    warnings,
    info
  };
}
```

---

#### Component 2.4: Psychology Pre-Flight Check

**Purpose:** Detect emotional trading before it happens.

**Questions Asked Before Trade Execution:**

```typescript
const psychologyCheck = {
  questions: [
    {
      id: 'reason',
      question: 'Why are you taking this trade?',
      options: [
        { value: 'clear_setup', label: 'I see a clear technical setup', score: 10 },
        { value: 'following_signal', label: 'Following someone\'s signal', score: 6 },
        { value: 'experimenting', label: 'Just trying something', score: 4 },
        { value: 'feeling_lucky', label: 'Feeling lucky / FOMO', score: 2 },
      ]
    },
    {
      id: 'confidence',
      question: 'How confident are you in this trade? (1-10)',
      type: 'slider',
      min: 1,
      max: 10,
      interpretation: (score: number) => {
        if (score >= 8) return { level: 'good', message: 'High confidence - good!' };
        if (score >= 6) return { level: 'ok', message: 'Moderate confidence' };
        return { 
          level: 'warning', 
          message: 'Low confidence increases chance of emotional exit. Wait for better setup?' 
        };
      }
    },
    {
      id: 'recent_loss',
      question: 'Have you lost money in your last trade?',
      options: [
        { value: 'yes', label: 'Yes, lost on last trade', score: 0, warning: true },
        { value: 'no', label: 'No / First trade today', score: 10 },
      ]
    },
    {
      id: 'plan_adherence',
      question: 'Does this trade follow your trading plan?',
      options: [
        { value: 'yes', label: 'Yes, exactly', score: 10 },
        { value: 'mostly', label: 'Mostly, with small deviation', score: 7 },
        { value: 'no', label: 'No, this is impulsive', score: 3, warning: true },
      ]
    }
  ]
};
```

**Scoring System:**

- **8-10 points per question:** Green light
- **5-7 points:** Yellow flag (caution advised)
- **&lt;5 points:** Red flag (consider not trading)

**If "revenge trading" detected (lost on last trade + low confidence + impulsive):**

```
🚫 TRADING PAUSED

It looks like you might be revenge trading after a loss.
This is the #1 way traders blow up accounts.

Recommendation:
• Take a 30-minute break
• Review why the last trade lost
• Come back with a clear head

[Take Break] [Trade Anyway]
```

---

#### Component 2.5: Educational Tooltips

**Every field in the trade form has contextual help:**

```typescript
const tooltips = {
  pair: {
    title: "Currency Pair",
    content: "This shows which currencies you're trading. EUR/USD means you're buying Euros with US Dollars (or vice versa).",
    learnMore: "/learn/currency-pairs"
  },
  direction: {
    title: "Buy (Long) vs Sell (Short)",
    content: "BUY if you think the price will go UP. SELL if you think it will go DOWN. You make money from the price movement.",
    example: "If EUR/USD is 1.0850 and you BUY, you profit when it goes to 1.0900 (+50 pips = $25 for 0.5 lots)"
  },
  lotSize: {
    title: "Position Size (Lots)",
    content: "This is automatically calculated based on your risk percentage and stop-loss. 1 lot = $10/pip for majors.",
    warning: "Manually changing this can increase your risk beyond planned levels."
  },
  stopLoss: {
    title: "Stop-Loss",
    content: "The price where you'll automatically exit if the trade goes against you. This LIMITS YOUR LOSS.",
    critical: "NEVER trade without a stop-loss. It's the difference between a small loss and blowing up your account.",
    example: "If you buy EUR/USD at 1.0850 and set SL at 1.0820, you'll lose $150 (for 0.5 lots) if it drops 30 pips."
  },
  takeProfit: {
    title: "Take-Profit",
    content: "The price where you'll automatically exit with profit. Aim for 2x your risk (1:2 R:R ratio).",
    tip: "If risking 30 pips, target at least 60 pips profit."
  },
  riskReward: {
    title: "Risk:Reward Ratio",
    content: "This compares potential profit to potential loss. Minimum 1:2 recommended.",
    math: "If you risk $100 to make $200, that's 1:2. You only need to win 35% of trades to profit!",
    example: "With 1:2 R:R and 50% win rate: 5 wins ($1000) - 5 losses ($500) = $500 profit"
  }
};
```

---

#### UI Mockup: Complete Trade Entry Form

```
┌─────────────────────────────────────────────────────────┐
│ New Trade                                           [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Step 1: What are you trading?                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Currency Pair: [EUR/USD ▼] [?]                      ││
│ │ Current Price: 1.0850 | Spread: 0.2 pips            ││
│ │                                                      ││
│ │ Direction:                                           ││
│ │ [🟢 BUY / LONG]  [🔴 SELL / SHORT]                   ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Step 2: Risk Management [?]                            │
│ ┌─────────────────────────────────────────────────────┐│
│ │ How much will you risk?                             ││
│ │ [1%] [2% ✓] [3%] [5%] Custom: [___]%               ││
│ │                                                      ││
│ │ Risk Amount: $200 (2% of $10,000)                   ││
│ │ ╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍               ││
│ │ Conservative ←──────────────────→ Aggressive        ││
│ │                                                      ││
│ │ 💡 Professionals typically risk 1-2% per trade      ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Step 3: Stop-Loss (Required) [?]                       │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Where will you exit if wrong?                       ││
│ │                                                      ││
│ │ Price: [1.0820] OR Pips: [30] below entry           ││
│ │                                                      ││
│ │ 🤖 AI Suggestion: Based on 15m chart, support is at ││
│ │    1.0815 (35 pips). Consider SL at 1.0810.         ││
│ │                                                      ││
│ │ Max Loss if stopped out: $200                       ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Step 4: Take-Profit (Recommended) [?]                  │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Where will you take profit?                         ││
│ │                                                      ││
│ │ Price: [1.0910] OR Pips: [60] above entry           ││
│ │                                                      ││
│ │ Potential Profit: $400                              ││
│ │                                                      ││
│ │ Risk:Reward Ratio:  1:2.0 ✅                        ││
│ │ [────────────────────●────] Good!                   ││
│ │ Poor         Acceptable         Excellent           ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📊 TRADE SUMMARY                                    ││
│ │─────────────────────────────────────────────────────││
│ │ Position Size: 0.67 lots (Auto-calculated)          ││
│ │ Required Margin: $725                               ││
│ │ Available Margin: $9,275 ✅                         ││
│ │                                                      ││
│ │ If Stopped Out: -$200 (2.0%)                        ││
│ │ If Take Profit: +$400 (4.0%)                        ││
│ │ Risk:Reward: 1:2 ✅                                 ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ⚠️ WARNINGS                                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ ℹ️ First trade of the day - good luck!              ││
│ │ ✅ Excellent risk management (2% risk)              ││
│ │ ✅ Good risk:reward ratio (1:2)                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ 🧠 Quick Psychology Check                              │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Why are you taking this trade?                      ││
│ │ ○ I see a clear technical setup                     ││
│ │ ○ Following someone's signal                        ││
│ │ ○ Just trying something                             ││
│ │ ○ Feeling lucky / FOMO                              ││
│ │                                                      ││
│ │ Confidence (1-10): [────●─────] 7/10                ││
│ │                                                      ││
│ │ Have you lost money today?                          ││
│ │ ○ Yes  ● No                                         ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│               [← Go Back]  [Execute Trade →]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Feature 3: AI-Powered Trade Analysis

**Description:**\
After each trade is closed, an AI agent analyzes the trade quality and provides specific, actionable feedback to help the user improve.

**Analysis Components:**

1. **Overall Score (1-5 stars)**

   - Weighted average of all components
   - Visual: Star rating with color (red &lt; 3, yellow 3-4, green 4+)

2. **Risk Management Analysis**

   - Score: 1-5
   - Evaluates:
     - Position sizing (was it 1-2% of account risk?)
     - Stop-loss placement (technical level or arbitrary?)
     - Risk:Reward ratio (min 1:2 recommended)
   - Feedback: 2-3 sentences explaining score

3. **Entry Timing Analysis**

   - Score: 1-5
   - Evaluates:
     - Trend direction (with or against trend?)
     - Support/resistance proximity
     - Technical indicator confluence (RSI, MACD)
     - News events (if major news at time)
   - Feedback: 2-3 sentences

4. **Exit Decision Analysis**

   - Score: 1-5
   - Evaluates:
     - Hit TP/SL vs manual close
     - If manual: Was it early exit (fear) or late (greed)?
     - Did price action justify exit?
   - Feedback: 2-3 sentences

5. **Improvement Tips**

   - 3 specific, actionable recommendations
   - Example: "Move your stop-loss to breakeven after 50% to target"
   - Example: "Wait for RSI confirmation before entering counter-trend"

**AI Prompt Structure:**

```typescript
// lib/ai/prompts.ts
export function buildTradeAnalysisPrompt(context: {
  trade: {
    pair: string;
    direction: "long" | "short";
    entryPrice: number;
    exitPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    lotSize: number;
    profitLoss: number;
    duration: number; // milliseconds
  };
  priceData: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  indicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    ema20: number;
    ema50: number;
    support: number;
    resistance: number;
    trend: "uptrend" | "downtrend" | "sideways";
  };
  accountSize: number;
}) {
  return `You are an expert Forex trading analyst helping a beginner trader improve. Analyze this trade and provide constructive, specific feedback.

TRADE DETAILS:
- Pair: ${context.trade.pair}
- Direction: ${context.trade.direction}
- Entry Price: ${context.trade.entryPrice}
- Exit Price: ${context.trade.exitPrice}
- Stop Loss: ${context.trade.stopLoss || "None set"}
- Take Profit: ${context.trade.takeProfit || "None set"}
- Position Size: ${context.trade.lotSize} lots
- Result: ${context.trade.profitLoss > 0 ? "Profit" : "Loss"} of $${Math.abs(context.trade.profitLoss).toFixed(2)}
- Duration: ${Math.round(context.trade.duration / 1000 / 60)} minutes
- Account Size: $${context.accountSize}

MARKET CONTEXT AT ENTRY:
- RSI (14): ${context.indicators.rsi.toFixed(1)}
- MACD: ${context.indicators.macd.value.toFixed(4)} (Signal: ${context.indicators.macd.signal.toFixed(4)})
- EMA 20: ${context.indicators.ema20.toFixed(4)}
- EMA 50: ${context.indicators.ema50.toFixed(4)}
- Trend: ${context.indicators.trend}
- Nearest Support: ${context.indicators.support.toFixed(4)}
- Nearest Resistance: ${context.indicators.resistance.toFixed(4)}

PRICE ACTION:
Entry was ${context.trade.direction === "long" ? "above" : "below"} EMA 20.
Entry was ${getProximity(context.trade.entryPrice, context.indicators.support, context.indicators.resistance)}.

Analyze this trade across 3 dimensions and provide a JSON response with this exact structure:
{
  "overallScore": <number 1-5>,
  "riskManagement": {
    "score": <number 1-5>,
    "feedback": "<2-3 sentences about position sizing, stop-loss, and risk:reward>"
  },
  "entryTiming": {
    "score": <number 1-5>,
    "feedback": "<2-3 sentences about whether entry aligned with trend, indicators, and support/resistance>"
  },
  "exitDecision": {
    "score": <number 1-5>,
    "feedback": "<2-3 sentences about whether exit was optimal or emotional>"
  },
  "improvementTips": [
    "<specific tip 1>",
    "<specific tip 2>",
    "<specific tip 3>"
  ]
}

ANALYSIS GUIDELINES:
- Be constructive and encouraging, especially if the trade lost money
- Focus on process over outcome (good process, bad outcome is still good trading)
- Highlight what they did RIGHT first, then areas to improve
- Make tips actionable (not "be patient" but "wait for RSI to cross above 50 before entering longs")
- Consider the beginner's account size when evaluating position size
- Recommended risk: 1-2% of account per trade

Provide ONLY the JSON response, no additional text.`;
}

function getProximity(entry: number, support: number, resistance: number) {
  const supportDist = Math.abs(entry - support);
  const resistanceDist = Math.abs(entry - resistance);
  if (supportDist < resistanceDist) {
    return `near support level (${(supportDist * 10000).toFixed(0)} pips away)`;
  } else {
    return `near resistance level (${(resistanceDist * 10000).toFixed(0)} pips away)`;
  }
}
```

**Technical Indicators Calculation:**

```typescript
// lib/indicators.ts
import { RSI, MACD, EMA } from 'technicalindicators';

export function calculateIndicators(priceData: Array<{
  close: number;
  high: number;
  low: number;
}>) {
  const closes = priceData.map(c => c.close);
  const highs = priceData.map(c => c.high);
  const lows = priceData.map(c => c.low);

  // RSI (14 period)
  const rsi = RSI.calculate({
    values: closes,
    period: 14
  });

  // MACD (12, 26, 9)
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  // EMAs
  const ema20 = EMA.calculate({ values: closes, period: 20 });
  const ema50 = EMA.calculate({ values: closes, period: 50 });

  // Support/Resistance (simple: recent lows/highs)
  const recentLows = lows.slice(-20);
  const recentHighs = highs.slice(-20);
  const support = Math.min(...recentLows);
  const resistance = Math.max(...recentHighs);

  // Trend determination (simple: EMA crossover)
  const currentEma20 = ema20[ema20.length - 1];
  const currentEma50 = ema50[ema50.length - 1];
  let trend: "uptrend" | "downtrend" | "sideways";
  if (currentEma20 > currentEma50 * 1.001) {
    trend = "uptrend";
  } else if (currentEma20 < currentEma50 * 0.999) {
    trend = "downtrend";
  } else {
    trend = "sideways";
  }

  return {
    rsi: rsi[rsi.length - 1],
    macd: macd[macd.length - 1],
    ema20: currentEma20,
    ema50: currentEma50,
    support,
    resistance,
    trend
  };
}
```

**Inngest Workflow:**

```typescript
// inngest/functions.ts
import { inngest } from "./client";
import { api } from "../convex/_generated/api";
import { getCurrentPrice, getHistoricalCandles } from "../lib/polygon";
import { calculateIndicators } from "../lib/indicators";
import { buildTradeAnalysisPrompt } from "../lib/ai/prompts";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const analyzeTradeFunction = inngest.createFunction(
  { id: "analyze-trade", name: "Analyze Trade with AI" },
  { event: "trade/closed" },
  async ({ event, step }) => {
    const { tradeId, userId } = event.data;

    // Step 1: Fetch trade data from Convex
    const trade = await step.run("fetch-trade", async () => {
      // Note: You'll need to create a Convex HTTP action to fetch this
      // or use Convex client from backend
      return await convex.query(api.trades.getTrade, { tradeId });
    });

    // Step 2: Fetch user data
    const user = await step.run("fetch-user", async () => {
      return await convex.query(api.users.getUser, { userId });
    });

    // Step 3: Fetch price data
    const priceData = await step.run("fetch-price-data", async () => {
      return await getHistoricalCandles(trade.pair, "15", 100);
    });

    // Step 4: Calculate indicators
    const indicators = await step.run("calculate-indicators", async () => {
      return calculateIndicators(priceData);
    });

    // Step 5: Build prompt and call Claude
    const analysis = await step.run("ai-analysis", async () => {
      const prompt = buildTradeAnalysisPrompt({
        trade: {
          pair: trade.pair,
          direction: trade.direction,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice!,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          lotSize: trade.lotSize,
          profitLoss: trade.profitLoss!,
          duration: trade.closedAt! - trade.openedAt,
        },
        priceData,
        indicators,
        accountSize: user.virtualBalance,
      });

      try {
        const result = await generateObject({
          model: anthropic("claude-3-5-sonnet-20241022"),
          schema: z.object({
            overallScore: z.number().min(1).max(5),
            riskManagement: z.object({
              score: z.number().min(1).max(5),
              feedback: z.string(),
            }),
            entryTiming: z.object({
              score: z.number().min(1).max(5),
              feedback: z.string(),
            }),
            exitDecision: z.object({
              score: z.number().min(1).max(5),
              feedback: z.string(),
            }),
            improvementTips: z.array(z.string()).length(3),
          }),
          prompt,
        });

        return result.object;
      } catch (error) {
        console.error("AI analysis failed:", error);
        throw new Error("Failed to generate AI analysis");
      }
    });

    // Step 6: Save analysis to Convex
    const analysisId = await step.run("save-analysis", async () => {
      return await convex.mutation(api.analyses.create, {
        tradeId,
        userId,
        overallScore: analysis.overallScore,
        riskManagementScore: analysis.riskManagement.score,
        riskManagementFeedback: analysis.riskManagement.feedback,
        entryTimingScore: analysis.entryTiming.score,
        entryTimingFeedback: analysis.entryTiming.feedback,
        exitDecisionScore: analysis.exitDecision.score,
        exitDecisionFeedback: analysis.exitDecision.feedback,
        improvementTips: analysis.improvementTips,
        rawAiResponse: JSON.stringify(analysis),
      });
    });

    // Step 7: Update trade with analysis ID
    await step.run("link-analysis", async () => {
      await convex.mutation(api.trades.linkAnalysis, {
        tradeId,
        analysisId,
      });
    });

    return { success: true, analysisId };
  }
);
```

**AI Cost Estimation:**

With Claude 3.5 Sonnet:

- Input: \~1,500 tokens (prompt + context)
- Output: \~500 tokens (JSON response)
- Cost per analysis: \~$0.005 (half a cent)

At 25 trades/user/month × 100 users = 2,500 analyses/month Monthly AI cost: 2,500 × $0.005 = **$12.50/month**

Well within your $100/month budget!

---

### Feature 3: Trading Dashboard

**Description:**\
Central hub displaying account summary, open positions, trade history, and performance metrics.

**Dashboard Sections:**

**1. Account Summary Card**

```
┌─────────────────────────────────────┐
│ Account Balance                     │
│ $10,247.00                          │
│ ↑ +$247.00 (+2.47%)                │
│                                     │
│ Trades This Month: 12 / 25         │
│ [Progress bar: 48% filled]          │
└─────────────────────────────────────┘
```

**2. Open Positions Panel** (Real-time)

- Table showing all open trades
- Live P&L updates every 5 seconds
- Quick "Close" button per position
- Total open P&L displayed at bottom

**3. Recent Trades List**

- Last 10 closed trades
- Shows: Pair, Direction, P&L, AI Score
- Click to view full AI analysis
- Filter by: All / Profitable / Loss-making

**4. Performance Chart**

- Line chart: Account balance over time (last 30 days)
- X-axis: Date
- Y-axis: Balance ($)
- Tooltip on hover: Date + Balance

**5. Quick Stats**

```
Win Rate: 62% (8 wins / 5 losses)
Avg Win: $45.20
Avg Loss: -$28.50
Best Trade: +$120 (EUR/USD)
Worst Trade: -$65 (GBP/USD)
```

**Technical Implementation:**

**Dashboard Component (Next.js):**

```typescript
// app/dashboard/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AccountSummary } from "@/components/dashboard/AccountSummary";
import { OpenPositions } from "@/components/dashboard/OpenPositions";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { QuickStats } from "@/components/dashboard/QuickStats";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const openTrades = useQuery(api.trades.getOpenTrades);
  const recentTrades = useQuery(api.trades.getRecentTrades, { limit: 10 });
  const stats = useQuery(api.users.getStats);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountSummary 
          balance={user.virtualBalance}
          tradesThisMonth={user.tradesThisMonth}
          monthlyLimit={user.monthlyTradeLimit}
        />
        <QuickStats stats={stats} />
      </div>

      <OpenPositions trades={openTrades} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTrades trades={recentTrades} />
        <PerformanceChart userId={user._id} />
      </div>
    </div>
  );
}
```

**Real-Time Price Updates:**

```typescript
// components/dashboard/OpenPositions.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getCurrentPrice } from "@/lib/polygon";

export function OpenPositions({ trades }) {
  const [prices, setPrices] = useState<Record<string, { bid: number; ask: number }>>({});
  const closeTrade = useMutation(api.trades.closeTrade);

  // Poll prices every 5 seconds
  useEffect(() => {
    const updatePrices = async () => {
      const uniquePairs = [...new Set(trades.map(t => t.pair))];
      const pricePromises = uniquePairs.map(pair => getCurrentPrice(pair));
      const priceResults = await Promise.all(pricePromises);
      
      const priceMap = {};
      uniquePairs.forEach((pair, idx) => {
        priceMap[pair] = priceResults[idx];
      });
      
      setPrices(priceMap);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [trades]);

  // Calculate live P&L
  const calculatePnL = (trade) => {
    const currentPrice = prices[trade.pair];
    if (!currentPrice) return 0;

    const exitPrice = trade.direction === "long" ? currentPrice.bid : currentPrice.ask;
    const contractSize = 100000;
    
    if (trade.direction === "long") {
      return (exitPrice - trade.entryPrice) * trade.lotSize * contractSize;
    } else {
      return (trade.entryPrice - exitPrice) * trade.lotSize * contractSize;
    }
  };

  const handleClose = async (trade) => {
    const currentPrice = prices[trade.pair];
    const exitPrice = trade.direction === "long" ? currentPrice.bid : currentPrice.ask;
    await closeTrade({ tradeId: trade._id, exitPrice });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Open Positions ({trades?.length || 0})</h2>
      {trades?.length === 0 ? (
        <p className="text-gray-500">No open positions</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Pair</th>
              <th className="text-left py-2">Direction</th>
              <th className="text-right py-2">Size</th>
              <th className="text-right py-2">Entry</th>
              <th className="text-right py-2">Current</th>
              <th className="text-right py-2">P&L</th>
              <th className="text-right py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => {
              const pnl = calculatePnL(trade);
              const currentPrice = prices[trade.pair];
              const displayPrice = trade.direction === "long" 
                ? currentPrice?.bid 
                : currentPrice?.ask;

              return (
                <tr key={trade._id} className="border-b">
                  <td className="py-3">{trade.pair}</td>
                  <td className={trade.direction === "long" ? "text-green-600" : "text-red-600"}>
                    {trade.direction.toUpperCase()}
                  </td>
                  <td className="text-right">{trade.lotSize}</td>
                  <td className="text-right">{trade.entryPrice.toFixed(4)}</td>
                  <td className="text-right">{displayPrice?.toFixed(4) || "..."}</td>
                  <td className={`text-right font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleClose(trade)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

### Feature 4: User Authentication & Account Management

**Description:**\
Secure user authentication using BetterAuth with email/password and Google OAuth.

**Auth Flows:**

**1. Sign Up**

```
User enters email + password
    ↓
BetterAuth creates account
    ↓
Sends verification email
    ↓
User clicks link in email
    ↓
Email verified
    ↓
Create user record in Convex
    ↓
Initialize:
    - Virtual balance: $10,000
    - Trades this month: 0
    - Monthly limit: 25
    ↓
Redirect to dashboard
```

**2. Sign In**

```
User enters credentials OR clicks "Sign in with Google"
    ↓
BetterAuth validates
    ↓
JWT token issued
    ↓
Redirect to dashboard
```

**3. Password Reset**

```
User clicks "Forgot password"
    ↓
Enters email
    ↓
Receives reset link via email
    ↓
Clicks link
    ↓
Enters new password
    ↓
Password updated
```

**BetterAuth Configuration:**

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
});
```

**Convex Integration:**

```typescript
// convex/users.ts
export const createUser = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .unique();

    if (existing) return existing._id;

    // Create new user with starting balance
    return await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      name: args.name,
      virtualBalance: 10000,
      tradesThisMonth: 0,
      monthlyTradeLimit: 25,
      lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM
      createdAt: Date.now(),
    });
  },
});
```

**Middleware (Protect Routes):**

```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPublic = request.nextUrl.pathname === "/";

  if (!session && !isAuthPage && !isPublic) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## UI/UX Specifications

### Design System

**Colors:**

```css
/* Primary */
--primary-blue: #3B82F6;
--primary-blue-hover: #2563EB;

/* Success/Long */
--success-green: #10B981;
--success-green-light: #D1FAE5;

/* Danger/Short */
--danger-red: #EF4444;
--danger-red-light: #FEE2E2;

/* Neutral */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-900: #111827;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
```

**Typography:**

- Font: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400 weight
- Code/Numbers: 500 weight (tabular-nums)

**Components (shadcn/ui):**

- Button
- Card
- Table
- Modal/Dialog
- Input
- Select
- Toast
- Badge

### Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

**Mobile Optimizations:**

- Stack dashboard cards vertically
- Simplify trade entry form (one field per line)
- Bottom sheet for AI analysis modal
- Sticky "New Trade" button

### Loading States

**Skeleton Loaders:**

- Dashboard: Shimmer cards while data loads
- Trade table: Skeleton rows
- AI analysis: Animated spinner + "Analyzing trade..."

**Empty States:**

- No open positions: "No trades yet. Click 'New Trade' to start!"
- No history: "Your trade history will appear here."

### Error States

**User-Friendly Messages:**

- API failure: "Unable to fetch prices. Please try again."
- Trade limit: "You've reached your 25 trades for this month. Upgrade for unlimited!"
- Insufficient margin: "Not enough margin. Try a smaller position size."

---

## Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Next.js 14 (App Router)                    │   │
│  │  - Server Components (for initial render)            │   │
│  │  - Client Components (for interactivity)             │   │
│  │  - TradingView Lightweight Charts                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  - Next.js API Routes                                        │
│  - Static asset CDN                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓ ↑
        ┌─────────────────┴──────────────────┐
        ↓                                     ↓
┌──────────────────┐              ┌──────────────────────┐
│  Convex Database │              │   Inngest (Jobs)     │
│  - Users         │              │   - Trade Analysis   │
│  - Trades        │              │   - Price Updates    │
│  - Analyses      │              │   - Notifications    │
│  - Real-time     │              └──────────────────────┘
└──────────────────┘                          ↓
        ↓                          ┌──────────────────────┐
┌──────────────────┐               │  Vercel AI SDK       │
│  BetterAuth      │               │  - Anthropic Claude  │
│  - PostgreSQL    │               │  - Streaming         │
│  - JWT Sessions  │               │  - Structured Output │
└──────────────────┘               └──────────────────────┘
                                              ↓
                                   ┌──────────────────────┐
                                   │  External APIs       │
                                   │  - Polygon.io (FX)   │
                                   │  - Resend (Email)    │
                                   └──────────────────────┘
```

### Data Flow: Trade Execution

```
1. User clicks "Execute Trade" in browser
   ↓
2. Next.js API route validates request
   ↓
3. Convex mutation:
   - Check trade limit
   - Check margin
   - Insert trade record
   - Update user trade count
   ↓
4. Return trade ID to client
   ↓
5. Client updates UI (trade appears in "Open Positions")
   ↓
6. Price polling begins (every 5s):
   - Fetch current price from Polygon.io
   - Calculate live P&L
   - Update UI
```

### Data Flow: AI Analysis

```
1. User clicks "Close" on open position
   ↓
2. Convex mutation:
   - Update trade status to "closed"
   - Calculate final P&L
   - Update user balance
   - Trigger Inngest event "trade/closed"
   ↓
3. Inngest function starts (background job):
   Step 1: Fetch trade data from Convex
   Step 2: Fetch historical price data (Polygon.io)
   Step 3: Calculate technical indicators
   Step 4: Build AI prompt with all context
   Step 5: Call Claude API (Vercel AI SDK)
   Step 6: Parse structured JSON response
   Step 7: Save analysis to Convex
   ↓
4. Client receives real-time update (Convex subscription)
   ↓
5. AI Analysis modal auto-opens with results
```

---

## API Specifications

### Convex Queries

`api.users.getCurrentUser`

```typescript
// Returns current authenticated user
{
  _id: Id<"users">,
  email: string,
  virtualBalance: number,
  tradesThisMonth: number,
  monthlyTradeLimit: number,
  createdAt: number
}
```

`api.trades.getOpenTrades`

```typescript
// Returns all open trades for current user
[
  {
    _id: Id<"trades">,
    pair: string,
    direction: "long" | "short",
    lotSize: number,
    entryPrice: number,
    stopLoss?: number,
    takeProfit?: number,
    openedAt: number
  }
]
```

`api.trades.getRecentTrades`

```typescript
// Args: { limit?: number }
// Returns recent closed trades
[
  {
    _id: Id<"trades">,
    pair: string,
    direction: "long" | "short",
    profitLoss: number,
    closedAt: number,
    aiAnalysisId?: Id<"analyses">
  }
]
```

### Convex Mutations

`api.trades.openTrade`

```typescript
// Args:
{
  pair: string,
  direction: "long" | "short",
  lotSize: number,
  entryPrice: number,
  stopLoss?: number,
  takeProfit?: number
}

// Returns: Id<"trades">
// Throws: "Monthly trade limit reached" | "Insufficient margin"
```

`api.trades.closeTrade`

```typescript
// Args:
{
  tradeId: Id<"trades">,
  exitPrice: number
}

// Returns:
{
  profitLoss: number,
  newBalance: number
}
```

### External API: Polygon.io

**Get Current Price**

```
GET https://api.polygon.io/v2/last/nbbo/C:EURUSD
Headers: Authorization: Bearer {API_KEY}

Response:
{
  "results": {
    "p": 1.0850,  // Bid
    "P": 1.0852,  // Ask
    "t": 1704067200000  // Timestamp
  }
}
```

**Get Historical Candles**

```
GET https://api.polygon.io/v2/aggs/ticker/C:EURUSD/range/15/minute/{from}/{to}
Headers: Authorization: Bearer {API_KEY}

Response:
{
  "results": [
    {
      "t": 1704067200000,
      "o": 1.0850,
      "h": 1.0865,
      "l": 1.0845,
      "c": 1.0860,
      "v": 12500
    }
  ]
}
```

---

## Testing Requirements

### Unit Tests

**Priority Functions to Test:**

```typescript
// lib/calculations.test.ts
- calculatePnL(trade, currentPrice)
- calculateRequiredMargin(lotSize, price, leverage)
- calculateRiskReward(entry, stopLoss, takeProfit)

// lib/indicators.test.ts
- calculateIndicators(priceData)
- findSupport(priceData)
- findResistance(priceData)
```

**Test Framework:** Vitest

### Integration Tests

**Critical Flows:**

1. Sign up → Create user in Convex → Initialize balance
2. Open trade → Check limits → Execute → Appear in dashboard
3. Close trade → Trigger Inngest → AI analysis → Save to DB
4. Monthly reset → Reset trade counter

**Test Framework:** Playwright

### Manual QA Checklist

**Pre-Launch:**

**Authentication & Account:**

- [ ] Can sign up with email + password

- [ ] Can sign in with Google OAuth

- [ ] Email verification works

- [ ] Password reset flow works

- [ ] Logout works

**Trading Simulator:**

- [ ] Can open trade on all 5 pairs

- [ ] Live P&L updates correctly

- [ ] Can close trade

- [ ] Cannot exceed 25 trades/month

- [ ] Cannot trade with insufficient margin

**Intelligent Guidance System (NEW - CRITICAL):**

- [ ] Risk calculator auto-updates as user changes inputs

- [ ] Position size auto-calculates correctly

- [ ] Cannot place trade without stop-loss (hard block)

- [ ] Warning shows when risk &gt;2%

- [ ] Warning shows when R:R &lt;1:2

- [ ] Psychology check appears before trade execution

- [ ] Low confidence score triggers warning

- [ ] Revenge trading detection works (after loss + low confidence)

- [ ] All tooltips display correctly

- [ ] Trade summary updates in real-time

- [ ] Color coding (red/yellow/green) correct for warnings

- [ ] Can override warnings but must acknowledge

- [ ] Educational tips appear after trade execution

**AI Analysis:**

- [ ] AI analysis appears within 15 seconds

- [ ] Analysis is relevant and helpful

- [ ] Analysis saved to trade history

**Dashboard & UI:**

- [ ] Dashboard metrics calculate correctly

- [ ] Mobile responsive (iPhone, Android)

- [ ] Works in Chrome, Safari, Firefox

**Guidance System Edge Cases:**

- [ ] Test with 0.01% risk (should allow)

- [ ] Test with 15% risk (should block)

- [ ] Test with no stop-loss (should block)

- [ ] Test with SL = entry price (should warn)

- [ ] Test with 0.01:1 R:R (should strongly warn)

- [ ] Test trading same pair 5x in a row (should warn about overtrading)

- [ ] Test psychology check with all "bad" answers (should recommend break)

- [ ] Test after losing trade immediately opening another (revenge trading warning)

---

## 30-Day Implementation Plan

### Week 1: Foundation & Authentication

**Days 1-2: Setup**

- [ ] Initialize Next.js project with TypeScript

- [ ] Install dependencies: Convex, BetterAuth, Inngest, shadcn/ui

- [ ] Set up Vercel project

- [ ] Configure environment variables

- [ ] Initialize Convex schema

- [ ] Set up BetterAuth with PostgreSQL

**Days 3-4: Authentication**

- [ ] Build sign up page

- [ ] Build sign in page

- [ ] Implement email/password auth

- [ ] Implement Google OAuth

- [ ] Email verification flow

- [ ] Password reset flow

- [ ] Protected route middleware

**Days 5-7: Database & User System**

- [ ] Finalize Convex schema

- [ ] Create user mutations (create, update)

- [ ] Create user queries (getCurrentUser, getStats)

- [ ] Build basic dashboard layout

- [ ] Account summary component

---

### Week 2: Trading Simulator + Intelligent Guidance

**Days 8-9: Price Data Integration**

- [ ] Set up Polygon.io API client

- [ ] Test fetching current prices (all 5 pairs)

- [ ] Test fetching historical candles

- [ ] Implement price caching strategy

- [ ] Error handling for API failures

**Days 10-11: Smart Risk Calculator (NEW)**

- [ ] Build risk percentage selector (1-10%)

- [ ] Implement position size auto-calculation

- [ ] Create risk:reward ratio analyzer

- [ ] Build visual indicators (color-coded warnings)

- [ ] Add educational tooltips to all fields

**Days 12-14: Trade Entry Form with Guidance**

- [ ] Build multi-step trade entry form UI

- [ ] Implement real-time validation (warnings/errors)

- [ ] Add psychology pre-flight check

- [ ] Create trade summary panel

- [ ] Make stop-loss mandatory for beginners

- [ ] Wire up to Convex mutations

**Days 15-16: Trade Execution & Management**

- [ ] Create `openTrade` mutation with validation

- [ ] Create `closeTrade` mutation

- [ ] Real-time P&L calculation

- [ ] Open positions table component

- [ ] Handle edge cases (insufficient margin, trade limits)

---

### Week 3: AI Analysis System + Dashboard Polish

**Days 17-18: Dashboard Components**

- [ ] Recent trades list component

- [ ] Performance chart (balance over time)

- [ ] Quick stats component

- [ ] Responsive design tweaks

- [ ] Loading states & skeletons

**Days 19-20: Technical Indicators**

- [ ] Install `technicalindicators` library

- [ ] Implement RSI calculation

- [ ] Implement MACD calculation

- [ ] Implement EMA calculation

- [ ] Implement support/resistance detection

- [ ] Unit tests for indicators

**Days 21-23: AI Integration**

- [ ] Set up Vercel AI SDK with Claude

- [ ] Write trade analysis prompt template

- [ ] Test prompt with sample trades

- [ ] Refine prompt based on output quality

- [ ] Create analysis Convex schema

- [ ] Implement `createAnalysis` mutation

**Days 24-25: Inngest Workflow**

- [ ] Set up Inngest client

- [ ] Create `analyzeTradeFunction`

- [ ] Test end-to-end workflow

- [ ] Error handling & retries

- [ ] Link analysis to trade record

- [ ] Real-time updates via Convex subscriptions

---

### Week 4: Polish & Launch

**Days 22-23: UI for AI Analysis**

- [ ] AI analysis modal component

- [ ] Star rating visualization

- [ ] Feedback sections layout

- [ ] Improvement tips display

- [ ] "Rate this analysis" feature

- [ ] View analysis from trade history

**Days 24-25: Edge Cases & Limits**

- [ ] Monthly trade limit enforcement

- [ ] Upgrade prompt when limit hit

- [ ] Insufficient margin error handling

- [ ] API rate limiting (Polygon.io)

- [ ] Graceful AI failure handling

- [ ] Account balance reset feature

**Days 26-27: Testing**

- [ ] Write unit tests (calculations, indicators)

- [ ] Manual QA on all flows

- [ ] Test on mobile devices

- [ ] Test on different browsers

- [ ] Performance testing (load times)

- [ ] Fix critical bugs

**Days 28-29: Launch Prep**

- [ ] Write landing page copy

- [ ] Create demo video (2 min)

- [ ] Set up email service (Resend)

- [ ] Configure analytics (PostHog)

- [ ] Set up error tracking (Sentry)

- [ ] Prepare Product Hunt launch

**Day 30: LAUNCH! 🚀**

- [ ] Deploy to Vercel production

- [ ] Post on Product Hunt

- [ ] Share on Reddit (r/Forex, r/SideProject)

- [ ] Email beta testers

- [ ] Monitor errors & user feedback

- [ ] Celebrate! 🎉

---

## Post-MVP Roadmap (After Launch)

### Month 2: Iterate & Improve

- Fix bugs based on user feedback
- Improve AI prompt quality
- Add more educational tooltips
- Implement user onboarding tutorial
- Add trade notes feature (simple text field)

### Month 3: Social Features

- Accountability partner matching
- Weekly trading challenges
- Simple in-app messaging
- Public trade feed (opt-in)

### Month 4: Journal & Education

- Full trading journal with tags
- Psychology training modules
- Pre-trade psychology checks
- 10-15 educational lessons

### Month 5: Monetization

- Launch paid tiers ($29, $49, $99)
- Implement Stripe subscriptions
- Add premium features:
  - Unlimited trades
  - Advanced AI coach chat
  - Study groups
  - 1-on-1 coaching

---

## Risk Management & Mitigation

### Technical Risks

**Risk: Polygon.io API downtime**

- Mitigation: Implement fallback to Alpha Vantage
- Cache recent prices in Convex
- Display "Delayed prices" warning

**Risk: Claude API quota exceeded**

- Mitigation: Queue analyses during high traffic
- Implement exponential backoff
- Display "Analysis pending" state
- Set monthly budget alerts

**Risk: Convex database limits**

- Mitigation: Archive old price data (&gt; 90 days)
- Optimize queries with proper indexes
- Monitor storage usage weekly

### Business Risks

**Risk: Users don't value AI feedback**

- Mitigation: A/B test different prompt styles
- Collect feedback ratings on analyses
- Iterate based on user comments
- Add "Was this helpful?" after each analysis

**Risk: Low user retention**

- Mitigation: Email re-engagement campaigns
- Weekly performance summary emails
- Push notifications for milestones
- Gamification elements (badges, streaks)

**Risk: AI costs spiral**

- Mitigation: Set hard monthly budget cap ($100)
- Rate limit: Max 3 analyses per user per day
- Cache similar trade patterns
- Consider switching to cheaper model if needed

---

## Analytics & Tracking

### Critical Events to Track (PostHog)

**User Acquisition:**

- `user_signed_up` - { method: 'email' | 'google' }
- `user_verified_email`
- `user_completed_onboarding`

**Trading Behavior:**

- `trade_form_opened` - { pair: string }
- `trade_executed` - { pair, direction, lotSize, riskPercent, hasStopLoss, hasTakeProfit, riskRewardRatio }
- `trade_closed` - { pair, profitLoss, duration, closedManually: boolean }
- `monthly_limit_reached`

**Guidance System Engagement (NEW - CRITICAL):**

- `risk_calculator_used` - { riskPercent, changedFromDefault: boolean }
- `warning_shown` - { warningType: 'no_stop_loss' | 'high_risk' | 'poor_rr' | 'overtrading' | 'revenge_trading', severity: 'error' | 'warning' | 'info' }
- `warning_dismissed` - { warningType, userProceeded: boolean }
- `psychology_check_completed` - { reason, confidenceScore, recentLoss, planAdherence }
- `psychology_check_skipped`
- `trading_paused_by_system` - { reason: 'revenge_trading' | 'too_many_warnings' }
- `tooltip_clicked` - { field: string }
- `ai_suggestion_accepted` - { suggestionType: 'stop_loss' | 'take_profit' }

**AI Analysis:**

- `ai_analysis_started` - { tradeId }
- `ai_analysis_completed` - { tradeId, overallScore, duration }
- `ai_analysis_failed` - { tradeId, error }
- `analysis_rated` - { tradeId, rating: 1-5, helpful: boolean }

**Dashboard Engagement:**

- `dashboard_viewed`
- `trade_history_viewed`
- `performance_chart_viewed`

### Key Metrics Dashboard

**User Health:**

```
- DAU / MAU ratio
- Avg trades per user per week
- Churn rate (users who don't return within 7 days)
- Activation rate (% who complete first trade)
```

**Guidance System Effectiveness (NEW):**

```
- % trades with stop-loss set (target: 95%+)
- Avg risk per trade (target: <2.5%)
- Avg R:R ratio (target: >1.5)
- Psychology check completion rate (target: 80%+)
- Warning override rate (target: <30%)
- Revenge trading detection rate
- Correlation: psychology_score vs trade_outcome
```

**AI Performance:**

```
- AI analysis success rate (target: 95%+)
- Avg analysis time (target: <10s)
- User rating of analyses (target: 4+/5)
- Cost per analysis (target: <$0.01)
```

---

## Success Metrics & KPIs

### Launch Week (Days 1-7)

- **Signups:** 50+ users
- **Activated users:** 25+ (completed 1 trade)
- **Trades executed:** 100+
- **AI analyses generated:** 75+
- **Avg session time:** 5+ minutes
- **Psychology check completion:** 80%+ (critical: shows users engage with guidance)
- **Warning override rate:** &lt;30% (users heed warnings)
- **Trades with stop-loss:** 95%+ (mandatory enforcement working)

### Month 1 (Days 1-30)

- **Total signups:** 100+ users
- **Active traders:** 50+ (3+ trades)
- **Total trades:** 500+
- **AI analysis avg rating:** 4+/5 stars
- **7-day retention:** 40%+
- **Email list:** 75+ subscribers
- **Avg risk per trade:** &lt;2.5% (guidance system working)
- **Avg R:R ratio:** &gt;1:1.5 (improved through warnings)

### Month 3 Goals

- **Total users:** 500
- **Active traders:** 200
- **Monthly trades:** 2,500+
- **Paying customers:** 10 (when paid tier launches)
- **MRR:** $290+

---

## Appendix

### Environment Variables

```bash
# .env.local

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-project.convex.cloud
CONVEX_DEPLOYMENT=prod

# BetterAuth
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://your-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Polygon.io
POLYGON_API_KEY=your-polygon-api-key

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Resend (Email)
RESEND_API_KEY=re_your-resend-key

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "convex": "^1.16.0",
    "better-auth": "^0.9.0",
    "@ai-sdk/anthropic": "^0.0.50",
    "ai": "^3.3.0",
    "inngest": "^3.22.0",
    "technicalindicators": "^3.1.0",
    "lightweight-charts": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "recharts": "^2.12.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "vitest": "^1.6.0",
    "@playwright/test": "^1.44.0",
    "prettier": "^3.3.0"
  }
}
```

---

## Conclusion

This PRD provides complete specifications for building ForexMentor AI MVP in 30 days. The scope is focused, achievable solo, and addresses a genuine market need: beginner traders desperately want feedback on their practice trades.

**Key Differentiators:**

1. **AI analysis** - Instant, specific feedback (not generic lessons)
2. **Beginner-first** - Simple UX, only 5 pairs, no complexity overload
3. **Free tier** - 25 trades/month removes barrier to entry
4. **Technical foundation** - Built to scale for social/journal/education features

**Next Steps:**

1. Review this PRD and confirm scope
2. Set up development environment (Day 1)
3. Start with Week 1 tasks (auth + user system)
4. Ship weekly demos to validate progress
5. Launch on Day 30! 🚀

**Questions or concerns?** Flag them now before starting development. Good luck building!