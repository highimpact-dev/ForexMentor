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
import { TickerSelector } from "@/components/trading/TickerSelector";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIMEFRAMES, TimeframeKey, DEFAULT_TRADING_PAIRS } from "@/lib/chart-config";
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
import { DrawingMode, Drawing, HorizontalLine, TrendLine, DRAWING_COLORS, LINE_STYLES } from "@/lib/drawing-types";
import { CrosshairSettings, LINE_STYLE_OPTIONS } from "@/lib/chart-settings";
import { Plus, Minus, TrendingUp, Trash2, X, Edit2, Settings } from "lucide-react";

interface ChartToolbarProps {
  // Symbol and timeframe
  selectedSymbol: string;
  selectedTimeframe: TimeframeKey;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: TimeframeKey) => void;

  // Account info
  accountBalance: number;
  equity: number;
  available: number;

  // Indicators
  indicators: IndicatorConfig[];
  onAddIndicator: (indicator: IndicatorConfig) => void;
  onRemoveIndicator: (id: string) => void;
  onToggleIndicator: (id: string) => void;
  onUpdateIndicator: (id: string, updates: Partial<IndicatorConfig>) => void;

  // Drawing tools
  drawingMode: DrawingMode;
  drawings: Drawing[];
  onModeChange: (mode: DrawingMode) => void;
  onDeleteDrawing: (id: string) => void;
  onUpdateDrawing: (id: string, updates: Partial<Drawing>) => void;
  onClearAllDrawings: () => void;

  // Chart settings
  crosshairSettings: CrosshairSettings;
  onUpdateCrosshair: (settings: CrosshairSettings) => void;
}

