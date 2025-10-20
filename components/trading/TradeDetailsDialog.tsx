"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeModificationDialog } from "./TradeModificationDialog";
import { TradeCloseDialog } from "./TradeCloseDialog";
import { Id } from "@/convex/_generated/dataModel";
import { usePrice } from "@/context/PriceContext";

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

interface TradeDetailsDialogProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDetailsDialog({
  trade,
  open,
  onOpenChange,
}: TradeDetailsDialogProps) {
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const { getPrice, subscribeToSymbol, unsubscribeFromSymbol } = usePrice();

  // Subscribe to price updates for this trade's symbol
  useEffect(() => {
    if (open) {
      subscribeToSymbol(trade.symbol);
      return () => {
        unsubscribeFromSymbol(trade.symbol);
      };
    }
    // subscribeToSymbol and unsubscribeFromSymbol are now memoized in PriceContext
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trade.symbol]);

  const currentPrice = getPrice(trade.symbol) || trade.entryPrice;

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
  const distanceToSL = trade.stopLoss
    ? Math.abs(currentPrice - trade.stopLoss) / pipSize
    : 0;
  const distanceToTP = trade.takeProfit
    ? Math.abs(currentPrice - trade.takeProfit) / pipSize
    : 0;

  // Calculate time in trade
  const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60);
  const hours = Math.floor(timeInTrade / 60);
  const minutes = timeInTrade % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl">{trade.symbol}</DialogTitle>
                  <Badge
                    variant={trade.direction === "long" ? "default" : "secondary"}
                  >
                    {trade.direction.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {timeDisplay} in trade
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
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
          </DialogHeader>

          <div className="space-y-4">
            {/* Trade Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Entry</div>
                <div className="font-medium text-lg">
                  {trade.entryPrice.toFixed(decimalPlaces)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Current</div>
                <div className="font-medium text-lg">
                  {currentPrice.toFixed(decimalPlaces)}
                </div>
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
            {(trade.stopLoss || trade.takeProfit) && (
              <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <div className="text-muted-foreground mb-1">Stop Loss</div>
                  {trade.stopLoss ? (
                    <>
                      <div className="font-medium">
                        {trade.stopLoss.toFixed(decimalPlaces)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {distanceToSL.toFixed(1)} pips away
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
                      <div className="font-medium">
                        {trade.takeProfit.toFixed(decimalPlaces)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {distanceToTP.toFixed(1)} pips away
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not set</div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {trade.notes && (
              <div className="text-sm border-t pt-4">
                <div className="text-muted-foreground mb-2">Entry Notes</div>
                <div className="text-sm p-3 bg-muted/50 rounded-lg">
                  {trade.notes}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowModifyDialog(true)}
              >
                Modify Levels
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowCloseDialog(true)}
              >
                Close Trade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Dialogs */}
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
