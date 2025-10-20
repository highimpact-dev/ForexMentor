/**
 * Types and configuration for technical indicators
 */

export type IndicatorType = "SMA" | "EMA" | "RSI" | "MACD";

export type IndicatorDisplayType = "overlay" | "oscillator";

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  name: string;
  color: string;
  visible: boolean;
  params: IndicatorParams;
  displayType: IndicatorDisplayType;
}

/**
 * Get display type for indicator
 */
export function getIndicatorDisplayType(type: IndicatorType): IndicatorDisplayType {
  if (type === "RSI" || type === "MACD") {
    return "oscillator";
  }
  return "overlay";
}

export interface IndicatorParams {
  period?: number; // For SMA, EMA, RSI
  shortPeriod?: number; // For MACD
  longPeriod?: number; // For MACD
  signalPeriod?: number; // For MACD
  // RSI-specific settings
  overbought?: number; // Default: 70
  oversold?: number; // Default: 30
  showMidline?: boolean; // Default: false
  showPriceLineTitles?: boolean; // Default: true - show titles on price lines
}

export interface IndicatorData {
  timestamp: number;
  value: number;
}

export interface MACDData {
  macd: IndicatorData[];
  signal: IndicatorData[];
  histogram: IndicatorData[];
}

// Colors for MACD components
export interface MACDColors {
  macdLine: string;
  signalLine: string;
  histogramPositive: string;
  histogramNegative: string;
}

export const DEFAULT_MACD_COLORS: MACDColors = {
  macdLine: "#2196F3", // blue
  signalLine: "#FF9800", // orange
  histogramPositive: "#4CAF50", // green
  histogramNegative: "#F44336", // red
};

/**
 * Default indicator configurations
 */
export const DEFAULT_INDICATORS: Record<IndicatorType, Omit<IndicatorConfig, "id" | "visible">> = {
  SMA: {
    type: "SMA",
    name: "SMA (20)",
    color: "#2196F3",
    params: { period: 20 },
    displayType: "overlay",
  },
  EMA: {
    type: "EMA",
    name: "EMA (20)",
    color: "#00BCD4",
    params: { period: 20 },
    displayType: "overlay",
  },
  RSI: {
    type: "RSI",
    name: "RSI (14)",
    color: "#9C27B0",
    params: {
      period: 14,
      overbought: 70,
      oversold: 30,
      showMidline: false,
      showPriceLineTitles: true,
    },
    displayType: "oscillator",
  },
  MACD: {
    type: "MACD",
    name: "MACD (12,26,9)",
    color: "#2196F3",
    params: {
      shortPeriod: 12,
      longPeriod: 26,
      signalPeriod: 9,
    },
    displayType: "oscillator",
  },
};

/**
 * Indicator color options
 */
export const INDICATOR_COLORS = [
  "#2196F3", // blue
  "#00BCD4", // cyan
  "#4CAF50", // green
  "#FF9800", // orange
  "#F44336", // red
  "#9C27B0", // purple
  "#FF5722", // deep orange
  "#3F51B5", // indigo
  "#009688", // teal
  "#FFC107", // amber
];

/**
 * Common indicator periods/presets
 */
export const COMMON_PERIODS = {
  SMA: [10, 20, 50, 100, 200],
  EMA: [9, 12, 20, 26, 50],
  RSI: [14, 21],
  MACD: [
    { short: 12, long: 26, signal: 9 },
    { short: 5, long: 35, signal: 5 },
  ],
};

/**
 * Generate unique indicator ID
 */
export function generateIndicatorId(type: IndicatorType, params: IndicatorParams): string {
  if (type === "MACD") {
    return `${type}_${params.shortPeriod}_${params.longPeriod}_${params.signalPeriod}`;
  }
  return `${type}_${params.period}`;
}

/**
 * Format indicator name with parameters
 */
export function formatIndicatorName(type: IndicatorType, params: IndicatorParams): string {
  if (type === "MACD") {
    return `MACD (${params.shortPeriod},${params.longPeriod},${params.signalPeriod})`;
  }
  return `${type} (${params.period})`;
}
