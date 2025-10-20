/**
 * Types for chart drawing tools
 */

export type DrawingMode = "none" | "horizontal-line" | "trend-line";

export interface Point {
  time: number; // Unix timestamp in seconds
  price: number;
}

export interface BaseDrawing {
  id: string;
  color: string;
  lineWidth: number;
  lineStyle: 0 | 1 | 2 | 3 | 4; // 0=solid, 1=dotted, 2=dashed, 3=large dashed, 4=sparse dotted
  label?: string;
}

export interface HorizontalLine extends BaseDrawing {
  type: "horizontal-line";
  price: number;
}

export interface TrendLine extends BaseDrawing {
  type: "trend-line";
  point1: Point;
  point2: Point;
  extend?: boolean; // Extend line beyond endpoints
}

export type Drawing = HorizontalLine | TrendLine;

/**
 * Default drawing colors
 */
export const DRAWING_COLORS = [
  "#2196F3", // blue
  "#F44336", // red
  "#4CAF50", // green
  "#FF9800", // orange
  "#9C27B0", // purple
  "#00BCD4", // cyan
  "#FFC107", // amber
  "#795548", // brown
];

/**
 * Line style options (matches TradingView LineStyle enum)
 */
export const LINE_STYLES = {
  SOLID: 0,
  DOTTED: 1,
  DASHED: 2,
  LARGE_DASHED: 3,
  SPARSE_DOTTED: 4,
} as const;

/**
 * Generate unique drawing ID
 */
export function generateDrawingId(type: Drawing["type"]): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default drawing configurations
 */
export const DEFAULT_HORIZONTAL_LINE: Omit<HorizontalLine, "id" | "price"> = {
  type: "horizontal-line",
  color: "#2196F3",
  lineWidth: 2,
  lineStyle: LINE_STYLES.SOLID,
};

export const DEFAULT_TREND_LINE: Omit<TrendLine, "id" | "point1" | "point2"> = {
  type: "trend-line",
  color: "#2196F3",
  lineWidth: 2,
  lineStyle: LINE_STYLES.SOLID,
  extend: false,
};
