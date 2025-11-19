'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Gauge, WifiOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface InfrastructureStatsProps {
  stats: {
    appCrashes: number;
    slowLoadEvents: number;
    offlineModeActivations: number;
  };
}

export function InfrastructureStats({ stats }: InfrastructureStatsProps) {
  const getStatusColor = (value: number, type: 'crashes' | 'slow' | 'offline') => {
    if (type === 'crashes') {
      return value === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    if (type === 'slow') {
      return value === 0 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  const getStatusIcon = (value: number, type: 'crashes' | 'slow') => {
    if (type === 'crashes') {
      return value === 0 ? CheckCircle2 : XCircle;
    }
    return value === 0 ? CheckCircle2 : AlertCircle;
  };

  const CrashesIcon = getStatusIcon(stats.appCrashes, 'crashes');
  const SlowLoadIcon = getStatusIcon(stats.slowLoadEvents, 'slow');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`border-red-200/50 dark:border-red-900/50 bg-gradient-to-br ${stats.appCrashes === 0 ? 'from-green-50/50' : 'from-red-50/50'} to-transparent ${stats.appCrashes === 0 ? 'dark:from-green-950/20' : 'dark:from-red-950/20'} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">App Crashes</CardTitle>
            <div className={`p-2 rounded-lg ${stats.appCrashes === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <CrashesIcon className={`h-4 w-4 ${getStatusColor(stats.appCrashes, 'crashes')}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(stats.appCrashes, 'crashes')}`}>
              {stats.appCrashes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total crashes reported</p>
          </CardContent>
        </Card>

        <Card className={`border-yellow-200/50 dark:border-yellow-900/50 bg-gradient-to-br ${stats.slowLoadEvents === 0 ? 'from-green-50/50' : 'from-yellow-50/50'} to-transparent ${stats.slowLoadEvents === 0 ? 'dark:from-green-950/20' : 'dark:from-yellow-950/20'} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Slow Load Events</CardTitle>
            <div className={`p-2 rounded-lg ${stats.slowLoadEvents === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              <SlowLoadIcon className={`h-4 w-4 ${getStatusColor(stats.slowLoadEvents, 'slow')}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(stats.slowLoadEvents, 'slow')}`}>
              {stats.slowLoadEvents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pages taking &gt;3s to load</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Offline Mode Activations</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <WifiOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.offlineModeActivations}</div>
            <p className="text-xs text-muted-foreground mt-1">Times offline mode was used</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Infrastructure Monitoring
          </CardTitle>
          <CardDescription>Application performance and reliability metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${getStatusColor(stats.appCrashes, 'crashes')}`} />
                  <h3 className="font-semibold">App Crashes</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Crashes:</span>
                    <span className={`font-bold text-lg ${getStatusColor(stats.appCrashes, 'crashes')}`}>
                      {stats.appCrashes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${getStatusColor(stats.appCrashes, 'crashes')}`}>
                      {stats.appCrashes === 0 ? '✓ No crashes' : '✗ Crashes detected'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <Gauge className={`h-5 w-5 ${getStatusColor(stats.slowLoadEvents, 'slow')}`} />
                  <h3 className="font-semibold">Performance</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Slow Load Events:</span>
                    <span className={`font-bold text-lg ${getStatusColor(stats.slowLoadEvents, 'slow')}`}>
                      {stats.slowLoadEvents}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${getStatusColor(stats.slowLoadEvents, 'slow')}`}>
                      {stats.slowLoadEvents === 0 ? '✓ Good' : '⚠ Needs attention'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold">Offline Capabilities</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Offline Activations:</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {stats.offlineModeActivations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      Tracked
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    Implementation Note
                  </p>
                  <p className="text-muted-foreground">
                    Infrastructure tracking is not yet fully implemented. To enable these metrics, you need to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Implement crash reporting (e.g., using Sentry or similar service)</li>
                    <li>Add performance monitoring for page load times</li>
                    <li>Track offline mode activations in the application state</li>
                    <li>Store these events in a dedicated collection or analytics service</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
