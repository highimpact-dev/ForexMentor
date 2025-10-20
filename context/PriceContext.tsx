"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForexWebSocket } from "@/hooks/useForexWebSocket";

interface PriceData {
  [symbol: string]: number;
}

interface PriceContextValue {
  prices: PriceData;
  getPrice: (symbol: string) => number;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
}

const PriceContext = createContext<PriceContextValue | undefined>(undefined);

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceData>({});
  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(new Set());
  const getLatestPrice = useAction(api.forex.getLatestPrice);

  // Subscribe to a symbol - memoized to prevent infinite loops
  const subscribeToSymbol = useCallback((symbol: string) => {
    setSubscribedSymbols((prev) => {
      const newSet = new Set(prev);
      newSet.add(symbol);
      return newSet;
    });
  }, []);

  // Unsubscribe from a symbol - memoized to prevent infinite loops
  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    setSubscribedSymbols((prev) => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  }, []);

  // Get price for a symbol (returns 0 if not available) - memoized
  const getPrice = useCallback((symbol: string) => {
    return prices[symbol] || 0;
  }, [prices]);

  // Poll prices for subscribed symbols
  useEffect(() => {
    if (subscribedSymbols.size === 0) return;

    const updatePrices = async () => {
      const symbolArray = Array.from(subscribedSymbols);

      // Fetch prices for all subscribed symbols
      const pricePromises = symbolArray.map(async (symbol) => {
        try {
          const latestData = await getLatestPrice({ symbol });
          return { symbol, price: latestData.price };
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return { symbol, price: 0 };
        }
      });

      const results = await Promise.all(pricePromises);

      // Update prices state
      setPrices((prev) => {
        const newPrices = { ...prev };
        results.forEach(({ symbol, price }) => {
          if (price > 0) {
            newPrices[symbol] = price;
          }
        });
        return newPrices;
      });
    };

    // Initial update
    updatePrices();

    // Poll every 5 seconds
    const interval = setInterval(updatePrices, 5000);

    return () => clearInterval(interval);
  }, [subscribedSymbols, getLatestPrice]);

  return (
    <PriceContext.Provider
      value={{
        prices,
        getPrice,
        subscribeToSymbol,
        unsubscribeFromSymbol,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrice must be used within a PriceProvider");
  }
  return context;
}
