"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IndicatorType,
  IndicatorConfig,
  DEFAULT_INDICATORS,
  COMMON_PERIODS,
  INDICATOR_COLORS,
  generateIndicatorId,
  formatIndicatorName,
  getIndicatorDisplayType,
} from "@/lib/indicator-types";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface IndicatorPanelProps {
  indicators: IndicatorConfig[];
  onAddIndicator: (indicator: IndicatorConfig) => void;
  onRemoveIndicator: (id: string) => void;
  onToggleIndicator: (id: string) => void;
  onUpdateIndicator: (id: string, updates: Partial<IndicatorConfig>) => void;
}

export function IndicatorPanel({
  indicators,
  onAddIndicator,
  onRemoveIndicator,
  onToggleIndicator,
  onUpdateIndicator,
}: IndicatorPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<IndicatorType>("SMA");
  const [period, setPeriod] = useState<number>(20);
  const [shortPeriod, setShortPeriod] = useState<number>(12);
  const [longPeriod, setLongPeriod] = useState<number>(26);
  const [signalPeriod, setSignalPeriod] = useState<number>(9);
  const [color, setColor] = useState<string>(INDICATOR_COLORS[0]);
  // RSI-specific settings
  const [rsiOverbought, setRsiOverbought] = useState<number>(70);
  const [rsiOversold, setRsiOversold] = useState<number>(30);
  const [rsiShowMidline, setRsiShowMidline] = useState<boolean>(false);
  const [rsiShowPriceLineTitles, setRsiShowPriceLineTitles] = useState<boolean>(true);
  // Mobile collapse state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleAddIndicator = () => {
    let params;
    if (selectedType === "MACD") {
      params = { shortPeriod, longPeriod, signalPeriod };
    } else if (selectedType === "RSI") {
      params = {
        period,
        overbought: rsiOverbought,
        oversold: rsiOversold,
        showMidline: rsiShowMidline,
        showPriceLineTitles: rsiShowPriceLineTitles,
      };
    } else {
      params = { period };
    }

    const id = generateIndicatorId(selectedType, params);
    const name = formatIndicatorName(selectedType, params);

    // Check if indicator already exists
    if (indicators.some((ind) => ind.id === id)) {
      alert("This indicator is already added!");
      return;
    }

    const newIndicator: IndicatorConfig = {
      id,
      type: selectedType,
      name,
      color,
      visible: true,
      params,
      displayType: getIndicatorDisplayType(selectedType),
    };

    onAddIndicator(newIndicator);
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground lg:cursor-default"
        >
          <span>Indicators</span>
          <span className="lg:hidden">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setShowAddDialog(!showAddDialog);
            // Auto-expand on mobile when opening add dialog
            if (!showAddDialog) {
              setIsExpanded(true);
            }
          }}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Collapsible content - hidden on mobile when collapsed */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block space-y-2`}>
        {/* Active Indicators List */}
        {indicators.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {indicators.map((indicator) => (
              <div
                key={indicator.id}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border ${
                  indicator.visible
                    ? "bg-secondary border-border"
                    : "bg-muted border-muted opacity-60"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-sm cursor-pointer"
                  style={{ backgroundColor: indicator.color }}
                  onClick={() => onToggleIndicator(indicator.id)}
                />
                <span className="text-foreground font-medium">
                  {indicator.name}
                </span>
                <button
                  onClick={() => onRemoveIndicator(indicator.id)}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Indicator Dialog */}
        {showAddDialog && (
        <div className="mt-2 p-3 border border-border rounded-lg bg-background space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Indicator Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value as IndicatorType);
                // Set default params for selected type
                const defaults = DEFAULT_INDICATORS[value as IndicatorType];
                if (value === "MACD") {
                  setShortPeriod(defaults.params.shortPeriod || 12);
                  setLongPeriod(defaults.params.longPeriod || 26);
                  setSignalPeriod(defaults.params.signalPeriod || 9);
                } else if (value === "RSI") {
                  setPeriod(defaults.params.period || 14);
                  setRsiOverbought(defaults.params.overbought || 70);
                  setRsiOversold(defaults.params.oversold || 30);
                  setRsiShowMidline(defaults.params.showMidline || false);
                  setRsiShowPriceLineTitles(defaults.params.showPriceLineTitles ?? true);
                } else {
                  setPeriod(defaults.params.period || 20);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMA">Simple Moving Average (SMA)</SelectItem>
                <SelectItem value="EMA">
                  Exponential Moving Average (EMA)
                </SelectItem>
                <SelectItem value="RSI">
                  Relative Strength Index (RSI)
                </SelectItem>
                <SelectItem value="MACD">MACD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parameters */}
          {selectedType === "MACD" ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Fast</Label>
                <Input
                  type="number"
                  value={shortPeriod}
                  onChange={(e) => setShortPeriod(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slow</Label>
                <Input
                  type="number"
                  value={longPeriod}
                  onChange={(e) => setLongPeriod(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Signal</Label>
                <Input
                  type="number"
                  value={signalPeriod}
                  onChange={(e) => setSignalPeriod(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Period</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="h-8 text-xs flex-1"
                />
                <div className="flex gap-1">
                  {COMMON_PERIODS[selectedType]?.slice(0, 3).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant="outline"
                      onClick={() => setPeriod(p as number)}
                      className="h-8 px-2 text-xs"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RSI-specific settings */}
          {selectedType === "RSI" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold">RSI Levels</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Overbought</Label>
                  <Input
                    type="number"
                    value={rsiOverbought}
                    onChange={(e) => setRsiOverbought(Number(e.target.value))}
                    className="h-8 text-xs"
                    min={50}
                    max={100}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Oversold</Label>
                  <Input
                    type="number"
                    value={rsiOversold}
                    onChange={(e) => setRsiOversold(Number(e.target.value))}
                    className="h-8 text-xs"
                    min={0}
                    max={50}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rsi-midline"
                  checked={rsiShowMidline}
                  onChange={(e) => setRsiShowMidline(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="rsi-midline" className="text-xs cursor-pointer">
                  Show midline (50)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rsi-price-line-titles"
                  checked={rsiShowPriceLineTitles}
                  onChange={(e) => setRsiShowPriceLineTitles(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="rsi-price-line-titles" className="text-xs cursor-pointer">
                  Show price line titles
                </Label>
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-1.5">
              {INDICATOR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 ${
                    color === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleAddIndicator}
              className="flex-1 h-8 text-xs"
            >
              Add Indicator
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
