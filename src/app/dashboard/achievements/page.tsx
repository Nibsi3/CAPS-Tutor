'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ALL_ACHIEVEMENTS, 
  Achievement, 
  getRarityColor, 
  getRarityBorderColor 
} from '@/lib/achievements';

// Helper function to get shimmer gradient color based on rarity
function getShimmerColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'rare':
      return 'from-transparent via-blue-400/30 to-transparent';
    case 'epic':
      return 'from-transparent via-purple-400/30 to-transparent';
    case 'legendary':
      return 'from-transparent via-yellow-400/30 to-transparent';
    default:
      return 'from-transparent via-white/10 to-transparent';
  }
}
import { AchievementUnlockNotification } from '@/components/achievements/AchievementUnlockNotification';
import { GlobalLeaderboard } from '@/components/achievements/GlobalLeaderboard';
import { Award, Trophy, Clock, Target, BookOpen, Zap, Sparkles, Loader, Star, Flame, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkAchievements, calculateUserStats, UserStats } from '@/lib/achievement-checker';
import { updateUnlockedAchievements } from '@/lib/achievement-tracking';

export default function AchievementsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<Achievement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'achievements' | 'leaderboard'>('achievements');

  // Get user profile
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userProfileRef);

  // Get student progress for score calculations
  const progressQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/studentProgress`);
  }, [user, firestore]);

  const { data: progressData } = useCollection(progressQuery);

  // Calculate user stats and check achievements
  useEffect(() => {
    if (!user || !userProfile || !progressData) {
      setIsLoading(false);
      return;
    }

    const stats = calculateUserStats(userProfile, progressData);
    setUserStats(stats);

    // Check and unlock achievements
    const newlyUnlocked = checkAchievements(stats, unlockedAchievements);
    
    if (newlyUnlocked.length > 0) {
      // Update unlocked achievements
      const newUnlockedSet = new Set([...unlockedAchievements, ...newlyUnlocked.map(a => a.id)]);
      setUnlockedAchievements(newUnlockedSet);
      
      // Show notification for first newly unlocked achievement
      if (newlyUnlocked[0]) {
        setNewUnlockedAchievement(newlyUnlocked[0]);
      }
      
      // Update user profile with unlocked achievements
      if (newlyUnlocked.length > 0 && user && firestore) {
        const allUnlocked = Array.from(newUnlockedSet);
        updateUnlockedAchievements(firestore, user.uid, allUnlocked);
      }
    }

    setIsLoading(false);
  }, [user, userProfile, progressData, unlockedAchievements]);

  // Initialize unlocked achievements from user profile
  useEffect(() => {
    if (userProfile?.unlockedAchievements) {
      setUnlockedAchievements(new Set(userProfile.unlockedAchievements));
    }
  }, [userProfile]);

  // Filter achievements by category and sort by rarity then points
  const filteredAchievements = useMemo(() => {
    let achievements = selectedCategory === 'all' 
      ? [...ALL_ACHIEVEMENTS] 
      : ALL_ACHIEVEMENTS.filter(a => a.category === selectedCategory);
    
    // Define rarity order: common -> rare -> epic -> legendary
    const rarityOrder: Record<Achievement['rarity'], number> = {
      'common': 1,
      'rare': 2,
      'epic': 3,
      'legendary': 4
    };
    
    // Sort by rarity first, then by points (ascending - lowest to highest)
    return achievements.sort((a, b) => {
      const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.points - b.points;
    });
  }, [selectedCategory]);

  // Calculate stats
  const totalAchievements = ALL_ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.size;
  const totalPoints = ALL_ACHIEVEMENTS
    .filter(a => unlockedAchievements.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);
  const maxPoints = ALL_ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
  const progressPercentage = (unlockedCount / totalAchievements) * 100;

  // Group achievements by category
  const achievementsByCategory = {
    all: ALL_ACHIEVEMENTS.length,
    login: ALL_ACHIEVEMENTS.filter(a => a.category === 'login').length,
    time: ALL_ACHIEVEMENTS.filter(a => a.category === 'time').length,
    score: ALL_ACHIEVEMENTS.filter(a => a.category === 'score').length,
    subject: ALL_ACHIEVEMENTS.filter(a => a.category === 'subject').length,
    streak: ALL_ACHIEVEMENTS.filter(a => a.category === 'streak').length,
    special: ALL_ACHIEVEMENTS.filter(a => a.category === 'special').length,
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AchievementUnlockNotification
        achievement={newUnlockedAchievement}
        onClose={() => setNewUnlockedAchievement(null)}
      />

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'achievements' ? 'default' : 'outline'}
              onClick={() => setViewMode('achievements')}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Your Achievements
            </Button>
            <Button
              variant={viewMode === 'leaderboard' ? 'default' : 'outline'}
              onClick={() => setViewMode('leaderboard')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Global Leaderboard
            </Button>
          </div>
        </div>

        {viewMode === 'achievements' ? (
          <>
            {/* Header Stats */}
            <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedCount} / {totalAchievements}</div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                out of {maxPoints} possible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Achievements Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              Keep studying to unlock more achievements and earn points!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="all">All ({achievementsByCategory.all})</TabsTrigger>
                <TabsTrigger value="login">
                  <Calendar className="h-4 w-4 mr-1" />
                  Login ({achievementsByCategory.login})
                </TabsTrigger>
                <TabsTrigger value="time">
                  <Clock className="h-4 w-4 mr-1" />
                  Time ({achievementsByCategory.time})
                </TabsTrigger>
                <TabsTrigger value="score">
                  <Target className="h-4 w-4 mr-1" />
                  Score ({achievementsByCategory.score})
                </TabsTrigger>
                <TabsTrigger value="subject">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Subject ({achievementsByCategory.subject})
                </TabsTrigger>
                <TabsTrigger value="streak">
                  <Zap className="h-4 w-4 mr-1" />
                  Streak ({achievementsByCategory.streak})
                </TabsTrigger>
                <TabsTrigger value="special">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Special ({achievementsByCategory.special})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                  {filteredAchievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.has(achievement.id);
                    const Icon = achievement.icon;
                    const rarityColor = getRarityColor(achievement.rarity);
                    const borderColor = getRarityBorderColor(achievement.rarity);

                    return (
                      <Card
                        key={achievement.id}
                        className={cn(
                          "relative overflow-hidden transition-all duration-300",
                          "hover:shadow-lg hover:scale-105",
                          isUnlocked && "ring-2 ring-primary/50",
                          !isUnlocked && "border-dashed",
                          borderColor
                        )}
                      >
                        {/* Rarity indicator bar */}
                        <div className={cn(
                          "absolute top-0 left-0 right-0 h-1",
                          rarityColor.split(' ')[0].replace('text-', 'bg-')
                        )} />

                        <CardHeader className="text-center pb-2 pt-4">
                          <div className={cn(
                            "mx-auto rounded-full p-4 mb-2",
                            isUnlocked ? rarityColor : "bg-muted/50 border-2 border-dashed border-muted-foreground/30",
                            "transition-all duration-300"
                          )}>
                            <Icon className={cn(
                              "h-8 w-8",
                              isUnlocked ? "" : "text-muted-foreground/70"
                            )} />
                          </div>
                          <CardTitle className={cn(
                            "text-base",
                            !isUnlocked && "text-muted-foreground"
                          )}>
                            {achievement.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 text-center">
                          <p className="text-xs text-muted-foreground mb-3 min-h-[2.5rem]">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              rarityColor
                            )}>
                              {achievement.rarity.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          {!isUnlocked && (
                            <Badge variant="outline" className="mt-2 text-xs border-dashed">
                              Locked
                            </Badge>
                          )}
                        </CardContent>

                        {/* Shimmer effect for all achievements */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r",
                          getShimmerColor(achievement.rarity),
                          "animate-[shimmer_3s_infinite] pointer-events-none"
                        )} />
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
          </>
        ) : (
          <GlobalLeaderboard />
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}

