import { DeepPartial, ChartOptions, ColorType } from "lightweight-charts";

/**
 * Timeframe configuration
 */
export const TIMEFRAMES = {
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
 * Get the actual computed background color from the theme
 */
function getThemeBackgroundColor(): string {
  if (typeof window === 'undefined') return '';

  // Get the computed background color from the body or root element
  const bgColor = getComputedStyle(document.body).backgroundColor;

  // If we got a valid color, return it
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    return bgColor;
  }

  return '';
}

/**
 * Convert rgb/rgba string to hex
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return rgb;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Get theme colors with fallback
 */
function getThemeColors(isDark: boolean) {
  // Try to get the actual background color from the DOM
  const bgColor = getThemeBackgroundColor();

  if (bgColor) {
    const hexBg = bgColor.startsWith('rgb') ? rgbToHex(bgColor) : bgColor;

    // Calculate derived colors based on the background
    // For dark mode, lighten the background for grid lines
    // For light mode, darken slightly
    return {
      background: hexBg,
      gridLines: isDark ? '#1a1a2e' : '#f1f1f1',
      text: isDark ? '#b3b3c2' : '#2b2b3d',
      borderColor: isDark ? '#2a2a3e' : '#e0e0e0',
    };
  }

  // Fallback if we can't read from DOM
  return {
    background: isDark ? '#0d0d1a' : '#ffffff',
    gridLines: isDark ? '#1a1a2e' : '#f1f1f1',
    text: isDark ? '#b3b3c2' : '#2b2b3d',
    borderColor: isDark ? '#2a2a3e' : '#e0e0e0',
  };
}

/**
 * Chart theme configuration
 */
export const getChartOptions = (isDark: boolean): DeepPartial<ChartOptions> => {
  const colors = getThemeColors(isDark);

  return {
    layout: {
      background: { type: ColorType.Solid, color: colors.background },
      textColor: colors.text,
    },
    grid: {
      vertLines: { color: colors.gridLines },
      horzLines: { color: colors.gridLines },
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
      borderColor: colors.borderColor,
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      borderColor: colors.borderColor,
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
  };
};

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
 * Calculate days back based on timeframe and desired number of bars
 *
 * IMPORTANT: Convex has a hard limit of 8,192 items in return arrays
 * So we cap bars to ~7500-8000 to stay under the limit while maximizing data
 */
export function getDateRange(
  timeframe: TimeframeKey,
  barsToFetch: number = 7500 // Fetch close to Convex's 8192 limit for max historical data
): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0]; // Today in UTC (Polygon accepts future dates)

  // Ensure we don't exceed Convex's array limit of 8,192
  const maxBars = 8000; // Leave small buffer under 8192
  const safeBarsToFetch = Math.min(barsToFetch, maxBars);

  // Calculate days back based on timeframe to get the requested number of bars
  let daysBack: number;

  switch (timeframe) {
    case "1m":
      // 1 minute bars: ~1440 bars per day (24 * 60)
      // 7500 bars = ~5.2 days
      daysBack = Math.ceil(safeBarsToFetch / 1440);
      break;
    case "5m":
      // 5 minute bars: ~288 bars per day (24 * 60 / 5)
      // 7500 bars = ~26 days
      daysBack = Math.ceil(safeBarsToFetch / 288);
      break;
    case "15m":
      // 15 minute bars: ~96 bars per day (24 * 60 / 15)
      // 7500 bars = ~78 days (~2.5 months)
      daysBack = Math.ceil(safeBarsToFetch / 96);
      break;
    case "1h":
      // 1 hour bars: 24 bars per day
      // 7500 bars = 312 days (~10 months)
      daysBack = Math.ceil(safeBarsToFetch / 24);
      break;
    case "4h":
      // 4 hour bars: 6 bars per day
      // 7500 bars = 1250 days (~3.4 years)
      daysBack = Math.ceil(safeBarsToFetch / 6);
      break;
    case "1d":
      // Daily bars: 1 bar per day
      // 7500 bars = ~20.5 years (capped at 2 years below)
      daysBack = safeBarsToFetch;
      break;
    default:
      daysBack = 365; // Default to 1 year
  }

  // Cap at 3.5 years maximum - this allows 4h charts to fetch max bars while staying under Convex limit
  // For 4h timeframe: 7500 bars / 6 bars per day = 1250 days (~3.4 years)
  const maxDaysBack = 1300; // ~3.5 years
  daysBack = Math.min(daysBack, maxDaysBack);

  const fromDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const from = fromDate.toISOString().split("T")[0];

  return {
    from,
    to,
  };
}
