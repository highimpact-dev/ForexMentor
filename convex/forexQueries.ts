import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Query to get all active trading pairs
 */
export const getActiveTradingPairs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tradingPairs"),
      symbol: v.string(),
      polygonTicker: v.string(),
      name: v.string(),
      baseCurrency: v.string(),
      quoteCurrency: v.string(),
      pipSize: v.number(),
      displayOrder: v.number(),
    })
  ),
  handler: async (ctx) => {
    const pairs = await ctx.db
      .query("tradingPairs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return pairs
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((pair) => ({
        _id: pair._id,
        symbol: pair.symbol,
        polygonTicker: pair.polygonTicker,
        name: pair.name,
        baseCurrency: pair.baseCurrency,
        quoteCurrency: pair.quoteCurrency,
        pipSize: pair.pipSize,
        displayOrder: pair.displayOrder,
      }));
  },
});

