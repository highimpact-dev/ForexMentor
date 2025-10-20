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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

interface Trade {
  _id: Id<"trades">;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: number;
}

interface TradeCloseDialogProps {
  trade: Trade;
  currentPrice: number;
  currentPnL: number;
  currentPnLPercentage: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeCloseDialog({
  trade,
  currentPrice,
  currentPnL,
  currentPnLPercentage,
  open,
  onOpenChange,
}: TradeCloseDialogProps) {
  const [closeReason, setCloseReason] = useState("");
  const [emotionalState, setEmotionalState] = useState("");
  const [exitNotes, setExitNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeTrade = useMutation(api.trades.closeTrade);

  // Determine decimal places based on symbol
  const decimalPlaces = trade.symbol.includes("JPY") ? 3 : 5;

  // Calculate time in trade
  const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60); // Minutes
  const hours = Math.floor(timeInTrade / 60);
  const minutes = timeInTrade % 60;
  const timeDisplay =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;

  // Calculate distances
  const pipSize = trade.symbol.includes("JPY") ? 0.01 : 0.0001;
  const distanceToSL = trade.stopLoss
    ? Math.abs(currentPrice - trade.stopLoss) / pipSize
    : null;
  const distanceToTP = trade.takeProfit
    ? Math.abs(currentPrice - trade.takeProfit) / pipSize
    : null;

  // Calculate percentage of target reached
  const percentageOfTarget =
    trade.takeProfit && trade.stopLoss
      ? ((Math.abs(currentPrice - trade.entryPrice) /
          Math.abs(trade.takeProfit - trade.entryPrice)) *
          100).toFixed(1)
      : null;

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setCloseReason("");
      setEmotionalState("");
      setExitNotes("");
    }
  };

  const handleClose = async () => {
    // Validate required fields
    if (!closeReason) {
      alert("Please select a reason for closing this trade.");
      return;
    }
    if (!emotionalState) {
      alert("Please select how you're feeling about this trade.");
      return;
    }
    if (closeReason === "other" && !exitNotes.trim()) {
      alert("Please provide details about why you're closing this trade.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine reason, emotion, and notes into exitNotes
      const combinedNotes = [
        `Reason: ${closeReason}`,
        `Feeling: ${emotionalState}`,
        exitNotes ? `Notes: ${exitNotes}` : null,
      ].filter(Boolean).join("\n\n");

      await closeTrade({
        tradeId: trade._id,
        exitPrice: currentPrice,
        currentPrice,
        closeReason: "manual",
        exitNotes: combinedNotes,
      });

      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to close trade:", error);
      alert("Failed to close trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Close Trade</DialogTitle>
          <DialogDescription>
            Confirm closing your {trade.symbol} {trade.direction} trade. Please share why you're closing and how you're feeling - this helps identify patterns in your trading psychology.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* P&L Display */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Current P&L</div>
              <div
                className={`text-3xl font-bold ${
                  currentPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentPnL >= 0 ? "+" : ""}${currentPnL.toFixed(2)}
              </div>
              <div
                className={`text-lg ${
                  currentPnLPercentage >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentPnLPercentage >= 0 ? "+" : ""}
                {currentPnLPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Entry Price</div>
              <div className="font-medium">{trade.entryPrice.toFixed(decimalPlaces)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Exit Price</div>
              <div className="font-medium">{currentPrice.toFixed(decimalPlaces)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Time in Trade</div>
              <div className="font-medium">{timeDisplay}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Direction</div>
              <div className="font-medium uppercase">{trade.direction}</div>
            </div>
          </div>

          {/* Distance Information */}
          {(distanceToSL !== null || distanceToTP !== null) && (
            <div className="border rounded-lg p-3 space-y-2 text-sm">
              {distanceToSL !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Distance to Stop Loss:
                  </span>
                  <span className="font-medium">
                    {distanceToSL.toFixed(1)} pips
                  </span>
                </div>
              )}
              {distanceToTP !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Distance to Take Profit:
                  </span>
                  <span className="font-medium">
                    {distanceToTP.toFixed(1)} pips
                  </span>
                </div>
              )}
              {percentageOfTarget && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Target Reached:
                  </span>
                  <span className="font-medium">{percentageOfTarget}%</span>
                </div>
              )}
            </div>
          )}

          {/* Reason for Closing */}
          <div className="space-y-2">
            <Label htmlFor="closeReason">
              Why are you closing? <span className="text-red-500">*</span>
            </Label>
            <Select value={closeReason} onValueChange={setCloseReason}>
              <SelectTrigger id="closeReason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="taking_profit_early">Taking profit early</SelectItem>
                <SelectItem value="cutting_loss_early">Cutting loss early</SelectItem>
                <SelectItem value="market_conditions_changed">Market conditions changed</SelectItem>
                <SelectItem value="setup_invalidated">Setup invalidated</SelectItem>
                <SelectItem value="hitting_daily_target">Hitting daily target</SelectItem>
                <SelectItem value="hitting_daily_loss_limit">Hitting daily loss limit</SelectItem>
                <SelectItem value="need_to_step_away">Need to step away from screen</SelectItem>
                <SelectItem value="news_event_coming">News event coming up</SelectItem>
                <SelectItem value="technical_issue">Technical issue / platform problem</SelectItem>
                <SelectItem value="other">Other reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Emotional State */}
          <div className="space-y-2">
            <Label htmlFor="emotionalState">
              How are you feeling? <span className="text-red-500">*</span>
            </Label>
            <Select value={emotionalState} onValueChange={setEmotionalState}>
              <SelectTrigger id="emotionalState">
                <SelectValue placeholder="Select your emotional state..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confident">😊 Confident - Following my plan</SelectItem>
                <SelectItem value="satisfied">😌 Satisfied - Happy with the decision</SelectItem>
                <SelectItem value="neutral">😐 Neutral - Just executing the plan</SelectItem>
                <SelectItem value="uncertain">🤔 Uncertain - Not sure if this is right</SelectItem>
                <SelectItem value="anxious">😰 Anxious - Worried about the outcome</SelectItem>
                <SelectItem value="frustrated">😤 Frustrated - Trade didn't go as planned</SelectItem>
                <SelectItem value="fearful">😨 Fearful - Scared of losing more</SelectItem>
                <SelectItem value="greedy">🤑 Greedy - Wanting more profit</SelectItem>
                <SelectItem value="regretful">😔 Regretful - Wish I had done differently</SelectItem>
                <SelectItem value="relieved">😅 Relieved - Glad to be out</SelectItem>
                <SelectItem value="impatient">😣 Impatient - Can't wait anymore</SelectItem>
                <SelectItem value="excited">🤩 Excited - This is working!</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Being honest about your emotions helps identify patterns in your trading psychology.
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="exitNotes">
              Additional Notes {closeReason === "other" ? (
                <span className="text-red-500">*</span>
              ) : (
                "(Optional)"
              )}
            </Label>
            <Textarea
              id="exitNotes"
              placeholder={
                closeReason === "other"
                  ? "Please explain your reason for closing this trade..."
                  : "Any other thoughts or observations about this trade?"
              }
              value={exitNotes}
              onChange={(e) => setExitNotes(e.target.value)}
              rows={3}
            />
            {closeReason === "other" && (
              <div className="text-xs text-red-500">
                Required when selecting "Other reason"
              </div>
            )}
          </div>

          {/* Warning if closing early */}
          {percentageOfTarget &&
            parseFloat(percentageOfTarget) < 100 &&
            currentPnL > 0 && (
              <div className="border border-orange-500/50 rounded-lg p-3 bg-orange-500/10">
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  ⚠ You're closing this trade before reaching your take profit
                  target ({percentageOfTarget}% reached). Consider if this
                  aligns with your trading plan.
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClose}
            disabled={
              isSubmitting ||
              !closeReason ||
              !emotionalState ||
              (closeReason === "other" && !exitNotes.trim())
            }
          >
            {isSubmitting ? "Closing..." : "Close Trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
