import { CandlestickData } from "lightweight-charts";

/**
 * Indicator calculation utilities for technical analysis
 */

export interface IndicatorData {
  time: number;
  value: number;
}

/**
 * Simple Moving Average (SMA)
 * @param data - Candlestick data
 * @param period - Number of periods (default: 20)
 * @returns Array of indicator data points
 */
export function calculateSMA(
  data: CandlestickData[],
  period: number = 20
): IndicatorData[] {
  if (data.length < period) return [];

  const result: IndicatorData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;
    result.push({
      time: data[i].time as number,
      value: sma,
    });
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 * @param data - Candlestick data
 * @param period - Number of periods (default: 20)
 * @returns Array of indicator data points
 */
export function calculateEMA(
  data: CandlestickData[],
  period: number = 20
): IndicatorData[] {
  if (data.length < period) return [];

  const result: IndicatorData[] = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA as the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  result.push({
    time: data[period - 1].time as number,
    value: ema,
  });

  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      time: data[i].time as number,
      value: ema,
    });
  }

  return result;
}

/**
 * Bollinger Bands
 * @param data - Candlestick data
 * @param period - Number of periods (default: 20)
 * @param stdDev - Standard deviation multiplier (default: 2)
 * @returns Object with upper, middle, and lower bands
 */
export function calculateBollingerBands(
  data: CandlestickData[],
  period: number = 20,
  stdDev: number = 2
): {
  upper: IndicatorData[];
  middle: IndicatorData[];
  lower: IndicatorData[];
} {
  if (data.length < period) {
    return { upper: [], middle: [], lower: [] };
  }

  const upper: IndicatorData[] = [];
  const middle: IndicatorData[] = [];
  const lower: IndicatorData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA (middle band)
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;

    // Calculate standard deviation
    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j].close - sma, 2);
    }
    const standardDeviation = Math.sqrt(variance / period);

    const time = data[i].time as number;
    middle.push({ time, value: sma });
    upper.push({ time, value: sma + stdDev * standardDeviation });
    lower.push({ time, value: sma - stdDev * standardDeviation });
  }

  return { upper, middle, lower };
}

/**
 * Relative Strength Index (RSI)
 * @param data - Candlestick data
 * @param period - Number of periods (default: 14)
 * @returns Array of indicator data points (0-100 scale)
 */
export function calculateRSI(
  data: CandlestickData[],
  period: number = 14
): IndicatorData[] {
  if (data.length < period + 1) return [];

  const result: IndicatorData[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate initial gains and losses
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Calculate RSI for first data point
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  result.push({
    time: data[period].time as number,
    value: rsi,
  });

  // Calculate smoothed RSI for remaining data points
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i + 1].time as number,
      value: rsi,
    });
  }

  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * @param data - Candlestick data
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns Object with MACD line, signal line, and histogram
 */
export function calculateMACD(
  data: CandlestickData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: IndicatorData[];
  signal: IndicatorData[];
  histogram: IndicatorData[];
} {
  if (data.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Calculate MACD line (fast - slow)
  const macdLine: IndicatorData[] = [];
  const startIndex = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push({
      time: slowEMA[i].time,
      value: fastEMA[i + startIndex].value - slowEMA[i].value,
    });
  }

  // Calculate signal line (EMA of MACD)
  const signalLine: IndicatorData[] = [];
  const multiplier = 2 / (signalPeriod + 1);

  // Initial SMA for signal line
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdLine[i].value;
  }
  let ema = sum / signalPeriod;
  signalLine.push({
    time: macdLine[signalPeriod - 1].time,
    value: ema,
  });

  // Calculate signal line EMA
  for (let i = signalPeriod; i < macdLine.length; i++) {
    ema = (macdLine[i].value - ema) * multiplier + ema;
    signalLine.push({
      time: macdLine[i].time,
      value: ema,
    });
  }

  // Calculate histogram (MACD - Signal)
  const histogram: IndicatorData[] = [];
  const histogramStart = signalPeriod - 1;
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push({
      time: signalLine[i].time,
      value: macdLine[i + histogramStart].value - signalLine[i].value,
    });
  }

  return {
    macd: macdLine.slice(histogramStart),
    signal: signalLine,
    histogram,
  };
}

/**
 * Get indicator color by name
 */
export function getIndicatorColor(name: string): string {
  const colors: Record<string, string> = {
    "SMA 20": "#2196F3", // blue
    "SMA 50": "#FF9800", // orange
    "SMA 200": "#9C27B0", // purple
    "EMA 12": "#00BCD4", // cyan
    "EMA 26": "#FF5722", // deep orange
    "BB Upper": "#4CAF50", // green
    "BB Middle": "#2196F3", // blue
    "BB Lower": "#F44336", // red
    RSI: "#9C27B0", // purple
    MACD: "#2196F3", // blue
    Signal: "#FF9800", // orange
    Histogram: "#4CAF50", // green
  };

  return colors[name] || "#888888";
}
