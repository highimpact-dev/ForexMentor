# Forex Data Fetching Architecture

## Overview

This document explains how ForexMentor fetches and displays forex data from Polygon.io using pagination, date ranges, and real-time updates.

**Last Updated**: October 20, 2025

---

## Data Flow

```
User selects pair/timeframe
    ↓
Frontend (chart/page.tsx) calculates date range
    ↓
Convex Action (forex.ts::getForexAggregates) called
    ↓
Polygon.io REST API (with pagination)
    ↓
Multiple pages fetched and accumulated
    ↓
Data transformed to our format
    ↓
Frontend receives all bars
    ↓
Client-side trims to last 150 bars
    ↓
TradingView Lightweight Charts displays data
```

---

## Key Components

### 1. Date Range Calculation (`lib/chart-config.ts:180-195`)

**Purpose**: Calculate the date range to request from Polygon.io

**Strategy**: Simple 30-day lookback
- Always goes back 30 days from today
- Does NOT try to calculate exact bars needed (market closures make this complex)
- Polygon.io returns all available bars within this range
- Client-side trimming handles excess data

```typescript
export function getDateRange(
  timeframe: TimeframeKey,
  barsToFetch: number = 150
): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0]; // Today (YYYY-MM-DD)

  const daysBack = 30;
  const from = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  return {
    from: from.toISOString().split("T")[0], // 30 days ago
    to,
  };
}
```

**Why 30 days?**
- Ensures we get enough data for all timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- Accounts for weekends when forex markets are closed (Sat/Sun)
- Allows for some extra buffer data

---

### 2. Polygon.io API Integration (`convex/forex.ts`)

#### Action: `getForexAggregates`

**Purpose**: Fetch OHLC (Open, High, Low, Close) candlestick data from Polygon.io

**Critical Discovery**: Polygon.io uses **pagination** for large datasets

**API Endpoint Structure**:
```
https://api.polygon.io/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}?adjusted=true&sort=asc&limit=5000&apiKey={key}
```

**Example**:
```
https://api.polygon.io/v2/aggs/ticker/C:EURUSD/range/1/hour/2025-09-20/2025-10-20?adjusted=true&sort=asc&limit=5000&apiKey=xxx
```

**Parameters**:
- `ticker`: `C:EURUSD` (C: prefix for forex pairs)
- `multiplier`: 1, 5, 15 for minutes; 1, 4 for hours; 1 for days
- `timespan`: "minute", "hour", "day"
- `from/to`: YYYY-MM-DD format
- `limit`: 5000 bars per page (maximum)
- `adjusted`: true (adjust for splits/dividends)
- `sort`: asc (chronological order)

#### Pagination Implementation (`convex/forex.ts:112-177`)

**The Problem We Solved**:
Initially, we only fetched the first page (84 bars from Sept 23-25), missing current data. The API response includes a `next_url` field when more data is available.

**The Solution**:
```typescript
const allResults: any[] = [];
let nextUrl: string | null = url;
let pageCount = 0;
const maxPages = 10; // Safety limit

// Fetch all pages of data
while (nextUrl && pageCount < maxPages) {
  pageCount++;

  const response = await fetchWithRetry(nextUrl, 3, 2000, 8000);

  if (!response.ok) {
    // Handle errors
  }

  const data = await response.json();

  if (data.results && data.results.length > 0) {
    allResults.push(...data.results);
    console.log(`[Polygon API] Page ${pageCount}: Received ${data.results.length} bars (total: ${allResults.length})`);
  }

  // Get next page URL
  nextUrl = data.next_url || null;

  // Append API key to pagination URL
  if (nextUrl && !nextUrl.includes('apiKey=')) {
    nextUrl = `${nextUrl}&apiKey=${apiKey}`;
  }
}

console.log(`[Polygon API] Fetched ${allResults.length} total bars across ${pageCount} pages`);
```

