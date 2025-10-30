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
    <Card>
      <CardHeader>
        <CardTitle>{t.recentActivity}</CardTitle>
        <CardDescription>{t.recentActivityDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <div className="space-y-4">
            {recentActivityData.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg",
                  activity.status === 'passed' ? 'bg-green-100 dark:bg-green-900/50' :
                  activity.status === 'unlocked' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                  'bg-muted'
                )}>
                  <activity.icon className={cn("h-5 w-5",
                    activity.status === 'passed' ? 'text-green-600 dark:text-green-400' :
                    activity.status === 'unlocked' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{activity.description}</p>
                    {activity.score && <p className="text-sm font-semibold text-primary">{activity.score}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
              <BookOpen className="w-12 h-12 mb-4" />
              <h3 className="font-semibold text-lg">{t.noActivity}</h3>
              <p className="text-sm">{t.noActivityDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
