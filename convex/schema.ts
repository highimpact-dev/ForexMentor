import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  waitlist: defineTable({
    email: v.string(),
    name: v.string(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),

  // Invite system tables
  inviteRequests: defineTable({
    email: v.string(),
    name: v.string(),
    // Qualification answers
    tradingExperience: v.union(
      v.literal("never"),
      v.literal("less_than_3_months"),
      v.literal("3_to_12_months"),
      v.literal("1_plus_years")
    ),
    primaryChallenge: v.union(
      v.literal("emotional_decisions"),
      v.literal("lack_of_discipline"),
      v.literal("no_accountability"),
      v.literal("information_overload")
    ),
    motivation: v.string(), // Free text, 100-300 chars
    canCommit: v.boolean(),
    referralSource: v.union(
      v.literal("social_media"),
      v.literal("friend"),
      v.literal("article"),
      v.literal("search"),
      v.literal("other")
    ),
    // Security tracking
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("flagged")
    ),
    // Admin fields
    reviewedBy: v.optional(v.string()), // User ID of admin who reviewed
    reviewedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    inviteCodeId: v.optional(v.id("inviteCodes")), // Code generated for this request
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_ip_and_created", ["ipAddress", "createdAt"])
    .index("by_created", ["createdAt"]),

  inviteCodes: defineTable({
    code: v.string(), // 8-character alphanumeric
    maxUses: v.number(), // Default 5
    currentUses: v.number(), // Track usage
    createdBy: v.optional(v.string()), // User ID of admin (optional for auto-generated)
    createdForRequestId: v.optional(v.id("inviteRequests")), // Link to request if auto-approved
    expiresAt: v.number(), // 30 days from creation
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_active_and_expires", ["isActive", "expiresAt"]),

  inviteCodeUsage: defineTable({
    inviteCodeId: v.id("inviteCodes"),
    code: v.string(), // Denormalized for easier querying
    userId: v.string(), // Clerk user ID
    email: v.string(),
    usedAt: v.number(),
  })
    .index("by_invite_code", ["inviteCodeId"])
    .index("by_user", ["userId"])
    .index("by_code", ["code"]),

  securityBlocks: defineTable({
    type: v.union(v.literal("ip"), v.literal("email")),
    value: v.string(), // IP address or email
    reason: v.string(),
    blockedBy: v.optional(v.string()), // Admin user ID
    expiresAt: v.optional(v.number()), // Optional expiration
    isPermanent: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_type_and_value", ["type", "value"])
    .index("by_expires", ["expiresAt"]),

  // User profiles and subscription management
  userProfiles: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    inviteCodeUsed: v.optional(v.string()), // The invite code they used to sign up
    inviteCodeOwnerId: v.optional(v.string()), // User ID of who invited them
    // Subscription and usage
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("pro")
    ),
    bonusTradeAllowance: v.number(), // Extra trades from referrals
    totalTradesUsed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"])
    .index("by_invite_code_owner", ["inviteCodeOwnerId"]),

  // Referral rewards tracking
  referralRewards: defineTable({
    referrerId: v.string(), // User ID who shared the code
    referredUserId: v.string(), // User ID who used the code
    inviteCodeId: v.id("inviteCodes"),
    inviteCode: v.string(), // Denormalized for easy display
    rewardType: v.union(
      v.literal("bonus_trades"),
      v.literal("subscription_extension"),
      v.literal("feature_unlock")
    ),
    rewardAmount: v.number(), // Number of bonus trades or days
    isProcessed: v.boolean(),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referred_user", ["referredUserId"])
    .index("by_invite_code", ["inviteCodeId"])
    .index("by_processed", ["isProcessed"]),

  // Trading pairs configuration
  tradingPairs: defineTable({
    symbol: v.string(), // e.g., "EURUSD"
    polygonTicker: v.string(), // e.g., "C:EURUSD"
    name: v.string(), // e.g., "Euro / US Dollar"
    baseCurrency: v.string(), // e.g., "EUR"
    quoteCurrency: v.string(), // e.g., "USD"
    pipSize: v.number(), // e.g., 0.0001 for most pairs, 0.01 for JPY pairs
    isActive: v.boolean(),
    displayOrder: v.number(),
  }).index("by_symbol", ["symbol"])
    .index("by_active", ["isActive"]),

  // User trades
  trades: defineTable({
    userId: v.string(), // Clerk user ID
    symbol: v.string(), // e.g., "EURUSD"
    direction: v.union(v.literal("long"), v.literal("short")),
    entryPrice: v.number(),
    exitPrice: v.optional(v.number()),
    positionSize: v.number(), // in lots
    stopLoss: v.optional(v.number()),
    takeProfit: v.optional(v.number()),
    riskAmount: v.number(), // $ amount risked
    riskPercentage: v.number(), // % of account risked
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("cancelled")
    ),
    closeReason: v.optional(v.union(
      v.literal("manual"),
      v.literal("stop_loss_hit"),
      v.literal("take_profit_hit"),
      v.literal("cancelled")
    )),
    profitLoss: v.optional(v.number()),
    profitLossPercentage: v.optional(v.number()),
    entryTime: v.number(),
    exitTime: v.optional(v.number()),
    notes: v.optional(v.string()),
    exitNotes: v.optional(v.string()), // Notes added when closing
    // AI analysis (added after trade closes)
    aiAnalysis: v.optional(v.string()),
    aiAnalysisRating: v.optional(v.number()), // 1-5 stars
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_entry_time", ["userId", "entryTime"])
    .index("by_status", ["status"]),

  // Account balance history
  accountBalances: defineTable({
    userId: v.string(),
    balance: v.number(),
    timestamp: v.number(),
    changeReason: v.union(
      v.literal("initial"),
      v.literal("trade_close"),
      v.literal("adjustment")
    ),
    tradeId: v.optional(v.id("trades")), // Link to trade if change was from trade
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),

  // Trade modification history / audit trail
  tradeHistory: defineTable({
    tradeId: v.id("trades"),
    userId: v.string(),
    symbol: v.string(),
    // Action type
    action: v.union(
      v.literal("trade_opened"),
      v.literal("stop_loss_modified"),
      v.literal("take_profit_modified"),
      v.literal("trade_closed_manual"),
      v.literal("trade_closed_sl_hit"),
      v.literal("trade_closed_tp_hit"),
      v.literal("trade_cancelled"),
      v.literal("notes_added")
    ),
    timestamp: v.number(),
    // Market context
    priceAtAction: v.number(),
    // Modification details (for SL/TP changes)
    oldValue: v.optional(v.number()),
    newValue: v.optional(v.number()),
    changeDirection: v.optional(v.union(
      v.literal("tightened"),
      v.literal("widened"),
      v.literal("moved_closer"),
      v.literal("moved_further")
    )),
    changeMagnitude: v.optional(v.number()), // Pips/points changed
    // Exit details (for closes)
    exitPrice: v.optional(v.number()),
    profitLoss: v.optional(v.number()),
    profitLossPercentage: v.optional(v.number()),
    timeInTrade: v.optional(v.number()), // Seconds
    // User context
    userNotes: v.optional(v.string()),
    // Behavioral metadata (JSON string for flexibility)
    metadata: v.optional(v.string()), // Stringified JSON object
  })
    .index("by_trade_id", ["tradeId"])
    .index("by_user_id", ["userId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"])
    .index("by_trade_and_timestamp", ["tradeId", "timestamp"]),
});
