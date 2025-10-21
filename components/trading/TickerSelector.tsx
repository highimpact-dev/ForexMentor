"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DEFAULT_TRADING_PAIRS } from "@/lib/chart-config";

interface TickerSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TickerSelector({ value, onChange }: TickerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tickers, setTickers] = useState(DEFAULT_TRADING_PAIRS);
  const [isLoading, setIsLoading] = useState(false);

  const searchTickers = useAction(api.forexTickers.searchForexTickers);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (search.length === 0) {
      setTickers(DEFAULT_TRADING_PAIRS);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await searchTickers({ search, limit: 50 });
        setTickers(result.tickers);
      } catch (error) {
        console.error("Error searching tickers:", error);
        // Fall back to default pairs on error
        setTickers(DEFAULT_TRADING_PAIRS);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [search, open, searchTickers]);

  const selectedTicker = tickers.find((t) => t.symbol === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between h-8 text-sm font-semibold"
        >
          {selectedTicker?.symbol || value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search currency pairs..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : tickers.length === 0 ? (
              <CommandEmpty>No currency pair found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {tickers.map((ticker) => (
                  <CommandItem
                    key={ticker.symbol}
                    value={ticker.symbol}
                    onSelect={() => {
                      onChange(ticker.symbol);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ticker.symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">{ticker.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {ticker.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
