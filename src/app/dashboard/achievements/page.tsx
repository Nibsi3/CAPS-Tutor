'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Book, Brain, CheckCircle, Star, Target, Trophy, Medal, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const personalAchievements = [
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

const leaderboards: Record<string, { rank: number; name: string; score: number; avatar: string }[]> = {
  "Mathematics": [
    { rank: 1, name: "Lerato M.", score: 152, avatar: "/avatars/01.png" },
    { rank: 2, name: "John D.", score: 148, avatar: "/avatars/02.png" },
    { rank: 3, name: "Thabo K.", score: 145, avatar: "/avatars/03.png" },
    { rank: 4, name: "You", score: 130, avatar: "" },
    { rank: 5, name: "Sipho N.", score: 121, avatar: "/avatars/04.png" },
  ],
  "Life Sciences": [
    { rank: 1, name: "Aisha P.", score: 210, avatar: "/avatars/05.png" },
    { rank: 2, name: "You", score: 198, avatar: "" },
    { rank: 3, name: "Fatima A.", score: 185, avatar: "/avatars/06.png" },
    { rank: 4, name: "David L.", score: 170, avatar: "/avatars/01.png" },
    { rank: 5, name: "Nomvula Z.", score: 165, avatar: "/avatars/02.png" },
  ],
  "Physical Sciences": [
    { rank: 1, name: "Chris B.", score: 180, avatar: "/avatars/03.png" },
    { rank: 2, name: "Zane W.", score: 175, avatar: "/avatars/04.png" },
    { rank: 3, name: "Michael T.", score: 160, avatar: "/avatars/05.png" },
    { rank: 4, name: "You", score: 155, avatar: "" },
    { rank: 5, name: "Kevin R.", score: 140, avatar: "/avatars/06.png" },
  ],
};

const leaderboardSubjects = Object.keys(leaderboards);


export default function AchievementsPage() {
  const [selectedSubject, setSelectedSubject] = useState(leaderboardSubjects[0]);
  const unlockedCount = personalAchievements.filter(a => a.unlocked).length;
  const totalCount = personalAchievements.length;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <span className="font-bold text-lg">{rank}</span>;
  }

  return (
    <div className="flex-1 space-y-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-3xl">
              <Award className="h-8 w-8 text-primary" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              You've unlocked {unlockedCount} of {totalCount} badges. Keep up the great work!
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {personalAchievements.map((achievement, index) => (
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
      
      <div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 font-headline text-3xl">
                  <Trophy className="h-8 w-8 text-primary" />
                  Global Leaderboards
                </CardTitle>
                <CardDescription>
                  See how you rank against other students.
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaderboardSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Lessons Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboards[selectedSubject]?.map((student) => (
                  <TableRow key={student.rank} className={cn(student.name === "You" && "bg-accent")}>
                    <TableCell className="w-[80px]">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                           {getRankIcon(student.rank)}
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">{student.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
