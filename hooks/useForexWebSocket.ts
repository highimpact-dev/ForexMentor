"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface ForexAggregate {
  eventType: string; // "CAS" for per-second aggregates
  pair: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  startTimestamp: number;
  endTimestamp: number;
}

interface UseForexWebSocketOptions {
  symbol: string; // e.g., "EURUSD"
  enabled?: boolean;
  onAggregate?: (aggregate: ForexAggregate) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: "connecting" | "connected" | "disconnected" | "error") => void;
  onSubscriptionError?: (isSubscriptionIssue: boolean) => void;
}

// Use the appropriate WebSocket URL based on subscription tier
// For unlimited tier, use wss://socket.polygon.io
const WS_URL = "wss://socket.polygon.io/forex";
const RECONNECT_DELAY = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useForexWebSocket({
  symbol,
  enabled = true,
  onAggregate,
  onError,
  onStatusChange,
  onSubscriptionError,
}: UseForexWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [lastAggregate, setLastAggregate] = useState<ForexAggregate | null>(null);
  const subscriptionErrorRef = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false); // Prevent concurrent connection attempts
  const consecutiveFailuresRef = useRef<number>(0); // Track consecutive connection failures
  const MAX_CONSECUTIVE_FAILURES = 3; // Give up after 3 failures

  // Update status and notify
  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Clean up function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) return;

    // Don't retry if we've detected a subscription error
    if (subscriptionErrorRef.current) {
      console.log("[WebSocket] Skipping connection due to subscription tier limitation");
      return;
    }

    // Prevent concurrent connection attempts (critical for Polygon.io single-connection limit)
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("[WebSocket] Connection already in progress, skipping...");
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      console.log("[WebSocket] Closing existing connection before reconnecting...");
      wsRef.current.close();
      wsRef.current = null;
    }

    // Get API key from env
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    if (!apiKey) {
      const error = new Error("NEXT_PUBLIC_POLYGON_API_KEY not found");
      console.error(error);
      onError?.(error);
      updateStatus("error");
      return;
    }

    console.log(`[WebSocket] Connecting to ${WS_URL}...`);
    isConnectingRef.current = true;
    updateStatus("connecting");

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected, authenticating...");
        isConnectingRef.current = false;

        // Send authentication
        ws.send(JSON.stringify({
          action: "auth",
          params: apiKey,
        }));
      };

      ws.onmessage = (event) => {
        try {
          console.log("[WebSocket] Raw message:", event.data);
          const messages = JSON.parse(event.data);

          // Handle array of messages
          if (Array.isArray(messages)) {
            messages.forEach((msg: any) => {
              // Handle status messages
              if (msg.ev === "status") {
                console.log(`[WebSocket] Status: ${msg.status} - ${msg.message}`);

                if (msg.status === "auth_success") {
                  updateStatus("connected");
                  consecutiveFailuresRef.current = 0; // Reset failure counter on success
                  console.log("[WebSocket] Authentication successful");

                  // Subscribe to per-second aggregates for the symbol
                  // Format: CAS.{from}/{to} (e.g., CAS.EUR/USD)
                  const formattedSymbol = `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
                  const subscribeParams = `CAS.${formattedSymbol}`;
                  const subscribeMessage = {
                    action: "subscribe",
                    params: subscribeParams,
                  };

                  console.log(`[WebSocket] Subscribing to ${subscribeParams}`);
                  ws.send(JSON.stringify(subscribeMessage));

                  // Start heartbeat
                  heartbeatIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({ action: "ping" }));
                    }
                  }, HEARTBEAT_INTERVAL);
                } else if (msg.status === "auth_failed") {
                  const error = new Error(`Authentication failed: ${msg.message}`);
                  console.error(error);
                  onError?.(error);
                  updateStatus("error");
                } else if (msg.status === "error") {
                  console.error(`[WebSocket] Server error: ${msg.message}`);
                  // Check for multiple connection error
                  if (msg.message && msg.message.includes("max_connections")) {
                    console.error(
                      "[WebSocket] Multiple connections detected!\n" +
                      "Polygon.io Forex only allows ONE simultaneous WebSocket connection.\n" +
                      "Close other tabs/windows with the chart page open."
                    );
                    subscriptionErrorRef.current = true;
                    onSubscriptionError?.(true);
                  }
                  onError?.(new Error(msg.message));
                  updateStatus("error");
                }
              }
              // Handle aggregate data (CAS = Currency Aggregates per Second)
              else if (msg.ev === "CAS") {
                const aggregate: ForexAggregate = {
                  eventType: msg.ev,
                  pair: msg.pair,
                  open: msg.o,
                  close: msg.c,
                  high: msg.h,
                  low: msg.l,
                  volume: msg.v,
                  startTimestamp: msg.s,
                  endTimestamp: msg.e,
                };

                setLastAggregate(aggregate);
                onAggregate?.(aggregate);
              }
            });
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
          onError?.(error as Error);
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error event:", event);
        isConnectingRef.current = false;
        const error = new Error(`WebSocket error: ${event.type}`);
        onError?.(error);
        updateStatus("error");
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Disconnected - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}, Clean: ${event.wasClean}`);
        isConnectingRef.current = false;

        // Check if this is a subscription tier issue or multiple connections
        // Error code 1006 with no reason often indicates connection issues
        if (event.code === 1006 && !event.wasClean) {
          consecutiveFailuresRef.current += 1;

          console.warn(
            `[WebSocket] Connection failed (${consecutiveFailuresRef.current}/${MAX_CONSECUTIVE_FAILURES}) - Code 1006.\n` +
            "Possible causes:\n" +
            "1. Multiple connections: Polygon.io allows only ONE forex WebSocket connection at a time\n" +
            "2. Subscription tier: Verify your plan includes WebSocket access\n" +
            "3. Network/firewall: Check for blocking issues"
          );

          // Only give up after multiple consecutive failures
          if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
            console.error(
              `[WebSocket] Failed ${MAX_CONSECUTIVE_FAILURES} times consecutively. Giving up.\n` +
              "Falling back to REST API polling (5-second updates)."
            );
            subscriptionErrorRef.current = true;
            onSubscriptionError?.(true);
            updateStatus("error");
            return; // Don't attempt to reconnect
          }
        }

        updateStatus("disconnected");

        // Cleanup heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect after delay (only if not permanently disabled)
        if (enabled && !subscriptionErrorRef.current) {
          const attempt = consecutiveFailuresRef.current;
          const delay = Math.min(RECONNECT_DELAY * Math.pow(2, attempt - 1), 30000); // Exponential backoff, max 30s
          console.log(`[WebSocket] Reconnecting in ${delay / 1000}s... (Attempt ${attempt + 1})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      isConnectingRef.current = false;
      onError?.(error as Error);
      updateStatus("error");
    }
  }, [enabled, symbol, onAggregate, onError, updateStatus]);

  // Connect when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      cleanup();
      updateStatus("disconnected");
    }

    return cleanup;
  }, [enabled, connect, cleanup, updateStatus]);

  // Reconnect when symbol changes
  useEffect(() => {
    if (enabled && wsRef.current?.readyState === WebSocket.OPEN) {
      // Unsubscribe from old symbol
      const oldFormattedSymbol = `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
      console.log(`[WebSocket] Unsubscribing from CAS.${oldFormattedSymbol}`);
      wsRef.current.send(JSON.stringify({
        action: "unsubscribe",
        params: `CAS.${oldFormattedSymbol}`,
      }));

      // Subscribe to new symbol
      const newFormattedSymbol = `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
      console.log(`[WebSocket] Subscribing to CAS.${newFormattedSymbol}`);
      wsRef.current.send(JSON.stringify({
        action: "subscribe",
        params: `CAS.${newFormattedSymbol}`,
      }));
    }
  }, [symbol, enabled]);

  return {
    status,
    lastAggregate,
    isConnected: status === "connected",
  };
}
