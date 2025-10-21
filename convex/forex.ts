"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Polygon.io API base URL
const POLYGON_API_BASE = "https://api.polygon.io";

// Type definition for forex bar data
type ForexBar = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Utility function for exponential backoff retry with timeout
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = 8000 // 8 second timeout
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store', // Prevent browser caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      clearTimeout(timeoutId);

      // If successful or client error (not rate limit), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // If rate limited and not the last attempt, wait and retry
      if (response.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Return the response (will be handled as error)
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // If aborted due to timeout and not the last attempt, retry
      if (error.name === 'AbortError' && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Request timeout. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Re-throw the error if it's not a timeout or it's the last attempt
      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Get forex aggregates (OHLC bars) from Polygon.io
 * This is a Convex action that calls the external Polygon.io API
 * Implements exponential backoff retry for rate limiting (429 errors)
 */
export const getForexAggregates = action({
  args: {
    symbol: v.string(), // e.g., "EURUSD"
    timeframe: v.string(), // e.g., "1", "5", "15", "60", "240", "D"
    timespan: v.string(), // e.g., "minute", "hour", "day"
    from: v.string(), // YYYY-MM-DD format
    to: v.string(), // YYYY-MM-DD format
  },
  returns: v.array(
    v.object({
      timestamp: v.number(),
      open: v.number(),
      high: v.number(),
      low: v.number(),
      close: v.number(),
      volume: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const { symbol, timeframe, timespan, from, to } = args;
    const polygonTicker = `C:${symbol}`;

    // IMPORTANT: Convex has a hard limit of 8,192 items in return arrays
    // Limit total bars to 8000 to stay safely under this limit
    const MAX_BARS_LIMIT = 8000;

    // Request limit per page - use 5000 for faster pagination
    // Use sort=desc to get NEWEST bars first, so when we truncate we keep the most recent data
    const url = `${POLYGON_API_BASE}/v2/aggs/ticker/${polygonTicker}/range/${timeframe}/${timespan}/${from}/${to}?adjusted=true&sort=desc&limit=5000&apiKey=${apiKey}`;

    console.log(`[Polygon API] Requesting: ${symbol} ${timeframe}${timespan} from ${from} to ${to}`);

    try {
      const allResults: any[] = [];
      let nextUrl: string | null = url;
      let pageCount = 0;
      const maxPages = 10; // Limit to 10 pages to prevent infinite loops

      // Fetch pages of data until we hit the max bars limit
      while (nextUrl && pageCount < maxPages) {
        pageCount++;

        // Use 8-second timeout with 3 retries
        const response = await fetchWithRetry(nextUrl, 3, 2000, 8000);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Polygon API rate limit exceeded. Free tier allows 5 requests/minute. Please wait a moment and try again, or upgrade your Polygon.io plan."
            );
          }
          // Log full error details for debugging
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.error(`[Polygon API] Request failed: ${response.status} ${response.statusText}`);
          console.error(`[Polygon API] Error details:`, errorText);
          console.error(`[Polygon API] Request URL:`, nextUrl.replace(/apiKey=[^&]+/, 'apiKey=***'));
          throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "ERROR") {
          throw new Error(`Polygon API error: ${data.error || "Unknown error"}`);
        }

        if (data.results && data.results.length > 0) {
          allResults.push(...data.results);
          console.log(`[Polygon API] Page ${pageCount}: Received ${data.results.length} bars (total: ${allResults.length})`);

          // Stop fetching if we've exceeded the limit - we'll truncate later
          if (allResults.length >= MAX_BARS_LIMIT) {
            console.log(`[Polygon API] Reached ${MAX_BARS_LIMIT} bars limit, stopping pagination`);
            break;
          }
        }

        // Check for next page
        nextUrl = data.next_url || null;

        // If there's a next_url, we need to append the API key
        if (nextUrl && !nextUrl.includes('apiKey=')) {
          nextUrl = `${nextUrl}&apiKey=${apiKey}`;
        }
      }

      if (pageCount >= maxPages && nextUrl) {
        console.log("[Polygon API] WARNING: Reached max pages limit, more data may be available");
      }

      // Truncate results if we exceeded the limit (can happen if last page pushed us over)
      // Since we're fetching desc (newest first), truncate keeps the newest bars
      if (allResults.length > MAX_BARS_LIMIT) {
        console.log(`[Polygon API] Truncating ${allResults.length} bars to ${MAX_BARS_LIMIT} to stay under Convex limit`);
        allResults.splice(MAX_BARS_LIMIT);
      }

      console.log(`[Polygon API] Fetched ${allResults.length} total bars across ${pageCount} pages`);

      if (allResults.length === 0) {
        console.log("[Polygon API] No results returned for query:", { symbol, from, to });
        return [];
      }

      // Transform Polygon data to our format
      const transformed = allResults.map((bar: any) => ({
        timestamp: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v || 0,
      }));

      // Reverse array to get ascending order (oldest to newest) since we fetched desc
      // This ensures the chart displays correctly with oldest bars on the left
      return transformed.reverse();
    } catch (error) {
      console.error("Error fetching forex data from Polygon:", error);
      throw error;
    }
  },
});

/**
 * Get the latest price for a forex pair
 */
export const getLatestPrice = action({
  args: {
    symbol: v.string(),
  },
  returns: v.object({
    price: v.number(),
    timestamp: v.optional(v.number()),
    bid: v.optional(v.number()),
    ask: v.optional(v.number()),
    spread: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("POLYGON_API_KEY environment variable not set");
    }

    const polygonTicker = `C:${args.symbol}`;
    const url = `${POLYGON_API_BASE}/v2/last/nbbo/${polygonTicker}?apiKey=${apiKey}`;

    try {
      // Add timeout for latest price request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        throw new Error(`Polygon API error: ${data.error || "Unknown error"}`);
      }

      const result = data.results;

      // Handle missing data gracefully
      if (!result || (!result.P && !result.p)) {
        throw new Error("No price data available");
      }

      const spread = result.P && result.p ? result.P - result.p : undefined;
      const price = result.P && result.p ? (result.P + result.p) / 2 : result.P || result.p;

      return {
        price,
        timestamp: result.t || undefined,
        bid: result.p || undefined,
        ask: result.P || undefined,
        spread,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error("Request timeout while fetching latest price");
      }
      console.error("Error fetching latest price from Polygon:", error);
      throw error;
    }
  },
});


