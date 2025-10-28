
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Book, Brain, CheckCircle, Star, Target, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { subjects as allSubjects } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


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

const generateLeaderboardData = (subjects: { value: string, label: string }[]) => {
  const data: Record<string, Record<string, { rank: number; name: string; score: number; avatar: string }[]>> = {};
  const timeframes = ['Weekly', 'Monthly', 'Yearly', 'All Time'];
  const names = ["Lerato M.", "Thabo K.", "Sipho N.", "Aisha P.", "Fatima A.", "David L.", "Nomvula Z.", "Chris B.", "Zane W.", "Michael T."];

  subjects.forEach(subject => {
    data[subject.label] = {}; // Use label for display
    timeframes.forEach((timeframe, timeIndex) => {
      const leaderboard = [];
      const usedNames = new Set<string>();
      
      // Add "You" to the leaderboard at a random position
      const yourRank = Math.floor(Math.random() * 5) + 1;
      let scoreMultiplier = (4 - timeIndex) * 20;

      for (let i = 1; i <= 5; i++) {
        if (i === yourRank) {
           leaderboard.push({ rank: i, name: "You", score: Math.floor(Math.random() * 50) + scoreMultiplier + 50, avatar: "" });
        } else {
          let randomName;
          do {
            randomName = names[Math.floor(Math.random() * names.length)];
          } while (usedNames.has(randomName));
          usedNames.add(randomName);
          leaderboard.push({ rank: i, name: randomName, score: Math.floor(Math.random() * 30) + scoreMultiplier + (5-i)*10, avatar: `/avatars/0${i}.png` });
        }
      }
      // Simple sort by score and update ranks
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((player, index) => player.rank = index + 1);

      data[subject.label][timeframe] = leaderboard;
    });
  });

  return data;
}

const leaderboardSubjects = allSubjects.map(s => s.label);

export default function AchievementsPage() {
  const [leaderboards, setLeaderboards] = useState<Record<string, Record<string, { rank: number; name: string; score: number; avatar: string }[]>>>({});
  const [selectedSubject, setSelectedSubject] = useState(leaderboardSubjects[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Weekly');
  
  useEffect(() => {
    // Generate data on the client side to avoid hydration mismatch
    setLeaderboards(generateLeaderboardData(allSubjects));
    // Set the first subject as default
    if (allSubjects.length > 0) {
      setSelectedSubject(allSubjects[0].label);
    }
  }, []);


  const unlockedCount = personalAchievements.filter(a => a.unlocked).length;
  const totalCount = personalAchievements.length;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <span className="font-bold text-lg">{rank}</span>;
  }
  
  const currentLeaderboard = leaderboards[selectedSubject]?.[selectedTimeframe] || [];

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
          <CardContent>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {personalAchievements.map((achievement, index) => (
                  <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <div className="p-1">
                      <Card className={cn("transition-all h-full", !achievement.unlocked && "opacity-50 grayscale")}>
                        <CardHeader className="items-center text-center p-4">
                            <div className={cn("rounded-full p-3 mb-2", achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                <achievement.icon className="h-8 w-8" />
                            </div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center p-4 pt-0">
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-12" />
              <CarouselNext className="mr-12" />
            </Carousel>
          </CardContent>
        </Card>
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
                  <SelectTrigger className="w-full sm:w-[240px]">
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
            <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="Weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="Monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="Yearly">Yearly</TabsTrigger>
                    <TabsTrigger value="All Time">All Time</TabsTrigger>
                </TabsList>
            </Tabs>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Lessons Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLeaderboard.map((student) => (
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
