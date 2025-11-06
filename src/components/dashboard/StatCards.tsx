import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { statCardsData } from "@/lib/data"
import { stat } from "fs"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"

export function StatCards({ hasActivity = false }: { hasActivity?: boolean }) {
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid

  const activeStatCardsData = [
    {
      title: t.lessonsCompleted,
      value: '12 / 78',
      icon: statCardsData[0].icon,
      change: t.lessonsCompletedThisWeek.replace('{count}', '2'),
    },
    {
      title: t.avgScore,
      value: '82%',
      icon: statCardsData[1].icon,
      change: t.avgScoreChange.replace('{change}', '+3'),
    },
    {
      title: t.timeSpent,
      value: '7h 45m',
      icon: statCardsData[2].icon,
      change: t.timeSpentThisWeek.replace('{hours}', '1'),
    },
    {
      title: t.weakestTopic,
      value: 'Algebraic Fractions',
      icon: statCardsData[3].icon,
      change: t.practiceNow,
    },
  ];

  const inactiveStatCardsData = [
      {
        title: t.lessonsCompleted,
        value: '0 / 0',
        icon: statCardsData[0].icon,
        change: t.startLessonPrompt,
      },
      {
        title: t.avgScore,
        value: '0%',
        icon: statCardsData[1].icon,
        change: t.completeQuizPrompt,
      },
      {
        title: t.timeSpent,
        value: '0h 0m',
        icon: statCardsData[2].icon,
        change: t.timeSpentSubtext,
      },
      {
        title: t.weakestTopic,
        value: 'Not determined',
        icon: statCardsData[3].icon,
        change: t.weakestTopicSubtext,
      },
  ];


  const data = hasActivity ? activeStatCardsData : inactiveStatCardsData;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((card, index) => (
        <Card key={index} className="py-2">
          <CardHeader className="!p-3 !pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium">{card.title}</CardTitle>
            <card.icon className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="!p-3 !pt-0">
            <div className="text-xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
