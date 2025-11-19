'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, XCircle, Target, TrendingUp } from 'lucide-react';

interface MasteryStatsProps {
  stats: {
    correctVsIncorrect: { correct: number; incorrect: number };
    weakestTopicsByProvince: Record<string, Array<{ topic: string; avgMastery: number }>>;
    improvementOverTime: Array<{ date: string; avgMastery: number }>;
    atpCompletionPercentage: number;
  };
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

export function MasteryStats({ stats }: MasteryStatsProps) {
  // Prepare data for charts with empty state handling
  const correctCount = Number(stats.correctVsIncorrect?.correct) || 0;
  const incorrectCount = Number(stats.correctVsIncorrect?.incorrect) || 0;
  
  const correctVsIncorrectData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: incorrectCount },
  ].filter(item => item.value > 0);

  // Flatten weakest topics by province for display
  const weakestTopicsFlat = Object.entries(stats.weakestTopicsByProvince || {})
    .flatMap(([province, topics]) =>
      (Array.isArray(topics) ? topics : []).map((topic) => ({
        province,
        topic: topic?.topic || '',
        avgMastery: Number(topic?.avgMastery) || 0,
      }))
    )
    .filter(item => item.topic && item.avgMastery >= 0)
    .sort((a, b) => a.avgMastery - b.avgMastery)
    .slice(0, 10);

  // Prepare improvement over time data
  const improvementData = (stats.improvementOverTime || [])
    .map((item) => ({
      date: item?.date || '',
      mastery: parseFloat((Number(item?.avgMastery) || 0).toFixed(1)),
    }))
    .filter(item => item.date && item.mastery >= 0);

  const totalAnswers = correctCount + incorrectCount;
  const accuracyRate = totalAnswers > 0
    ? (correctCount / totalAnswers) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Correct Answers</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.correctVsIncorrect.correct}</div>
            <p className="text-xs text-muted-foreground mt-1">Total correct</p>
          </CardContent>
        </Card>

        <Card className="border-red-200/50 dark:border-red-900/50 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Incorrect Answers</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.correctVsIncorrect.incorrect}</div>
            <p className="text-xs text-muted-foreground mt-1">Total incorrect</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Accuracy Rate</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{accuracyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall accuracy</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">ATP Completion</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.atpCompletionPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Completion percentage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Correct vs Incorrect
            </CardTitle>
            <CardDescription>Distribution of answer accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            {correctVsIncorrectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={correctVsIncorrectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {correctVsIncorrectData.map((entry, index) => (
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
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No answer data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Improvement Over Time
            </CardTitle>
            <CardDescription>Average mastery level trends</CardDescription>
          </CardHeader>
          <CardContent>
            {improvementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={improvementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="mastery" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Avg Mastery %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No improvement data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Weakest Topics by Province
          </CardTitle>
          <CardDescription>Top 10 weakest topics across all provinces</CardDescription>
        </CardHeader>
        <CardContent>
          {weakestTopicsFlat.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weakestTopicsFlat} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="topic" type="category" width={150} stroke="#6b7280" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="avgMastery" radius={[0, 8, 8, 0]}>
                  {weakestTopicsFlat.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <p>No topic mastery data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
