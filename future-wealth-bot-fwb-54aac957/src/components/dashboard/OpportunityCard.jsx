
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRightLeft, Clock, Zap, Target, AlertTriangle, CheckCircle, Info, BarChart, Droplet, DollarSign, Timer, BarChart3 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OpportunityCard({ opportunity }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const getSpreadColor = (spread) => {
    if (spread >= 3) return 'text-emerald-400';
    if (spread >= 1.5) return 'text-amber-400';
    return 'text-slate-400';
  };

  const handleSimulate = () => {
    navigate(createPageUrl(`Simulator?opp_id=${opportunity.id}&from_alert=true`));
  };

  const handleViewCharts = () => {
    navigate(createPageUrl(`Charts?opp_id=${opportunity.id}`));
  };

  const formatLargeNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num?.toLocaleString() || 'N/A';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="glass-effect border-slate-600 hover:border-emerald-500/50 transition-all duration-300 group">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">{opportunity.symbol}</h3>
                <p className="text-sm text-slate-400">{opportunity.base_asset}/{opportunity.quote_asset}</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
              <p className={`text-2xl font-bold ${getSpreadColor(opportunity.spread_percentage)}`}>
                +{opportunity.spread_percentage?.toFixed(2)}%
              </p>
              <p className="text-sm text-slate-400">Spread</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Buy from</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{opportunity.buy_exchange}</span>
                <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
                  ${opportunity.buy_price?.toFixed(4)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Sell to</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{opportunity.sell_exchange}</span>
                <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/50">
                  ${opportunity.sell_price?.toFixed(4)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">
                  ${opportunity.profit_potential?.toFixed(0)} potential
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">
                  Score: {(opportunity.confidence_score || 85).toFixed(0)}/100
                </span>
              </div>
            </div>

            <Badge variant="outline" className={`${getRiskColor(opportunity.execution_risk)} flex-shrink-0`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {opportunity.execution_risk} risk
            </Badge>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-700/50 my-4 pt-4 space-y-3">
                   {opportunity.ai_analysis && (
                    <div className="bg-slate-800/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">AI Analysis</p>
                      <p className="text-sm text-slate-300">{opportunity.ai_analysis}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2"><DollarSign size={14} />Abs. Spread</span>
                      <span className="font-semibold text-slate-200">${opportunity.spread_amount?.toFixed(2) || 'N/A'}</span>
                    </div>
                     <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2"><Droplet size={14} />Liquidity</span>
                      <span className="font-semibold text-slate-200">{opportunity.liquidity_score?.toFixed(0) || 'N/A'}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2"><BarChart size={14} />24h Volume</span>
                      <span className="font-semibold text-slate-200">${formatLargeNumber(opportunity.volume_24h)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2"><Timer size={14} />Expires</span>
                      <span className="font-semibold text-slate-200">
                        {opportunity.expires_at ? formatDistanceToNow(new Date(opportunity.expires_at), { addSuffix: true }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-slate-700/50 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
                {opportunity.status === 'active' ? 'Active Now' : opportunity.status}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className={`text-xs border-slate-600  hover:border-emerald-500/50 ${isExpanded ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-700/50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Info className="w-3 h-3 mr-1" />
                {isExpanded ? 'Hide' : 'Details'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs border-slate-600 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50"
                onClick={handleViewCharts}
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Charts
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                onClick={handleSimulate}
              >
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                Simulate
              </Button>
              <Button size="sm" className="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                <Zap className="w-3 h-3 mr-1" />
                Execute
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