export function ChartToolbar({
  selectedSymbol,
  selectedTimeframe,
  onSymbolChange,
  onTimeframeChange,
  accountBalance,
  equity,
  available,
  indicators,
  onAddIndicator,
  onRemoveIndicator,
  onToggleIndicator,
  onUpdateIndicator,
  drawingMode,
  drawings,
  onModeChange,
  onDeleteDrawing,
  onUpdateDrawing,
  onClearAllDrawings,
  crosshairSettings,
  onUpdateCrosshair,
}: ChartToolbarProps) {
  // Indicator state
  const [showIndicatorDialog, setShowIndicatorDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<IndicatorType>("SMA");
  const [period, setPeriod] = useState<number>(20);
  const [shortPeriod, setShortPeriod] = useState<number>(12);
  const [longPeriod, setLongPeriod] = useState<number>(26);
  const [signalPeriod, setSignalPeriod] = useState<number>(9);
  const [color, setColor] = useState<string>(INDICATOR_COLORS[0]);
  const [rsiOverbought, setRsiOverbought] = useState<number>(70);
  const [rsiOversold, setRsiOversold] = useState<number>(30);
  const [rsiShowMidline, setRsiShowMidline] = useState<boolean>(false);
  const [rsiShowPriceLineTitles, setRsiShowPriceLineTitles] = useState<boolean>(true);

  // Drawing state
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);

  // Chart settings state
  const [showChartSettings, setShowChartSettings] = useState(false);

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const selectedPair = DEFAULT_TRADING_PAIRS.find((p) => p.symbol === selectedSymbol);

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
    setShowIndicatorDialog(false);
  };

  const handlePriceChange = (drawingId: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      onUpdateDrawing(drawingId, { price } as Partial<HorizontalLine>);
    }
  };

  const handleColorChange = (drawingId: string, color: string) => {
    onUpdateDrawing(drawingId, { color });
  };

  const handleLineStyleChange = (drawingId: string, lineStyle: 0 | 1 | 2 | 3 | 4) => {
    onUpdateDrawing(drawingId, { lineStyle });
  };

  const handleClearAllClick = () => {
    if (drawings.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmClearAll = () => {
    onClearAllDrawings();
    setShowConfirmDialog(false);
  };

  return (
    <div className="border-b border-border bg-card">
      {/* Main toolbar - Pair and Timeframe */}
      <div className="flex items-center gap-3 px-4 py-2">
        <TickerSelector value={selectedSymbol} onChange={onSymbolChange} />

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-1.5">
          {Object.entries(TIMEFRAMES).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedTimeframe === key ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(key as TimeframeKey)}
              className="h-7 px-3 text-xs"
            >
              {config.label}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border ml-auto" />

        {/* Account info */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Balance</span>
            <span className="font-semibold">${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Equity</span>
            <span className={`font-semibold ${equity > accountBalance ? 'text-green-500' : equity < accountBalance ? 'text-red-500' : ''}`}>
              ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Available</span>
            <span className="font-semibold">${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Indicators button */}
        <Button
          size="sm"
          variant={showIndicatorDialog ? "default" : "outline"}
          onClick={() => setShowIndicatorDialog(!showIndicatorDialog)}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Indicator
        </Button>

        {/* Drawing tools */}
        <Button
          size="sm"
          variant={drawingMode === "horizontal-line" ? "default" : "outline"}
          onClick={() => onModeChange(drawingMode === "horizontal-line" ? "none" : "horizontal-line")}
          className="h-7 text-xs"
        >
          <Minus className="w-3 h-3 mr-1" />
          H-Line
        </Button>

        <Button
          size="sm"
          variant={drawingMode === "trend-line" ? "default" : "outline"}
          onClick={() => onModeChange(drawingMode === "trend-line" ? "none" : "trend-line")}
          className="h-7 text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Trend
        </Button>

        {/* Chart settings */}
        <Button
          size="sm"
          variant={showChartSettings ? "default" : "outline"}
          onClick={() => setShowChartSettings(!showChartSettings)}
          className="h-7 text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          Settings
        </Button>
      </div>

      {/* Active indicators and drawings */}
      {(indicators.length > 0 || drawings.length > 0) && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/30 border-t border-border text-xs">
          {/* Indicators */}
          {indicators.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    indicator.visible ? "bg-background border-border" : "bg-muted border-muted opacity-60"
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm cursor-pointer"
                    style={{ backgroundColor: indicator.color }}
                    onClick={() => onToggleIndicator(indicator.id)}
                  />
                  <span className="font-medium">{indicator.name}</span>
                  <button
                    onClick={() => onRemoveIndicator(indicator.id)}
                    className="ml-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {indicators.length > 0 && drawings.length > 0 && <div className="h-3 w-px bg-border" />}

          {/* Drawings */}
          {drawings.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border bg-background border-border"
                >
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: drawing.color }} />
                  <span className="font-medium">
                    {drawing.type === "horizontal-line"
                      ? `@${(drawing as HorizontalLine).price.toFixed(5)}`
                      : "Trend"}
                  </span>
                  <button
                    onClick={() => onDeleteDrawing(drawing.id)}
                    className="ml-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAllClick}
                className="h-5 px-2 text-xs text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add indicator dialog */}
      {showIndicatorDialog && (
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <div className="p-3 border border-border rounded-lg bg-background space-y-3 max-w-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Add Indicator</h4>
              <button
                onClick={() => setShowIndicatorDialog(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value as IndicatorType);
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
                    <SelectItem value="SMA">SMA</SelectItem>
                    <SelectItem value="EMA">EMA</SelectItem>
                    <SelectItem value="RSI">RSI</SelectItem>
                    <SelectItem value="MACD">MACD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType === "MACD" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Fast Period</Label>
                    <Input
                      type="number"
                      value={shortPeriod}
                      onChange={(e) => setShortPeriod(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Slow Period</Label>
                    <Input
                      type="number"
                      value={longPeriod}
                      onChange={(e) => setLongPeriod(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Signal Period</Label>
                    <Input
                      type="number"
                      value={signalPeriod}
                      onChange={(e) => setSignalPeriod(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                </>
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
            </div>

            {selectedType === "RSI" && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
            )}

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

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddIndicator} className="flex-1 h-8 text-xs">
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowIndicatorDialog(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chart settings panel */}
      {showChartSettings && (
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <div className="p-3 border border-border rounded-lg bg-background max-w-4xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Chart Settings</h4>
              <button
                onClick={() => setShowChartSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Crosshair mode */}
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium whitespace-nowrap">Crosshair:</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={crosshairSettings.mode === "magnet" ? "default" : "outline"}
                    onClick={() => onUpdateCrosshair({ ...crosshairSettings, mode: "magnet" })}
                    className="h-7 px-2 text-xs"
                  >
                    Snap
                  </Button>
                  <Button
                    size="sm"
                    variant={crosshairSettings.mode === "normal" ? "default" : "outline"}
                    onClick={() => onUpdateCrosshair({ ...crosshairSettings, mode: "normal" })}
                    className="h-7 px-2 text-xs"
                  >
                    Follow
                  </Button>
                </div>
              </div>

              <div className="h-5 w-px bg-border" />

              {/* Vertical line */}
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium whitespace-nowrap">V-Line:</Label>
                <Switch
                  checked={crosshairSettings.verticalLineVisible}
                  onCheckedChange={(checked) =>
                    onUpdateCrosshair({ ...crosshairSettings, verticalLineVisible: checked })
                  }
                />
                {crosshairSettings.verticalLineVisible && (
                  <Select
                    value={crosshairSettings.verticalLineStyle.toString()}
                    onValueChange={(value) =>
                      onUpdateCrosshair({
                        ...crosshairSettings,
                        verticalLineStyle: parseInt(value) as 0 | 1 | 2 | 3 | 4,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINE_STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="h-5 w-px bg-border" />

              {/* Horizontal line */}
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium whitespace-nowrap">H-Line:</Label>
                <Switch
                  checked={crosshairSettings.horizontalLineVisible}
                  onCheckedChange={(checked) =>
                    onUpdateCrosshair({ ...crosshairSettings, horizontalLineVisible: checked })
                  }
                />
                {crosshairSettings.horizontalLineVisible && (
                  <Select
                    value={crosshairSettings.horizontalLineStyle.toString()}
                    onValueChange={(value) =>
                      onUpdateCrosshair({
                        ...crosshairSettings,
                        horizontalLineStyle: parseInt(value) as 0 | 1 | 2 | 3 | 4,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINE_STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog for clearing all drawings */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Drawings?</DialogTitle>
            <DialogDescription>
              Delete all {drawings.length} drawing{drawings.length === 1 ? '' : 's'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmClearAll}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
