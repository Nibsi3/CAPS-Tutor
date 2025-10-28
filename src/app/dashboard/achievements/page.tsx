'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Book, Brain, CheckCircle, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const achievements = [
    {
        icon: Star,
        title: "First Steps",
        description: "Completed your first lesson.",
        unlocked: true,
    },
    {
        icon: Target,
        title: "Practice Makes Perfect",
        description: "Finished your first practice quiz.",
        unlocked: true,
    },
    {
        icon: CheckCircle,
        title: "Perfect Score",
        description: "Got 100% on a quiz.",
        unlocked: true,
    },
    {
        icon: Book,
        title: "Subject Explorer",
        description: "Explored 3 different subjects.",
        unlocked: false,
    },
     {
        icon: Brain,
        title: "Knowledge Sponge",
        description: "Completed 10 lessons.",
        unlocked: false,
    },
    {
        icon: Award,
        title: "Topic Master",
        description: "Achieved 90% mastery in one topic.",
        unlocked: false,
    },
     {
        icon: Star,
        title: "Week-long Streak",
        description: "Studied every day for 7 days.",
        unlocked: false,
    },
    {
        icon: Target,
        title: "Exam Veteran",
        description: "Completed 5 adaptive exams.",
        unlocked: false,
    }
];

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <Award className="h-8 w-8" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            You've unlocked {unlockedCount} of {totalCount} badges. Keep up the great work!
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((achievement, index) => (
          <Card key={index} className={cn("transition-all", !achievement.unlocked && "opacity-50 grayscale")}>
            <CardHeader className="items-center text-center">
                <div className={cn("rounded-full p-4 mb-4", achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    <achievement.icon className="h-10 w-10" />
                </div>
              <CardTitle className="text-xl">{achievement.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
