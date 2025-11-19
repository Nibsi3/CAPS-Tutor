'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, BookOpen, Clock, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';

interface UsageStatsProps {
  stats: {
    activeLearnersByGrade: Record<number, number>;
    activeLearnersByProvince: Record<string, number>;
    dailyActiveLearners: number;
    weeklyActiveLearners: number;
    sessionsPerLearner: Record<string, number>;
    dropOffPoints: Array<{ topic: string; count: number }>;
    subjectLoad: Record<string, number>;
    subjectSelectionRates: Record<string, number>;
    timePerSubject: Record<string, number>;
    timePastPapersVsAI: { pastPapers: number; aiHelp: number };
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const GRADIENT_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
];

export function UsageStats({ stats }: UsageStatsProps) {
  // Prepare data for charts with empty state handling
  const gradeData = Object.entries(stats.activeLearnersByGrade || {})
    .map(([grade, count]) => ({ grade: `Grade ${grade}`, count: Number(count) || 0 }))
    .filter(item => item.count > 0)
    .sort((a, b) => parseInt(a.grade.replace('Grade ', '')) - parseInt(b.grade.replace('Grade ', '')));

  const provinceData = Object.entries(stats.activeLearnersByProvince || {})
    .map(([province, count]) => ({ province, count: Number(count) || 0 }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const subjectSelectionData = Object.entries(stats.subjectSelectionRates || {})
    .map(([subject, count]) => ({ subject, count: Number(count) || 0 }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const timePerSubjectData = Object.entries(stats.timePerSubject || {})
    .map(([subject, time]) => ({ subject, time: Math.round(Number(time) || 0) }))
    .filter(item => item.time > 0)
    .sort((a, b) => b.time - a.time);

  const dropOffData = (stats.dropOffPoints || []).slice(0, 10);

  const sessionsData = Object.values(stats.sessionsPerLearner || {});
  const avgSessions = sessionsData.length > 0
    ? Math.round(sessionsData.reduce((a, b) => a + (Number(b) || 0), 0) / sessionsData.length)
    : 0;

  const pastPaperVsAIData = [
    { name: 'Past Papers', value: Math.max(0, Number(stats.timePastPapersVsAI?.pastPapers) || 0) },
    { name: 'AI Help', value: Math.max(0, Number(stats.timePastPapersVsAI?.aiHelp) || 0) },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Daily Active Learners</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.dailyActiveLearners}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in the last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Active Learners</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.weeklyActiveLearners}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in the last 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Avg Sessions per Learner</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Average login sessions</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50 dark:border-orange-900/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Subjects</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Object.keys(stats.subjectSelectionRates).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique subjects selected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Active Learners by Grade
            </CardTitle>
            <CardDescription>Distribution of learners across grades</CardDescription>
          </CardHeader>
          <CardContent>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="grade" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No grade data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Active Learners by Province
            </CardTitle>
            <CardDescription>Top 10 provinces by active learners</CardDescription>
          </CardHeader>
          <CardContent>
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={provinceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="province" angle={-45} textAnchor="end" height={100} stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                <p>No province data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Subject Selection Rates
            </CardTitle>
            <CardDescription>Number of learners per subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={subjectSelectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Time Spent per Subject
            </CardTitle>
            <CardDescription>Average study time per subject (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={timePerSubjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="time" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Drop-off Points
            </CardTitle>
            <CardDescription>Topics where learners stop engaging</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dropOffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="topic" type="category" width={150} stroke="#6b7280" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Time: Past Papers vs AI Help
            </CardTitle>
            <CardDescription>Estimated time spent (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            {pastPaperVsAIData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pastPaperVsAIData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pastPaperVsAIData.map((entry, index) => (
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
                <p>No time tracking data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

