"use client";

import { TIMEFRAMES, TimeframeKey, DEFAULT_TRADING_PAIRS } from "@/lib/chart-config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartControlsProps {
  selectedSymbol: string;
  selectedTimeframe: TimeframeKey;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: TimeframeKey) => void;
}

export function ChartControls({
  selectedSymbol,
  selectedTimeframe,
  onSymbolChange,
  onTimeframeChange,
}: ChartControlsProps) {
  const selectedPair = DEFAULT_TRADING_PAIRS.find((p) => p.symbol === selectedSymbol);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 border-b border-border bg-card">
      {/* Currency Pair Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground hidden sm:inline">Pair:</label>
        <Select value={selectedSymbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <span className="font-semibold">{selectedPair?.symbol || selectedSymbol}</span>
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_TRADING_PAIRS.map((pair) => (
              <SelectItem key={pair.symbol} value={pair.symbol}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{pair.symbol}</span>
                  <span className="text-xs text-muted-foreground">{pair.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeframe Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">Timeframe:</label>
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-hide">
          {Object.entries(TIMEFRAMES).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedTimeframe === key ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(key as TimeframeKey)}
              className={`min-w-[60px] flex-shrink-0 ${
                selectedTimeframe === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
