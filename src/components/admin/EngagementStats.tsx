'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MessageCircle, Upload, Users, CheckCircle2 } from 'lucide-react';

interface EngagementStatsProps {
  stats: {
    uploadsPerLearner: Record<string, number>;
    aiChatInteractionsPerDay: number;
    completedToStartedRatio: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function EngagementStats({ stats }: EngagementStatsProps) {
  // Convert uploads per learner to array and get top uploaders
  const uploadsData = Object.entries(stats.uploadsPerLearner)
    .map(([learnerId, uploads]) => ({ learnerId: learnerId.substring(0, 8) + '...', uploads }))
    .sort((a, b) => b.uploads - a.uploads)
    .slice(0, 20); // Top 20 uploaders

  const totalUploads = Object.values(stats.uploadsPerLearner).reduce((sum, count) => sum + count, 0);
  const learnersWithUploads = Object.keys(stats.uploadsPerLearner).length;
  const avgUploadsPerLearner = learnersWithUploads > 0
    ? totalUploads / learnersWithUploads
    : 0;

  const completedToStartedData = [
    { name: 'Completed', value: stats.completedToStartedRatio },
    { name: 'Started but Not Completed', value: 100 - stats.completedToStartedRatio },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">AI Chat Interactions</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.aiChatInteractionsPerDay}</div>
            <p className="text-xs text-muted-foreground mt-1">Per day (average)</p>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Uploads</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalUploads}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all learners</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Avg Uploads per Learner</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgUploadsPerLearner.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average uploads</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Completion Rate</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.completedToStartedRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Questions completed vs started</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Top Uploaders
            </CardTitle>
            <CardDescription>Learners with most uploads (top 20)</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={uploadsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="learnerId" type="category" width={100} stroke="#6b7280" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="uploads" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No upload data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed vs Started Questions
            </CardTitle>
            <CardDescription>Ratio of completed questions to started questions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={completedToStartedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completedToStartedData.map((entry, index) => (
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
      </div>

      {(stats.aiChatInteractionsPerDay === 0 || totalUploads === 0) && (
        <Card className="border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Implementation Notes</CardTitle>
            <CardDescription>Tracking status for engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {stats.aiChatInteractionsPerDay === 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <p className="text-muted-foreground">
                    <strong>AI Chat Interactions:</strong> Tracking is not yet implemented. 
                    This will require adding chat interaction logging to the AI tutor feature.
                  </p>
                </div>
              )}
              {totalUploads === 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <p className="text-muted-foreground">
                    <strong>File Uploads:</strong> File upload tracking uses past paper progress as a proxy. 
                    For more accurate tracking, implement dedicated upload logging.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
