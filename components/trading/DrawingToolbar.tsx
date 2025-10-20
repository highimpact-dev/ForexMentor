"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawingMode, Drawing, HorizontalLine, TrendLine, DRAWING_COLORS, LINE_STYLES } from "@/lib/drawing-types";
import { Minus, TrendingUp, Trash2, X, Edit2 } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface DrawingToolbarProps {
  drawingMode: DrawingMode;
  drawings: Drawing[];
  onModeChange: (mode: DrawingMode) => void;
  onDeleteDrawing: (id: string) => void;
  onUpdateDrawing: (id: string, updates: Partial<Drawing>) => void;
  onClearAllDrawings: () => void;
}

export function DrawingToolbar({
  drawingMode,
  drawings,
  onModeChange,
  onDeleteDrawing,
  onUpdateDrawing,
  onClearAllDrawings,
}: DrawingToolbarProps) {
  const [showDrawingsList, setShowDrawingsList] = useState(true); // Auto-expand by default
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);

  const handleStartEdit = (drawing: Drawing) => {
    setEditingDrawingId(drawing.id);
  };

  const handleDoneEdit = () => {
    setEditingDrawingId(null);
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

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-border bg-card">
      {/* Drawing Tools */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Drawing Tools</span>
        {drawings.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDrawingsList(!showDrawingsList)}
            className="h-7 text-xs"
          >
            {drawings.length} {drawings.length === 1 ? "drawing" : "drawings"}
          </Button>
        )}
      </div>

      {/* Tool Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={drawingMode === "horizontal-line" ? "default" : "outline"}
          onClick={() =>
            onModeChange(drawingMode === "horizontal-line" ? "none" : "horizontal-line")
          }
          className="h-8 text-xs"
        >
          <Minus className="w-3 h-3 mr-1" />
          Horizontal Line
        </Button>

        <Button
          size="sm"
          variant={drawingMode === "trend-line" ? "default" : "outline"}
          onClick={() =>
            onModeChange(drawingMode === "trend-line" ? "none" : "trend-line")
          }
          className="h-8 text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Trend Line
        </Button>

        {drawingMode !== "none" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onModeChange("none")}
            className="h-8 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        )}

        {drawings.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAllDrawings}
            className="h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Drawing Mode Indicator */}
      {drawingMode !== "none" && (
        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded">
          {drawingMode === "horizontal-line" && (
            <span>📍 Click on the chart to place a horizontal line</span>
          )}
          {drawingMode === "trend-line" && (
            <span>📍 Click two points on the chart to draw a trend line (first click sets starting point)</span>
          )}
        </div>
      )}

      {/* Drawings List */}
      {showDrawingsList && drawings.length > 0 && (
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {drawings.map((drawing) => {
            const isEditing = editingDrawingId === drawing.id;
            const isHorizontalLine = drawing.type === "horizontal-line";

            return (
              <div
                key={drawing.id}
                className="flex items-center justify-between px-2 py-1.5 text-xs rounded bg-secondary/50 hover:bg-secondary"
              >
                {isEditing ? (
                  // Edit mode for all drawings - updates in real-time
                  <div className="flex flex-col gap-2 flex-1 py-2">
                    {/* Price input for horizontal lines */}
                    {drawing.type === "horizontal-line" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-12">Price:</Label>
                        <Input
                          type="number"
                          step="0.00001"
                          value={(drawing as HorizontalLine).price}
                          onChange={(e) => handlePriceChange(drawing.id, e.target.value)}
                          className="h-6 text-xs flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Escape") handleDoneEdit();
                          }}
                        />
                      </div>
                    )}

                    {/* Color picker */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-12">Color:</Label>
                      <div className="flex gap-1 flex-wrap">
                        {DRAWING_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(drawing.id, color)}
                            className={`w-5 h-5 rounded border-2 ${
                              drawing.color === color ? "border-foreground" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Line style selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-12">Style:</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={drawing.lineStyle === LINE_STYLES.SOLID ? "default" : "outline"}
                          onClick={() => handleLineStyleChange(drawing.id, LINE_STYLES.SOLID)}
                          className="h-6 px-2 text-xs"
                        >
                          Solid
                        </Button>
                        <Button
                          size="sm"
                          variant={drawing.lineStyle === LINE_STYLES.DASHED ? "default" : "outline"}
                          onClick={() => handleLineStyleChange(drawing.id, LINE_STYLES.DASHED)}
                          className="h-6 px-2 text-xs"
                        >
                          Dashed
                        </Button>
                        <Button
                          size="sm"
                          variant={drawing.lineStyle === LINE_STYLES.DOTTED ? "default" : "outline"}
                          onClick={() => handleLineStyleChange(drawing.id, LINE_STYLES.DOTTED)}
                          className="h-6 px-2 text-xs"
                        >
                          Dotted
                        </Button>
                      </div>
                    </div>

                    {/* Done button */}
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        onClick={handleDoneEdit}
                        className="h-6 px-3 text-xs flex-1"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal display mode
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: drawing.color }}
                      />
                      <span className="font-medium">
                        {drawing.type === "horizontal-line" ? (
                          <>Horizontal Line @ {(drawing as HorizontalLine).price.toFixed(5)}</>
                        ) : (
                          <>Trend Line</>
                        )}
                      </span>
                      {drawing.label && (
                        <span className="text-muted-foreground">({drawing.label})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(drawing)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteDrawing(drawing.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
