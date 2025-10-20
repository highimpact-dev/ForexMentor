import { DeepPartial, ChartOptions, ColorType } from "lightweight-charts";

/**
 * Timeframe configuration
 */
export const TIMEFRAMES = {
  "1m": { label: "1m", multiplier: 1, timespan: "minute", display: "1 Minute" },
  "5m": { label: "5m", multiplier: 5, timespan: "minute", display: "5 Minutes" },
  "15m": { label: "15m", multiplier: 15, timespan: "minute", display: "15 Minutes" },
  "1h": { label: "1h", multiplier: 1, timespan: "hour", display: "1 Hour" },
  "4h": { label: "4h", multiplier: 4, timespan: "hour", display: "4 Hours" },
  "1d": { label: "1d", multiplier: 1, timespan: "day", display: "1 Day" },
} as const;

export type TimeframeKey = keyof typeof TIMEFRAMES;

/**
 * Default trading pairs
 */
export const DEFAULT_TRADING_PAIRS = [
  {
    symbol: "EURUSD",
    polygonTicker: "C:EURUSD",
    name: "Euro / US Dollar",
    baseCurrency: "EUR",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    displayOrder: 1,
  },
  {
    symbol: "GBPUSD",
    polygonTicker: "C:GBPUSD",
    name: "British Pound / US Dollar",
    baseCurrency: "GBP",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    displayOrder: 2,
  },
  {
    symbol: "USDJPY",
    polygonTicker: "C:USDJPY",
    name: "US Dollar / Japanese Yen",
    baseCurrency: "USD",
    quoteCurrency: "JPY",
    pipSize: 0.01,
    displayOrder: 3,
  },
  {
    symbol: "USDCHF",
    polygonTicker: "C:USDCHF",
    name: "US Dollar / Swiss Franc",
    baseCurrency: "USD",
    quoteCurrency: "CHF",
    pipSize: 0.0001,
    displayOrder: 4,
  },
  {
    symbol: "AUDUSD",
    polygonTicker: "C:AUDUSD",
    name: "Australian Dollar / US Dollar",
    baseCurrency: "AUD",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    displayOrder: 5,
  },
] as const;

/**
 * Chart theme configuration
 */
export const getChartOptions = (isDark: boolean): DeepPartial<ChartOptions> => ({
  layout: {
    background: { type: ColorType.Solid, color: isDark ? "#0a0a0a" : "#ffffff" },
    textColor: isDark ? "#d1d5db" : "#374151",
  },
  grid: {
    vertLines: { color: isDark ? "#1f1f1f" : "#f3f4f6" },
    horzLines: { color: isDark ? "#1f1f1f" : "#f3f4f6" },
  },
  crosshair: {
    mode: 1, // Normal crosshair
    vertLine: {
      width: 1,
      color: isDark ? "#4b5563" : "#9ca3af",
      style: 3, // Dashed
    },
    horzLine: {
      width: 1,
      color: isDark ? "#4b5563" : "#9ca3af",
      style: 3, // Dashed
    },
  },
  timeScale: {
    borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: true,
  },
  handleScale: {
    axisPressedMouseMove: true,
    mouseWheel: true,
    pinch: true,
  },
});

/**
 * Candlestick series options
 */
export const getCandlestickOptions = (isDark: boolean, pipSize: number = 0.0001) => ({
  upColor: "#10b981", // green-500
  downColor: "#ef4444", // red-500
  borderVisible: false,
  wickUpColor: "#10b981",
  wickDownColor: "#ef4444",
  priceFormat: {
    type: 'price' as const,
    precision: pipSize === 0.01 ? 3 : 5, // JPY pairs use 3 decimals, others use 5
    minMove: pipSize === 0.01 ? 0.001 : 0.00001, // 5th decimal for most pairs, 3rd for JPY
  },
});

/**
 * Format price based on pip size
 * Always shows the 5th decimal for most pairs (or 3rd for JPY pairs)
 */
export function formatPrice(price: number, pipSize: number): string {
  const decimals = pipSize === 0.01 ? 3 : 5;
  return price.toFixed(decimals);
}

/**
 * Calculate pip value for a given pair
 */
export function calculatePips(
  entryPrice: number,
  exitPrice: number,
  pipSize: number,
  direction: "long" | "short"
): number {
  const priceDiff = direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return priceDiff / pipSize;
}

/**
 * Calculate position size based on risk
 * Formula: Position Size = Risk Amount / (Stop Loss Distance in pips × Pip Value)
 */
export function calculatePositionSize(
  riskAmount: number,
  stopLossPips: number,
  pipValue: number = 10 // Default $10 per pip for 1 standard lot
): number {
  if (stopLossPips === 0) return 0;
  return riskAmount / (stopLossPips * pipValue);
}

/**
 * Format timestamp for chart display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get date range for chart data fetch
 * Simply go back N days to get enough bars
 */
export function getDateRange(
  timeframe: TimeframeKey,
  barsToFetch: number = 150
): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0]; // Today

  // Go back 30 days to ensure we get enough bars
  const daysBack = 30;
  const from = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  return {
    from: from.toISOString().split("T")[0],
    to,
  };
}
