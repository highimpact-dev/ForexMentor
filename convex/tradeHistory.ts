import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Helper to log trade history events
 * This is an internal mutation called by other trade mutations
 */
export const logTradeEvent = internalMutation({
  args: {
    tradeId: v.id("trades"),
    userId: v.string(),
    symbol: v.string(),
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
    priceAtAction: v.number(),
    oldValue: v.optional(v.number()),
    newValue: v.optional(v.number()),
    changeDirection: v.optional(v.union(
      v.literal("tightened"),
      v.literal("widened"),
      v.literal("moved_closer"),
      v.literal("moved_further")
    )),
    changeMagnitude: v.optional(v.number()),
    exitPrice: v.optional(v.number()),
    profitLoss: v.optional(v.number()),
    profitLossPercentage: v.optional(v.number()),
    timeInTrade: v.optional(v.number()),
    userNotes: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  returns: v.id("tradeHistory"),
  handler: async (ctx, args) => {
    const historyId = await ctx.db.insert("tradeHistory", {
      ...args,
      timestamp: Date.now(),
    });

    console.log(`[TradeHistory] Logged ${args.action} for trade ${args.tradeId}`);

    return historyId;
  },
});

/**
 * Get trade history for a specific trade
 */
export const getTradeHistory = query({
  args: {
    tradeId: v.id("trades"),
  },
  returns: v.array(
    v.object({
      _id: v.id("tradeHistory"),
      _creationTime: v.number(),
      tradeId: v.id("trades"),
      userId: v.string(),
      symbol: v.string(),
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
      priceAtAction: v.number(),
      oldValue: v.optional(v.number()),
      newValue: v.optional(v.number()),
      changeDirection: v.optional(v.union(
        v.literal("tightened"),
        v.literal("widened"),
        v.literal("moved_closer"),
        v.literal("moved_further")
      )),
      changeMagnitude: v.optional(v.number()),
      exitPrice: v.optional(v.number()),
      profitLoss: v.optional(v.number()),
      profitLossPercentage: v.optional(v.number()),
      timeInTrade: v.optional(v.number()),
      userNotes: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get history for this trade
    const history = await ctx.db
      .query("tradeHistory")
      .withIndex("by_trade_and_timestamp", (q) =>
        q.eq("tradeId", args.tradeId)
      )
      .order("asc") // Chronological order
      .collect();

    // Verify user owns this trade
    const trade = await ctx.db.get(args.tradeId);
    if (!trade || trade.userId !== identity.subject) {
      throw new Error("Not authorized to view this trade history");
    }

    return history;
  },
});

/**
 * Get all trade history for a user (for analysis)
 */
export const getUserTradeHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("tradeHistory"),
      _creationTime: v.number(),
      tradeId: v.id("trades"),
      userId: v.string(),
      symbol: v.string(),
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
      priceAtAction: v.number(),
      oldValue: v.optional(v.number()),
      newValue: v.optional(v.number()),
      changeDirection: v.optional(v.union(
        v.literal("tightened"),
        v.literal("widened"),
        v.literal("moved_closer"),
        v.literal("moved_further")
      )),
      changeMagnitude: v.optional(v.number()),
      exitPrice: v.optional(v.number()),
      profitLoss: v.optional(v.number()),
      profitLossPercentage: v.optional(v.number()),
      timeInTrade: v.optional(v.number()),
      userNotes: v.optional(v.string()),
      metadata: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit || 1000;

    const history = await ctx.db
      .query("tradeHistory")
      .withIndex("by_user_and_timestamp", (q) =>
        q.eq("userId", identity.subject)
      )
      .order("desc") // Most recent first
      .take(limit);

    return history;
  },
});

/**
 * Helper functions to calculate behavioral metrics
 */

/**
 * Calculate change direction for Stop Loss modification
 */
export function calculateSLChangeDirection(
  direction: "long" | "short",
  entryPrice: number,
  oldSL: number,
  newSL: number
): "tightened" | "widened" {
  if (direction === "long") {
    // For long: higher SL = tightened (closer to entry), lower SL = widened (further from entry)
    return newSL > oldSL ? "tightened" : "widened";
  } else {
    // For short: lower SL = tightened (closer to entry), higher SL = widened (further from entry)
    return newSL < oldSL ? "tightened" : "widened";
  }
}

/**
 * Calculate change direction for Take Profit modification
 */
export function calculateTPChangeDirection(
  direction: "long" | "short",
  entryPrice: number,
  oldTP: number,
  newTP: number
): "moved_closer" | "moved_further" {
  if (direction === "long") {
    // For long: lower TP = moved closer (less profit target), higher TP = moved further (more profit target)
    return newTP < oldTP ? "moved_closer" : "moved_further";
  } else {
    // For short: higher TP = moved closer (less profit target), lower TP = moved further (more profit target)
    return newTP > oldTP ? "moved_closer" : "moved_further";
  }
}

/**
 * Calculate pip/point change magnitude
 */
export function calculateChangeMagnitude(
  oldValue: number,
  newValue: number,
  pipSize: number = 0.0001
): number {
  return Math.abs((newValue - oldValue) / pipSize);
}

/**
 * Generate metadata for trade history event
 */
export function generateTradeEventMetadata(params: {
  trade: {
    direction: "long" | "short";
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    entryTime: number;
  };
  currentPrice: number;
  profitLoss?: number;
  modificationCount?: number;
}): string {
  const { trade, currentPrice, profitLoss, modificationCount } = params;

  const metadata = {
    wasInProfit: profitLoss ? profitLoss > 0 : undefined,
    wasInLoss: profitLoss ? profitLoss < 0 : undefined,
    distanceFromSL: trade.stopLoss
      ? Math.abs(currentPrice - trade.stopLoss)
      : undefined,
    distanceFromTP: trade.takeProfit
      ? Math.abs(currentPrice - trade.takeProfit)
      : undefined,
    percentageOfTargetReached:
      trade.takeProfit && trade.stopLoss
        ? calculatePercentageToTarget(
            trade.direction,
            trade.entryPrice,
            currentPrice,
            trade.takeProfit
          )
        : undefined,
    modificationCount,
    isEarlyExit:
      trade.stopLoss && trade.takeProfit
        ? !hitSLOrTP(
            trade.direction,
            currentPrice,
            trade.stopLoss,
            trade.takeProfit
          )
        : undefined,
  };

  return JSON.stringify(metadata);
}

/**
 * Calculate what percentage of the target was reached
 */
function calculatePercentageToTarget(
  direction: "long" | "short",
  entryPrice: number,
  currentPrice: number,
  targetPrice: number
): number {
  const targetDistance = Math.abs(targetPrice - entryPrice);
  const currentDistance = Math.abs(currentPrice - entryPrice);

  return (currentDistance / targetDistance) * 100;
}

/**
 * Check if price hit SL or TP
 */
function hitSLOrTP(
  direction: "long" | "short",
  currentPrice: number,
  stopLoss: number,
  takeProfit: number
): boolean {
  if (direction === "long") {
    return currentPrice <= stopLoss || currentPrice >= takeProfit;
  } else {
    return currentPrice >= stopLoss || currentPrice <= takeProfit;
  }
}
