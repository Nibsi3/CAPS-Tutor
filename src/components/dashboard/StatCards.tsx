import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { statCardsData } from "@/lib/data"
import { stat } from "fs"

const activeStatCardsData = [
  {
    title: 'Lessons Completed',
    value: '12 / 78',
    icon: statCardsData[0].icon,
    change: '+2 this week',
  },
  {
    title: 'Avg. Score',
    value: '82%',
    icon: statCardsData[1].icon,
    change: '+3% this month',
  },
  {
    title: 'Time Spent',
    value: '7h 45m',
    icon: statCardsData[2].icon,
    change: '+1h this week',
  },
  {
    title: 'Weakest Topic',
    value: 'Algebraic Fractions',
    icon: statCardsData[3].icon,
    change: 'Practice now',
  },
];


export function StatCards({ hasActivity = false }: { hasActivity?: boolean }) {
  const data = hasActivity ? activeStatCardsData : statCardsData;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
