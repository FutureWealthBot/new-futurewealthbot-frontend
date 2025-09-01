import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function PricingCard({ plan, onSelect, isCurrent }) {
  const { name, price, description, features, isPopular } = plan;

  return (
    <Card className={`glass-effect border-slate-600 relative ${isPopular ? 'border-emerald-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 right-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg shadow-emerald-500/30">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-100">{name}</CardTitle>
        <CardDescription className="text-slate-400 h-10">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-4xl font-bold text-slate-100">
          {price} <span className="text-sm font-normal text-slate-400">/ month</span>
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelect(plan.name)} 
          className={`w-full ${isPopular ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-700'}`}
          disabled={isCurrent}
        >
          {isCurrent ? 'Current Plan' : `Switch to ${name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}