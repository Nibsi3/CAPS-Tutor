"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { progressChartData } from "@/lib/data"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"

// Replace hardcoded data with a version that can be empty for new users
const emptyProgressData = [
  { date: 'Mon', 'This Week': 0, 'Last Week': 0 },
  { date: 'Tue', 'This Week': 0, 'Last Week': 0 },
  { date: 'Wed', 'This Week': 0, 'Last Week': 0 },
  { date: 'Thu', 'This Week': 0, 'Last Week': 0 },
  { date: 'Fri', 'This Week': 0, 'Last Week': 0 },
  { date: 'Sat', 'This Week': 0, 'Last Week': 0 },
  { date: 'Sun', 'This Week': 0, 'Last Week': 0 },
];

export function ProgressChart({ hasActivity = false }: { hasActivity?: boolean }) {
  const data = hasActivity ? progressChartData : emptyProgressData;
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="!p-3 !pb-2">
        <CardTitle className="text-base">{t.weeklyProgress}</CardTitle>
        <CardDescription className="text-xs hidden">{t.weeklyProgressDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 !p-3 !pb-2 overflow-hidden flex flex-col">
        <ChartContainer config={{
          'This Week': { 
            label: t.thisWeek, 
            theme: { 
              light: 'hsl(210, 90%, 55%)', 
              dark: 'hsl(210, 90%, 60%)' 
            } 
          },
          'Last Week': { 
            label: t.lastWeek, 
            theme: { 
              light: 'hsl(25, 95%, 55%)', 
              dark: 'hsl(25, 95%, 60%)' 
            } 
          },
        }} className="!aspect-auto h-full w-full flex-1 flex flex-col justify-end">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={6} unit="m" tick={{ fontSize: 12 }} />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                <Bar dataKey="Last Week" fill="var(--color-Last-Week)" radius={4} />
                <Bar dataKey="This Week" fill="var(--color-This-Week)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
