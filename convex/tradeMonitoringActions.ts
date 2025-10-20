"use node";

import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Internal action to check all open trades and close them if SL/TP is hit
 * This runs as a scheduled job every 5 seconds
 */
export const checkOpenTrades = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get all open trades from the database
      const openTrades = await ctx.runQuery(
        internal.tradeMonitoringActions.getOpenTrades
      );

      if (openTrades.length === 0) {
        // No open trades to monitor
        return;
      }

      // Group trades by symbol to minimize API calls
      const tradesBySymbol = new Map<string, typeof openTrades>();
      for (const trade of openTrades) {
        const symbol = trade.symbol;
        if (!tradesBySymbol.has(symbol)) {
          tradesBySymbol.set(symbol, []);
        }
        tradesBySymbol.get(symbol)!.push(trade);
      }

      // Check each symbol's trades
      for (const [symbol, symbolTrades] of tradesBySymbol) {
        try {
          // Get current price from Polygon.io
          const apiKey = process.env.POLYGON_API_KEY;
          if (!apiKey) {
            console.error("[checkOpenTrades] Missing POLYGON_API_KEY");
            continue;
          }

          const polygonTicker = `C:${symbol}`;
          const url = `https://api.polygon.io/v2/last/nbbo/${polygonTicker}?apiKey=${apiKey}`;

          const response = await fetch(url);
          if (!response.ok) {
            console.error(
              `[checkOpenTrades] Failed to get price for ${symbol}: ${response.status}`
            );
            continue;
          }

          const data = await response.json();
          const currentPrice = data.results?.last?.price;

          if (!currentPrice) {
            console.error(
              `[checkOpenTrades] No price data for ${symbol}`
            );
            continue;
          }

          // Check each trade for this symbol
          for (const trade of symbolTrades) {
            let shouldClose = false;
            let closeReason: "stop_loss_hit" | "take_profit_hit" | null = null;

            // Check stop loss
            if (trade.stopLoss) {
              if (trade.direction === "long") {
                // Long trade: close if price drops to or below SL
                if (currentPrice <= trade.stopLoss) {
                  shouldClose = true;
                  closeReason = "stop_loss_hit";
                }
              } else {
                // Short trade: close if price rises to or above SL
                if (currentPrice >= trade.stopLoss) {
                  shouldClose = true;
                  closeReason = "stop_loss_hit";
                }
              }
            }

            // Check take profit (only if SL hasn't been hit)
            if (!shouldClose && trade.takeProfit) {
              if (trade.direction === "long") {
                // Long trade: close if price rises to or above TP
                if (currentPrice >= trade.takeProfit) {
                  shouldClose = true;
                  closeReason = "take_profit_hit";
                }
              } else {
                // Short trade: close if price drops to or below TP
                if (currentPrice <= trade.takeProfit) {
                  shouldClose = true;
                  closeReason = "take_profit_hit";
                }
              }
            }

            // Close the trade if SL or TP was hit
            if (shouldClose && closeReason) {
              await ctx.runMutation(internal.tradeMonitoringActions.closeTradeAutomatic, {
                tradeId: trade._id,
                exitPrice: currentPrice,
                currentPrice,
                closeReason,
              });

              console.log(
                `[checkOpenTrades] Closed ${trade.symbol} ${trade.direction} trade: ${closeReason} (entry: ${trade.entryPrice}, exit: ${currentPrice})`
              );
            }
          }
        } catch (error) {
          console.error(
            `[checkOpenTrades] Error checking ${symbol} trades:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("[checkOpenTrades] Error monitoring trades:", error);
    }
  },
});

/**
 * Internal query to get all open trades
 */
export const getOpenTrades = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("trades"),
      userId: v.string(),
      symbol: v.string(),
      direction: v.union(v.literal("long"), v.literal("short")),
      entryPrice: v.number(),
      positionSize: v.number(),
      stopLoss: v.optional(v.number()),
      takeProfit: v.optional(v.number()),
      riskAmount: v.number(),
      entryTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    // Get all open trades from database
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    return trades.map((trade) => ({
      _id: trade._id,
      userId: trade.userId,
      symbol: trade.symbol,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      positionSize: trade.positionSize,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      riskAmount: trade.riskAmount,
      entryTime: trade.entryTime,
    }));
  },
});

/**
 * Internal mutation to automatically close a trade when SL/TP is hit
 * This is called by the checkOpenTrades action
 */
export const closeTradeAutomatic = internalMutation({
  args: {
    tradeId: v.id("trades"),
    exitPrice: v.number(),
    currentPrice: v.number(),
    closeReason: v.union(
      v.literal("stop_loss_hit"),
      v.literal("take_profit_hit")
    ),
  },
  handler: async (ctx, args) => {
    const trade = await ctx.db.get(args.tradeId);
    if (!trade) {
      console.error(
        `[closeTradeAutomatic] Trade ${args.tradeId} not found`
      );
      return;
    }

    if (trade.status !== "open") {
      console.error(
        `[closeTradeAutomatic] Trade ${args.tradeId} is already ${trade.status}`
      );
      return;
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
    const metadata = {
      wasInProfit: profitLoss > 0,
      wasInLoss: profitLoss < 0,
      distanceFromSL: trade.stopLoss
        ? Math.abs(args.currentPrice - trade.stopLoss)
        : undefined,
      distanceFromTP: trade.takeProfit
        ? Math.abs(args.currentPrice - trade.takeProfit)
        : undefined,
      percentageOfTargetReached:
        trade.takeProfit && trade.stopLoss
          ? calculatePercentageToTarget(
              trade.direction,
              trade.entryPrice,
              args.currentPrice,
              trade.takeProfit
            )
          : undefined,
      modificationCount,
      isEarlyExit: false, // Automatic closures are not early exits
    };

    // Log closure event
    await ctx.scheduler.runAfter(0, internal.tradeHistory.logTradeEvent, {
      tradeId: args.tradeId,
      userId: trade.userId,
      symbol: trade.symbol,
      action: args.closeReason === "stop_loss_hit"
        ? "trade_closed_sl_hit" as const
        : "trade_closed_tp_hit" as const,
      priceAtAction: args.currentPrice,
      exitPrice: args.exitPrice,
      profitLoss,
      profitLossPercentage,
      timeInTrade,
      metadata: JSON.stringify(metadata),
    });

    console.log(
      `[closeTradeAutomatic] Closed trade ${args.tradeId} with reason: ${args.closeReason}`
    );
  },
});

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
