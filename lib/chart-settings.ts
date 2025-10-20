/**
 * Chart display settings
 */

export type CrosshairMode = "normal" | "magnet";

export interface CrosshairSettings {
  mode: CrosshairMode; // "normal" = follow cursor, "magnet" = snap to price
  verticalLineVisible: boolean;
  horizontalLineVisible: boolean;
  verticalLineStyle: 0 | 1 | 2 | 3 | 4; // 0=solid, 2=dashed, 3=dotted, 4=large dashed
  horizontalLineStyle: 0 | 1 | 2 | 3 | 4;
  verticalLineColor?: string;
  horizontalLineColor?: string;
}

export const DEFAULT_CROSSHAIR_SETTINGS: CrosshairSettings = {
  mode: "magnet", // Snap to price by default
  verticalLineVisible: true,
  horizontalLineVisible: true,
  verticalLineStyle: 2, // Dashed
  horizontalLineStyle: 2, // Dashed
};

export const LINE_STYLE_OPTIONS = [
  { value: 0, label: "Solid" },
  { value: 2, label: "Dashed" },
  { value: 3, label: "Dotted" },
  { value: 4, label: "Large Dashed" },
] as const;
