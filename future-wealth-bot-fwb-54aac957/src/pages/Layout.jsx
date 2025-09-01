

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { TrendingUp, Activity, Settings, Brain, Target, Zap, Shield, Gem, LogOut, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const allNavigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Activity },
  { title: "FutureWealthBot", url: createPageUrl("Analysis"), icon: Brain, pro: true },
  { title: "Trade Simulator", url: createPageUrl("Simulator"), icon: Target, pro: true },
  { title: "Charts", url: createPageUrl("Charts"), icon: BarChart3 },
  { title: "Alert Settings", url: createPageUrl("Alerts"), icon: Zap },
  { title: "Subscription", url: createPageUrl("Subscription"), icon: Gem },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
  { title: "Admin", url: createPageUrl("Admin"), icon: Shield, adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, [location.pathname]);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload(); // Reload to clear state and redirect to login if necessary
  };

  const navigationItems = allNavigationItems.filter(item => {
    if (item.adminOnly) {
      return currentUser?.role === 'admin';
    }
    return true;
  });

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --fwb-navy: #0A1628;
            --fwb-deep-blue: #0F1C2E;
            --fwb-electric: #00D4AA;
            --fwb-glow: #00FFB7;
            --fwb-danger: #FF4757;
            --fwb-warning: #FFA726;
            --fwb-text: #E2E8F0;
            --fwb-text-muted: #94A3B8;
            --fwb-surface: #1E293B;
            --fwb-border: #334155;
          }

          body {
            background: linear-gradient(135deg, var(--fwb-navy) 0%, var(--fwb-deep-blue) 100%);
            color: var(--fwb-text);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .glass-effect {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(148, 163, 184, 0.1);
          }

          .glow-text {
            text-shadow: 0 0 20px var(--fwb-glow);
          }

          .electric-gradient {
            background: linear-gradient(135deg, var(--fwb-electric) 0%, var(--fwb-glow) 100%);
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
        <Sidebar className="glass-effect border-r-0">
          <SidebarHeader className="border-b border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 electric-gradient rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-slate-900 font-bold" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-100 glow-text">FutureWealthBot</h2>
                <p className="text-xs text-slate-400 font-medium">Arbitrage AI</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-3">
                Trading Suite
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-300 rounded-xl mb-1 group ${
                          location.pathname === item.url ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'text-slate-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center justify-between gap-3 px-3 py-3">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-semibold">{item.title}</span>
                          </div>
                          {item.pro && <Gem className="w-4 h-4 text-amber-400" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center">
                <span className="text-slate-300 font-semibold text-sm">{currentUser?.full_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 text-sm truncate">{currentUser?.full_name || 'Trader'}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser?.subscription_plan || 'Free'} Plan</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="glass-effect border-b border-slate-700 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-700/50 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-100">FutureWealthBot</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

