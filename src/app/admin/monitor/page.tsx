'use client';

import { useEffect, useState } from 'react';
import { useDatabases } from '@/appwrite';
import { calculateDashboardStats, DashboardStats } from '@/lib/dashboard-stats';
import { Loader, BarChart3, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UsageStats } from '@/components/admin/UsageStats';
import { MasteryStats } from '@/components/admin/MasteryStats';
import { PerformanceStats } from '@/components/admin/PerformanceStats';
import { EquityStats } from '@/components/admin/EquityStats';
import { EngagementStats } from '@/components/admin/EngagementStats';
import { InfrastructureStats } from '@/components/admin/InfrastructureStats';
import { CollectionDiagnostics } from '@/components/admin/CollectionDiagnostics';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollRestore } from '@/hooks/use-scroll-restore';

export default function MonitorPage() {
  const databases = useDatabases();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Persist active tab across reloads
  const [activeTab, setActiveTab] = useLocalStorage<string>('monitor-active-tab', 'usage');
  
  // Restore scroll position on reload
  useScrollRestore('monitor-page');

  const loadStats = async () => {
    if (!databases) {
      setError('Databases not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await calculateDashboardStats(databases);
      setStats(dashboardStats);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [databases]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || 'Failed to load statistics'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate summary stats for header
  const totalActiveLearners = stats.usage.weeklyActiveLearners;
  const avgMastery = stats.mastery.improvementOverTime.length > 0
    ? stats.mastery.improvementOverTime[stats.mastery.improvementOverTime.length - 1]?.avgMastery || 0
    : 0;

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Monitoring Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive statistics and analytics for all students
                {lastRefresh && (
                  <span className="ml-2 text-xs">
                    • Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={loadStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Learners</p>
                  <p className="text-2xl font-bold mt-1">{totalActiveLearners}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Mastery</p>
                  <p className="text-2xl font-bold mt-1">{avgMastery.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Active</p>
                  <p className="text-2xl font-bold mt-1">{stats.usage.dailyActiveLearners}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab || 'usage'} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="usage" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Usage
          </TabsTrigger>
          <TabsTrigger value="mastery" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Mastery
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="equity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Equity
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Infrastructure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6 mt-6">
          <UsageStats stats={stats.usage} />
        </TabsContent>

        <TabsContent value="mastery" className="space-y-6 mt-6">
          <MasteryStats stats={stats.mastery} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <PerformanceStats stats={stats.performance} />
        </TabsContent>

        <TabsContent value="equity" className="space-y-6 mt-6">
          <EquityStats stats={stats.equity} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6 mt-6">
          <EngagementStats stats={stats.engagement} />
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6 mt-6">
          <InfrastructureStats stats={stats.infrastructure} />
          <CollectionDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

