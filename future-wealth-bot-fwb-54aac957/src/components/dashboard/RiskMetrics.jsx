
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function RiskMetrics({ opportunities }) {
  const riskAnalysis = {
    low: opportunities.filter(opp => opp.execution_risk === 'low').length,
    medium: opportunities.filter(opp => opp.execution_risk === 'medium').length,
    high: opportunities.filter(opp => opp.execution_risk === 'high').length,
  };

  const total = opportunities.length || 1;
  const avgConfidence = opportunities.length > 0 
    ? opportunities.reduce((sum, opp) => sum + (opp.confidence_score || 85), 0) / opportunities.length
    : 85;

  return (
    <Card className="glass-effect border-slate-600">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">AI Confidence</span>
              <span className="text-sm font-semibold text-slate-200">{avgConfidence.toFixed(0)}/100</span>
            </div>
            <Progress 
              value={avgConfidence} 
              className="h-2 bg-slate-700"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Low Risk</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-emerald-400">{riskAnalysis.low}</span>
                <span className="text-xs text-slate-500 ml-1">
                  ({((riskAnalysis.low / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-400">Medium Risk</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-amber-400">{riskAnalysis.medium}</span>
                <span className="text-xs text-slate-500 ml-1">
                  ({((riskAnalysis.medium / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-400">High Risk</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-red-400">{riskAnalysis.high}</span>
                <span className="text-xs text-slate-500 ml-1">
                  ({((riskAnalysis.high / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Overall Risk Level</p>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">
                  {riskAnalysis.low > riskAnalysis.medium + riskAnalysis.high ? 'Conservative' :
                   riskAnalysis.medium > riskAnalysis.high ? 'Balanced' : 'Aggressive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
