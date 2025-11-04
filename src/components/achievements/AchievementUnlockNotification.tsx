'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/achievements';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getRarityColor } from '@/lib/achievements';
import { Sparkles, Star } from 'lucide-react';

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

  return (
    <div 
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none",
        "transition-all duration-500 ease-out",
        isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-[-100px] opacity-0 scale-95"
      )}
    >
      <Card className={cn(
        "relative overflow-hidden shadow-2xl border-4",
        "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400",
        "dark:from-yellow-600 dark:via-orange-600 dark:to-yellow-600",
        "animate-pulse"
      )}>
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <Sparkles className={cn(
            "absolute w-full h-full opacity-30",
            "animate-spin",
            "[animation-duration:3s]"
          )} />
          <Sparkles className={cn(
            "absolute w-full h-full opacity-20",
            "animate-spin",
            "[animation-duration:5s]",
            "[animation-direction:reverse]"
          )} />
        </div>

        <CardContent className="relative p-6 flex items-center gap-4 min-w-[320px] max-w-md">
          {/* Icon with pulsing animation */}
          <div className={cn(
            "rounded-full p-4 bg-white dark:bg-gray-900",
            "shadow-lg animate-bounce",
            "[animation-duration:1s]"
          )}>
            <Icon className={cn("h-10 w-10", rarityColor.split(' ')[0])} />
          </div>

          {/* Text content */}
          <div className="flex-1 text-white">
            <div className="font-bold text-lg mb-1 drop-shadow-lg">
              🎉 Achievement Unlocked! 🎉
            </div>
            <div className="font-semibold text-base mb-1 drop-shadow-md">
              {achievement.title}
            </div>
            <div className="text-sm opacity-90 drop-shadow-md">
              {achievement.description}
            </div>
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              rarityColor
            )}>
              <span className="text-white">+{achievement.points} pts</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </CardContent>

        {/* Shine effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "animate-[shimmer_2s_infinite]",
          "pointer-events-none"
        )} />
      </Card>

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
    </div>
  );
}

