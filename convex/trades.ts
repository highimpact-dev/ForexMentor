import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  calculateSLChangeDirection,
  calculateTPChangeDirection,
  calculateChangeMagnitude,
  generateTradeEventMetadata,
} from "./tradeHistory";

/**
 * Create a new trade
 */
export const createTrade = mutation({
  args: {
    symbol: v.string(),
    direction: v.union(v.literal("long"), v.literal("short")),
    entryPrice: v.number(),
    positionSize: v.number(),
    stopLoss: v.optional(v.number()),
    takeProfit: v.optional(v.number()),
    riskAmount: v.number(),
    riskPercentage: v.number(),
    entryTime: v.number(),
    notes: v.optional(v.string()),
  },
  returns: v.id("trades"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tradeId = await ctx.db.insert("trades", {
      userId: identity.subject,
      symbol: args.symbol,
      direction: args.direction,
      entryPrice: args.entryPrice,
      positionSize: args.positionSize,
      stopLoss: args.stopLoss,
      takeProfit: args.takeProfit,
      riskAmount: args.riskAmount,
      riskPercentage: args.riskPercentage,
      status: "open",
      entryTime: args.entryTime,
      notes: args.notes,
    });

    // Log trade opened event
    await ctx.scheduler.runAfter(0, internal.tradeHistory.logTradeEvent, {
      tradeId,
      userId: identity.subject,
      symbol: args.symbol,
      action: "trade_opened",
      priceAtAction: args.entryPrice,
      userNotes: args.notes,
    });

    return tradeId;
  },
});

/**
 * Get all trades for the current user
 */
export const getUserTrades = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("closed"), v.literal("cancelled"))),
  },
  returns: v.array(
    v.object({
      _id: v.id("trades"),
      _creationTime: v.number(),
      userId: v.string(),
      symbol: v.string(),
      direction: v.union(v.literal("long"), v.literal("short")),
      entryPrice: v.number(),
      exitPrice: v.optional(v.number()),
      positionSize: v.number(),
      stopLoss: v.optional(v.number()),
      takeProfit: v.optional(v.number()),
      riskAmount: v.number(),
      riskPercentage: v.number(),
      status: v.union(v.literal("open"), v.literal("closed"), v.literal("cancelled")),
      profitLoss: v.optional(v.number()),
      profitLossPercentage: v.optional(v.number()),
      entryTime: v.number(),
      exitTime: v.optional(v.number()),
      notes: v.optional(v.string()),
      aiAnalysis: v.optional(v.string()),
      aiAnalysisRating: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Use index for efficient querying
    if (args.status) {
      return await ctx.db
        .query("trades")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", identity.subject).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    // Get all trades for user
    return await ctx.db
      .query("trades")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * Get open trades for a specific symbol
 */
export const getOpenTradesForSymbol = query({
  args: {
    symbol: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("trades"),
      _creationTime: v.number(),
      userId: v.string(),
      symbol: v.string(),
      direction: v.union(v.literal("long"), v.literal("short")),
      entryPrice: v.number(),
      exitPrice: v.optional(v.number()),
      positionSize: v.number(),
      stopLoss: v.optional(v.number()),
      takeProfit: v.optional(v.number()),
      riskAmount: v.number(),
      riskPercentage: v.number(),
      status: v.union(v.literal("open"), v.literal("closed"), v.literal("cancelled")),
      profitLoss: v.optional(v.number()),
      profitLossPercentage: v.optional(v.number()),
      entryTime: v.number(),
      exitTime: v.optional(v.number()),
      notes: v.optional(v.string()),
      aiAnalysis: v.optional(v.string()),
      aiAnalysisRating: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    console.log("[getOpenTradesForSymbol] User identity:", identity);
    console.log("[getOpenTradesForSymbol] Identity subject:", identity?.subject);
    console.log("[getOpenTradesForSymbol] Query symbol:", args.symbol);

    if (!identity) {
      console.error("[getOpenTradesForSymbol] Not authenticated - no identity found");
      throw new Error("Not authenticated");
    }

    // Get open trades for this symbol and user
    const allOpenTrades = await ctx.db
      .query("trades")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "open")
      )
      .collect();

    console.log("[getOpenTradesForSymbol] Found trades:", allOpenTrades.length);

    // Filter by symbol
    const filteredTrades = allOpenTrades.filter((trade) => trade.symbol === args.symbol);
    console.log("[getOpenTradesForSymbol] Filtered trades for symbol:", filteredTrades.length);

    return filteredTrades;
  },
});

/**
 * Close a trade manually
 */
export const closeTrade = mutation({
  args: {
    tradeId: v.id("trades"),
    exitPrice: v.number(),
    currentPrice: v.number(),
    closeReason: v.union(
      v.literal("manual"),
      v.literal("stop_loss_hit"),
      v.literal("take_profit_hit")
    ),
    exitNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const trade = await ctx.db.get(args.tradeId);
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.userId !== identity.subject) {
      throw new Error("Not authorized to close this trade");
    }

    if (trade.status !== "open") {
      throw new Error("Trade is already closed");
    }

    const exitTime = Date.now();
    const timeInTrade = Math.floor((exitTime - trade.entryTime * 1000) / 1000); // Seconds

    // Calculate P&L
    let profitLoss: number;
    if (trade.direction === "long") {
      profitLoss = (args.exitPrice - trade.entryPrice) * trade.positionSize;
    } else {
      profitLoss = (trade.entryPrice - args.exitPrice) * trade.positionSize;
    }

    const profitLossPercentage = (profitLoss / trade.riskAmount) * 100;

    // Update trade
    await ctx.db.patch(args.tradeId, {
      status: "closed",
      closeReason: args.closeReason,
      exitPrice: args.exitPrice,
      exitTime: Math.floor(exitTime / 1000),
      profitLoss,
      profitLossPercentage,
      exitNotes: args.exitNotes,
    });

    // Get modification count from history
    const history = await ctx.db
      .query("tradeHistory")
      .withIndex("by_trade_id", (q) => q.eq("tradeId", args.tradeId))
      .collect();

    const modificationCount = history.filter(
      (h) =>
        h.action === "stop_loss_modified" || h.action === "take_profit_modified"
    ).length;

    // Generate metadata
    const metadata = generateTradeEventMetadata({
      trade: {
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        entryTime: trade.entryTime,
      },
      currentPrice: args.currentPrice,
      profitLoss,
      modificationCount,
    });

    // Log closure event
    const action =
      args.closeReason === "manual"
        ? ("trade_closed_manual" as const)
        : args.closeReason === "stop_loss_hit"
        ? ("trade_closed_sl_hit" as const)
        : ("trade_closed_tp_hit" as const);

    await ctx.scheduler.runAfter(0, internal.tradeHistory.logTradeEvent, {
      tradeId: args.tradeId,
      userId: identity.subject,
      symbol: trade.symbol,
      action,
      priceAtAction: args.currentPrice,
      exitPrice: args.exitPrice,
      profitLoss,
      profitLossPercentage,
      timeInTrade,
      userNotes: args.exitNotes,
      metadata,
    });

    console.log(`[closeTrade] Closed trade ${args.tradeId} with reason: ${args.closeReason}`);
  },
});

/**
 * Cancel a trade
 */
export const cancelTrade = mutation({
  args: {
    tradeId: v.id("trades"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const trade = await ctx.db.get(args.tradeId);
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.userId !== identity.subject) {
      throw new Error("Not authorized to cancel this trade");
    }

    if (trade.status !== "open") {
      throw new Error("Trade is already closed");
    }

    await ctx.db.patch(args.tradeId, {
      status: "cancelled",
      exitTime: Date.now(),
    });
  },
});

/**
 * Update trade notes
 */
export const updateTradeNotes = mutation({
  args: {
    tradeId: v.id("trades"),
    notes: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const trade = await ctx.db.get(args.tradeId);
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.userId !== identity.subject) {
      throw new Error("Not authorized to update this trade");
    }

    await ctx.db.patch(args.tradeId, {
      notes: args.notes,
    });
  },
});

