"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatPrice, calculatePositionSize, calculatePips } from "@/lib/chart-config";

interface TradePanelProps {
  symbol: string;
  currentPrice: number;
  pipSize: number;
  accountBalance: number;
  onTrade?: (trade: TradeParams) => void;
}

interface TradeParams {
  direction: "long" | "short";
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  riskPercentage: number;
}

export function TradePanel({
  symbol,
  currentPrice,
  pipSize,
  accountBalance = 10000,
  onTrade,
}: TradePanelProps) {
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [riskPercentage, setRiskPercentage] = useState<number>(2);
  const [stopLossPips, setStopLossPips] = useState<number>(30);
  const [takeProfitPips, setTakeProfitPips] = useState<number>(60);

  // Calculate derived values
  const riskAmount = (accountBalance * riskPercentage) / 100;
  const pipValue = 10; // $10 per pip for 1 standard lot (simplified)
  const positionSize = calculatePositionSize(riskAmount, stopLossPips, pipValue);

  const stopLossPrice = direction === "long"
    ? currentPrice - (stopLossPips * pipSize)
    : currentPrice + (stopLossPips * pipSize);

  const takeProfitPrice = takeProfitPips > 0
    ? direction === "long"
      ? currentPrice + (takeProfitPips * pipSize)
      : currentPrice - (takeProfitPips * pipSize)
    : undefined;

  const riskRewardRatio = takeProfitPips / stopLossPips;
  const potentialProfit = takeProfitPips * pipValue * positionSize;
  const potentialLoss = riskAmount;

  const isHighRisk = riskPercentage > 2;
  const isGoodRR = riskRewardRatio >= 2;

  const handleTrade = () => {
    if (!onTrade || !takeProfitPrice) return;

    const tradeParams: TradeParams = {
      direction,
      quantity: positionSize,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      riskAmount,
      riskPercentage,
    };

    onTrade(tradeParams);
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-semibold">Place Trade</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Current Price: <span className="font-mono font-semibold text-foreground">{formatPrice(currentPrice, pipSize)}</span>
        </p>
      </div>

      {/* Direction Selection */}
      <div className="space-y-2">
        <Label>Direction</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={direction === "long" ? "default" : "outline"}
            onClick={() => setDirection("long")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Buy / Long
          </Button>
          <Button
            variant={direction === "short" ? "default" : "outline"}
            onClick={() => setDirection("short")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Sell / Short
          </Button>
        </div>
      </div>

      {/* Risk Management */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="risk">Risk Percentage</Label>
          <div className="flex items-center gap-2">
            <Input
              id="risk"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 2)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">%</span>
          </div>
          {isHighRisk && (
            <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>You're risking {riskPercentage}% - professionals typically risk 1-2%</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Risk Amount: ${riskAmount.toFixed(2)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
          <Input
            id="stopLoss"
            type="number"
            min="1"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(parseInt(e.target.value) || 30)}
          />
          <p className="text-xs text-muted-foreground">
            Stop Loss Price: {formatPrice(stopLossPrice, pipSize)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit">Take Profit (pips)</Label>
          <Input
            id="takeProfit"
            type="number"
            min="1"
            value={takeProfitPips}
            onChange={(e) => setTakeProfitPips(parseInt(e.target.value) || 60)}
          />
          {takeProfitPrice && (
            <p className="text-xs text-muted-foreground">
              Take Profit Price: {formatPrice(takeProfitPrice, pipSize)}
            </p>
          )}
        </div>
      </div>

      {/* Trade Summary */}
      <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
        <h4 className="font-semibold text-sm">Trade Summary</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position Size:</span>
            <span className="font-mono font-semibold">{positionSize.toFixed(2)} lots</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Risk:Reward Ratio:</span>
            <span
              className={`font-semibold ${
                isGoodRR ? 'text-green-600 dark:text-green-500' :
                riskRewardRatio >= 1 ? 'text-yellow-600 dark:text-yellow-500' :
                'text-red-600 dark:text-red-500'
              }`}
            >
              1:{riskRewardRatio.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Potential Profit:</span>
            <span className="font-semibold text-green-600 dark:text-green-500">
              +${potentialProfit.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Potential Loss:</span>
            <span className="font-semibold text-red-600 dark:text-red-500">
              -${potentialLoss.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <Button
        onClick={handleTrade}
        className="w-full"
        size="lg"
        disabled={!onTrade}
      >
        Place {direction === "long" ? "Buy" : "Sell"} Order
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Paper trading • No real money at risk
      </p>
    </Card>
  );
}
