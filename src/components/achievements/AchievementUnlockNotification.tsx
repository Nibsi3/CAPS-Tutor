'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/achievements';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getRarityColor, getRarityBorderColor } from '@/lib/achievements';
import { Sparkles, X } from 'lucide-react';

interface AchievementUnlockNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlockNotification({ achievement, onClose }: AchievementUnlockNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 500); // Wait for fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  const Icon = achievement.icon;
  const rarityColor = getRarityColor(achievement.rarity);
  const borderColor = getRarityBorderColor(achievement.rarity);
  const bgGradient = {
    common: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
    rare: 'from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50',
    epic: 'from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50',
    legendary: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50',
  }[achievement.rarity] || 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50';

  return (
    <div 
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
        "transition-all duration-500 ease-out",
        isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-[-100px] opacity-0 scale-95"
      )}
    >
      <Card className={cn(
        "relative overflow-hidden shadow-2xl",
        "bg-gradient-to-br",
        bgGradient,
        "backdrop-blur-sm",
        "border-2",
        borderColor,
        "min-w-[380px] max-w-md"
      )}>
        {/* Rarity indicator bar at top */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          rarityColor.split(' ')[0].replace('text-', 'bg-')
        )} />

        {/* Subtle sparkle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className={cn(
            "absolute top-4 right-4 w-16 h-16 opacity-20",
            rarityColor,
            "animate-pulse"
          )} />
          <Sparkles className={cn(
            "absolute bottom-4 left-4 w-12 h-12 opacity-15",
            rarityColor,
            "animate-pulse",
            "[animation-delay:1s]"
          )} />
        </div>

        <CardContent className="relative p-6">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                rarityColor.split(' ')[0].replace('text-', 'bg-')
              )} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Achievement Unlocked
              </span>
            </div>
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 300);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-muted"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main content */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "rounded-xl p-3 bg-background/80 backdrop-blur-sm",
              "border-2",
              borderColor,
              "shadow-lg",
              "flex-shrink-0",
              "transition-transform duration-300",
              "hover:scale-110"
            )}>
              <Icon className={cn("h-8 w-8", rarityColor)} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1.5 text-foreground leading-tight">
                {achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {achievement.description}
              </p>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "bg-background/60 backdrop-blur-sm border",
                borderColor,
                "shadow-sm"
              )}>
                <span className={cn("text-sm font-semibold", rarityColor)}>
                  +{achievement.points} points
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Subtle shine effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent",
          "animate-[shimmer_3s_infinite]",
          "pointer-events-none"
        )} />
      </Card>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
      `}</style>
    </div>
  );
}

