"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  LineSeries,
  LineData,
  HistogramSeries,
  HistogramData,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { getChartOptions, getCandlestickOptions, TimeframeKey } from "@/lib/chart-config";
import { IndicatorConfig, IndicatorData, DEFAULT_MACD_COLORS } from "@/lib/indicator-types";
import { Drawing, DrawingMode, HorizontalLine, TrendLine, generateDrawingId, DEFAULT_HORIZONTAL_LINE, DEFAULT_TREND_LINE, DRAWING_COLORS } from "@/lib/drawing-types";
import { CrosshairSettings } from "@/lib/chart-settings";
import { Trade, calculateTradeMetrics, calculateCurrentPnL, TRADE_COLORS } from "@/lib/trade-types";
import { CrosshairMode } from "lightweight-charts";

/**
 * Convert our crosshair settings to TradingView chart options
 */
function getCrosshairOptions(settings?: CrosshairSettings) {
  if (!settings) return {};

  return {
    crosshair: {
      mode: settings.mode === "magnet" ? CrosshairMode.Magnet : CrosshairMode.Normal,
      vertLine: {
        visible: settings.verticalLineVisible,
        style: settings.verticalLineStyle,
        width: 1,
        color: settings.verticalLineColor || "#758696",
        labelVisible: true,
      },
      horzLine: {
        visible: settings.horizontalLineVisible,
        style: settings.horizontalLineStyle,
        width: 1,
        color: settings.horizontalLineColor || "#758696",
        labelVisible: true,
      },
    },
  };
}

interface TradingChartProps {
  data: CandlestickData[];
  symbol: string;
  timeframe: TimeframeKey;
  pipSize?: number;
  indicators?: IndicatorConfig[];
  indicatorData?: Map<string, IndicatorData[]>;
  isLoading?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLive?: boolean;
  liveStatus?: "websocket" | "polling" | "disconnected";
  drawingMode?: DrawingMode;
  drawings?: Drawing[];
  onAddDrawing?: (drawing: Drawing) => void;
  crosshairSettings?: CrosshairSettings;
  trades?: Trade[];
  currentPrice?: number;
}

