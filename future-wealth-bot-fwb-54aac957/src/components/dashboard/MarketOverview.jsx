import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export default function MarketOverview({ opportunities }) {
  const marketData = {
    totalVolume: opportunities.reduce((sum, opp) => sum + (opp.volume_24h || 0), 0),
    avgLiquidity: opportunities.length > 0 
      ? (opportunities.reduce((sum, opp) => sum + (opp.liquidity_score || 0), 0) / opportunities.length) * 10 // Scaled to 0-100
      : 0,
    highestSpread: Math.max(...opportunities.map(opp => opp.spread_percentage || 0)),
    activeExchanges: [...new Set(opportunities.flatMap(opp => [opp.buy_exchange, opp.sell_exchange]))].length
  };

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">24h Volume</span>
            </div>
            <span className="font-semibold text-slate-200">
              ${(marketData.totalVolume / 1000000).toFixed(1)}M
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Highest Spread</span>
            </div>
            <span className="font-semibold text-emerald-400">
              {marketData.highestSpread.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Avg. Liquidity</span>
            </div>
            <span className="font-semibold text-slate-200">
              {marketData.avgLiquidity.toFixed(0)}/100
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-400">Active Exchanges</span>
            </div>
            <span className="font-semibold text-slate-200">
              {marketData.activeExchanges}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Market Status</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-400 font-medium">Live & Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}