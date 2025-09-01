
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { ArbitrageOpportunity } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, BarChart3, Zap, RefreshCw, Target, AlertCircle, Gem, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OpportunityCard from "../components/dashboard/OpportunityCard";

const Paywall = () => (
  <Card className="glass-effect border-slate-600">
    <CardContent className="p-12 text-center">
      <Gem className="w-16 h-16 text-amber-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-100 mb-2">Unlock FutureWealthBot Analysis</h3>
      <p className="text-slate-400 mb-6">This feature is available for Pro and Whale subscribers. Upgrade your plan to get advanced market insights.</p>
      <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
        <Link to={createPageUrl("Subscription")}>
          <Gem className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Link>
      </Button>
    </CardContent>
  </Card>
);

export default function Analysis() {
  const [currentUser, setCurrentUser] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [topOpportunity, setTopOpportunity] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(console.error);
    loadData();
  }, []);

  const loadData = async () => {
    const data = await ArbitrageOpportunity.list('-created_date', 20);
    setOpportunities(data);
  };
  
  const profitData = useMemo(() => {
    if (!opportunities.length) return { total: 0, breakdown: [] };
    
    const capitalAmount = 10000;
    const breakdown = opportunities
      .filter(opp => opp.status === 'active')
      .sort((a, b) => (b.spread_percentage || 0) - (a.spread_percentage || 0))
      .slice(0, 5)
      .map(opp => {
        const grossProfit = (capitalAmount * (opp.spread_percentage || 0)) / 100;
        const estimatedFees = grossProfit * 0.2; // 20% for fees and slippage
        const netProfit = grossProfit - estimatedFees;
        return {
          symbol: opp.symbol,
          spread: opp.spread_percentage,
          grossProfit,
          netProfit,
          riskLevel: opp.execution_risk
        };
      });
    
    const total = breakdown.reduce((sum, item) => sum + item.netProfit, 0);
    return { total, breakdown };
  }, [opportunities]);

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setTopOpportunity(null);
    try {
      const opportunityContext = opportunities.map(o => 
        `Symbol: ${o.symbol}, Spread: ${o.spread_percentage}%, Buy at ${o.buy_exchange}, Sell at ${o.sell_exchange}, Risk: ${o.execution_risk}`
      ).join('\n');

      const response = await InvokeLLM({
        prompt: `As an expert crypto market analyst for FutureWealthBot, your task is to provide a detailed and actionable market analysis for a trader focused on arbitrage opportunities.

**Step 1: Analyze Internal Data**
Here are the current arbitrage opportunities identified by our system:
${opportunityContext}

**Step 2: Gather External Market Intelligence**
To inform your analysis, consult the latest crypto news and market analysis from these primary sources:
-   insidefinancialnews.com (specifically the crypto section)
-   fxstreet.com

Synthesize the information from these sources to understand the current market narrative, major news events, and technical analysis trends.

**Step 3: Generate a Detailed Analysis Report**
Based on both internal and external data, generate a report with the following structure in JSON format:

1.  **Overall Market Sentiment:** Provide a nuanced sentiment (e.g., Cautiously Bullish, Neutral with Volatility) and a detailed justification. Cite at least one specific news headline or market trend from your external sources.
2.  **Top Opportunity Analysis:**
    -   **Primary Pick:** Identify the single best opportunity from the internal data. Explain in detail why it's the top pick, considering profit potential, risk, volume, and alignment with current market sentiment.
    -   **Runner-Up:** Briefly mention a second-best opportunity as an alternative, with a short explanation.
3.  **Key Market Drivers:** Provide 3-4 bullet points on the most significant factors influencing the market right now, based on your research from the specified websites.
4.  **Comprehensive Risk Assessment:** Identify key risks. For each, provide a brief description and a practical mitigation strategy for an arbitrage trader.
5.  **Actionable Trading Recommendations:** Suggest 2-3 concrete, actionable steps a trader should take based on your complete analysis.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_sentiment: { type: "string" },
            sentiment_justification: { type: "string" },
            top_opportunity_analysis: {
              type: "object",
              properties: {
                primary_pick: {
                  type: "object",
                  properties: {
                    symbol: { type: "string" },
                    explanation: { type: "string" }
                  },
                  required: ["symbol", "explanation"]
                },
                runner_up: {
                  type: "object",
                  properties: {
                    symbol: { type: "string" },
                    explanation: { type: "string" }
                  }
                }
              },
              required: ["primary_pick"]
            },
            market_drivers: { type: "array", items: { type: "string" } },
            risk_assessment: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        risk: {"type": "string"},
                        mitigation: {"type": "string"}
                    },
                    required: ["risk", "mitigation"]
                }
            },
            recommended_actions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setAnalysis(response);

      if (response?.top_opportunity_analysis?.primary_pick?.symbol) {
        const foundOpp = opportunities.find(opp => opp.symbol === response.top_opportunity_analysis.primary_pick.symbol);
        if (foundOpp) {
          setTopOpportunity(foundOpp);
        }
      }
    } catch (error) {
      console.error("Failed to generate analysis:", error);
      alert("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isPro = currentUser?.subscription_plan === 'Pro' || currentUser?.subscription_plan === 'Whale';

  if (!isPro && currentUser) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
         <Paywall />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">
              FutureWealthBot 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-2">
                Analysis
              </span>
            </h1>
            <p className="text-slate-400 mt-2">Get deep market insights powered by our trading intelligence engine.</p>
          </div>
          <Button
            onClick={generateAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 self-start lg:self-center"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
          </Button>
        </div>

        {/* Profit Overview Card */}
        <Card className="glass-effect border-slate-600 mb-6">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Profit Potential Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Total Potential (Top 5)</p>
                <p className="text-3xl font-bold text-emerald-400">${profitData.total.toFixed(0)}</p>
                <p className="text-xs text-slate-500">Per $10K capital</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Active Opportunities</p>
                <p className="text-3xl font-bold text-blue-400">{opportunities.filter(o => o.status === 'active').length}</p>
                <p className="text-xs text-slate-500">Live now</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Best Spread</p>
                <p className="text-3xl font-bold text-amber-400">
                  {Math.max(...opportunities.map(o => o.spread_percentage || 0)).toFixed(2)}%
                </p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800/50 border border-slate-600 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Overview</TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Top Pick</TabsTrigger>
            <TabsTrigger value="profit" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Profit</TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Risks</TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Actions</TabsTrigger>
          </TabsList>

          {!analysis && !isAnalyzing ? (
            <Card className="glass-effect border-slate-600">
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-100 mb-2">FutureWealthBot is Ready</h3>
                <p className="text-slate-400 mb-6">Click "Generate Analysis" to get comprehensive market insights.</p>
              </CardContent>
            </Card>
          ) : ( isAnalyzing ? (
            <Card className="glass-effect border-slate-600">
              <CardContent className="p-12 text-center">
                <RefreshCw className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-slate-100 mb-2">Analyzing Markets...</h3>
                <p className="text-slate-400 mb-6">Our AI is processing data. This may take a moment.</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TabsContent value="overview">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glass-effect border-slate-600">
                      <CardHeader>
                        <CardTitle>Market Overview</CardTitle>
                        <CardDescription>AI-powered sentiment analysis</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-bold text-lg text-slate-200">Sentiment: <span className="text-purple-400">{analysis.market_sentiment}</span></h4>
                          <p className="text-slate-400">{analysis.sentiment_justification}</p>
                        </div>
                      </CardContent>
                    </Card>
                     <Card className="glass-effect border-slate-600">
                        <CardHeader>
                            <CardTitle>Key Market Drivers</CardTitle>
                            <CardDescription>Insights from market news and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2 mt-2">
                                {analysis.market_drivers?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>
              <TabsContent value="opportunities">
                <div className="space-y-6">
                  <Card className="glass-effect border-slate-600">
                    <CardHeader>
                        <CardTitle>FutureWealthBot's Top Pick Analysis</CardTitle>
                        <CardDescription>The best opportunity identified by our AI</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-bold text-lg text-slate-200">{analysis.top_opportunity_analysis?.primary_pick?.symbol}</h4>
                      <p className="text-slate-400">{analysis.top_opportunity_analysis?.primary_pick?.explanation}</p>
                    </CardContent>
                  </Card>
                  {topOpportunity && <OpportunityCard opportunity={topOpportunity} />}
                  {analysis.top_opportunity_analysis?.runner_up?.symbol && (
                    <Card className="glass-effect border-slate-600">
                      <CardHeader>
                        <CardTitle>Runner-Up Opportunity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-bold text-lg text-slate-200">{analysis.top_opportunity_analysis.runner_up.symbol}</h4>
                        <p className="text-slate-400">{analysis.top_opportunity_analysis.runner_up.explanation}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="profit">
                <Card className="glass-effect border-slate-600">
                  <CardHeader>
                    <CardTitle>Detailed Profit Breakdown</CardTitle>
                    <CardDescription>Based on a simulated $10,000 trade per opportunity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profitData.breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                          <div>
                            <p className="font-semibold text-slate-200">{item.symbol}</p>
                            <p className="text-sm text-slate-400">{item.spread.toFixed(2)}% spread • {item.riskLevel} risk</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">${item.netProfit.toFixed(0)}</p>
                            <p className="text-xs text-slate-500">Net profit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="risks">
                <Card className="glass-effect border-slate-600">
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>AI summary of potential market risks and mitigations</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <ul className="space-y-4">
                        {analysis.risk_assessment?.map((item, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1"/>
                            <div>
                              <p className="font-semibold text-slate-200">{item.risk}</p>
                              <p className="text-sm text-slate-400">Mitigation: {item.mitigation}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="actions">
                <Card className="glass-effect border-slate-600">
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                    <CardDescription>Concrete steps to take based on the analysis</CardDescription>
                    </CardHeader>
                  <CardContent>
                    <ul className="list-none space-y-3 text-slate-300">
                      {analysis.recommended_actions?.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1"/>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