/**
 * Update stop loss and take profit with full logging
 */
export const updateTradeLevels = mutation({
  args: {
    tradeId: v.id("trades"),
    currentPrice: v.number(),
    stopLoss: v.optional(v.number()),
    takeProfit: v.optional(v.number()),
    userNotes: v.optional(v.string()),
    pipSize: v.optional(v.number()), // For calculating magnitude
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const trade = await ctx.db.get(args.tradeId);
    if (!trade) {
      throw new Error("Trade not found");
    }

    if (trade.userId !== identity.subject) {
      throw new Error("Not authorized to update this trade");
    }

    if (trade.status !== "open") {
      throw new Error("Cannot update closed trade");
    }

    const pipSize = args.pipSize || 0.0001;

    // Handle Stop Loss update
    if (args.stopLoss !== undefined && trade.stopLoss !== args.stopLoss) {
      const oldSL = trade.stopLoss || 0;
      const newSL = args.stopLoss;

      const changeDirection = calculateSLChangeDirection(
        trade.direction,
        trade.entryPrice,
        oldSL,
        newSL
      );

      const changeMagnitude = calculateChangeMagnitude(oldSL, newSL, pipSize);

      // Update trade
      await ctx.db.patch(args.tradeId, { stopLoss: newSL });

      // Log modification
      await ctx.scheduler.runAfter(0, internal.tradeHistory.logTradeEvent, {
        tradeId: args.tradeId,
        userId: identity.subject,
        symbol: trade.symbol,
        action: "stop_loss_modified",
        priceAtAction: args.currentPrice,
        oldValue: oldSL,
        newValue: newSL,
        changeDirection,
        changeMagnitude,
        userNotes: args.userNotes,
      });

      console.log(
        `[updateTradeLevels] SL ${changeDirection}: ${oldSL} → ${newSL} (${changeMagnitude.toFixed(1)} pips)`
      );
    }

    // Handle Take Profit update
    if (args.takeProfit !== undefined && trade.takeProfit !== args.takeProfit) {
      const oldTP = trade.takeProfit || 0;
      const newTP = args.takeProfit;

      const changeDirection = calculateTPChangeDirection(
        trade.direction,
        trade.entryPrice,
        oldTP,
        newTP
      );

      const changeMagnitude = calculateChangeMagnitude(oldTP, newTP, pipSize);

      // Update trade
      await ctx.db.patch(args.tradeId, { takeProfit: newTP });

      // Log modification
      await ctx.scheduler.runAfter(0, internal.tradeHistory.logTradeEvent, {
        tradeId: args.tradeId,
        userId: identity.subject,
        symbol: trade.symbol,
        action: "take_profit_modified",
        priceAtAction: args.currentPrice,
        oldValue: oldTP,
        newValue: newTP,
        changeDirection,
        changeMagnitude,
        userNotes: args.userNotes,
      });

      console.log(
        `[updateTradeLevels] TP ${changeDirection}: ${oldTP} → ${newTP} (${changeMagnitude.toFixed(1)} pips)`
      );
    }
  },
});
