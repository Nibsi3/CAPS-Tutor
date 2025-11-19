"use client"

import { useState, useEffect } from 'react'
import { Bell, X, AlertCircle, Info, AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { useAdminMode } from '@/hooks/use-admin-mode'

interface Announcement {
  $id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  active: boolean
  targetAudience?: 'students' | 'admins' | 'both'
  scheduledStart?: string
  scheduledEnd?: string
}

const priorityConfig = {
  low: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    icon: Bell,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  high: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    icon: AlertTriangle,
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useIsAdmin()
  const { adminModeEnabled } = useAdminMode(isAdmin)

  useEffect(() => {
    loadAnnouncements()
  }, [isAdmin, adminModeEnabled])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      // Determine target audience based on current mode
      const targetAudience = adminModeEnabled ? 'admins' : 'students'
      
      const response = await fetch('/api/admin/system/announcements?active=true')
      const data = await response.json()
      
      if (data.success && data.announcements) {
        const now = new Date()
        
        // Filter announcements based on:
        // 1. Target audience (students/admins/both)
        // 2. Scheduling (scheduledStart, scheduledEnd)
        // 3. Active status
        const filtered = data.announcements.filter((announcement: Announcement) => {
          // Check target audience
          const audience = announcement.targetAudience || 'both'
          if (audience === 'both') {
            // "both" means show to everyone
          } else if (audience !== targetAudience) {
            return false
          }
          
          // Check if scheduled
          if (announcement.scheduledStart) {
            const startDate = new Date(announcement.scheduledStart)
            if (now < startDate) {
              return false // Not started yet
            }
          }
          
          if (announcement.scheduledEnd) {
            const endDate = new Date(announcement.scheduledEnd)
            if (now > endDate) {
              return false // Already ended
            }
          }
          
          return announcement.active
        })
        
        setAnnouncements(filtered)
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }

  // Get visible announcements (not dismissed)
  const visibleAnnouncements = announcements.filter(
    ann => !dismissedIds.has(ann.$id)
  )

  if (loading || visibleAnnouncements.length === 0) {
    return null
  }

  // Show only the first announcement (most recent)
  const announcement = visibleAnnouncements[0]
  const config = priorityConfig[announcement.priority] || priorityConfig.medium
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-l-4 rounded-r-lg',
        config.bg,
        config.border,
        config.text
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">{announcement.title}</h4>
        <p className="text-sm leading-relaxed">{announcement.message}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-6 w-6 flex-shrink-0',
          config.text,
          'hover:bg-black/10 dark:hover:bg-white/10'
        )}
        onClick={() => handleDismiss(announcement.$id)}
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

