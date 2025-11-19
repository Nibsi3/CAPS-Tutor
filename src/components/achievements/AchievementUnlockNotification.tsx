'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { getRarityColor } from '@/lib/achievements';

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
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 400); // Wait for fade out animation
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement || !isVisible) return null;

  const Icon = achievement.icon;
  const rarityColor = getRarityColor(achievement.rarity);
  
  // Get background color based on rarity
  const bgColor = {
    common: 'bg-blue-500',
    rare: 'bg-purple-500',
    epic: 'bg-pink-500',
    legendary: 'bg-amber-500',
  }[achievement.rarity] || 'bg-blue-500';

  return (
    <div 
      className={cn(
        "fixed top-8 left-1/2 transform -translate-x-1/2 z-50",
        "transition-all duration-500 ease-out",
        isAnimating 
          ? "translate-y-0 opacity-100 scale-100" 
          : "-translate-y-20 opacity-0 scale-90"
      )}
    >
      <div className={cn(
        "rounded-full px-6 py-4",
        "flex items-center gap-3",
        "shadow-2xl",
        "backdrop-blur-sm",
        "border-2 border-white/20",
        bgColor,
        "text-white",
        "min-w-[200px]",
        "max-w-[90vw]"
      )}>
        {/* Icon Circle */}
        <div className={cn(
          "rounded-full p-2",
          "bg-white/20 backdrop-blur-sm",
          "flex-shrink-0"
        )}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Achievement Name */}
        <span className="font-semibold text-base whitespace-nowrap overflow-hidden text-ellipsis">
          {achievement.title}
        </span>
      </div>
    </div>
  );
}

