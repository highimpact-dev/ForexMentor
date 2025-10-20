"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeModificationDialog } from "./TradeModificationDialog";
import { TradeCloseDialog } from "./TradeCloseDialog";
import { Id } from "@/convex/_generated/dataModel";

interface Trade {
  _id: Id<"trades">;
  _creationTime: number;
  userId: string;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  riskAmount: number;
  riskPercentage: number;
  status: "open" | "closed" | "cancelled";
  profitLoss?: number;
  profitLossPercentage?: number;
  entryTime: number;
  exitTime?: number;
  notes?: string;
  aiAnalysis?: string;
  aiAnalysisRating?: number;
}

interface TradeCardProps {
  trade: Trade;
  currentPrice: number;
}

export function TradeCard({ trade, currentPrice }: TradeCardProps) {
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Determine decimal places based on symbol
  const decimalPlaces = trade.symbol.includes("JPY") ? 3 : 5;

  // Calculate current P&L
  const calculatePnL = () => {
    if (trade.direction === "long") {
      return (currentPrice - trade.entryPrice) * trade.positionSize * 100000; // Standard lot conversion
    } else {
      return (trade.entryPrice - currentPrice) * trade.positionSize * 100000;
    }
  };

  const currentPnL = calculatePnL();
  const currentPnLPercentage = (currentPnL / trade.riskAmount) * 100;

  // Calculate distances
  const distanceToSL = trade.stopLoss
    ? Math.abs(currentPrice - trade.stopLoss)
    : 0;
  const distanceToTP = trade.takeProfit
    ? Math.abs(currentPrice - trade.takeProfit)
    : 0;

  // Convert to pips (assuming 0.0001 pip size for most pairs, 0.01 for JPY)
  const pipSize = trade.symbol.includes("JPY") ? 0.01 : 0.0001;
  const pipsToSL = distanceToSL / pipSize;
  const pipsToTP = distanceToTP / pipSize;

  // Calculate time in trade
  const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60); // Minutes
  const hours = Math.floor(timeInTrade / 60);
  const minutes = timeInTrade % 60;

  return (
    <>
      <Card className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{trade.symbol}</span>
              <Badge
                variant={trade.direction === "long" ? "default" : "secondary"}
              >
                {trade.direction.toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} in trade
            </div>
          </div>

          {/* P&L Display */}
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                currentPnL >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentPnL >= 0 ? "+" : ""}${currentPnL.toFixed(2)}
            </div>
            <div
              className={`text-sm ${
                currentPnLPercentage >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentPnLPercentage >= 0 ? "+" : ""}
              {currentPnLPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Entry</div>
            <div className="font-medium">{trade.entryPrice.toFixed(decimalPlaces)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current</div>
            <div className="font-medium">{currentPrice.toFixed(decimalPlaces)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Position Size</div>
            <div className="font-medium">{trade.positionSize.toFixed(2)} lots</div>
          </div>
          <div>
            <div className="text-muted-foreground">Risk</div>
            <div className="font-medium">
              ${trade.riskAmount} ({trade.riskPercentage}%)
            </div>
          </div>
        </div>

        {/* SL/TP Levels */}
        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
          <div>
            <div className="text-muted-foreground mb-1">Stop Loss</div>
            {trade.stopLoss ? (
              <>
                <div className="font-medium">{trade.stopLoss.toFixed(decimalPlaces)}</div>
                <div className="text-xs text-muted-foreground">
                  {pipsToSL.toFixed(1)} pips away
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Not set</div>
            )}
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Take Profit</div>
            {trade.takeProfit ? (
              <>
                <div className="font-medium">{trade.takeProfit.toFixed(decimalPlaces)}</div>
                <div className="text-xs text-muted-foreground">
                  {pipsToTP.toFixed(1)} pips away
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Not set</div>
            )}
          </div>
        </div>

        {/* Notes */}
        {trade.notes && (
          <div className="text-sm border-t pt-3">
            <div className="text-muted-foreground mb-1">Notes</div>
            <div className="text-xs">{trade.notes}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowModifyDialog(true)}
          >
            Modify Levels
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowCloseDialog(true)}
          >
            Close Trade
          </Button>
        </div>
      </Card>

      {/* Dialogs */}
      <TradeModificationDialog
        trade={trade}
        currentPrice={currentPrice}
        open={showModifyDialog}
        onOpenChange={setShowModifyDialog}
      />
      <TradeCloseDialog
        trade={trade}
        currentPrice={currentPrice}
        currentPnL={currentPnL}
        currentPnLPercentage={currentPnLPercentage}
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
      />
    </>
  );
}
