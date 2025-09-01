
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, Key, Palette, HardDrive, Trash2, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function ApiKeyManager({ apiKeys, setApiKeys }) {
  const [newKey, setNewKey] = useState({ exchange: '', api_key: '', secret_key: '' });
  const exchanges = ['Binance', 'Kraken', 'KuCoin', 'OKX'];

  const handleAddKey = () => {
    if (!newKey.exchange || !newKey.api_key || !newKey.secret_key) return;
    setApiKeys(prev => ({ ...prev, [newKey.exchange.toLowerCase()]: { api_key: newKey.api_key, secret_key: newKey.secret_key }}));
    setNewKey({ exchange: '', api_key: '', secret_key: '' });
  };
  
  const handleRemoveKey = (exchange) => {
    setApiKeys(prev => {
      const updated = { ...prev };
      delete updated[exchange];
      return updated;
    });
  };

  return (
    <div className="space-y-6">
       <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30">
          <Key className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-300">Security Warning</AlertTitle>
          <AlertDescription className="text-amber-400">
            API keys are stored in plain text. For production use, enable backend functions for secure, encrypted storage. Do not use main account keys.
          </AlertDescription>
        </Alert>

      {Object.entries(apiKeys || {}).map(([exchange, keys]) => (
        <div key={exchange} className="p-4 rounded-lg bg-slate-800/50 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-200 capitalize">{exchange}</p>
            <p className="text-sm text-slate-400">API Key: ••••••••{keys.api_key.slice(-4)}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => handleRemoveKey(exchange)}>
            <Trash2 className="w-4 h-4 mr-2" /> Remove
          </Button>
        </div>
      ))}
      <div className="space-y-4 p-4 border border-dashed border-slate-600 rounded-lg">
        <h4 className="font-semibold text-slate-200">Add New API Key</h4>
        <Select onValueChange={(val) => setNewKey(p => ({...p, exchange: val}))} value={newKey.exchange}>
          <SelectTrigger className="bg-slate-800/50 border-slate-600"><SelectValue placeholder="Select Exchange" /></SelectTrigger>
          <SelectContent>{exchanges.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="API Key" value={newKey.api_key} onChange={e => setNewKey(p => ({...p, api_key: e.target.value}))} className="bg-slate-800/50 border-slate-600"/>
        <Input placeholder="Secret Key" type="password" value={newKey.secret_key} onChange={e => setNewKey(p => ({...p, secret_key: e.target.value}))} className="bg-slate-800/50 border-slate-600"/>
        <Button onClick={handleAddKey} className="w-full">Add Key</Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ full_name: '', api_keys: {} });
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    User.me().then(u => {
      setUser(u);
      setUserData({
        full_name: u.full_name || '',
        api_keys: u.api_keys || {}
      });
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(userData);
      alert("Settings saved successfully!");
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("Error saving settings.");
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <TooltipProvider>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">
              Platform <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-slate-400 text-lg">Manage your profile, API keys, and preferences.</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-600">
              <TabsTrigger value="profile"><UserIcon className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
              <TabsTrigger value="api_keys"><Key className="w-4 h-4 mr-2"/>API Keys</TabsTrigger>
              <TabsTrigger value="data"><HardDrive className="w-4 h-4 mr-2"/>Data</TabsTrigger>
            </TabsList>
            
            <Card className="glass-effect border-slate-600 mt-6">
              <TabsContent value="profile" className="p-0">
                <CardHeader><CardTitle>User Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={userData.full_name} onChange={e => setUserData(p => ({...p, full_name: e.target.value}))} className="bg-slate-800/50 border-slate-600"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-slate-800/50 border-slate-600"/>
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="api_keys" className="p-0">
                <CardHeader><CardTitle>API Key Management</CardTitle></CardHeader>
                <CardContent>
                  <ApiKeyManager 
                    apiKeys={userData.api_keys} 
                    setApiKeys={(keys) => setUserData(p => ({...p, api_keys: keys}))}
                  />
                </CardContent>
              </TabsContent>

              <TabsContent value="data" className="p-0">
                <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-800/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-200">Export My Data</p>
                        <p className="text-sm text-slate-400">Download all your opportunities and simulations.</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="secondary" disabled>Export</Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Coming soon!</p></TooltipContent>
                      </Tooltip>
                    </div>
                  <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
                      <h4 className="font-bold text-red-400">Danger Zone</h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-red-300">Permanently delete all your data.</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" disabled>Delete Data</Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Coming soon!</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                </CardContent>
              </TabsContent>

              <div className="p-6 border-t border-slate-700 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                  {isSaving ? 'Saving...' : 'Save All Settings'}
                </Button>
              </div>
            </Card>
          </Tabs>
        </div>
      </TooltipProvider>
    </div>
  );
}
