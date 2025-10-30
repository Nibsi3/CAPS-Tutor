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
  const t = translations[lang];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.weeklyProgress}</CardTitle>
        <CardDescription>{t.weeklyProgressDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          'This Week': { label: t.thisWeek, color: 'hsl(var(--chart-1))' },
          'Last Week': { label: t.lastWeek, color: 'hsl(var(--chart-2))' },
        }} className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="m" />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="Last Week" fill="var(--color-Last Week)" radius={4} />
                <Bar dataKey="This Week" fill="var(--color-This Week)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
