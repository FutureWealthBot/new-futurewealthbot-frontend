import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { SystemStats } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart, Activity, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role !== 'admin') return;
        
        const [allUsers, systemStats] = await Promise.all([
          User.list(),
          SystemStats.list('-date', 1),
        ]);
        setUsers(allUsers);
        setStats(systemStats[0] || {});
      } catch (error) {
        console.error("Failed to load admin data:", error);
      }
    };
    fetchData();
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        <Shield className="w-8 h-8 mr-4" />
        <p className="text-2xl font-bold">Access Denied. Administrator role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{background: 'linear-gradient(135deg, #0A1628 0%, #0F1C2E 100%)'}}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-slate-600">
            <CardHeader><CardTitle className="flex items-center justify-between">Total Users <Users className="text-blue-400" /></CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{users.length}</p></CardContent>
          </Card>
          <Card className="glass-effect border-slate-600">
            <CardHeader><CardTitle className="flex items-center justify-between">Active Subs <Shield className="text-emerald-400" /></CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{users.filter(u => u.subscription_plan !== 'Free').length}</p></CardContent>
          </Card>
          <Card className="glass-effect border-slate-600">
            <CardHeader><CardTitle className="flex items-center justify-between">Opps Found <Activity className="text-amber-400" /></CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats?.opportunities_found || 0}</p></CardContent>
          </Card>
          <Card className="glass-effect border-slate-600">
            <CardHeader><CardTitle className="flex items-center justify-between">Sims Run <BarChart className="text-purple-400" /></CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats?.simulations_run || 0}</p></CardContent>
          </Card>
        </div>

        <Card className="glass-effect border-slate-600">
          <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-200">Email</TableHead>
                  <TableHead className="text-slate-200">Name</TableHead>
                  <TableHead className="text-slate-200">Plan</TableHead>
                  <TableHead className="text-slate-200">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 10).map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={user.subscription_plan === 'Free' ? 'outline' : 'default'}
                             className={user.subscription_plan === 'Pro' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : ''}>
                        {user.subscription_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_date), 'PPP')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}