export function TradingChart({
  data,
  symbol,
  timeframe,
  pipSize = 0.0001,
  indicators = [],
  indicatorData = new Map(),
  isLoading = false,
  onLoadMore,
  isLoadingMore = false,
  isLive = false,
  liveStatus = "disconnected",
  drawingMode = "none",
  drawings = [],
  onAddDrawing,
  crosshairSettings,
  trades = [],
  currentPrice = 0,
}: TradingChartProps) {
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const oscillatorChartContainerRef = useRef<HTMLDivElement>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const oscillatorChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const overlayIndicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const oscillatorSeriesRef = useRef<Map<string, ISeriesApi<"Line"> | ISeriesApi<"Histogram">>>(new Map());
  const drawingPriceLinesRef = useRef<Map<string, any>>(new Map());
  const drawingLineSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const trendLineClicksRef = useRef<{ time: number; price: number } | null>(null);
  const tradePriceLinesRef = useRef<Map<string, { entry: any; sl: any; tp: any }>>(new Map());
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = resolvedTheme === "dark";

  // Separate indicators by display type
  const overlayIndicators = indicators.filter((ind) => ind.displayType === "overlay");
  const oscillatorIndicators = indicators.filter((ind) => ind.displayType === "oscillator");
  const hasOscillators = oscillatorIndicators.length > 0;

  // Handle mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize main chart
  useEffect(() => {
    if (!mounted || !mainChartContainerRef.current) return;

    // Create main chart
    const mainChart = createChart(mainChartContainerRef.current, {
      ...getChartOptions(isDark),
      ...getCrosshairOptions(crosshairSettings),
      width: mainChartContainerRef.current.clientWidth,
      height: mainChartContainerRef.current.clientHeight,
    });

    mainChartRef.current = mainChart;

    // Add candlestick series (v5 API)
    const candlestickSeries = mainChart.addSeries(CandlestickSeries, getCandlestickOptions(isDark, pipSize));
    seriesRef.current = candlestickSeries;

    // Handle resize (window and container)
    const handleResize = () => {
      if (mainChartContainerRef.current && mainChartRef.current) {
        mainChartRef.current.applyOptions({
          width: mainChartContainerRef.current.clientWidth,
          height: mainChartContainerRef.current.clientHeight,
        });
      }
    };

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Listen for container resize (sidebar toggle, etc.)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (mainChartContainerRef.current) {
      resizeObserver.observe(mainChartContainerRef.current);
    }

    // Subscribe to visible range changes for lazy loading
    // TEMPORARILY DISABLED - causing infinite loop
    // const timeScale = chart.timeScale();
    // const handleVisibleRangeChange = () => {
    //   if (!onLoadMore || isLoadingMore) return;

    //   const logicalRange = timeScale.getVisibleLogicalRange();
    //   if (!logicalRange) return;

    //   // Check if user scrolled near the left edge (oldest data)
    //   // Trigger load more when within 50 bars of the start
    //   if (logicalRange.from < 50) {
    //     onLoadMore();
    //   }
    // };

    // timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      // timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      mainChart.remove();
      mainChartRef.current = null;
      seriesRef.current = null;
    };
  }, [mounted, isDark, onLoadMore, isLoadingMore, pipSize]);

  // Initialize oscillator chart
  useEffect(() => {
    if (!mounted || !oscillatorChartContainerRef.current || !hasOscillators) return;

    // Create oscillator chart
    const oscillatorChart = createChart(oscillatorChartContainerRef.current, {
      ...getChartOptions(isDark),
      ...getCrosshairOptions(crosshairSettings),
      width: oscillatorChartContainerRef.current.clientWidth,
      height: oscillatorChartContainerRef.current.clientHeight,
    });

    oscillatorChartRef.current = oscillatorChart;

    // Sync time scale with main chart
    if (mainChartRef.current) {
      const mainTimeScale = mainChartRef.current.timeScale();
      const oscillatorTimeScale = oscillatorChart.timeScale();

      // Subscribe to main chart time scale changes
      mainTimeScale.subscribeVisibleLogicalRangeChange((logicalRange) => {
        if (logicalRange) {
          oscillatorTimeScale.setVisibleLogicalRange(logicalRange);
        }
      });

      oscillatorTimeScale.subscribeVisibleLogicalRangeChange((logicalRange) => {
        if (logicalRange) {
          mainTimeScale.setVisibleLogicalRange(logicalRange);
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      if (oscillatorChartContainerRef.current && oscillatorChartRef.current) {
        oscillatorChartRef.current.applyOptions({
          width: oscillatorChartContainerRef.current.clientWidth,
          height: oscillatorChartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (oscillatorChartContainerRef.current) {
      resizeObserver.observe(oscillatorChartContainerRef.current);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      oscillatorChart.remove();
      oscillatorChartRef.current = null;
    };
  }, [mounted, isDark, hasOscillators]);

  // Track the last data length to detect new bars vs updates
  const lastDataLengthRef = useRef(0);

  // Reset the last data length ref when symbol or timeframe changes
  useEffect(() => {
    lastDataLengthRef.current = 0;
  }, [symbol, timeframe]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const currentLength = data.length;
    const hadData = lastDataLengthRef.current > 0;

    // If we have significantly different data (new symbol, timeframe, or initial load)
    // use setData to replace everything
    if (!hadData || Math.abs(currentLength - lastDataLengthRef.current) > 10) {
      seriesRef.current.setData(data);

      // Auto-scale to fit data
      if (mainChartRef.current) {
        mainChartRef.current.timeScale().fitContent();
      }
    }
    // If data length is the same or only 1 bar different, it's a live update
    // Use update() for better performance
    else if (currentLength >= lastDataLengthRef.current) {
      const lastBar = data[data.length - 1];
      seriesRef.current.update(lastBar);
    }
    // If data length decreased, replace everything (shouldn't happen normally)
    else {
      seriesRef.current.setData(data);
    }

    lastDataLengthRef.current = currentLength;
  }, [data]);

  // Manage overlay indicator series (on main chart)
  useEffect(() => {
    if (!mainChartRef.current) return;

    const chart = mainChartRef.current;
    const currentSeries = overlayIndicatorSeriesRef.current;

    // Get current indicator IDs
    const currentIds = Array.from(currentSeries.keys());
    const newIds = overlayIndicators.map((ind) => ind.id);

    // Remove series for indicators that no longer exist
    currentIds.forEach((id) => {
      if (!newIds.includes(id)) {
        const series = currentSeries.get(id);
        if (series) {
          chart.removeSeries(series);
          currentSeries.delete(id);
        }
      }
    });

    // Add or update series for each overlay indicator
    overlayIndicators.forEach((indicator) => {
      const data = indicatorData.get(indicator.id);

      if (!data || data.length === 0) {
        return;
      }

      // Convert data to LineData format (already sorted ascending by API)
      const lineData: LineData[] = data.map((d) => ({
        time: (d.timestamp / 1000) as any,
        value: d.value,
      }));

      let series = currentSeries.get(indicator.id);

      // Create new series if it doesn't exist
      if (!series) {
        series = chart.addSeries(LineSeries, {
          color: indicator.color,
          lineWidth: 2,
          title: indicator.name,
          visible: indicator.visible,
        });
        currentSeries.set(indicator.id, series);
      } else {
        // Update existing series options
        series.applyOptions({
          color: indicator.color,
          title: indicator.name,
          visible: indicator.visible,
        });
      }

      // Update series data
      series.setData(lineData);
    });
  }, [overlayIndicators, indicatorData]);

  // Manage oscillator indicator series (on oscillator chart)
  useEffect(() => {
    if (!oscillatorChartRef.current || !hasOscillators) return;

    const chart = oscillatorChartRef.current;
    const currentSeries = oscillatorSeriesRef.current;

    // Build list of all series IDs we need (including MACD sub-series)
    const neededSeriesIds = new Set<string>();
    oscillatorIndicators.forEach((ind) => {
      if (ind.type === "MACD") {
        neededSeriesIds.add(`${ind.id}_macd`);
        neededSeriesIds.add(`${ind.id}_signal`);
        neededSeriesIds.add(`${ind.id}_histogram`);
      } else {
        neededSeriesIds.add(ind.id);
      }
    });

    // Remove series that are no longer needed
    Array.from(currentSeries.keys()).forEach((id) => {
      if (!neededSeriesIds.has(id)) {
        const series = currentSeries.get(id);
        if (series) {
          chart.removeSeries(series);
          currentSeries.delete(id);
        }
      }
    });

    // Add or update series for each oscillator indicator
    oscillatorIndicators.forEach((indicator) => {
      if (indicator.type === "MACD") {
        // Handle MACD specially - it has three series
        const macdData = indicatorData.get(`${indicator.id}_macd`);
        const signalData = indicatorData.get(`${indicator.id}_signal`);
        const histogramData = indicatorData.get(`${indicator.id}_histogram`);

        // MACD Line (blue)
        if (macdData && macdData.length > 0) {
          const lineData: LineData[] = macdData.map((d) => ({
            time: (d.timestamp / 1000) as any,
            value: d.value,
          }));

          let macdSeries = currentSeries.get(`${indicator.id}_macd`) as ISeriesApi<"Line"> | undefined;
          if (!macdSeries) {
            macdSeries = chart.addSeries(LineSeries, {
              color: DEFAULT_MACD_COLORS.macdLine,
              lineWidth: 2,
              title: "MACD",
              visible: indicator.visible,
              priceFormat: { type: 'price' as const, precision: 4, minMove: 0.0001 },
            });
            currentSeries.set(`${indicator.id}_macd`, macdSeries);
          } else {
            macdSeries.applyOptions({ visible: indicator.visible });
          }
          macdSeries.setData(lineData);
        }

        // Signal Line (orange)
        if (signalData && signalData.length > 0) {
          const lineData: LineData[] = signalData.map((d) => ({
            time: (d.timestamp / 1000) as any,
            value: d.value,
          }));

          let signalSeries = currentSeries.get(`${indicator.id}_signal`) as ISeriesApi<"Line"> | undefined;
          if (!signalSeries) {
            signalSeries = chart.addSeries(LineSeries, {
              color: DEFAULT_MACD_COLORS.signalLine,
              lineWidth: 2,
              title: "Signal",
              visible: indicator.visible,
              priceFormat: { type: 'price' as const, precision: 4, minMove: 0.0001 },
            });
            currentSeries.set(`${indicator.id}_signal`, signalSeries);
          } else {
            signalSeries.applyOptions({ visible: indicator.visible });
          }
          signalSeries.setData(lineData);
        }

        // Histogram (green/red bars)
        if (histogramData && histogramData.length > 0) {
          const histData: HistogramData[] = histogramData.map((d) => ({
            time: (d.timestamp / 1000) as any,
            value: d.value,
            color: d.value >= 0 ? DEFAULT_MACD_COLORS.histogramPositive : DEFAULT_MACD_COLORS.histogramNegative,
          }));

          let histSeries = currentSeries.get(`${indicator.id}_histogram`) as ISeriesApi<"Histogram"> | undefined;
          if (!histSeries) {
            histSeries = chart.addSeries(HistogramSeries, {
              priceFormat: { type: 'price' as const, precision: 4, minMove: 0.0001 },
              visible: indicator.visible,
            });
            currentSeries.set(`${indicator.id}_histogram`, histSeries);
          } else {
            histSeries.applyOptions({ visible: indicator.visible });
          }
          histSeries.setData(histData);
        }
      } else {
        // Handle other oscillators (RSI, etc.) - single line series
        const data = indicatorData.get(indicator.id);

        if (!data || data.length === 0) {
          return;
        }

        const lineData: LineData[] = data.map((d) => ({
          time: (d.timestamp / 1000) as any,
          value: d.value,
        }));

        let series = currentSeries.get(indicator.id) as ISeriesApi<"Line"> | undefined;

        if (!series) {
          series = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth: 2,
            title: indicator.name,
            visible: indicator.visible,
            priceFormat: {
              type: 'price' as const,
              precision: indicator.type === "RSI" ? 2 : 4,
              minMove: indicator.type === "RSI" ? 0.01 : 0.0001,
            },
          });
          currentSeries.set(indicator.id, series);

          // Add reference lines for RSI
          if (indicator.type === "RSI") {
            chart.applyOptions({
              rightPriceScale: {
                scaleMargins: { top: 0.1, bottom: 0.1 },
              },
            });

            const showTitles = indicator.params.showPriceLineTitles ?? true;

            // Add overbought level (default 70)
            const overbought = indicator.params.overbought || 70;
            series.createPriceLine({
              price: overbought,
              color: '#F44336',
              lineWidth: 1,
              lineStyle: 2, // Dashed
              axisLabelVisible: true,
              ...(showTitles && { title: `Overbought (${overbought})` }),
            });

            // Add oversold level (default 30)
            const oversold = indicator.params.oversold || 30;
            series.createPriceLine({
              price: oversold,
              color: '#4CAF50',
              lineWidth: 1,
              lineStyle: 2, // Dashed
              axisLabelVisible: true,
              ...(showTitles && { title: `Oversold (${oversold})` }),
            });

            // Add midline (50) if enabled
            if (indicator.params.showMidline) {
              series.createPriceLine({
                price: 50,
                color: '#9E9E9E',
                lineWidth: 1,
                lineStyle: 3, // Dotted
                axisLabelVisible: true,
                ...(showTitles && { title: 'Midline (50)' }),
              });
            }
          }
        } else {
          series.applyOptions({
            color: indicator.color,
            title: indicator.name,
            visible: indicator.visible,
          });
        }

        series.setData(lineData);
      }
    });
  }, [oscillatorIndicators, indicatorData, hasOscillators]);

  // Update theme when it changes
  useEffect(() => {
    if (mainChartRef.current && seriesRef.current) {
      mainChartRef.current.applyOptions(getChartOptions(isDark));
      seriesRef.current.applyOptions(getCandlestickOptions(isDark, pipSize));
    }

    if (oscillatorChartRef.current) {
      oscillatorChartRef.current.applyOptions(getChartOptions(isDark));
    }
  }, [isDark, pipSize]);

  // Update crosshair settings dynamically
  useEffect(() => {
    if (mainChartRef.current && crosshairSettings) {
      mainChartRef.current.applyOptions(getCrosshairOptions(crosshairSettings));
    }

    if (oscillatorChartRef.current && crosshairSettings) {
      oscillatorChartRef.current.applyOptions(getCrosshairOptions(crosshairSettings));
    }
  }, [crosshairSettings]);

  // Handle drawing mode clicks
  useEffect(() => {
    if (!mainChartRef.current || !seriesRef.current || drawingMode === "none" || !onAddDrawing) return;

    const chart = mainChartRef.current;
    const series = seriesRef.current;

    const handleChartClick = (param: any) => {
      if (!param.point || !param.time) return;

      // Get price at click location
      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      const time = param.time as number;

      if (drawingMode === "horizontal-line") {
        // Create horizontal line drawing
        const newLine: HorizontalLine = {
          ...DEFAULT_HORIZONTAL_LINE,
          id: generateDrawingId("horizontal-line"),
          price,
        };

        onAddDrawing(newLine);
      } else if (drawingMode === "trend-line") {
        // Trend line requires two clicks
        if (!trendLineClicksRef.current) {
          // First click - store the point
          trendLineClicksRef.current = { time, price };
        } else {
          // Second click - create the trend line
          const point1 = trendLineClicksRef.current;
          const point2 = { time, price };

          const newTrendLine: TrendLine = {
            ...DEFAULT_TREND_LINE,
            id: generateDrawingId("trend-line"),
            point1,
            point2,
          };

          onAddDrawing(newTrendLine);
          trendLineClicksRef.current = null; // Reset for next trend line
        }
      }
    };

    chart.subscribeClick(handleChartClick);

    // Change cursor when in drawing mode
    if (mainChartContainerRef.current) {
      mainChartContainerRef.current.style.cursor = "crosshair";
    }

    return () => {
      chart.unsubscribeClick(handleChartClick);
      trendLineClicksRef.current = null; // Reset on mode change
      if (mainChartContainerRef.current) {
        mainChartContainerRef.current.style.cursor = "default";
      }
    };
  }, [drawingMode, onAddDrawing]);

  // Render horizontal line drawings
  useEffect(() => {
    if (!mainChartRef.current || !seriesRef.current) return;

    const series = seriesRef.current;
    const horizontalLines = drawings.filter((d) => d.type === "horizontal-line") as HorizontalLine[];
    const currentPriceLines = drawingPriceLinesRef.current;

    // Get current drawing IDs
    const currentIds = Array.from(currentPriceLines.keys());
    const newIds = horizontalLines.map((line) => line.id);

    // Remove price lines for deleted drawings or recreate if updated
    currentIds.forEach((id) => {
      const priceLine = currentPriceLines.get(id);
      if (priceLine) {
        series.removePriceLine(priceLine);
        currentPriceLines.delete(id);
      }
    });

    // Create/recreate all price lines (this handles both new and updated drawings)
    horizontalLines.forEach((line) => {
      const priceLine = series.createPriceLine({
        price: line.price,
        color: line.color,
        lineWidth: line.lineWidth,
        lineStyle: line.lineStyle,
        axisLabelVisible: true,
        title: line.label || `${line.price.toFixed(5)}`,
      });
      currentPriceLines.set(line.id, priceLine);
    });
  }, [drawings]);

  // Render trend line drawings
  useEffect(() => {
    if (!mainChartRef.current) return;

    const chart = mainChartRef.current;
    const trendLines = drawings.filter((d) => d.type === "trend-line") as TrendLine[];
    const currentLineSeries = drawingLineSeriesRef.current;

    // Get current trend line IDs
    const currentIds = Array.from(currentLineSeries.keys());
    const newIds = trendLines.map((line) => line.id);

    // Remove all existing line series (we'll recreate to handle updates)
    currentIds.forEach((id) => {
      const lineSeries = currentLineSeries.get(id);
      if (lineSeries) {
        chart.removeSeries(lineSeries);
        currentLineSeries.delete(id);
      }
    });

    // Create/recreate all trend lines (handles both new and updated)
    trendLines.forEach((line) => {
      const lineSeries = chart.addSeries(LineSeries, {
        color: line.color,
        lineWidth: line.lineWidth,
        lineStyle: line.lineStyle,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });

      // Ensure points are in ascending time order (required by TradingView)
      const lineData: LineData[] = line.point1.time < line.point2.time
        ? [
            { time: line.point1.time as any, value: line.point1.price },
            { time: line.point2.time as any, value: line.point2.price },
          ]
        : [
            { time: line.point2.time as any, value: line.point2.price },
            { time: line.point1.time as any, value: line.point1.price },
          ];

      lineSeries.setData(lineData);
      currentLineSeries.set(line.id, lineSeries);
    });
  }, [drawings]);

  // Render trade visualizations
  useEffect(() => {
    if (!mainChartRef.current || !seriesRef.current) return;

    const series = seriesRef.current;
    const currentTradeLines = tradePriceLinesRef.current;

    // Remove all existing trade lines
    const currentIds = Array.from(currentTradeLines.keys());
    currentIds.forEach((id) => {
      const lines = currentTradeLines.get(id);
      if (lines) {
        series.removePriceLine(lines.entry);
        series.removePriceLine(lines.sl);
        series.removePriceLine(lines.tp);
        currentTradeLines.delete(id);
      }
    });

    // Create lines for each trade
    trades.forEach((trade) => {
      const metrics = calculateTradeMetrics(
        trade.direction,
        trade.entryPrice,
        trade.stopLoss,
        trade.takeProfit,
        trade.quantity
      );

      const pnl = currentPrice > 0 ? calculateCurrentPnL(
        trade.direction,
        trade.entryPrice,
        currentPrice,
        trade.quantity
      ) : 0;

      // Entry line (blue)
      const entryLine = series.createPriceLine({
        price: trade.entryPrice,
        color: TRADE_COLORS.ENTRY_LINE,
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: `Entry ${trade.entryPrice.toFixed(5)}`,
      });

      // Stop Loss line (red)
      const slLine = series.createPriceLine({
        price: trade.stopLoss,
        color: TRADE_COLORS.LONG_LOSS_BORDER,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `SL ${trade.stopLoss.toFixed(5)} (-${metrics.riskPercentage.toFixed(2)}%)`,
      });

      // Take Profit line (green)
      const tpLine = series.createPriceLine({
        price: trade.takeProfit,
        color: TRADE_COLORS.LONG_PROFIT_BORDER,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `TP ${trade.takeProfit.toFixed(5)} (+${metrics.rewardPercentage.toFixed(2)}%)`,
      });

      currentTradeLines.set(trade.id, {
        entry: entryLine,
        sl: slLine,
        tp: tpLine,
      });
    });
  }, [trades, currentPrice]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col gap-2">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading {symbol} {timeframe} data...</p>
          </div>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border z-10 shadow-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p className="text-xs text-muted-foreground">Loading historical data...</p>
        </div>
      )}

      {/* Live indicator */}
      {isLive && !isLoading && (
        <div className={`absolute top-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border z-10 shadow-lg ${
          liveStatus === "websocket"
            ? "border-green-500/50"
            : liveStatus === "polling"
            ? "border-yellow-500/50"
            : "border-red-500/50"
        }`}>
          <div className={`h-2 w-2 rounded-full ${
            liveStatus === "websocket"
              ? "bg-green-500 animate-pulse"
              : liveStatus === "polling"
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500"
          }`}></div>
          <p className={`text-xs font-medium ${
            liveStatus === "websocket"
              ? "text-green-500"
              : liveStatus === "polling"
              ? "text-yellow-500"
              : "text-red-500"
          }`}>
            {liveStatus === "websocket" ? "LIVE" : liveStatus === "polling" ? "LIVE (Polling)" : "OFFLINE"}
          </p>
        </div>
      )}

      {/* Main price chart */}
      <div
        ref={mainChartContainerRef}
        className={`w-full rounded-lg border border-border ${hasOscillators ? 'h-2/3' : 'h-full'} min-h-[300px] md:min-h-[400px]`}
      />

      {/* Oscillator chart (RSI, MACD, etc.) */}
      {hasOscillators && (
        <div
          ref={oscillatorChartContainerRef}
          className="w-full h-1/3 rounded-lg border border-border min-h-[150px] md:min-h-[200px]"
        />
      )}

      {/* TradingView Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
        Powered by{" "}
        <a
          href="https://www.tradingview.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          TradingView
        </a>
      </div>
    </div>
  );
}
