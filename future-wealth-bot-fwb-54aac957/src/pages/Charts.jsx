
import React, { useState, useEffect, useCallback } from "react";
import { ArbitrageOpportunity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Target } from "lucide-react";
import PairChart from "../components/charts/PairChart";
import MarketCharts from "../components/charts/MarketCharts";

export default function Charts() {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const oppId = urlParams.get('opp_id');

        const allOpsPromise = ArbitrageOpportunity.list('-created_date', 20);
        const specificOpPromise = oppId ? ArbitrageOpportunity.get(oppId) : Promise.resolve(null);
        
        const [allOps, specificOp] = await Promise.all([allOpsPromise, specificOpPromise]);
        
        setOpportunities(allOps);
        
        if (specificOp) {
          setSelectedOpportunity(specificOp);
        } else if (allOps.length > 0) {
          setSelectedOpportunity(allOps[0]);
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialLoad();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">
              Trading 
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ml-2">
                Charts
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Visualize market trends and price movements</p>
          </div>
          
          <div className="w-full lg:w-auto">
            <Select 
              value={selectedOpportunity?.id || ''} 
              onValueChange={(value) => {
                const opp = opportunities.find(o => o.id === value);
                setSelectedOpportunity(opp);
              }}
            >
              <SelectTrigger className="w-full lg:w-64 bg-slate-800/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {opportunities.map(opp => (
                  <SelectItem key={opp.id} value={opp.id}>
                    {opp.symbol} (+{opp.spread_percentage?.toFixed(2)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Individual Pair Chart */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="glass-effect border-slate-600">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading chart data...</p>
                </CardContent>
              </Card>
            ) : selectedOpportunity ? (
              <PairChart opportunity={selectedOpportunity} />
            ) : (
              <Card className="glass-effect border-slate-600">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No opportunities available. Refresh data on the dashboard.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Market Overview Charts */}
          <div>
            <MarketCharts opportunities={opportunities} />
          </div>
        </div>

        {/* Additional Market Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card className="glass-effect border-slate-600">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-400">
                {opportunities.length > 0 
                  ? Math.max(...opportunities.map(o => o.spread_percentage || 0)).toFixed(2)
                  : '0.00'}%
              </p>
              <p className="text-sm text-slate-400">Highest Spread Today</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-600">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">
                {opportunities.length > 0 
                  ? (opportunities.reduce((sum, o) => sum + (o.spread_percentage || 0), 0) / opportunities.length).toFixed(2)
                  : '0.00'}%
              </p>
              <p className="text-sm text-slate-400">Average Spread</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-600">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">
                {opportunities.filter(o => o.status === 'active').length}
              </p>
              <p className="text-sm text-slate-400">Active Opportunities</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
