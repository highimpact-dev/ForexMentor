"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Search for forex ticker symbols from Polygon.io
 * Supports lazy loading with search query
 */
export const searchForexTickers = action({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY is not configured");
    }

    const limit = args.limit || 100;
    const search = args.search || "";

    // Build URL with search parameter
    let url = `https://api.polygon.io/v3/reference/tickers?market=fx&active=true&order=asc&limit=${limit}&sort=ticker&apiKey=${apiKey}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to our format
    const tickers = (data.results || []).map((ticker: any) => {
      // Extract base and quote currencies from ticker
      // Polygon format: C:EURUSD -> EUR/USD
      const symbol = ticker.ticker.replace("C:", "");

      // Determine pip size based on currency pair
      // JPY pairs use 2 decimals (0.01), most others use 4 (0.0001)
      const pipSize = symbol.includes("JPY") ? 0.01 : 0.0001;

      return {
        symbol,
        polygonTicker: ticker.ticker,
        name: ticker.name || symbol,
        baseCurrency: ticker.base_currency_symbol || symbol.substring(0, 3),
        quoteCurrency: ticker.currency_symbol || symbol.substring(3, 6),
        pipSize,
      };
    });

    return {
      tickers,
      count: data.count || 0,
      nextUrl: data.next_url || null,
    };
  },
});
