"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { progressChartData } from "@/lib/data"

export function ProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Minutes spent learning this week vs. last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          'This Week': { label: 'This Week', color: 'hsl(var(--chart-1))' },
          'Last Week': { label: 'Last Week', color: 'hsl(var(--chart-2))' },
        }} className="h-[250px] w-full">
            <BarChart data={progressChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="m" />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="Last Week" fill="var(--color-Last Week)" radius={4} />
              <Bar dataKey="This Week" fill="var(--color-This Week)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
