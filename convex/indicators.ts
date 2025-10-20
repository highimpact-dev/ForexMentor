"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// Polygon.io API base URL
const POLYGON_API_BASE = "https://api.polygon.io";

// Type definition for indicator data point
type IndicatorValue = {
  timestamp: number;
  value: number;
};

/**
 * Get Simple Moving Average (SMA) from Polygon.io
 */
export const getSMA = action({
  args: {
    symbol: v.string(), // e.g., "EURUSD"
    timespan: v.string(), // e.g., "day", "hour", "minute"
    window: v.number(), // Period (e.g., 20, 50, 200)
    seriesType: v.optional(v.string()), // "close", "open", "high", "low" (default: "close")
    from: v.optional(v.string()), // YYYY-MM-DD format
    to: v.optional(v.string()), // YYYY-MM-DD format
  },
  returns: v.array(
    v.object({
      timestamp: v.number(),
      value: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const { symbol, timespan, window, seriesType = "close", from, to } = args;
    const polygonTicker = `C:${symbol}`;

    // Build URL with query parameters
    const params = new URLSearchParams({
      timespan,
      adjusted: "true",
      series_type: seriesType,
      window: window.toString(),
      limit: "5000",
      order: "desc",
      apiKey,
    });

    // Note: Technical indicators API may not support timestamp filtering
    // If from/to are provided, we'll filter on the client side after fetching
    // if (from) params.append("timestamp.gte", from);
    // if (to) params.append("timestamp.lte", to);

    const url = `${POLYGON_API_BASE}/v1/indicators/sma/${polygonTicker}?${params}`;

    console.log(`[getSMA] Fetching: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Response body might not be JSON
          const errorText = await response.text();
          if (errorText) errorDetails = ` - ${errorText}`;
        }
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        throw new Error(`Polygon API error: ${data.error || data.message || "Unknown error"}`);
      }

      if (!data.results || !data.results.values || data.results.values.length === 0) {
        return [];
      }

      // Transform Polygon data to our format
      // API returns data in descending order (newest first), but TradingView needs ascending
      let results = data.results.values.map((item: any) => ({
        timestamp: item.timestamp,
        value: item.value,
      })).reverse();

      // Filter by date range if provided (API doesn't support date filtering)
      if (from || to) {
        const fromMs = from ? new Date(from).getTime() : 0;
        const toMs = to ? new Date(to).getTime() + 86400000 : Infinity; // Add 1 day to include the to date

        const beforeFilter = results.length;
        results = results.filter((item: IndicatorValue) => {
          return item.timestamp >= fromMs && item.timestamp <= toMs;
        });

        console.log(`[getSMA] Filtered from ${beforeFilter} to ${results.length} values within date range ${from} to ${to}`);
      }

      console.log(`[getSMA] Transformed ${results.length} values`);
      if (results.length > 0) {
        console.log(`[getSMA] First timestamp: ${results[0].timestamp} (${new Date(results[0].timestamp).toISOString()})`);
        console.log(`[getSMA] Last timestamp: ${results[results.length - 1].timestamp} (${new Date(results[results.length - 1].timestamp).toISOString()})`);
      }

      return results;
    } catch (error) {
      console.error("Error fetching SMA from Polygon:", error);
      throw error;
    }
  },
});

/**
 * Get Exponential Moving Average (EMA) from Polygon.io
 */
export const getEMA = action({
  args: {
    symbol: v.string(),
    timespan: v.string(),
    window: v.number(),
    seriesType: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      timestamp: v.number(),
      value: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const { symbol, timespan, window, seriesType = "close", from, to } = args;
    const polygonTicker = `C:${symbol}`;

    const params = new URLSearchParams({
      timespan,
      adjusted: "true",
      series_type: seriesType,
      window: window.toString(),
      limit: "5000",
      order: "desc",
      apiKey,
    });

    const url = `${POLYGON_API_BASE}/v1/indicators/ema/${polygonTicker}?${params}`;

    console.log(`[getEMA] Fetching: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Response body might not be JSON
          const errorText = await response.text();
          if (errorText) errorDetails = ` - ${errorText}`;
        }
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        throw new Error(`Polygon API error: ${data.error || data.message || "Unknown error"}`);
      }

      if (!data.results || !data.results.values || data.results.values.length === 0) {
        return [];
      }

      // API returns data in descending order (newest first), but TradingView needs ascending
      let results = data.results.values.map((item: any) => ({
        timestamp: item.timestamp,
        value: item.value,
      })).reverse();

      // Filter by date range if provided (API doesn't support date filtering)
      if (from || to) {
        const fromMs = from ? new Date(from).getTime() : 0;
        const toMs = to ? new Date(to).getTime() + 86400000 : Infinity; // Add 1 day to include the to date

        const beforeFilter = results.length;
        results = results.filter((item: IndicatorValue) => {
          return item.timestamp >= fromMs && item.timestamp <= toMs;
        });

        console.log(`[getEMA] Filtered from ${beforeFilter} to ${results.length} values within date range ${from} to ${to}`);
      }

      console.log(`[getEMA] Transformed ${results.length} values`);
      if (results.length > 0) {
        console.log(`[getEMA] First timestamp: ${results[0].timestamp} (${new Date(results[0].timestamp).toISOString()})`);
        console.log(`[getEMA] Last timestamp: ${results[results.length - 1].timestamp} (${new Date(results[results.length - 1].timestamp).toISOString()})`);
      }

      return results;
    } catch (error) {
      console.error("Error fetching EMA from Polygon:", error);
      throw error;
    }
  },
});

/**
 * Get Relative Strength Index (RSI) from Polygon.io
 */
