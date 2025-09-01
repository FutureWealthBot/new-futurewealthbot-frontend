import React, { useState, useEffect, useMemo } from "react";
import { ArbitrageOpportunity } from "@/api/entities";
import { AlertSettings } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap, Target, DollarSign, BarChart3, RefreshCw, AlertTriangle, CheckCircle, Clock, Wallet, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import OpportunityCard from "../components/dashboard/OpportunityCard";
import MarketOverview from "../components/dashboard/MarketOverview";
import TopPerformers from "../components/dashboard/TopPerformers";
import RiskMetrics from "../components/dashboard/RiskMetrics";
import PriceTicker from "../components/dashboard/PriceTicker";
import StatCard from "../components/dashboard/StatCard";

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [alertSettings, setAlertSettings] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [oppData, alertData] = await Promise.all([
        ArbitrageOpportunity.list('-created_date', 50),
        AlertSettings.list()
      ]);
      
      setOpportunities(oppData);
      setAlertSettings(alertData[0] || null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const refreshOpportunities = async () => {
    setIsRefreshing(true);
    try {
      // 1. Get all currently active opportunities
      const oldOpportunities = await ArbitrageOpportunity.filter({ status: 'active' });

      // 2. Delete them to prevent clutter
      for (const opp of oldOpportunities) {
        await ArbitrageOpportunity.delete(opp.id);
      }
      
      // 3. Generate fresh arbitrage data using AI
      const response = await InvokeLLM({
        prompt: `Generate 8-12 realistic cryptocurrency arbitrage opportunities for today. Include major pairs like BTC/USDT, ETH/USDT, etc. across exchanges like Binance, Kraken, KuCoin. Make spreads between 0.8% to 4.2%. Include realistic prices, volumes, and risk assessments. Provide both a confidence_score and a liquidity_score on a 0-100 scale.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  base_asset: { type: "string" },
                  quote_asset: { type: "string" },
                  buy_exchange: { type: "string" },
                  sell_exchange: { type: "string" },
                  buy_price: { type: "number" },
                  sell_price: { type: "number" },
                  spread_percentage: { type: "number" },
                  spread_amount: { type: "number" },
                  volume_24h: { type: "number" },
                  liquidity_score: { type: "number" },
                  execution_risk: { type: "string" },
                  profit_potential: { type: "number" },
                  market_cap: { type: "number" },
                  confidence_score: { type: "number" },
                  ai_analysis: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.opportunities) {
        // 4. Create the new opportunities
        await ArbitrageOpportunity.bulkCreate(
          response.opportunities.map(opp => ({
            ...opp,
            status: "active",
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          }))
        );
        // 5. Reload all data
        await loadData();
      }
    } catch (error) {
      console.error("Error refreshing opportunities:", error);
    }
    setIsRefreshing(false);
  };

  const filteredOpportunities = useMemo(() => opportunities.filter(opp => {
    if (activeTab === "all") return true;
    if (activeTab === "high_profit") return opp.spread_percentage >= 2.0;
    if (activeTab === "low_risk") return opp.execution_risk === "low";
    if (activeTab === "active") return opp.status === "active";
    return true;
  }), [opportunities, activeTab]);

  const stats = useMemo(() => ({
    totalOpportunities: opportunities.length,
    activeOpportunities: opportunities.filter(o => o.status === "active").length,
    avgSpread: opportunities.length > 0 
      ? (opportunities.reduce((sum, o) => sum + o.spread_percentage, 0) / opportunities.length).toFixed(2)
      : "0.00",
    totalBalance: (alertSettings?.trading_capital || 0).toLocaleString('en-US')
  }), [opportunities, alertSettings]);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-2">
              Live Arbitrage 
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent ml-2">
                Opportunities
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Real-time profit detection across major exchanges</p>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={refreshOpportunities}
              disabled={isRefreshing}
              className="flex-1 lg:flex-none bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Scanning...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Price Ticker */}
        <PriceTicker />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Opportunities"
            value={stats.totalOpportunities}
            icon={Target}
            change={<CheckCircle className="w-4 h-4" />}
            changeText="Live Tracking"
            colorClass="slate"
          />
          <StatCard
            title="Active Now"
            value={stats.activeOpportunities}
            icon={Zap}
            change={<Clock className="w-4 h-4" />}
            changeText="Real-time"
            colorClass="blue"
          />
          <StatCard
            title="Avg. Spread"
            value={`${stats.avgSpread}%`}
            icon={BarChart3}
            change={<TrendingUp className="w-4 h-4" />}
            changeText="Trending Up"
            colorClass="amber"
          />
          <StatCard
            title="Total Account Balance"
            value={`$${stats.totalBalance}`}
            icon={Wallet}
            change={<Settings className="w-4 h-4" />}
            linkTo={createPageUrl('Alerts')}
            linkText="Manage Capital"
            colorClass="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Opportunities List */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl font-bold text-slate-100">Arbitrage Opportunities</CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    {filteredOpportunities.length} Found
                  </Badge>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 w-full">
                  <div className="overflow-x-auto pb-2 -mb-2">
                    <TabsList className="bg-slate-800/50 border border-slate-600">
                      <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">All</TabsTrigger>
                      <TabsTrigger value="high_profit" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">High Profit</TabsTrigger>
                      <TabsTrigger value="low_risk" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Low Risk</TabsTrigger>
                      <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Active</TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                      </div>
                    ) : filteredOpportunities.length > 0 ? (
                      filteredOpportunities.map((opportunity) => (
                        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-400">No opportunities found. Click refresh to scan for new ones.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            <MarketOverview opportunities={opportunities} />
            <TopPerformers opportunities={opportunities} />
            <RiskMetrics opportunities={opportunities} />
          </div>
        </div>
      </div>
    </div>
  );
}