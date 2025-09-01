
import React, { useState, useEffect } from "react";
import { ArbitrageOpportunity } from "@/api/entities";
import { TradeSimulation } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { ArrowLeft, Target, Bot, Zap, TrendingUp, TrendingDown, Scale, Percent, ExternalLink } from "lucide-react"; // Added ExternalLink import
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Sub-component for displaying simulation results
function SimulationResults({ results }) {
  if (!results) return null;
  const totalCosts = (results.trading_fees || 0) + (results.slippage_cost || 0);

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Bot className="w-5 h-5 text-purple-400" />
          Simulation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400"/>Gross Profit</span>
              <span className="font-bold text-emerald-400 text-lg">${results.gross_profit?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400"/>Total Costs</span>
              <span className="font-bold text-red-400 text-lg">-${totalCosts.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2"><Scale className="w-4 h-4 text-blue-400"/>Net Profit</span>
              <span className="font-bold text-blue-400 text-2xl">${results.net_profit?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2"><Percent className="w-4 h-4 text-amber-400"/>ROI</span>
              <span className="font-bold text-amber-400 text-lg">{results.roi_percentage?.toFixed(2)}%</span>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">AI Recommendation</h4>
            <p className="text-sm text-slate-300">{results.ai_recommendation}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 mb-2">Potential Risks</h4>
          <ul className="space-y-1 text-sm text-slate-400 list-disc list-inside">
            {results.risk_factors?.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Simulator() {
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    trade_amount: 1000,
    buy_fee_percent: 0.1,
    sell_fee_percent: 0.1,
    slippage_percent: 0.05,
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cameFromAlert, setCameFromAlert] = useState(false); // Added new state

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('opp_id');
    const fromAlert = urlParams.get('from_alert'); // Read from_alert parameter
    
    if (oppId) {
      ArbitrageOpportunity.get(oppId).then(opp => {
        setOpportunity(opp);
        if (fromAlert) { // Check if loaded from alert
          setCameFromAlert(true);
        }
      }).catch(console.error);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setSimulationParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const applyPreset = (preset) => {
    const presets = {
      low: { buy_fee_percent: 0.05, sell_fee_percent: 0.05, slippage_percent: 0.02 },
      standard: { buy_fee_percent: 0.1, sell_fee_percent: 0.1, slippage_percent: 0.05 },
      high: { buy_fee_percent: 0.2, sell_fee_percent: 0.2, slippage_percent: 0.1 },
    };
    setSimulationParams(prev => ({ ...prev, ...presets[preset] }));
  };

  const runSimulation = async () => {
    if (!opportunity) return;
    setIsSimulating(true);
    setSimulationResults(null);

    const { trade_amount, buy_fee_percent, sell_fee_percent, slippage_percent } = simulationParams;
    const { buy_price, sell_price } = opportunity;
    
    // Auto-calculate costs
    const amount_in_base = trade_amount / buy_price;
    const gross_profit = (sell_price - buy_price) * amount_in_base;
    
    const buy_fee = trade_amount * (buy_fee_percent / 100);
    const sell_value = amount_in_base * sell_price;
    const sell_fee = sell_value * (sell_fee_percent / 100);
    const trading_fees = buy_fee + sell_fee;

    const slippage_cost = sell_value * (slippage_percent / 100);

    const net_profit = gross_profit - trading_fees - slippage_cost;
    const roi_percentage = (net_profit / trade_amount) * 100;

    const baseResults = {
      opportunity_id: opportunity.id,
      trade_amount,
      entry_price: buy_price,
      exit_price: sell_price,
      gross_profit,
      trading_fees,
      slippage_percent,
      slippage_cost,
      net_profit,
      roi_percentage,
    };

    try {
      const aiResponse = await InvokeLLM({
        prompt: `Analyze this crypto arbitrage trade simulation.
        Opportunity: ${JSON.stringify(opportunity)}
        Simulation Parameters: ${JSON.stringify(simulationParams)}
        Calculated Costs: Trading Fees: $${trading_fees.toFixed(2)}, Slippage Cost: $${slippage_cost.toFixed(2)}
        Initial Calculation: ${JSON.stringify(baseResults)}
        
        Provide a concise AI recommendation (e.g., "EXECUTE", "MONITOR", "AVOID") and identify 3 key potential risk factors.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            ai_recommendation: { type: "string" },
            risk_factors: { type: "array", items: { type: "string" } },
            success_probability: { type: "number" }
          }
        }
      });
      
      const finalResults = { ...baseResults, ...aiResponse };
      setSimulationResults(finalResults);
      await TradeSimulation.create(finalResults);
    } catch (error) {
      console.error("AI simulation failed:", error);
      setSimulationResults({ ...baseResults, ai_recommendation: "AI analysis failed.", risk_factors: ["Could not fetch AI insights."] });
    }

    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <Button variant="outline" size="icon" className="border-slate-600" onClick={() => navigate(createPageUrl('Dashboard'))}>
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">
              Trade <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Simulator</span>
            </h1>
            <p className="text-slate-400 text-lg">Backtest opportunities before execution.</p>
          </div>
        </div>

        {cameFromAlert && (
          <div className="mb-6">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 flex items-center gap-2 w-fit">
              <ExternalLink className="w-4 h-4" />
              Loaded from Alert - Ready to Simulate
            </Badge>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Simulation Parameters */}
          <Card className="glass-effect border-slate-600">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Target className="w-5 h-5 text-emerald-400" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {opportunity ? (
                <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                  <h3 className="font-bold text-lg text-slate-100">{opportunity.symbol}</h3>
                  <p className="text-sm text-slate-400">{opportunity.buy_exchange} → {opportunity.sell_exchange}</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">+{opportunity.spread_percentage?.toFixed(2)}% Spread</p>
                </div>
              ) : (
                <p className="text-slate-400 text-center">Select an opportunity from the dashboard to begin.</p>
              )}

              <div className="space-y-2">
                <Label className="text-slate-200">Trade Amount (USD)</Label>
                <Input type="number" value={simulationParams.trade_amount} onChange={e => handleInputChange('trade_amount', e.target.value)} className="bg-slate-800/50 border-slate-600 text-slate-200" />
              </div>

              <div>
                <Label className="text-slate-200 mb-2 block">Cost Presets</Label>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => applyPreset('low')} className="border-slate-600 text-slate-300 hover:bg-slate-700">Low</Button>
                    <Button variant="outline" size="sm" onClick={() => applyPreset('standard')} className="border-slate-600 text-slate-300 hover:bg-slate-700">Standard</Button>
                    <Button variant="outline" size="sm" onClick={() => applyPreset('high')} className="border-slate-600 text-slate-300 hover:bg-slate-700">High</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Buy Fee (%)</Label>
                  <Input type="number" step="0.01" value={simulationParams.buy_fee_percent} onChange={e => handleInputChange('buy_fee_percent', e.target.value)} className="bg-slate-800/50 border-slate-600 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Sell Fee (%)</Label>
                  <Input type="number" step="0.01" value={simulationParams.sell_fee_percent} onChange={e => handleInputChange('sell_fee_percent', e.target.value)} className="bg-slate-800/50 border-slate-600 text-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Slippage (%)</Label>
                <Input type="number" step="0.01" value={simulationParams.slippage_percent} onChange={e => handleInputChange('slippage_percent', e.target.value)} className="bg-slate-800/50 border-slate-600 text-slate-200" />
              </div>
              
              <Button onClick={runSimulation} disabled={!opportunity || isSimulating} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                <Zap className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} />
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Results placeholder */}
          <div className="flex items-center justify-center">
            {isSimulating && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>}
            {!isSimulating && simulationResults && <SimulationResults results={simulationResults} />}
            {!isSimulating && !simulationResults && (
              <div className="text-center text-slate-500">
                <Bot className="w-16 h-16 mx-auto mb-4" />
                <p>Your simulation results will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
