"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrosshairSettings, LINE_STYLE_OPTIONS } from "@/lib/chart-settings";
import { Settings, X } from "lucide-react";
import { useState } from "react";

interface ChartSettingsProps {
  crosshairSettings: CrosshairSettings;
  onUpdateCrosshair: (settings: CrosshairSettings) => void;
}

export function ChartSettings({
  crosshairSettings,
  onUpdateCrosshair,
}: ChartSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Chart Settings</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          {isOpen ? "Hide" : "Show"}
        </Button>
      </div>

      {/* Settings Panel */}
      {isOpen && (
        <div className="space-y-3 p-3 border border-border rounded-lg bg-background">
          {/* Crosshair Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Crosshair Mode</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={crosshairSettings.mode === "magnet" ? "default" : "outline"}
                onClick={() =>
                  onUpdateCrosshair({ ...crosshairSettings, mode: "magnet" })
                }
                className="h-7 text-xs flex-1"
              >
                Snap to Price
              </Button>
              <Button
                size="sm"
                variant={crosshairSettings.mode === "normal" ? "default" : "outline"}
                onClick={() =>
                  onUpdateCrosshair({ ...crosshairSettings, mode: "normal" })
                }
                className="h-7 text-xs flex-1"
              >
                Follow Cursor
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {crosshairSettings.mode === "magnet"
                ? "Crosshair snaps to nearest price point"
                : "Crosshair follows cursor position exactly"}
            </p>
          </div>

          {/* Vertical Line Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Vertical Line</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Visible</Label>
                <Switch
                  checked={crosshairSettings.verticalLineVisible}
                  onCheckedChange={(checked) =>
                    onUpdateCrosshair({
                      ...crosshairSettings,
                      verticalLineVisible: checked,
                    })
                  }
                />
              </div>
            </div>
            {crosshairSettings.verticalLineVisible && (
              <div className="space-y-1">
                <Label className="text-xs">Line Style</Label>
                <Select
                  value={crosshairSettings.verticalLineStyle.toString()}
                  onValueChange={(value) =>
                    onUpdateCrosshair({
                      ...crosshairSettings,
                      verticalLineStyle: parseInt(value) as 0 | 1 | 2 | 3 | 4,
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_STYLE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Horizontal Line Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Horizontal Line</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Visible</Label>
                <Switch
                  checked={crosshairSettings.horizontalLineVisible}
                  onCheckedChange={(checked) =>
                    onUpdateCrosshair({
                      ...crosshairSettings,
                      horizontalLineVisible: checked,
                    })
                  }
                />
              </div>
            </div>
            {crosshairSettings.horizontalLineVisible && (
              <div className="space-y-1">
                <Label className="text-xs">Line Style</Label>
                <Select
                  value={crosshairSettings.horizontalLineStyle.toString()}
                  onValueChange={(value) =>
                    onUpdateCrosshair({
                      ...crosshairSettings,
                      horizontalLineStyle: parseInt(value) as 0 | 1 | 2 | 3 | 4,
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_STYLE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
