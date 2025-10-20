"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CompactTradeCard } from "./CompactTradeCard";
import { Card } from "@/components/ui/card";

interface TradeListProps {
  symbol: string;
  currentPrice: number;
}

export function TradeList({ symbol, currentPrice }: TradeListProps) {
  const trades = useQuery(api.trades.getOpenTradesForSymbol, { symbol });

  if (!trades) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Loading trades...</div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground text-center">
          No active trades for {symbol}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Active Trades ({trades.length})
      </div>
      <div className="space-y-2">
        {trades.map((trade) => (
          <CompactTradeCard
            key={trade._id}
            trade={trade}
            currentPrice={currentPrice}
          />
        ))}
      </div>
    </div>
  );
}
