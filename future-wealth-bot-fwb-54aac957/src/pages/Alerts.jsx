
import React, { useState, useEffect } from "react";
import { AlertSettings } from "@/api/entities";
import { User } from "@/api/entities";
import { ArbitrageOpportunity } from "@/api/entities"; // Added import
import { SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Mail, Settings, Bell, Target, DollarSign, Shield, MessageCircle, Info, ExternalLink, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPageUrl } from "@/lib/utils"; // Added import

export default function Alerts() {
  const [settings, setSettings] = useState({
    user_email: '',
    telegram_chat_id: '',
    telegram_enabled: false,
    notification_channels: ['email'],
    telegram_message_format: 'detailed',
    min_spread_percentage: 1.0,
    min_profit_amount: 10,
    max_execution_risk: 'medium',
    preferred_exchanges: [],
    preferred_assets: [],
    alert_frequency: 'instant',
    is_active: true,
    trading_capital: 1000,
    max_positions: 5
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const existingSettings = await AlertSettings.list();
        if (existingSettings.length > 0) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...existingSettings[0],
            user_email: user.email
          }));
        } else {
          setSettings(prev => ({ ...prev, user_email: user.email }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingSettings = await AlertSettings.list();
      if (existingSettings.length > 0) {
        await AlertSettings.update(existingSettings[0].id, settings);
      } else {
        await AlertSettings.create(settings);
      }
      
      setShowConfirmation({ type: 'save', message: 'Settings saved successfully!' });
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setShowConfirmation({ type: 'error', message: 'Error saving settings.' });
      setTimeout(() => setShowConfirmation(false), 3000);
    }
    setIsSaving(false);
  };

  const testTelegramAlert = async () => {
    setTestingTelegram(true);
    try {
      // Get a sample opportunity for the demo link
      const sampleOpp = await ArbitrageOpportunity.list('-created_date', 1);
      const oppId = sampleOpp.length > 0 ? sampleOpp[0].id : 'sample';
      const simulatorUrl = `${window.location.origin}${createPageUrl(`Simulator?opp_id=${oppId}`)}`;
      
      await SendEmail({
        to: settings.user_email,
        subject: "🚀 FutureWealthBot - Arbitrage Alert",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1C2E; color: #E2E8F0; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #00D4AA; margin: 0;">🎯 Arbitrage Opportunity Detected!</h1>
              <p style="color: #94A3B8; margin: 5px 0;">FutureWealthBot Analysis</p>
            </div>
            
            <div style="background: #1E293B; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #E2E8F0; margin-top: 0;">BTC/USDT (Test Alert)</h2>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="color: #94A3B8;">Spread:</span>
                <span style="color: #00D4AA; font-weight: bold;">+2.45% 📈</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="color: #94A3B8;">Buy from:</span>
                <span style="color: #E2E8F0;">Kraken @ $43,250</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="color: #94A3B8;">Sell to:</span>
                <span style="color: #E2E8F0;">Binance @ $44,309</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="color: #94A3B8;">Profit Potential:</span>
                <span style="color: #00D4AA; font-weight: bold;">$245 (for $10K trade)</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span style="color: #94A3B8;">Risk Level:</span>
                <span style="color: #FFA726;">Medium</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${simulatorUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #00D4AA 0%, #00FFB7 100%); 
                        color: #0A1628; font-weight: bold; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-size: 16px;">
                🎯 Simulate This Trade
              </a>
            </div>

            <div style="background: #334155; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #00D4AA; margin-top: 0;">⚡ Quick Actions:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 5px 0;">Click "Simulate This Trade" to run detailed analysis</li>
                <li style="margin: 5px 0;">Review fees, slippage, and profit calculations</li>
                <li style="margin: 5px 0;">Execute when you're confident in the setup</li>
              </ul>
            </div>

            <hr style="border: 1px solid #475569; margin: 20px 0;">
            
            <div style="text-align: center; color: #94A3B8; font-size: 12px;">
              <p>This is a test alert from FutureWealthBot</p>
              <p>Real alerts will include live opportunities with direct simulation links</p>
              <p><strong>FutureWealthBot</strong> - Your Crypto Arbitrage AI</p>
            </div>
          </div>
        `
      });
      setShowConfirmation({ type: 'test', message: 'Test email alert sent with simulation link!' });
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Error sending test alert:", error);
      setShowConfirmation({ type: 'error', message: 'Failed to send test alert.' });
      setTimeout(() => setShowConfirmation(false), 3000);
    }
    setTestingTelegram(false);
  };

  const toggleExchange = (exchange) => {
    setSettings(prev => ({
      ...prev,
      preferred_exchanges: prev.preferred_exchanges.includes(exchange)
        ? prev.preferred_exchanges.filter(e => e !== exchange)
        : [...prev.preferred_exchanges, exchange]
    }));
  };

  const toggleAsset = (asset) => {
    setSettings(prev => ({
      ...prev,
      preferred_assets: prev.preferred_assets.includes(asset)
        ? prev.preferred_assets.filter(a => a !== asset)
        : [...prev.preferred_assets, asset]
    }));
  };

  const toggleNotificationChannel = (channel) => {
    setSettings(prev => ({
      ...prev,
      notification_channels: prev.notification_channels.includes(channel)
        ? prev.notification_channels.filter(c => c !== channel)
        : [...prev.notification_channels, channel]
    }));
  };

  const exchanges = ['Binance', 'Kraken', 'KuCoin', 'OKX', 'Coinbase', 'Huobi'];
  const assets = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'LINK'];

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 right-5 z-50"
          >
            <Alert className={showConfirmation.type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-emerald-500/20 border-emerald-500/50'}>
              <CheckCircle className={`h-4 w-4 ${showConfirmation.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`} />
              <AlertDescription className={showConfirmation.type === 'error' ? 'text-red-300' : 'text-emerald-300'}>
                {showConfirmation.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-2">
            Alert 
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent ml-2">
              Settings
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Configure notifications for profitable opportunities</p>
        </div>

        {/* Telegram Integration Notice */}
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Telegram Integration:</strong> Currently in development. Enable backend functions in Dashboard → Settings for custom integrations, 
            or contact support to add full Telegram bot functionality. Email alerts are active now.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Channels */}
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <Label className="text-slate-200 font-medium">Email Notifications</Label>
                        <p className="text-sm text-slate-400">Reliable email alerts (Active)</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notification_channels.includes('email')}
                      onCheckedChange={() => toggleNotificationChannel('email')}
                    />
                  </div>
                  
                  <div className="space-y-2 pl-8">
                    <Label className="text-slate-200 font-medium">Email Address</Label>
                    <Input
                      type="email"
                      value={settings.user_email}
                      onChange={(e) => setSettings(prev => ({ ...prev, user_email: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                      disabled={!!currentUser?.email}
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Telegram Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <Label className="text-slate-200 font-medium">Telegram Notifications</Label>
                        <p className="text-sm text-slate-400">Instant mobile alerts (Coming Soon)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                        Beta
                      </Badge>
                      <Switch
                        checked={settings.telegram_enabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, telegram_enabled: checked }))}
                      />
                    </div>
                  </div>

                  {settings.telegram_enabled && (
                    <div className="space-y-4 pl-8">
                      <div className="space-y-2">
                        <Label className="text-slate-200 font-medium">Chat ID</Label>
                        <Input
                          placeholder="Your Telegram Chat ID (e.g., 123456789)"
                          value={settings.telegram_chat_id}
                          onChange={(e) => setSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                          className="bg-slate-800/50 border-slate-600 text-slate-200"
                        />
                        <p className="text-xs text-slate-500">
                          Get your Chat ID by messaging <code>@userinfobot</code> on Telegram
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-200 font-medium">Message Format</Label>
                        <Select
                          value={settings.telegram_message_format}
                          onValueChange={(value) => setSettings(prev => ({ ...prev, telegram_message_format: value }))}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple (Pair + Spread)</SelectItem>
                            <SelectItem value="detailed">Detailed (Full Info)</SelectItem>
                            <SelectItem value="technical">Technical (Advanced)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testTelegramAlert}
                        disabled={testingTelegram}
                        className="border-emerald-600 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {testingTelegram ? 'Testing...' : 'Test Alert (Email)'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Alert Frequency</Label>
                  <Select
                    value={settings.alert_frequency}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, alert_frequency: value }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Profit Thresholds */}
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Profit Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">Minimum Spread %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.min_spread_percentage}
                      onChange={(e) => setSettings(prev => ({ ...prev, min_spread_percentage: parseFloat(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">Minimum Profit ($)</Label>
                    <Input
                      type="number"
                      value={settings.min_profit_amount}
                      onChange={(e) => setSettings(prev => ({ ...prev, min_profit_amount: parseFloat(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">Trading Capital ($)</Label>
                    <Input
                      type="number"
                      value={settings.trading_capital}
                      onChange={(e) => setSettings(prev => ({ ...prev, trading_capital: parseFloat(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200 font-medium">Max Positions</Label>
                    <Input
                      type="number"
                      value={settings.max_positions}
                      onChange={(e) => setSettings(prev => ({ ...prev, max_positions: parseInt(e.target.value) }))}
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 font-medium">Maximum Risk Level</Label>
                  <Select
                    value={settings.max_execution_risk}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, max_execution_risk: value }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk Only</SelectItem>
                      <SelectItem value="medium">Medium Risk & Below</SelectItem>
                      <SelectItem value="high">All Risk Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Trading Preferences */}
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Trading Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-slate-200 font-medium mb-3 block">Preferred Exchanges</Label>
                  <div className="flex flex-wrap gap-2">
                    {exchanges.map(exchange => (
                      <Badge
                        key={exchange}
                        variant={settings.preferred_exchanges.includes(exchange) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          settings.preferred_exchanges.includes(exchange)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                            : 'bg-slate-800/50 text-slate-400 border-slate-600 hover:bg-slate-700/50'
                        }`}
                        onClick={() => toggleExchange(exchange)}
                      >
                        {exchange}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-200 font-medium mb-3 block">Preferred Assets</Label>
                  <div className="flex flex-wrap gap-2">
                    {assets.map(asset => (
                      <Badge
                        key={asset}
                        variant={settings.preferred_assets.includes(asset) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          settings.preferred_assets.includes(asset)
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                            : 'bg-slate-800/50 text-slate-400 border-slate-600 hover:bg-slate-700/50'
                        }`}
                        onClick={() => toggleAsset(asset)}
                      >
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Alert Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Status</span>
                    <Badge variant={settings.is_active ? "default" : "outline"} 
                           className={settings.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : ""}>
                      {settings.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Channels</span>
                    <div className="flex gap-1">
                      {settings.notification_channels.includes('email') && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                          Email
                        </Badge>
                      )}
                      {settings.telegram_enabled && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                          Telegram
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Min Spread</span>
                    <span className="text-sm font-medium text-slate-200">{settings.min_spread_percentage}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Min Profit</span>
                    <span className="text-sm font-medium text-slate-200">${settings.min_profit_amount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Max Risk</span>
                    <span className="text-sm font-medium text-slate-200 capitalize">{settings.max_execution_risk}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Frequency</span>
                    <span className="text-sm font-medium text-slate-200 capitalize">{settings.alert_frequency}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Exchanges</span>
                    <span className="text-sm font-medium text-slate-200">{settings.preferred_exchanges.length || 'All'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Assets</span>
                    <span className="text-sm font-medium text-slate-200">{settings.preferred_assets.length || 'All'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telegram Setup Guide */}
            <Card className="glass-effect border-slate-600">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  Telegram Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="text-sm text-slate-300 space-y-2">
                  <p className="font-medium text-emerald-400">Quick Setup Guide:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400">
                    <li>Message <code className="bg-slate-800 px-1 rounded">@BotFather</code> on Telegram</li>
                    <li>Create new bot with <code className="bg-slate-800 px-1 rounded">/newbot</code></li>
                    <li>Get your Chat ID from <code className="bg-slate-800 px-1 rounded">@userinfobot</code></li>
                    <li>Enable backend functions in Settings</li>
                    <li>Contact support for full integration</li>
                  </ol>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-emerald-600 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => window.open('https://t.me/botfather', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Open @BotFather
                </Button>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
