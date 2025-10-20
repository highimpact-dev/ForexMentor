"use client";

import { useState, useRef, useId, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TradeModificationDialog } from "./TradeModificationDialog";
import { TradeCloseDialog } from "./TradeCloseDialog";
import { Id } from "@/convex/_generated/dataModel";
import { XIcon } from "lucide-react";

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

interface ExpandableTradeCardProps {
  trade: Trade;
  currentPrice: number;
  active: Trade | null;
  setActive: (trade: Trade | null) => void;
}

export function ExpandableTradeCard({
  trade,
  currentPrice,
  active,
  setActive,
}: ExpandableTradeCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useOutsideClick(ref, () => {
    if (active?._id === trade._id) {
      setActive(null);
    }
  });

  // Handle Escape key and body overflow
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active?._id === trade._id) {
        setActive(null);
      }
    };

    const isActive = active?._id === trade._id;

    // Prevent body scroll when modal is open
    if (isActive) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore scroll when component unmounts
      document.body.style.overflow = "auto";
    };
  }, [active, trade._id, setActive]);

  // Determine decimal places based on symbol
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
  const distanceToSL = trade.stopLoss
    ? Math.abs(currentPrice - trade.stopLoss)
    : 0;
  const distanceToTP = trade.takeProfit
    ? Math.abs(currentPrice - trade.takeProfit)
    : 0;

  // Convert to pips
  const pipSize = trade.symbol.includes("JPY") ? 0.01 : 0.0001;
  const pipsToSL = distanceToSL / pipSize;
  const pipsToTP = distanceToTP / pipSize;

  // Calculate time in trade
  const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60);
  const hours = Math.floor(timeInTrade / 60);
  const minutes = timeInTrade % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const isActive = active?._id === trade._id;

  return (
    <>
      {/* Overlay and Expanded Modal - rendered via portal to avoid overflow clipping */}
      {mounted && createPortal(
        <>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 h-full w-full z-[100]"
                onClick={() => setActive(null)}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isActive && (
              <div className="fixed inset-0 grid place-items-center z-[101] p-4" onClick={(e) => {
                // Close if clicking the backdrop
                if (e.target === e.currentTarget) {
                  setActive(null);
                }
              }}>
              <motion.div
                ref={ref}
                layoutId={`card-${trade._id}-${id}`}
                className="w-full max-w-2xl h-fit max-h-[90vh] flex flex-col overflow-hidden bg-background border rounded-xl shadow-2xl"
              >
                {/* Expanded Header */}
                <div className="flex items-start justify-between p-6 border-b">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{trade.symbol}</h3>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(null);
                    }}
                    className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Expanded Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    <div>
                      <div className="text-muted-foreground mb-1">Stop Loss</div>
                      {trade.stopLoss ? (
                        <>
                          <div className="font-medium text-lg">
                            {trade.stopLoss.toFixed(decimalPlaces)}
                          </div>
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
                          <div className="font-medium text-lg">
                            {trade.takeProfit.toFixed(decimalPlaces)}
                          </div>
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
                    <div className="text-sm border-t pt-4">
                      <div className="text-muted-foreground mb-2">Entry Notes</div>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">
                        {trade.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t bg-muted/20">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowModifyDialog(true);
                      }}
                    >
                      Modify Levels
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCloseDialog(true);
                      }}
                    >
                      Close Trade
                    </Button>
                  </div>
                </div>
              </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Collapsed View - always rendered */}
      <motion.div
        layoutId={`card-${trade._id}-${id}`}
        onClick={() => setActive(isActive ? null : trade)}
        className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
          isActive ? "" : "hover:border-primary/50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Symbol and Direction */}
          <div className="flex items-center gap-3">
            <div>
              <div className="font-semibold text-lg">{trade.symbol}</div>
              <Badge
                variant={trade.direction === "long" ? "default" : "secondary"}
                className="text-xs"
              >
                {trade.direction.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Center: P&L */}
          <div className="flex-1 text-center">
            <div
              className={`text-xl font-bold ${
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

          {/* Right: Time in trade */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{timeDisplay}</div>
          </div>
        </div>
      </motion.div>

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
