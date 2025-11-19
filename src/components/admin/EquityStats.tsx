'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin, Smartphone, Wifi, Users } from 'lucide-react';

interface EquityStatsProps {
  stats: {
    ruralVsUrban: { rural: number; urban: number };
    lowDeviceVsHighDevice: { lowDevice: number; highDevice: number };
    dataSavingModeUsage: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function EquityStats({ stats }: EquityStatsProps) {
  // Prepare data for charts
  const ruralVsUrbanData = [
    { name: 'Rural', value: stats.ruralVsUrban.rural },
    { name: 'Urban', value: stats.ruralVsUrban.urban },
  ];

  const deviceData = [
    { name: 'Low Device', value: stats.lowDeviceVsHighDevice.lowDevice },
    { name: 'High Device', value: stats.lowDeviceVsHighDevice.highDevice },
  ];

  const totalUsers = stats.ruralVsUrban.rural + stats.ruralVsUrban.urban;
  const ruralPercentage = totalUsers > 0
    ? (stats.ruralVsUrban.rural / totalUsers) * 100
    : 0;
  const urbanPercentage = totalUsers > 0
    ? (stats.ruralVsUrban.urban / totalUsers) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Rural Learners</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.ruralVsUrban.rural}</div>
            <p className="text-xs text-muted-foreground mt-1">{ruralPercentage.toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Urban Learners</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.ruralVsUrban.urban}</div>
            <p className="text-xs text-muted-foreground mt-1">{urbanPercentage.toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Data Saving Mode</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Wifi className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.dataSavingModeUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">Users using data saving</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Users</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Rural + Urban learners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Rural vs Urban Distribution
            </CardTitle>
            <CardDescription>Geographic distribution of learners</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={ruralVsUrbanData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ruralVsUrbanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              Device Capability Distribution
            </CardTitle>
            <CardDescription>Low vs high device capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Equity Metrics Summary
          </CardTitle>
          <CardDescription>Key equity indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Rural Learners</p>
              <p className="text-2xl font-bold text-green-600">{stats.ruralVsUrban.rural}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Urban Learners</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ruralVsUrban.urban}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data Saving Mode</p>
              <p className="text-2xl font-bold text-purple-600">{stats.dataSavingModeUsage}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Low Device</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowDeviceVsHighDevice.lowDevice}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">High Device</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.lowDeviceVsHighDevice.highDevice}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
