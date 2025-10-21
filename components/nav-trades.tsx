"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { TradeDetailsDialog } from "@/components/trading/TradeDetailsDialog"
import { Id } from "@/convex/_generated/dataModel"
import { usePrice } from "@/context/PriceContext"

export function NavTrades() {
  const trades = useQuery(api.trades.getUserTrades, { status: "open" })
  const [selectedTradeId, setSelectedTradeId] = useState<Id<"trades"> | null>(null)
  const { getPrice, subscribeToSymbol, unsubscribeFromSymbol } = usePrice()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Subscribe to price updates for all open trades
  useEffect(() => {
    if (!trades) return

    const symbols = new Set(trades.map(t => t.symbol))
    symbols.forEach(symbol => subscribeToSymbol(symbol))

    return () => {
      symbols.forEach(symbol => unsubscribeFromSymbol(symbol))
    }
    // subscribeToSymbol and unsubscribeFromSymbol are now memoized in PriceContext
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades])

  const selectedTrade = trades?.find(t => t._id === selectedTradeId)

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              Active Trades
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarMenu className="gap-2 px-2">
              {!trades && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {trades && trades.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-xs text-muted-foreground">No active trades</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {trades && trades.map((trade) => {
                const decimalPlaces = trade.symbol.includes("JPY") ? 3 : 5
                const currentPrice = getPrice(trade.symbol) || trade.entryPrice

                // Calculate P&L
                const calculatePnL = () => {
                  if (trade.direction === "long") {
                    return (currentPrice - trade.entryPrice) * trade.positionSize * 100000
                  } else {
                    return (trade.entryPrice - currentPrice) * trade.positionSize * 100000
                  }
                }

                const pnl = calculatePnL()
                const isProfit = pnl >= 0

                // Calculate time in trade
                const timeInTrade = Math.floor((Date.now() / 1000 - trade.entryTime) / 60)
                const hours = Math.floor(timeInTrade / 60)
                const minutes = timeInTrade % 60
                const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

                return (
                  <SidebarMenuItem key={trade._id}>
                    <SidebarMenuButton
                      onClick={(e) => {
                        e.preventDefault()

                        // Check if we're on the chart page
                        const isOnChartPage = pathname === '/chart'

                        // Get current symbol from URL or default to null
                        const currentSymbol = searchParams.get('symbol')

                        // Check if we're already viewing this trade's symbol
                        const isOnCorrectSymbol = currentSymbol === trade.symbol

                        // Navigate to the chart page with the trade's symbol
                        router.push(`/chart?symbol=${trade.symbol}`)

                        // Only open the modal if we're already on the chart page with the correct symbol
                        if (isOnChartPage && isOnCorrectSymbol) {
                          setSelectedTradeId(trade._id)
                        }
                      }}
                      className="h-auto py-2.5 hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 w-full">
                        {trade.direction === "long" ? (
                          <TrendingUp className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isProfit ? "text-green-600" : "text-red-600"}`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isProfit ? "text-green-600" : "text-red-600"}`} />
                        )}
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{trade.symbol}</span>
                            <span className={`text-xs font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                              {isProfit ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{trade.entryPrice.toFixed(decimalPlaces)}</span>
                            <span>•</span>
                            <span>{timeDisplay}</span>
                          </div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {selectedTrade && (
        <TradeDetailsDialog
          trade={selectedTrade}
          open={selectedTradeId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTradeId(null)
          }}
        />
      )}
    </>
  )
}
