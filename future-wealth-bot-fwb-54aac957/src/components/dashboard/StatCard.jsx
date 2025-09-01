import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function StatCard({ title, value, icon: Icon, change, changeText, linkTo, linkText, colorClass = "emerald" }) {
  const colorMap = {
    emerald: {
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-400",
      valueText: "text-emerald-400",
      changeText: "text-emerald-400",
    },
    blue: {
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-400",
      valueText: "text-blue-400",
      changeText: "text-blue-400",
    },
    amber: {
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
      valueText: "text-amber-400",
      changeText: "text-amber-400",
    },
    purple: {
      iconBg: "bg-purple-500/20",
      iconText: "text-purple-400",
      valueText: "text-purple-400",
      changeText: "text-purple-400",
    },
    slate: {
        iconBg: "bg-slate-500/20",
        iconText: "text-slate-400",
        valueText: "text-slate-100",
        changeText: "text-slate-400",
      },
  };

  const colors = colorMap[colorClass] || colorMap.slate;

  return (
    <Card className="glass-effect border-slate-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${title === 'Total Opportunities' ? 'text-slate-100' : colors.valueText}`}>
              {value}
            </p>
          </div>
          <div className={`p-3 ${colors.iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${colors.iconText}`} />
          </div>
        </div>
        {linkTo ? (
          <Link to={linkTo} className={`flex items-center mt-4 text-sm ${colors.changeText} font-medium hover:underline`}>
            {change}
            <span className="ml-2">{linkText}</span>
          </Link>
        ) : changeText ? (
            <div className={`flex items-center mt-4 text-sm ${colors.changeText} font-medium`}>
                {change}
                <span className="ml-2">{changeText}</span>
            </div>
        ) : null}
      </CardContent>
    </Card>
  );
}