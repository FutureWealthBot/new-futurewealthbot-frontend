import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp } from "lucide-react";

export default function TopPerformers({ opportunities }) {
  const topPerformers = opportunities
    .sort((a, b) => (b.spread_percentage || 0) - (a.spread_percentage || 0))
    .slice(0, 5);

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {topPerformers.length > 0 ? topPerformers.map((opportunity, index) => (
            <div key={opportunity.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-amber-500/20 text-amber-400' :
                  index === 1 ? 'bg-slate-500/20 text-slate-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-600/20 text-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{opportunity.symbol}</p>
                  <p className="text-xs text-slate-500">{opportunity.buy_exchange} → {opportunity.sell_exchange}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {opportunity.spread_percentage?.toFixed(2)}%
                </Badge>
              </div>
            </div>
          )) : (
            <p className="text-center text-slate-400 py-4">No opportunities available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}