**Key Points**:
- Loops until `next_url` is null (no more pages)
- Accumulates results from all pages into `allResults` array
- Appends API key to pagination URLs (Polygon.io doesn't include it automatically)
- Logs progress for each page: "Page 1: Received 84 bars (total: 84)"
- Safety limit of 10 pages to prevent infinite loops
- Uses exponential backoff retry for timeouts and rate limits

**Typical Pagination Example** (1-hour timeframe, 30 days):
```
Page 1: Received 84 bars (total: 84)
Page 2: Received 83 bars (total: 167)
Page 3: Received 83 bars (total: 250)
Page 4: Received 83 bars (total: 333)
Page 5: Received 83 bars (total: 416)
Page 6: Received 89 bars (total: 505)
Fetched 505 total bars across 7 pages
```

#### Retry Logic with Exponential Backoff (`convex/forex.ts:21-74`)

**Function**: `fetchWithRetry`

**Purpose**: Handle API timeouts and rate limits gracefully

```typescript
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = 8000 // 8 second timeout
): Promise<Response>
```

**Features**:
- 3 retries with exponential backoff (1s, 2s, 4s delays)
- 8-second timeout per request using AbortController
- Handles 429 rate limit errors specifically
- Logs retry attempts: "Rate limited. Retrying in 2000ms (attempt 2/3)..."
- Returns response or throws error after max retries

**Why Important**:
- Polygon.io can have intermittent slowness
- Rate limits on lower-tier plans (5 requests/min on free tier)
- Network timeouts are common with large datasets

---

### 3. Data Transformation (`convex/forex.ts:165-172`)

**Input** (Polygon.io format):
```json
{
  "t": 1698321600000,  // timestamp in milliseconds
  "o": 1.16444,        // open
  "h": 1.16450,        // high
  "l": 1.16440,        // low
  "c": 1.16445,        // close
  "v": 1234            // volume
}
```

**Output** (our format):
```typescript
{
  timestamp: 1698321600000,
  open: 1.16444,
  high: 1.16450,
  low: 1.16440,
  close: 1.16445,
  volume: 1234
}
```

**Transformation**:
```typescript
return allResults.map((bar: any) => ({
  timestamp: bar.t,
  open: bar.o,
  high: bar.h,
  low: bar.l,
  close: bar.c,
  volume: bar.v || 0,
}));
```

---

### 4. Frontend Data Handling (`app/(dashboard)/chart/page.tsx`)

#### Fetching Data

```typescript
const fetchChartData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // Get date range (30 days back)
    const { from, to } = getDateRange(activeTimeframe);
    console.log(`[fetchChartData] Date range: ${from} to ${to}`);

    const timeframeConfig = TIMEFRAMES[activeTimeframe];

    // Call Convex action (which handles pagination internally)
    const data = await fetchForexData({
      symbol: activePair,
      timeframe: timeframeConfig.multiplier.toString(),
      timespan: timeframeConfig.timespan,
      from,
      to,
    });

    // Transform to TradingView format
    const formattedData: CandlestickData[] = data.map((bar) => ({
      time: (bar.timestamp / 1000) as Time, // Convert to seconds
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    // Debug: Log date range of received data
    if (formattedData.length > 0) {
      const firstBar = formattedData[0];
      const lastBar = formattedData[formattedData.length - 1];
      console.log(`[fetchChartData] Received ${formattedData.length} bars`);
      console.log(`[fetchChartData] First bar: ${new Date((firstBar.time as number) * 1000).toISOString()}`);
      console.log(`[fetchChartData] Last bar: ${new Date((lastBar.time as number) * 1000).toISOString()}`);
    }

    // Keep only the last 150 bars (most recent data)
    const barsToShow = 150;
    const recentData = formattedData.length > barsToShow
      ? formattedData.slice(-barsToShow)
      : formattedData;

    setChartData(recentData);
  } catch (err) {
    console.error("Error fetching chart data:", err);
    setError(err instanceof Error ? err.message : "Failed to fetch data");
  } finally {
    setLoading(false);
  }
}, [activePair, activeTimeframe, fetchForexData]);
```

**Key Steps**:
1. Calculate date range (30 days back)
2. Call Convex action with symbol, timeframe, timespan, from, to
3. Convex action handles pagination and returns all bars
4. Transform timestamps from milliseconds to seconds (TradingView format)
5. Log received data for debugging
6. Trim to last 150 bars using `slice(-150)`
7. Update chart state

#### Client-Side Trimming

**Why trim?**
- Polygon.io returns 500+ bars for 30-day range
- We only need last 150 bars to display on chart
- Reduces memory usage and rendering time
- User can scroll back if needed (TradingView handles this)

```typescript
const barsToShow = 150;
const recentData = formattedData.length > barsToShow
  ? formattedData.slice(-barsToShow)  // Take last 150
  : formattedData;                     // Or all if less than 150
```

---

## Current Data Precision

### Problem: 5th Decimal Digit Not Updating

**Current Behavior**: Prices show 4 decimals (1.1644) instead of 5 (1.16444)

**Root Cause**: Polygon.io REST API (`/v2/aggs`) returns limited precision

**Polygon.io Precision by Endpoint**:

| Endpoint | Precision | Real-Time | Use Case |
|----------|-----------|-----------|----------|
| `/v2/aggs` (REST) | 4-5 decimals | Historical | Candlestick charts |
| `/v2/last/nbbo` (REST) | 4-5 decimals | Near real-time | Latest price |
| WebSocket | 5+ decimals | Real-time | Live streaming |

**Decimal Places by Pair**:
- Most pairs (EUR/USD, GBP/USD): 5 decimals (0.00001 = 1 pip)
- JPY pairs (USD/JPY): 2 decimals (0.01 = 1 pip)

**Current Implementation** (`lib/chart-config.ts:133-136`):
```typescript
export function formatPrice(price: number, pipSize: number): string {
  const decimals = pipSize === 0.01 ? 2 : 5;
  return price.toFixed(decimals);
}
```

**Next Steps to Fix**:
1. Investigate if Polygon.io REST API can return 5 decimals
2. Consider using WebSocket for real-time tick updates
3. Or accept 4-decimal precision from REST API for historical data

---

## Real-Time Updates

### Current Polling Strategy (`app/(dashboard)/chart/page.tsx`)

```typescript
useEffect(() => {
  // Initial fetch
  fetchChartData();

  // Poll every 30 seconds
  const interval = setInterval(() => {
    fetchChartData();
  }, 30000);

  return () => clearInterval(interval);
}, [fetchChartData]);
```

**Behavior**:
- Fetches data immediately on page load
- Re-fetches every 30 seconds
- Shows "LIVE (Polling)" badge on chart

**Limitations**:
- 30-second delay means prices can be slightly stale
- REST API calls count against rate limit
- Not true tick-by-tick updates

**Future Enhancement**: WebSocket Integration
- Polygon.io offers WebSocket streaming
- Real-time tick updates (millisecond precision)
- No polling required
- More efficient for live trading

---

## Environment Variables

Required in `.env.local`:

```bash
POLYGON_API_KEY=your_api_key_here
```

**API Tiers**:
- Free: 5 requests/min, delayed data
- Starter: 100 requests/min, near real-time
- Developer: 250 requests/min
- Advanced: 1000 requests/min
- **Current**: Pro plan (no tier found in docs, likely custom)

---

## Debugging Tips

### Console Logs to Watch

**Date Range Calculation**:
```
[fetchChartData] Date range: 2025-09-20 to 2025-10-20
```

**Pagination Progress**:
```
[Polygon API] Page 1: Received 84 bars (total: 84)
[Polygon API] Page 2: Received 83 bars (total: 167)
...
[Polygon API] Fetched 505 total bars across 7 pages
```

**Data Received**:
```
[fetchChartData] Received 505 bars
[fetchChartData] First bar: 2025-09-21T00:00:00.000Z
[fetchChartData] Last bar: 2025-10-19T23:00:00.000Z
```

### Common Issues

**Issue**: Chart shows old data (e.g., September instead of October)
**Cause**: Pagination not working, only fetching first page
**Fix**: Verify `next_url` is being followed in while loop

**Issue**: "No data available"
**Cause**: Date range too narrow or API rate limit
**Fix**: Check date range calculation, verify API key

**Issue**: Request timeout
**Cause**: Slow API response or network issue
**Fix**: Exponential backoff retry handles this automatically

**Issue**: Wrong number of bars
**Cause**: Client-side trimming or pagination cutoff
**Fix**: Check `slice(-150)` logic and `maxPages` limit

---

## Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `convex/forex.ts` | Polygon.io API integration with pagination | 81-178 |
| `lib/chart-config.ts` | Date range calculation and formatting | 180-195 |
| `app/(dashboard)/chart/page.tsx` | Frontend chart component and data fetching | Full file |
| `components/trading/TradingChart.tsx` | TradingView chart rendering | Full file |
| `convex/schema.ts` | Database schema (tradingPairs table) | 146-156 |

---

## Success Metrics

**Working System Should Show**:
- ✅ Console logs with 5-7 pages of pagination
- ✅ 400-600 total bars fetched (depending on timeframe)
- ✅ Chart displays current date (Oct 20, 2025)
- ✅ "LIVE (Polling)" badge visible
- ✅ Price updates every 30 seconds
- ✅ No "WARNING: More data available but not fetched"

**As of Oct 20, 2025**: All metrics passing ✅
