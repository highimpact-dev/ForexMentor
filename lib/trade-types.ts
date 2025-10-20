/**
 * Types for trade visualization on charts
 */

export type TradeDirection = "long" | "short";
export type TradeStatus = "pending" | "open" | "closed";

export interface Trade {
  id: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: number; // Unix timestamp in seconds
  exitTime?: number;
  exitPrice?: number;
  pnl?: number;
  symbol: string;
}

export interface TradeVisualization extends Trade {
  // Calculated fields for display
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  riskPercentage: number;
  rewardPercentage: number;
}

/**
 * Calculate trade metrics for visualization
 */
export function calculateTradeMetrics(
  direction: TradeDirection,
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  quantity: number
): {
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  riskPercentage: number;
  rewardPercentage: number;
} {
  const risk = Math.abs(entryPrice - stopLoss) * quantity;
  const reward = Math.abs(takeProfit - entryPrice) * quantity;
  const riskRewardRatio = reward / risk;

  const riskPercentage = (Math.abs(entryPrice - stopLoss) / entryPrice) * 100;
  const rewardPercentage = (Math.abs(takeProfit - entryPrice) / entryPrice) * 100;

  return {
    riskAmount: risk,
    rewardAmount: reward,
    riskRewardRatio,
    riskPercentage,
    rewardPercentage,
  };
}

/**
 * Calculate current P&L for an open trade
 */
export function calculateCurrentPnL(
  direction: TradeDirection,
  entryPrice: number,
  currentPrice: number,
  quantity: number
): number {
  if (direction === "long") {
    return (currentPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - currentPrice) * quantity;
  }
}

/**
 * Generate unique trade ID
 */
export function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Color scheme for trade visualization
 */
export const TRADE_COLORS = {
  LONG_PROFIT: "rgba(76, 175, 80, 0.15)", // Semi-transparent green
  LONG_PROFIT_BORDER: "#4CAF50",
  SHORT_PROFIT: "rgba(76, 175, 80, 0.15)",
  SHORT_PROFIT_BORDER: "#4CAF50",
  LONG_LOSS: "rgba(244, 67, 54, 0.15)", // Semi-transparent red
  LONG_LOSS_BORDER: "#F44336",
  SHORT_LOSS: "rgba(244, 67, 54, 0.15)",
  SHORT_LOSS_BORDER: "#F44336",
  ENTRY_LINE: "#2196F3", // Blue for entry
} as const;
