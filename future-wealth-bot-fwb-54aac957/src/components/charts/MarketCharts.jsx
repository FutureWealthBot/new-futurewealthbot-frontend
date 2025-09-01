
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart3, Target } from "lucide-react";

export default function MarketCharts({ opportunities }) {
  const [marketData, setMarketData] = useState([]);
  const [activeChart, setActiveChart] = useState("spreads");

  const generateMarketData = useCallback(() => {
    const data = [];
    
    // Generate 7 days of market data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const avgSpread = opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + (opp.spread_percentage || 0), 0) / opportunities.length
        : 1.5;
      
      // Add some variation to historical data
      const variation = (Math.random() - 0.5) * 0.5;
      const daySpread = Math.max(0.1, avgSpread + variation);
      const opportunityCount = Math.floor(Math.random() * 15) + 5;
      const totalVolume = Math.random() * 100000000 + 50000000;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgSpread: daySpread,
        opportunities: opportunityCount,
        totalVolume: totalVolume,
        maxSpread: daySpread * 1.8,
        minSpread: daySpread * 0.4,
      });
    }
    
    setMarketData(data);
  }, [opportunities]); // opportunities is a dependency for generateMarketData

  useEffect(() => {
    generateMarketData();
  }, [generateMarketData]); // generateMarketData is a dependency because it's a memoized function

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Market Trends (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-600 mb-6">
            <TabsTrigger value="spreads" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Spreads
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="volume" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Volume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spreads" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={(value) => `${value?.toFixed(1)}%`}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value, name) => [
                      `${value?.toFixed(2)}%`,
                      name === 'avgSpread' ? 'Average Spread' : 
                      name === 'maxSpread' ? 'Max Spread' : 'Min Spread'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgSpread" 
                    stroke="#8b5cf6" 
                    fill="url(#spreadGradient)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxSpread" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <defs>
                    <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [value, 'Opportunities Found']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opportunities" 
                    stroke="#06b6d4" 
                    fill="url(#opportunityGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="opportunityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="volume" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`$${(value / 1000000).toFixed(1)}M`, 'Trading Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalVolume" 
                    stroke="#f59e0b" 
                    fill="url(#volumeGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="profit" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={(value) => `$${value?.toFixed(0)}`}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`$${value?.toFixed(0)}`, 'Potential Profit']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    fill="url(#profitGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-slate-400">Based on average spread and $10,000 trade amount</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