export const getRSI = action({
  args: {
    symbol: v.string(),
    timespan: v.string(),
    window: v.number(), // Period (typically 14)
    seriesType: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      timestamp: v.number(),
      value: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const { symbol, timespan, window, seriesType = "close", from, to } = args;
    const polygonTicker = `C:${symbol}`;

    const params = new URLSearchParams({
      timespan,
      adjusted: "true",
      series_type: seriesType,
      window: window.toString(),
      limit: "5000",
      order: "desc",
      apiKey,
    });

    const url = `${POLYGON_API_BASE}/v1/indicators/rsi/${polygonTicker}?${params}`;

    console.log(`[getRSI] Fetching: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Response body might not be JSON
          const errorText = await response.text();
          if (errorText) errorDetails = ` - ${errorText}`;
        }
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        throw new Error(`Polygon API error: ${data.error || data.message || "Unknown error"}`);
      }

      if (!data.results || !data.results.values || data.results.values.length === 0) {
        return [];
      }

      // API returns data in descending order (newest first), but TradingView needs ascending
      let results = data.results.values.map((item: any) => ({
        timestamp: item.timestamp,
        value: item.value,
      })).reverse();

      // Filter by date range if provided (API doesn't support date filtering)
      if (from || to) {
        const fromMs = from ? new Date(from).getTime() : 0;
        const toMs = to ? new Date(to).getTime() + 86400000 : Infinity; // Add 1 day to include the to date

        const beforeFilter = results.length;
        results = results.filter((item: IndicatorValue) => {
          return item.timestamp >= fromMs && item.timestamp <= toMs;
        });

        console.log(`[getRSI] Filtered from ${beforeFilter} to ${results.length} values within date range ${from} to ${to}`);
      }

      console.log(`[getRSI] Transformed ${results.length} values`);
      if (results.length > 0) {
        console.log(`[getRSI] First timestamp: ${results[0].timestamp} (${new Date(results[0].timestamp).toISOString()})`);
        console.log(`[getRSI] Last timestamp: ${results[results.length - 1].timestamp} (${new Date(results[results.length - 1].timestamp).toISOString()})`);
      }

      return results;
    } catch (error) {
      console.error("Error fetching RSI from Polygon:", error);
      throw error;
    }
  },
});

/**
 * Get MACD from Polygon.io
 */
export const getMACD = action({
  args: {
    symbol: v.string(),
    timespan: v.string(),
    shortWindow: v.number(), // Fast period (typically 12)
    longWindow: v.number(), // Slow period (typically 26)
    signalWindow: v.number(), // Signal period (typically 9)
    seriesType: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  returns: v.object({
    macd: v.array(v.object({ timestamp: v.number(), value: v.number() })),
    signal: v.array(v.object({ timestamp: v.number(), value: v.number() })),
    histogram: v.array(v.object({ timestamp: v.number(), value: v.number() })),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const { symbol, timespan, shortWindow, longWindow, signalWindow, seriesType = "close", from, to } = args;
    const polygonTicker = `C:${symbol}`;

    const params = new URLSearchParams({
      timespan,
      adjusted: "true",
      series_type: seriesType,
      short_window: shortWindow.toString(),
      long_window: longWindow.toString(),
      signal_window: signalWindow.toString(),
      limit: "5000",
      order: "desc",
      apiKey,
    });

    const url = `${POLYGON_API_BASE}/v1/indicators/macd/${polygonTicker}?${params}`;

    console.log(`[getMACD] Fetching: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Response body might not be JSON
          const errorText = await response.text();
          if (errorText) errorDetails = ` - ${errorText}`;
        }
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        throw new Error(`Polygon API error: ${data.error || data.message || "Unknown error"}`);
      }

      if (!data.results || !data.results.values || data.results.values.length === 0) {
        return { macd: [], signal: [], histogram: [] };
      }

      // Polygon returns MACD with value, signal, and histogram properties
      // API returns data in descending order (newest first), so we need to reverse
      const macdValues: IndicatorValue[] = [];
      const signalValues: IndicatorValue[] = [];
      const histogramValues: IndicatorValue[] = [];

      // Calculate date range filter
      const fromMs = from ? new Date(from).getTime() : 0;
      const toMs = to ? new Date(to).getTime() + 86400000 : Infinity; // Add 1 day to include the to date

      // Process in reverse order to get ascending timestamps
      for (let i = data.results.values.length - 1; i >= 0; i--) {
        const item = data.results.values[i];

        // Filter by date range if provided
        if (from || to) {
          if (item.timestamp < fromMs || item.timestamp > toMs) {
            continue; // Skip this item
          }
        }

        macdValues.push({ timestamp: item.timestamp, value: item.value });
        if (item.signal !== undefined) {
          signalValues.push({ timestamp: item.timestamp, value: item.signal });
        }
        if (item.histogram !== undefined) {
          histogramValues.push({ timestamp: item.timestamp, value: item.histogram });
        }
      }

      console.log(`[getMACD] Transformed ${macdValues.length} MACD values, ${signalValues.length} signal values, ${histogramValues.length} histogram values`);
      if (from || to) {
        console.log(`[getMACD] Filtered to date range ${from} to ${to}`);
      }
      if (macdValues.length > 0) {
        console.log(`[getMACD] First timestamp: ${macdValues[0].timestamp} (${new Date(macdValues[0].timestamp).toISOString()})`);
        console.log(`[getMACD] Last timestamp: ${macdValues[macdValues.length - 1].timestamp} (${new Date(macdValues[macdValues.length - 1].timestamp).toISOString()})`);
      }

      return {
        macd: macdValues,
        signal: signalValues,
        histogram: histogramValues,
      };
    } catch (error) {
      console.error("Error fetching MACD from Polygon:", error);
      throw error;
    }
  },
});
