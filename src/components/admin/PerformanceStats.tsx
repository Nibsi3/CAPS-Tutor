'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, BookOpen, Target, TrendingUp } from 'lucide-react';

interface PerformanceStatsProps {
  stats: {
    avgPastPaperScore: number;
    difficultyHeatmap: Record<string, Record<string, number>>;
    predictedExamReadiness: Record<string, number>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function PerformanceStats({ stats }: PerformanceStatsProps) {
  // Prepare data for charts with empty state handling
  const readinessData = Object.entries(stats.predictedExamReadiness || {})
    .map(([subject, readiness]) => ({ 
      subject, 
      readiness: parseFloat((Number(readiness) || 0).toFixed(1)) 
    }))
    .filter(item => item.readiness >= 0)
    .sort((a, b) => b.readiness - a.readiness);

  // Flatten difficulty heatmap for display (subject-topic pairs)
  const difficultyData = Object.entries(stats.difficultyHeatmap || {})
    .flatMap(([subject, topics]) =>
      Object.entries(topics || {}).map(([topic, difficulty]) => ({
        subject,
        topic: `${subject} - ${topic}`,
        difficulty: parseFloat((Number(difficulty) || 0).toFixed(1)),
      }))
    )
    .filter(item => item.difficulty >= 0)
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 15);

  const avgReadiness = readinessData.length > 0
    ? readinessData.reduce((sum, item) => sum + item.readiness, 0) / readinessData.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Avg Past Paper Score</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.avgPastPaperScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average score across all papers</p>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Subjects Tracked</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{Object.keys(stats.predictedExamReadiness).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Subjects with performance data</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Topic Areas</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{difficultyData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Topics analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Avg Readiness</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{avgReadiness.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average exam readiness</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Predicted Exam Readiness
            </CardTitle>
            <CardDescription>Readiness score by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {readinessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={readinessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="readiness" radius={[8, 8, 0, 0]}>
                    {readinessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No readiness data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              Difficulty Heatmap
            </CardTitle>
            <CardDescription>Top 15 most difficult topic areas</CardDescription>
          </CardHeader>
          <CardContent>
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={difficultyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="topic" type="category" width={200} stroke="#6b7280" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="difficulty" radius={[0, 8, 8, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No difficulty data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
