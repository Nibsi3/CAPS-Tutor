import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { recentActivityData } from "@/lib/data"
import { cn } from "@/lib/utils"
import { BookOpen } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"

export function RecentActivity({ hasActivity = false }: { hasActivity?: boolean }) {
  const lang = useLanguage();
  const t = translations[lang];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="!p-3 !pb-2">
        <CardTitle className="text-base">{t.recentActivity}</CardTitle>
        <CardDescription className="text-xs hidden">{t.recentActivityDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 !p-3 !pb-2 overflow-hidden">
        {hasActivity ? (
          <div className="space-y-2 h-full flex flex-col">
            {recentActivityData.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                  activity.status === 'passed' ? 'bg-green-100 dark:bg-green-900/50' :
                  activity.status === 'unlocked' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                  'bg-muted'
                )}>
                  <activity.icon className={cn("h-4 w-4",
                    activity.status === 'passed' ? 'text-green-600 dark:text-green-400' :
                    activity.status === 'unlocked' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-sm leading-tight">{activity.description}</p>
                    {activity.score && <p className="text-xs font-semibold text-primary shrink-0">{activity.score}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-4 h-full">
              <BookOpen className="w-10 h-10 mb-2" />
              <h3 className="font-semibold text-sm">{t.noActivity}</h3>
              <p className="text-xs">{t.noActivityDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
