"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeModificationDialog } from "./TradeModificationDialog";
import { TradeCloseDialog } from "./TradeCloseDialog";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronUp } from "lucide-react";

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

interface CompactTradeCardProps {
  trade: Trade;
  currentPrice: number;
}

export function CompactTradeCard({ trade, currentPrice }: CompactTradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const decimalPlaces = trade.symbol.includes("JPY") ? 3 : 5;

  // Calculate current P&L
  const calculatePnL = () => {
    if (trade.direction === "long") {
      return (currentPrice - trade.entryPrice) * trade.positionSize * 100000;
    } else {
      return (trade.entryPrice - currentPrice) * trade.positionSize * 100000;
    }
  };

  const currentPnL = calculatePnL();
  const currentPnLPercentage = (currentPnL / trade.riskAmount) * 100;

  // Calculate distances
  const pipSize = trade.symbol.includes("JPY") ? 0.01 : 0.0001;
  const distanceToSL = trade.stopLoss ? Math.abs(currentPrice - trade.stopLoss) / pipSize : 0;
  const distanceToTP = trade.takeProfit ? Math.abs(currentPrice - trade.takeProfit) / pipSize : 0;

  // Calculate time in trade
  const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60);
  const hours = Math.floor(timeInTrade / 60);
  const minutes = timeInTrade % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <>
      <Card className="overflow-hidden">
        {/* Compact Header - Always Visible */}
        <div
          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{trade.symbol}</span>
              <Badge
                variant={trade.direction === "long" ? "default" : "secondary"}
                className="text-xs px-1.5 py-0"
              >
                {trade.direction === "long" ? "L" : "S"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`text-sm font-bold ${
                  currentPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentPnL >= 0 ? "+" : ""}${currentPnL.toFixed(2)}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{timeDisplay}</span>
            <span
              className={currentPnLPercentage >= 0 ? "text-green-600" : "text-red-600"}
            >
              {currentPnLPercentage >= 0 ? "+" : ""}
              {currentPnLPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t bg-muted/20 p-3 space-y-3">
            {/* Prices */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Entry</div>
                <div className="font-medium">{trade.entryPrice.toFixed(decimalPlaces)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current</div>
                <div className="font-medium">{currentPrice.toFixed(decimalPlaces)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Position</div>
                <div className="font-medium">{trade.positionSize.toFixed(2)} lots</div>
              </div>
              <div>
                <div className="text-muted-foreground">Risk</div>
                <div className="font-medium">${trade.riskAmount}</div>
              </div>
            </div>

            {/* SL/TP */}
            {(trade.stopLoss || trade.takeProfit) && (
              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                {trade.stopLoss && (
                  <div>
                    <div className="text-muted-foreground">Stop Loss</div>
                    <div className="font-medium">{trade.stopLoss.toFixed(decimalPlaces)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {distanceToSL.toFixed(1)} pips
                    </div>
                  </div>
                )}
                {trade.takeProfit && (
                  <div>
                    <div className="text-muted-foreground">Take Profit</div>
                    <div className="font-medium">{trade.takeProfit.toFixed(decimalPlaces)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {distanceToTP.toFixed(1)} pips
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModifyDialog(true);
                }}
              >
                Modify
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloseDialog(true);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
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
