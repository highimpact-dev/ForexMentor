"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TradingChart } from "@/components/trading/TradingChart";
import { ChartControls } from "@/components/trading/ChartControls";
import { TradePanel } from "@/components/trading/TradePanel";
import { IndicatorPanel } from "@/components/trading/IndicatorPanel";
import {
  TimeframeKey,
  TIMEFRAMES,
  DEFAULT_TRADING_PAIRS,
  getDateRange,
} from "@/lib/chart-config";
import { IndicatorConfig, IndicatorData } from "@/lib/indicator-types";
import { Drawing, DrawingMode } from "@/lib/drawing-types";
import { CrosshairSettings, DEFAULT_CROSSHAIR_SETTINGS } from "@/lib/chart-settings";
import { Trade, generateTradeId } from "@/lib/trade-types";
import { CandlestickData } from "lightweight-charts";
import { useForexWebSocket } from "@/hooks/useForexWebSocket";
import { DrawingToolbar } from "@/components/trading/DrawingToolbar";
import { ChartSettings } from "@/components/trading/ChartSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ChartPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("EURUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("1h");
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [useWebSocket, setUseWebSocket] = useState(true);

  // Indicator state
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
  const [indicatorData, setIndicatorData] = useState<Map<string, IndicatorData[]>>(new Map());

  // Drawing tools state
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none");
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  // Chart settings state
  const [crosshairSettings, setCrosshairSettings] = useState<CrosshairSettings>(
    DEFAULT_CROSSHAIR_SETTINGS
  );

  // Trades state
  const [trades, setTrades] = useState<Trade[]>([]);

  // Error dialog state
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onRetry?: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onRetry: undefined,
  });

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<{
    isRetrying: boolean;
    retryAttempt: number;
    totalAttempts: number;
  }>({
    isRetrying: false,
    retryAttempt: 0,
    totalAttempts: 0,
  });

  // Force WebSocket to be enabled on mount
  const hasResetWebSocketRef = useRef(false);
  useEffect(() => {
    if (!hasResetWebSocketRef.current && !useWebSocket) {
      console.log("[ChartPage] Force re-enabling WebSocket");
      hasResetWebSocketRef.current = true;
      setUseWebSocket(true);
    }
  }); // Run on every render until reset happens

  const getForexData = useAction(api.forex.getForexAggregates);
  const getLatestPrice = useAction(api.forex.getLatestPrice);
  const getSMA = useAction(api.indicators.getSMA);
  const getEMA = useAction(api.indicators.getEMA);
  const getRSI = useAction(api.indicators.getRSI);
  const getMACD = useAction(api.indicators.getMACD);
  const oldestTimestampRef = useRef<number | null>(null);
  const liveFeedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket for real-time updates
  const { status: wsStatus, lastAggregate, isConnected: wsConnected } = useForexWebSocket({
    symbol: selectedSymbol,
    enabled: useWebSocket && isLive,
    onAggregate: (aggregate) => {
      // Update current price
      setCurrentPrice(aggregate.close);

      // Update chart data with WebSocket aggregate
      setChartData((prevData) => {
        if (prevData.length === 0) return prevData;

        // Get the timestamp for this aggregate (use start timestamp)
        const aggregateTime = Math.floor(aggregate.startTimestamp / 1000);

        // Get the last bar
        const lastBar = prevData[prevData.length - 1];
        const lastBarTime = lastBar.time as number;

        // Determine if we're in the same timeframe period
        const currentPeriodStart = getTimeframePeriodStart(aggregateTime, selectedTimeframe);
        const lastBarPeriodStart = getTimeframePeriodStart(lastBarTime, selectedTimeframe);

        if (currentPeriodStart === lastBarPeriodStart) {
          // Update the existing bar by merging with the new aggregate
          const updatedBar: CandlestickData = {
            ...lastBar,
            close: aggregate.close,
            high: Math.max(lastBar.high, aggregate.high),
            low: Math.min(lastBar.low, aggregate.low),
          };

          return [...prevData.slice(0, -1), updatedBar];
        } else {
          // Create a new bar for the new period
          const newBar: CandlestickData = {
            time: currentPeriodStart as any,
            open: aggregate.open,
            high: aggregate.high,
            low: aggregate.low,
            close: aggregate.close,
          };

          return [...prevData, newBar];
        }
      });
    },
    onError: (error) => {
      // Only log critical WebSocket errors
    },
    onStatusChange: (status) => {
      // Only log for debugging if needed
    },
    onSubscriptionError: (isSubscriptionIssue) => {
      if (isSubscriptionIssue) {
        setUseWebSocket(false);
      }
    },
  });

  // Manual retry function
  const handleRetryWebSocket = useCallback(() => {
    setUseWebSocket(false); // Disable first
    setTimeout(() => {
      setUseWebSocket(true); // Re-enable after a brief delay to force reconnection
    }, 100);
    // Note: This will only work if you've closed other tabs or fixed the subscription issue
    window.location.reload(); // Reload to reset the WebSocket hook's internal state
  }, []);

  // Get pip size for selected symbol
  const selectedPair = DEFAULT_TRADING_PAIRS.find((p) => p.symbol === selectedSymbol);
  const pipSize = selectedPair?.pipSize || 0.0001;

  // Helper function to get the start of the current timeframe period
  const getTimeframePeriodStart = useCallback((timestamp: number, timeframe: TimeframeKey): number => {
    const date = new Date(timestamp * 1000);
    const timeframeConfig = TIMEFRAMES[timeframe];

    if (timeframeConfig.timespan === "minute") {
      // Round down to the nearest multiple of minutes
      const minutes = date.getMinutes();
      const roundedMinutes = Math.floor(minutes / timeframeConfig.multiplier) * timeframeConfig.multiplier;
      date.setMinutes(roundedMinutes, 0, 0);
    } else if (timeframeConfig.timespan === "hour") {
      // Round down to the nearest multiple of hours
      const hours = date.getHours();
      const roundedHours = Math.floor(hours / timeframeConfig.multiplier) * timeframeConfig.multiplier;
      date.setHours(roundedHours, 0, 0, 0);
    } else if (timeframeConfig.timespan === "day") {
      // Round down to start of day
      date.setHours(0, 0, 0, 0);
    }

    return Math.floor(date.getTime() / 1000);
  }, []);

  // Fetch chart data with retry logic
  const fetchChartData = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;

    setIsLoading(true);
    setHasMoreData(true);
    oldestTimestampRef.current = null;

    // Update connection status
    if (retryCount > 0) {
      setConnectionStatus({
        isRetrying: true,
        retryAttempt: retryCount,
        totalAttempts: maxRetries + 1,
      });
    }

    let willRetry = false;

    try {
      const timeframeConfig = TIMEFRAMES[selectedTimeframe];
      const { from, to } = getDateRange(selectedTimeframe);

      // Only log on first attempt or errors
      if (retryCount === 0) {
        console.log(`[fetchChartData] Fetching ${selectedSymbol} ${selectedTimeframe} data`);
        console.log(`[fetchChartData] Date range: ${from} to ${to}`);
      }

      const data = await getForexData({
        symbol: selectedSymbol,
        timeframe: timeframeConfig.multiplier.toString(),
        timespan: timeframeConfig.timespan,
        from,
        to,
      });

      // Clear connection status on success
      setConnectionStatus({ isRetrying: false, retryAttempt: 0, totalAttempts: 0 });

      // Transform data to TradingView format
      const formattedData: CandlestickData[] = data.map((bar: {
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }) => ({
        time: (bar.timestamp / 1000) as any, // Convert to seconds
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

      if (recentData.length > 0) {
        const firstRecent = recentData[0];
        const lastRecent = recentData[recentData.length - 1];
        console.log(`[fetchChartData] Showing ${recentData.length} bars`);
        console.log(`[fetchChartData] Showing from: ${new Date((firstRecent.time as number) * 1000).toISOString()}`);
        console.log(`[fetchChartData] Showing to: ${new Date((lastRecent.time as number) * 1000).toISOString()}`);
      }

      setChartData(recentData);

      // Track oldest timestamp
      if (recentData.length > 0) {
        const lastBar = recentData[recentData.length - 1];
        setCurrentPrice(lastBar.close);

        const firstBar = recentData[0];
        oldestTimestampRef.current = firstBar.time as number;
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        // Calculate exponential backoff delay: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;

        // Mark that we're going to retry
        willRetry = true;

        // Wait and retry
        setTimeout(() => {
          fetchChartData(retryCount + 1);
        }, delay);
      } else {
        // All retries failed
        console.error("[fetchChartData] All retry attempts failed");
        setIsLive(false); // Disable live updates when data loading fails
        setConnectionStatus({ isRetrying: false, retryAttempt: 0, totalAttempts: 0 });
        setErrorDialog({
          open: true,
          title: "Failed to Load Chart Data",
          message: `Unable to load chart data after ${maxRetries + 1} attempts. Please check your connection and try again.`,
          onRetry: () => {
            setErrorDialog({ ...errorDialog, open: false });
            setIsLive(true);
            fetchChartData(0);
          },
        });
      }
    } finally {
      // Always set loading to false unless we're retrying
      if (!willRetry) {
        setIsLoading(false);
      }
    }
  }, [selectedSymbol, selectedTimeframe, getForexData]);

  // Load more historical data
  const loadMoreData = useCallback(async (retryCount = 0) => {
    if (isLoadingMore || !hasMoreData || !oldestTimestampRef.current) {
      return;
    }

    const maxRetries = 3;
    setIsLoadingMore(true);

    let willRetry = false;

    try {
      const timeframeConfig = TIMEFRAMES[selectedTimeframe];

      // Calculate date range going back from oldest timestamp
      const oldestDate = new Date(oldestTimestampRef.current * 1000);
      const to = oldestDate.toISOString().split("T")[0];

      // Calculate how many days to go back for 500 more bars
      const barsToFetch = 500;
      let daysBack: number;
      switch (selectedTimeframe) {
        case "1m":
          daysBack = Math.ceil((barsToFetch * 1) / (60 * 24)); // 1 minute bars
          break;
        case "5m":
          daysBack = Math.ceil((barsToFetch * 5) / (60 * 24)); // 5 minute bars
          break;
        case "15m":
          daysBack = Math.ceil((barsToFetch * 15) / (60 * 24)); // 15 minute bars
          break;
        case "1h":
          daysBack = Math.ceil((barsToFetch * 1) / 24); // 1 hour bars
          break;
        case "4h":
          daysBack = Math.ceil((barsToFetch * 4) / 24); // 4 hour bars
          break;
        case "1d":
          daysBack = barsToFetch; // 1 day bars
          break;
        default:
          daysBack = 30;
      }

      // Calculate from date by going back from oldest timestamp
      const fromDate = new Date(oldestDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const from = fromDate.toISOString().split("T")[0];

      const data = await getForexData({
        symbol: selectedSymbol,
        timeframe: timeframeConfig.multiplier.toString(),
        timespan: timeframeConfig.timespan,
        from,
        to,
      });

      if (data.length === 0) {
        setHasMoreData(false);
        return;
      }

      // Transform and prepend data
      const formattedData: CandlestickData[] = data.map((bar: {
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }) => ({
        time: (bar.timestamp / 1000) as any,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      }));

      // Prepend new data to existing
      setChartData((prevData) => {
        // Remove duplicates and sort
        const combined = [...formattedData, ...prevData];
        const unique = combined.filter(
          (bar, index, self) =>
            index === self.findIndex((b) => b.time === bar.time)
        );
        return unique.sort((a, b) => (a.time as number) - (b.time as number));
      });

      // Update oldest timestamp
      if (formattedData.length > 0) {
        oldestTimestampRef.current = formattedData[0].time as number;
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        // Calculate exponential backoff delay: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;

        // Mark that we're going to retry
        willRetry = true;

        // Wait and retry
        setTimeout(() => {
          loadMoreData(retryCount + 1);
        }, delay);
      } else {
        // All retries failed
        console.error("[loadMoreData] All retry attempts failed");
        setErrorDialog({
          open: true,
          title: "Failed to Load Historical Data",
          message: `Unable to load more historical data after ${maxRetries + 1} attempts. Please try again later.`,
          onRetry: () => {
            setErrorDialog({ ...errorDialog, open: false });
            loadMoreData(0);
          },
        });
      }
    } finally {
      // Always set loading to false unless we're retrying
      if (!willRetry) {
        setIsLoadingMore(false);
      }
    }
  }, [selectedSymbol, selectedTimeframe, isLoadingMore, hasMoreData, getForexData]);

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    setIsLive(true); // Re-enable live mode when fetching new data
    fetchChartData();
    // Clear indicators when changing symbol/timeframe - user will need to re-add them
    setIndicators([]);
    setIndicatorData(new Map());
  }, [fetchChartData]);

  // Update chart with latest price
  const updateLivePrice = useCallback(async () => {
    if (!isLive || chartData.length === 0) {
      return;
    }

    try {
      const latestData = await getLatestPrice({ symbol: selectedSymbol }).catch(err => {
        return null;
      });

      if (!latestData) return;
      const newPrice = latestData.price;
      const newTimestamp = latestData.timestamp
        ? Math.floor(latestData.timestamp / 1000)
        : Math.floor(Date.now() / 1000); // Fallback to current time if no timestamp

      setCurrentPrice(newPrice);

      setChartData((prevData) => {
        if (prevData.length === 0) {
          return prevData;
        }

        // Get the last bar
        const lastBar = prevData[prevData.length - 1];
        const lastBarTime = lastBar.time as number;

        // Determine if we're in the same timeframe period
        const currentPeriodStart = getTimeframePeriodStart(newTimestamp, selectedTimeframe);
        const lastBarPeriodStart = getTimeframePeriodStart(lastBarTime, selectedTimeframe);

        if (currentPeriodStart === lastBarPeriodStart) {
          // Update the existing bar
          const updatedBar: CandlestickData = {
            ...lastBar,
            close: newPrice,
            high: Math.max(lastBar.high, newPrice),
            low: Math.min(lastBar.low, newPrice),
          };

          return [...prevData.slice(0, -1), updatedBar];
        } else {
          // Create a new bar for the new period
          const newBar: CandlestickData = {
            time: currentPeriodStart as any,
            open: newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
          };

          return [...prevData, newBar];
        }
      });
    } catch (error) {
      // Silently handle price update errors - they'll retry
    }
  }, [isLive, chartData.length, getLatestPrice, selectedSymbol, getTimeframePeriodStart, selectedTimeframe]);

  // Set up live price feed (polling fallback when WebSocket is not connected)
  useEffect(() => {
    // Only use polling if live is enabled AND WebSocket is not connected
    const shouldPoll = isLive && (!useWebSocket || !wsConnected);

    if (!shouldPoll) {
      if (liveFeedIntervalRef.current) {
        clearInterval(liveFeedIntervalRef.current);
        liveFeedIntervalRef.current = null;
      }
      return;
    }

    // Initial update
    updateLivePrice();

    // Set up interval for live updates (every 5 seconds)
    liveFeedIntervalRef.current = setInterval(() => {
      updateLivePrice();
    }, 5000);

    return () => {
      if (liveFeedIntervalRef.current) {
        clearInterval(liveFeedIntervalRef.current);
        liveFeedIntervalRef.current = null;
      }
    };
  }, [isLive, useWebSocket, wsConnected, updateLivePrice]);

  // Handle trade execution
  const handleTrade = useCallback((tradeParams: {
    direction: "long" | "short";
    quantity: number;
    stopLoss: number;
    takeProfit: number;
  }) => {
    const newTrade: Trade = {
      id: generateTradeId(),
      symbol: selectedSymbol,
      direction: tradeParams.direction,
      status: "open",
      entryPrice: currentPrice,
      quantity: tradeParams.quantity,
      stopLoss: tradeParams.stopLoss,
      takeProfit: tradeParams.takeProfit,
      entryTime: Math.floor(Date.now() / 1000),
    };

    console.log("Trade executed:", newTrade);
    setTrades((prev) => [...prev, newTrade]);

    // TODO: Implement trade execution via Convex mutation
    // This will be connected to the trades table in the schema
  }, [selectedSymbol, currentPrice]);

  // Indicator handlers
  const handleAddIndicator = useCallback(async (indicator: IndicatorConfig) => {
    // Add indicator to list
    setIndicators((prev) => [...prev, indicator]);

    // Fetch indicator data
    try {
      const timeframeConfig = TIMEFRAMES[selectedTimeframe];

      // Calculate how many extra bars we need for the indicator to have enough lookback
      let maxPeriod = 0;
      if (indicator.type === "MACD") {
        maxPeriod = Math.max(
          indicator.params.longPeriod || 26,
          indicator.params.signalPeriod || 9
        );
      } else {
        maxPeriod = indicator.params.period || 20;
      }

      // Use the chart's actual date range (if we have chart data)
      let from: string;
      let to: string;

      if (chartData.length > 0) {
        // Get the date range from existing chart data and extend backwards for lookback
        const oldestBar = chartData[0];
        const newestBar = chartData[chartData.length - 1];

        // Convert timestamps to dates
        const oldestDate = new Date((oldestBar.time as number) * 1000);
        const newestDate = new Date((newestBar.time as number) * 1000);

        // Extend backwards by the indicator period
        let daysBack = 0;
        switch (selectedTimeframe) {
          case "1m":
            daysBack = Math.ceil((maxPeriod * 1) / (60 * 24));
            break;
          case "5m":
            daysBack = Math.ceil((maxPeriod * 5) / (60 * 24));
            break;
          case "15m":
            daysBack = Math.ceil((maxPeriod * 15) / (60 * 24));
            break;
          case "1h":
            daysBack = Math.ceil((maxPeriod * 1) / 24);
            break;
          case "4h":
            daysBack = Math.ceil((maxPeriod * 4) / 24);
            break;
          case "1d":
            daysBack = maxPeriod;
            break;
        }

        const extendedFromDate = new Date(oldestDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
        from = extendedFromDate.toISOString().split("T")[0];
        to = newestDate.toISOString().split("T")[0];
      } else {
        // Fallback: use default date range
        const barsToFetch = 500 + maxPeriod;
        const dateRange = getDateRange(selectedTimeframe, barsToFetch);
        from = dateRange.from;
        to = dateRange.to;
      }

      let data: IndicatorData[] = [];

      if (indicator.type === "SMA") {
        data = await getSMA({
          symbol: selectedSymbol,
          timespan: timeframeConfig.timespan,
          window: indicator.params.period!,
          from,
          to,
        });
      } else if (indicator.type === "EMA") {
        data = await getEMA({
          symbol: selectedSymbol,
          timespan: timeframeConfig.timespan,
          window: indicator.params.period!,
          from,
          to,
        });
      } else if (indicator.type === "RSI") {
        data = await getRSI({
          symbol: selectedSymbol,
          timespan: timeframeConfig.timespan,
          window: indicator.params.period!,
          from,
          to,
        });
      } else if (indicator.type === "MACD") {
        const macdData = await getMACD({
          symbol: selectedSymbol,
          timespan: timeframeConfig.timespan,
          shortWindow: indicator.params.shortPeriod!,
          longWindow: indicator.params.longPeriod!,
          signalWindow: indicator.params.signalPeriod!,
          from,
          to,
        });

        // Store all three MACD components separately
        setIndicatorData((prev) => {
          const newMap = new Map(prev);
          // Store each MACD component with a suffix
          newMap.set(`${indicator.id}_macd`, macdData.macd);
          newMap.set(`${indicator.id}_signal`, macdData.signal);
          newMap.set(`${indicator.id}_histogram`, macdData.histogram);
          return newMap;
        });
        return; // Early return since we handled MACD specially
      }

      // Update indicator data (for non-MACD indicators)
      setIndicatorData((prev) => {
        const newMap = new Map(prev);
        newMap.set(indicator.id, data);
        return newMap;
      });
    } catch (error) {
      console.error("Error fetching indicator data:", error);
      setErrorDialog({
        open: true,
        title: "Failed to Load Indicator",
        message: "Unable to load indicator data. Please try again.",
        onRetry: () => {
          setErrorDialog({ ...errorDialog, open: false });
          handleAddIndicator(indicator);
        },
      });
      // Remove indicator from list if fetch failed
      setIndicators((prev) => prev.filter((ind) => ind.id !== indicator.id));
    }
  }, [selectedSymbol, selectedTimeframe, chartData, getSMA, getEMA, getRSI, getMACD]);

  const handleRemoveIndicator = useCallback((id: string) => {
    const indicator = indicators.find((ind) => ind.id === id);
    setIndicators((prev) => prev.filter((ind) => ind.id !== id));
    setIndicatorData((prev) => {
      const newMap = new Map(prev);
      // For MACD, remove all three series
      if (indicator?.type === "MACD") {
        newMap.delete(`${id}_macd`);
        newMap.delete(`${id}_signal`);
        newMap.delete(`${id}_histogram`);
      } else {
        newMap.delete(id);
      }
      return newMap;
    });
  }, [indicators]);

  const handleToggleIndicator = useCallback((id: string) => {
    setIndicators((prev) =>
      prev.map((ind) =>
        ind.id === id ? { ...ind, visible: !ind.visible } : ind
      )
    );
  }, []);

  const handleUpdateIndicator = useCallback((id: string, updates: Partial<IndicatorConfig>) => {
    setIndicators((prev) =>
      prev.map((ind) =>
        ind.id === id ? { ...ind, ...updates } : ind
      )
    );
  }, []);

  // Drawing handlers
  const handleDrawingModeChange = useCallback((mode: DrawingMode) => {
    setDrawingMode(mode);
  }, []);

  const handleAddDrawing = useCallback((drawing: Drawing) => {
    setDrawings((prev) => [...prev, drawing]);
    setDrawingMode("none"); // Exit drawing mode after adding
  }, []);

  const handleDeleteDrawing = useCallback((id: string) => {
    setDrawings((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleUpdateDrawing = useCallback((id: string, updates: Partial<Drawing>) => {
    setDrawings((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const handleClearAllDrawings = useCallback(() => {
    if (drawings.length > 0 && confirm(`Delete all ${drawings.length} drawings?`)) {
      setDrawings([]);
    }
  }, [drawings.length]);

  // Crosshair settings handler
  const handleUpdateCrosshair = useCallback((settings: CrosshairSettings) => {
    setCrosshairSettings(settings);
  }, []);

  // Calculate live status
  const liveStatus = useWebSocket && wsConnected
    ? "websocket"
    : isLive
    ? "polling"
    : "disconnected";

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-var(--header-height)-2rem)]">
      {/* Connection Status Indicator */}
      {connectionStatus.isRetrying && (
        <div className="bg-yellow-600/20 border-l-4 border-yellow-600 px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent" />
            <span className="text-yellow-600 font-medium">
              Reconnecting... Attempt {connectionStatus.retryAttempt} of {connectionStatus.totalAttempts}
            </span>
          </div>
        </div>
      )}

      {/* Header with controls */}
      <ChartControls
        selectedSymbol={selectedSymbol}
        selectedTimeframe={selectedTimeframe}
        onSymbolChange={setSelectedSymbol}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Indicator Panel */}
      <IndicatorPanel
        indicators={indicators}
        onAddIndicator={handleAddIndicator}
        onRemoveIndicator={handleRemoveIndicator}
        onToggleIndicator={handleToggleIndicator}
        onUpdateIndicator={handleUpdateIndicator}
      />

      {/* Drawing Toolbar */}
      <DrawingToolbar
        drawingMode={drawingMode}
        drawings={drawings}
        onModeChange={handleDrawingModeChange}
        onDeleteDrawing={handleDeleteDrawing}
        onUpdateDrawing={handleUpdateDrawing}
        onClearAllDrawings={handleClearAllDrawings}
      />

      {/* Chart Settings */}
      <ChartSettings
        crosshairSettings={crosshairSettings}
        onUpdateCrosshair={handleUpdateCrosshair}
      />

      {/* Main content area - stacks vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col lg:flex-row lg:flex-1 gap-4 lg:min-h-0 lg:overflow-hidden pb-4 lg:pb-0">
        {/* Chart area - takes most of the space */}
        <div className="flex-1 h-[50vh] lg:h-auto lg:min-h-0 min-w-0">
          <TradingChart
            data={chartData}
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            pipSize={pipSize}
            indicators={indicators}
            indicatorData={indicatorData}
            isLoading={isLoading}
            onLoadMore={loadMoreData}
            isLoadingMore={isLoadingMore}
            isLive={isLive}
            liveStatus={liveStatus}
            drawingMode={drawingMode}
            drawings={drawings}
            onAddDrawing={handleAddDrawing}
            crosshairSettings={crosshairSettings}
            trades={trades}
            currentPrice={currentPrice}
          />
        </div>

        {/* Trade panel - full width on mobile, fixed width on desktop */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:overflow-y-auto">
          <TradePanel
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            pipSize={pipSize}
            accountBalance={10000}
            onTrade={handleTrade}
          />
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.title}</DialogTitle>
            <DialogDescription>{errorDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            {errorDialog.onRetry && (
              <Button variant="default" onClick={errorDialog.onRetry}>
                Retry
              </Button>
            )}
            <Button
              variant={errorDialog.onRetry ? "outline" : "default"}
              onClick={() => setErrorDialog({ ...errorDialog, open: false })}
            >
              {errorDialog.onRetry ? "Cancel" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
