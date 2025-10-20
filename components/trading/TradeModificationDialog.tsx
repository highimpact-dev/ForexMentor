"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";

interface Trade {
  _id: Id<"trades">;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  riskAmount: number;
}

interface TradeModificationDialogProps {
  trade: Trade;
  currentPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeModificationDialog({
  trade,
  currentPrice,
  open,
  onOpenChange,
}: TradeModificationDialogProps) {
  // Determine decimal places based on symbol
  const decimalPlaces = trade.symbol.includes("JPY") ? 3 : 5;

  const [stopLoss, setStopLoss] = useState(
    trade.stopLoss?.toFixed(decimalPlaces) || ""
  );
  const [takeProfit, setTakeProfit] = useState(
    trade.takeProfit?.toFixed(decimalPlaces) || ""
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTradeLevels = useMutation(api.trades.updateTradeLevels);

  // Calculate pip size
  const pipSize = trade.symbol.includes("JPY") ? 0.01 : 0.0001;

  // Calculate new R:R ratio
  const calculateRR = () => {
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (isNaN(sl) || isNaN(tp)) return null;

    const slDistance = Math.abs(trade.entryPrice - sl);
    const tpDistance = Math.abs(tp - trade.entryPrice);

    if (slDistance === 0) return null;

    return (tpDistance / slDistance).toFixed(2);
  };

  // Calculate pip changes
  const calculateSLChange = () => {
    const newSL = parseFloat(stopLoss);
    if (isNaN(newSL) || !trade.stopLoss) return null;

    const change = Math.abs(newSL - trade.stopLoss) / pipSize;
    const direction =
      trade.direction === "long"
        ? newSL > trade.stopLoss
          ? "tightened"
          : "widened"
        : newSL < trade.stopLoss
        ? "tightened"
        : "widened";

    return { change: change.toFixed(1), direction };
  };

  const calculateTPChange = () => {
    const newTP = parseFloat(takeProfit);
    if (isNaN(newTP) || !trade.takeProfit) return null;

    const change = Math.abs(newTP - trade.takeProfit) / pipSize;
    const direction =
      trade.direction === "long"
        ? newTP > trade.takeProfit
          ? "moved further"
          : "moved closer"
        : newTP < trade.takeProfit
        ? "moved further"
        : "moved closer";

    return { change: change.toFixed(1), direction };
  };

  const slChange = calculateSLChange();
  const tpChange = calculateTPChange();
  const newRR = calculateRR();

  // Validation
  const isValid = () => {
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    // At least one must be changed
    if (
      (isNaN(sl) || sl === trade.stopLoss) &&
      (isNaN(tp) || tp === trade.takeProfit)
    ) {
      return false;
    }

    // SL validation
    if (!isNaN(sl)) {
      if (trade.direction === "long" && sl >= trade.entryPrice) return false;
      if (trade.direction === "short" && sl <= trade.entryPrice) return false;
    }

    // TP validation
    if (!isNaN(tp)) {
      if (trade.direction === "long" && tp <= trade.entryPrice) return false;
      if (trade.direction === "short" && tp >= trade.entryPrice) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isValid()) return;

    setIsSubmitting(true);

    try {
      await updateTradeLevels({
        tradeId: trade._id,
        currentPrice,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        userNotes: notes || undefined,
        pipSize,
      });

      onOpenChange(false);

      // Reset form
      setStopLoss(trade.stopLoss?.toFixed(decimalPlaces) || "");
      setTakeProfit(trade.takeProfit?.toFixed(decimalPlaces) || "");
      setNotes("");
    } catch (error) {
      console.error("Failed to update trade levels:", error);
      alert("Failed to update trade levels. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modify Trade Levels</DialogTitle>
          <DialogDescription>
            Update stop loss and/or take profit for your {trade.symbol}{" "}
            {trade.direction} trade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Trade Info */}
          <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-3 bg-muted/50">
            <div>
              <div className="text-muted-foreground">Entry Price</div>
              <div className="font-medium">{trade.entryPrice.toFixed(decimalPlaces)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Price</div>
              <div className="font-medium">{currentPrice.toFixed(decimalPlaces)}</div>
            </div>
          </div>

          {/* Stop Loss Input */}
          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss</Label>
            <Input
              id="stopLoss"
              type="number"
              step={trade.symbol.includes("JPY") ? "0.001" : "0.00001"}
              placeholder={trade.stopLoss?.toFixed(decimalPlaces) || "Enter stop loss"}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
            {slChange && (
              <div className="text-xs">
                <span
                  className={
                    slChange.direction === "tightened"
                      ? "text-green-600"
                      : "text-orange-600"
                  }
                >
                  {slChange.direction === "tightened" ? "✓" : "⚠"}{" "}
                  {slChange.direction} by {slChange.change} pips
                </span>
              </div>
            )}
          </div>

          {/* Take Profit Input */}
          <div className="space-y-2">
            <Label htmlFor="takeProfit">Take Profit</Label>
            <Input
              id="takeProfit"
              type="number"
              step={trade.symbol.includes("JPY") ? "0.001" : "0.00001"}
              placeholder={trade.takeProfit?.toFixed(decimalPlaces) || "Enter take profit"}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
            {tpChange && (
              <div className="text-xs">
                <span
                  className={
                    tpChange.direction === "moved further"
                      ? "text-green-600"
                      : "text-orange-600"
                  }
                >
                  {tpChange.direction === "moved further" ? "✓" : "⚠"}{" "}
                  {tpChange.direction} by {tpChange.change} pips
                </span>
              </div>
            )}
          </div>

          {/* New R:R Display */}
          {newRR && (
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="text-sm">
                <div className="text-muted-foreground">New Risk:Reward Ratio</div>
                <div className="text-lg font-bold">1:{newRR}</div>
              </div>
            </div>
          )}

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Why are you making this change?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid() || isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Levels"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
