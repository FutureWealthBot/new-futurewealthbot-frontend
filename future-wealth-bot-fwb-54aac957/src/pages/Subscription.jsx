
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import PricingCard from "@/components/subscription/PricingCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For beginners starting with arbitrage trading.',
    features: ['Real-time opportunity dashboard', 'Limited to 5 opportunities', 'Manual trade execution', 'Basic alerts'],
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For active traders who need advanced tools.',
    features: ['Everything in Free, plus:', 'Unlimited opportunities', 'FutureWealthBot Analysis', 'Trade Simulator', 'Advanced alerts (Instant)'],
    isPopular: true,
  },
  {
    name: 'Whale',
    price: '$199',
    description: 'For professional firms and high-volume traders.',
    features: ['Everything in Pro, plus:', 'API for automated trading', 'Priority support', 'Dedicated server resources', 'Team accounts'],
    isPopular: false,
  },
];

export default function Subscription() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(console.error);
  }, []);

  const handleSelectPlan = async (planName) => {
    if (!currentUser) return;
    try {
      await User.updateMyUserData({ subscription_plan: planName });
      alert(`Successfully switched to the ${planName} plan!`);
      // In a real app, this would redirect to a payment processor.
      User.me().then(setCurrentUser); // Refresh user data
    } catch (error) {
      console.error("Failed to update plan:", error);
      alert("There was an error updating your plan.");
    }
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 mb-4">
            Find Your Edge
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your trading style and unlock powerful tools to maximize your profit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              onSelect={handleSelectPlan}
              isCurrent={currentUser?.subscription_plan === plan.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
