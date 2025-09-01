import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const initialTickerData = [
  { symbol: 'BTC/USD', price: 68523.45, change: 1.25 },
  { symbol: 'ETH/USD', price: 3589.12, change: -0.55 },
  { symbol: 'SOL/USD', price: 165.88, change: 2.78 },
  { symbol: 'ADA/USD', price: 0.45, change: 0.15 },
  { symbol: 'XRP/USD', price: 0.52, change: -1.10 },
  { symbol: 'DOGE/USD', price: 0.16, change: 5.43 },
  { symbol: 'AVAX/USD', price: 37.19, change: -2.30 },
  { symbol: 'DOT/USD', price: 7.21, change: 1.89 },
  { symbol: 'LINK/USD', price: 17.55, change: 3.12 },
  { symbol: 'MATIC/USD', price: 0.73, change: -0.88 },
];

export default function PriceTicker() {
  const [tickerData, setTickerData] = useState(initialTickerData);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData(prevData =>
        prevData.map(item => {
          const changeFactor = (Math.random() - 0.5) * 0.1; // Small random change
          const newPrice = item.price * (1 + changeFactor / 100);
          const newChange = item.change + (Math.random() - 0.5) * 0.2;
          return {
            ...item,
            price: newPrice,
            change: newChange,
          };
        })
      );
    }, 3000); // Update every 3 seconds to simulate live data

    return () => clearInterval(interval);
  }, []);

  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div className="relative w-full overflow-hidden h-14 bg-slate-900/50 border-y border-slate-700 my-8">
      <style>
        {`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 60s linear infinite;
          }
        `}
      </style>
      <div className="absolute top-0 left-0 w-max h-full flex items-center animate-scroll">
        {duplicatedData.map((item, index) => (
          <div key={index} className="flex items-center gap-4 px-6 border-r border-slate-700 h-full flex-shrink-0">
            <span className="font-bold text-slate-300 text-sm">{item.symbol}</span>
            <span className="text-slate-100 font-mono text-sm">${item.price.toFixed(2)}</span>
            <div className={`flex items-center gap-1 text-sm font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{item.change.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}