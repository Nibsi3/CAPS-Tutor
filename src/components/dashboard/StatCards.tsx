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
  
  // Color schemes matching the monitoring dashboard
  const colorSchemes = [
    {
      // Lessons Completed - Primary (blue)
      border: 'border-primary/20',
      gradient: 'bg-gradient-to-br from-primary/5 to-transparent',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      // Average Score - Green
      border: 'border-green-500/20',
      gradient: 'bg-gradient-to-br from-green-500/5 to-transparent',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      // Time Spent - Blue
      border: 'border-blue-500/20',
      gradient: 'bg-gradient-to-br from-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      // Weakest Topic - Orange/Amber (warning color)
      border: 'border-orange-500/20',
      gradient: 'bg-gradient-to-br from-orange-500/5 to-transparent',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((card, index) => {
        const colors = colorSchemes[index];
        return (
          <Card 
            key={index} 
            className={`py-2 ${colors.border} ${colors.gradient} hover:shadow-lg transition-shadow`}
          >
            <CardHeader className="!p-3 !pb-1 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${colors.iconBg}`}>
                <card.icon className={`h-4 w-4 ${colors.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="!p-3 !pt-0">
              <div className="text-xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{card.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  )
}
