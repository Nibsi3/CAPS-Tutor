'use client';

import { useState, useEffect } from 'react';
import { useUser, useDoc, useCollection, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Medal, Trophy, Crown, Award, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Loader } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  totalPoints: number;
  unlockedCount: number;
  rank: number;
}

export function GlobalLeaderboard() {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Get user profile for current user's stats
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile } = useDoc(userProfileRef);

  // Fetch all users from the database
  const allUsersCollectionRef = useMemoAppwrite(() => {
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
    };
  }, []);

  const { data: allUsers, isLoading: isLoadingUsers } = useCollection(allUsersCollectionRef);

  // Process leaderboard data from real users
  useEffect(() => {
    if (isLoadingUsers || !allUsers) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    // Process each user's achievements and calculate points
    const leaderboardEntries: LeaderboardEntry[] = allUsers
      .map((userDoc: any) => {
        const unlockedAchievements = userDoc.unlockedAchievements || [];
        
        // Calculate total points from unlocked achievements
        const totalPoints = ALL_ACHIEVEMENTS
          .filter(a => unlockedAchievements.includes(a.id))
          .reduce((sum, a) => sum + a.points, 0);

        // Get display name (first name only)
        const displayName = userDoc.firstName 
          ? userDoc.firstName
          : userDoc.displayName || userDoc.email?.split('@')[0] || 'Anonymous';

        return {
          userId: userDoc.id,
          displayName,
          email: userDoc.email || null,
          photoURL: userDoc.photoURL || null,
          totalPoints,
          unlockedCount: unlockedAchievements.length,
          rank: 0, // Will be set after sorting
        };
      })
      .filter((entry: LeaderboardEntry) => entry.totalPoints > 0); // Only include users with achievements

    // Sort by points (descending), then by unlocked count
    leaderboardEntries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.unlockedCount - a.unlockedCount;
    });

    // Assign ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboard(leaderboardEntries);

    // Find current user's rank
    if (user) {
      const userRankIndex = leaderboardEntries.findIndex(entry => entry.userId === user.$id);
      setCurrentUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);
    } else {
      setCurrentUserRank(null);
    }

    setIsLoading(false);
  }, [allUsers, isLoadingUsers, user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <span className="font-bold text-lg">{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
    return '';
  };

  // Get top 10 and current user's position
  const topTen = leaderboard.slice(0, 10);
  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.$id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Global Leaderboard
        </CardTitle>
        <CardDescription>
          Compare your achievement points with other students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top 10 Leaderboard */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top 10 Students</h3>
            {topTen.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No students on the leaderboard yet. Be the first!
              </p>
            ) : (
              topTen.map((entry) => {
                const isCurrentUser = entry.userId === user?.$id;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-all",
                      getRankColor(entry.rank),
                      isCurrentUser && "ring-2 ring-primary",
                      "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.photoURL || undefined} alt={entry.displayName || ''} />
                      <AvatarFallback>
                        {(entry.displayName || entry.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{entry.displayName}</span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{entry.unlockedCount} achievements</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-bold text-lg">{entry.totalPoints.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Current User's Position (if not in top 10) */}
          {currentUserEntry && currentUserEntry.rank > 10 && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Position</h3>
                <div
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border-2 border-primary bg-primary/5",
                    "hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <span className="font-bold text-lg text-primary">{currentUserEntry.rank}</span>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUserEntry.photoURL || undefined} alt={currentUserEntry.displayName || ''} />
                    <AvatarFallback>
                      {(currentUserEntry.displayName || currentUserEntry.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{currentUserEntry.displayName}</span>
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{currentUserEntry.unlockedCount} achievements</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{currentUserEntry.totalPoints.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leaderboard.length > 0 
                    ? Math.round(leaderboard.reduce((sum, e) => sum + e.totalPoints, 0) / leaderboard.length)
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Avg Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leaderboard.length > 0 ? leaderboard[0].totalPoints : 0}
                </p>
                <p className="text-xs text-muted-foreground">Top Score</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

