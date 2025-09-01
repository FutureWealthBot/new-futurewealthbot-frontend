
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";

export default function PairChart({ opportunity }) {
  const [chartData, setChartData] = useState([]);
  const [activeChart, setActiveChart] = useState("price");

  const generateChartData = useCallback(() => {
    if (!opportunity) return;
    
    const basePrice = opportunity.buy_price;
    const spread = opportunity.spread_percentage / 100;
    const data = [];

    // Generate 24 hours of mock data (hourly)
    for (let i = 23; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000);
      const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
      
      const buyPrice = basePrice * (1 + priceVariation);
      const sellPrice = buyPrice * (1 + spread + (Math.random() - 0.5) * 0.005);
      const currentSpread = ((sellPrice - buyPrice) / buyPrice) * 100;
      const volume = Math.random() * 50000 + 10000;

      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.getTime(),
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        spread: currentSpread,
        volume: volume,
        profit: (10000 * currentSpread) / 100, // Profit for $10k trade
      });
    }
    
    setChartData(data);
  }, [opportunity]);

  useEffect(() => {
    generateChartData();
  }, [generateChartData]);

  const formatPrice = (value) => `$${value?.toFixed(4)}`;
  const formatSpread = (value) => `${value?.toFixed(2)}%`;
  const formatVolume = (value) => `$${(value / 1000).toFixed(0)}K`;

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          {opportunity?.symbol} Charts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-600 mb-6">
            <TabsTrigger value="price" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Price
            </TabsTrigger>
            <TabsTrigger value="spread" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Spread
            </TabsTrigger>
            <TabsTrigger value="volume" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Volume
            </TabsTrigger>
            <TabsTrigger value="profit" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Profit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={formatPrice}
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
                      formatPrice(value),
                      name === 'buyPrice' ? `${opportunity?.buy_exchange} Price` : `${opportunity?.sell_exchange} Price`
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="buyPrice" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="buyPrice"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sellPrice" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                    name="sellPrice"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-400">{opportunity?.buy_exchange}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-slate-400">{opportunity?.sell_exchange}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spread" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={formatSpread}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [formatSpread(value), 'Spread']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spread" 
                    stroke="#8b5cf6" 
                    fill="url(#spreadGradient)"
                    strokeWidth={2}
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

          <TabsContent value="volume" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickFormatter={formatVolume}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [formatVolume(value), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="profit" className="mt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
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
                    formatter={(value) => [`$${value?.toFixed(0)}`, 'Profit Potential']}
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
              <p className="text-xs text-slate-400">Based on $10,000 trade amount</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
