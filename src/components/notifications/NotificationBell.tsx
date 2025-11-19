"use client"

import { useState, useEffect } from 'react'
import { Bell, X, AlertCircle, Info, AlertTriangle, Check, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { useAdminMode } from '@/hooks/use-admin-mode'
import { formatDistanceToNow } from 'date-fns'

interface Announcement {
  $id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  active: boolean
  targetAudience?: 'students' | 'admins' | 'both'
  scheduledStart?: string
  scheduledEnd?: string
  $createdAt?: string
}

const priorityConfig = {
  low: {
    border: 'border-l-blue-500',
    icon: Info,
    iconColor: 'text-blue-500',
    badge: 'default',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  medium: {
    border: 'border-l-amber-500',
    icon: Bell,
    iconColor: 'text-amber-500',
    badge: 'default',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  high: {
    border: 'border-l-orange-500',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    badge: 'default',
    badgeColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  },
  critical: {
    border: 'border-l-red-500',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    badge: 'default',
    badgeColor: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  },
}

const STORAGE_KEY = 'readAnnouncements'
const DISMISSED_KEY = 'dismissedAnnouncements'

function getReadAnnouncements(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function getDismissedAnnouncements(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function dismissAnnouncement(announcementId: string) {
  if (typeof window === 'undefined') return
  try {
    const dismissed = getDismissedAnnouncements()
    dismissed.add(announcementId)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissed)))
  } catch (error) {
    console.error('Error dismissing announcement:', error)
  }
}

function markAsRead(announcementId: string) {
  if (typeof window === 'undefined') return
  try {
    const read = getReadAnnouncements()
    read.add(announcementId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read)))
  } catch (error) {
    console.error('Error marking announcement as read:', error)
  }
}

function markAsUnread(announcementId: string) {
  if (typeof window === 'undefined') return
  try {
    const read = getReadAnnouncements()
    read.delete(announcementId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read)))
  } catch (error) {
    console.error('Error marking announcement as unread:', error)
  }
}

function markAllAsRead(announcementIds: string[]) {
  if (typeof window === 'undefined') return
  try {
    const read = getReadAnnouncements()
    announcementIds.forEach(id => read.add(id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read)))
  } catch (error) {
    console.error('Error marking announcements as read:', error)
  }
}

export function NotificationBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { isAdmin } = useIsAdmin()
  const { adminModeEnabled } = useAdminMode(isAdmin)

  useEffect(() => {
    loadAnnouncements()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, adminModeEnabled])

  useEffect(() => {
    if (announcements.length > 0) {
      const read = getReadAnnouncements()
      const unread = announcements.filter(ann => !read.has(ann.$id))
      setUnreadCount(unread.length)
    }
  }, [announcements])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const targetAudience = adminModeEnabled ? 'admins' : 'students'
      
      const response = await fetch('/api/admin/system/announcements?active=true')
      const data = await response.json()
      
      if (data.success && data.announcements) {
        const now = new Date()
        
        const filtered = data.announcements.filter((announcement: Announcement) => {
          const audience = announcement.targetAudience || 'both'
          if (audience === 'both') {
            // "both" means show to everyone
          } else if (audience !== targetAudience) {
            return false
          }
          
          if (announcement.scheduledStart) {
            const startDate = new Date(announcement.scheduledStart)
            if (now < startDate) return false
          }
          
          if (announcement.scheduledEnd) {
            const endDate = new Date(announcement.scheduledEnd)
            if (now > endDate) return false
          }
          
          return announcement.active
        })
        
        // Filter out dismissed announcements
        const dismissed = getDismissedAnnouncements()
        const notDismissed = filtered.filter((ann: Announcement) => !dismissed.has(ann.$id))
        
        // Sort by creation date (newest first)
        notDismissed.sort((a: Announcement, b: Announcement) => {
          const dateA = a.$createdAt ? new Date(a.$createdAt).getTime() : 0
          const dateB = b.$createdAt ? new Date(b.$createdAt).getTime() : 0
          return dateB - dateA
        })
        
        setAnnouncements(notDismissed)
      }
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = (announcementId: string) => {
    markAsRead(announcementId)
    const read = getReadAnnouncements()
    const unread = announcements.filter(ann => !read.has(ann.$id))
    setUnreadCount(unread.length)
  }

  const handleMarkAsUnread = (announcementId: string) => {
    markAsUnread(announcementId)
    const read = getReadAnnouncements()
    const unread = announcements.filter(ann => !read.has(ann.$id))
    setUnreadCount(unread.length)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead(announcements.map(ann => ann.$id))
    setUnreadCount(0)
  }

  const handleDismiss = (announcementId: string) => {
    dismissAnnouncement(announcementId)
    // Remove from local state
    setAnnouncements(prev => prev.filter(ann => ann.$id !== announcementId))
    // Update unread count
    const read = getReadAnnouncements()
    const remaining = announcements.filter(ann => ann.$id !== announcementId)
    const unread = remaining.filter(ann => !read.has(ann.$id))
    setUnreadCount(unread.length)
  }

  const read = getReadAnnouncements()
  const unreadAnnouncements = announcements.filter(ann => !read.has(ann.$id))
  const readAnnouncements = announcements.filter(ann => read.has(ann.$id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {announcements.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {announcements.length}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {unreadAnnouncements.length > 0 && (
                <>
                  {unreadAnnouncements.map((announcement, index) => {
                    const config = priorityConfig[announcement.priority] || priorityConfig.medium
                    const Icon = config.icon
                    const createdDate = announcement.$createdAt ? new Date(announcement.$createdAt) : null
                    const isMultiple = unreadAnnouncements.length > 1
                    
                    return (
                      <div key={announcement.$id}>
                        <div
                          className={cn(
                            'p-3 border-l-4 hover:bg-muted/30 transition-colors',
                            config.border,
                            index < unreadAnnouncements.length - 1 && 'border-b'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1">
                              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.iconColor)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h4 className="font-semibold text-sm">{announcement.title}</h4>
                                  <Badge variant="outline" className={cn('text-xs', config.badgeColor)}>
                                    {announcement.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground mb-2 line-clamp-3">
                                  {announcement.message}
                                </p>
                                {createdDate && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(createdDate, { addSuffix: true })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(announcement.$id)
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDismiss(announcement.$id)
                                }}
                                title="Dismiss notification"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {isMultiple && index < unreadAnnouncements.length - 1 && (
                          <div className="px-3 py-1 text-center">
                            <div className="text-xs text-muted-foreground">
                              {unreadAnnouncements.length - index - 1} more notification{unreadAnnouncements.length - index - 1 !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {readAnnouncements.length > 0 && <Separator className="my-2" />}
                </>
              )}
              
              {readAnnouncements.map((announcement, index) => {
                const config = priorityConfig[announcement.priority] || priorityConfig.medium
                const Icon = config.icon
                const createdDate = announcement.$createdAt ? new Date(announcement.$createdAt) : null
                const isMultiple = readAnnouncements.length > 1
                
                return (
                  <div key={announcement.$id}>
                    <div
                      className={cn(
                        'p-3 border-l-4 opacity-60 hover:opacity-100 hover:bg-muted/20 transition-all',
                        config.border,
                        index < readAnnouncements.length - 1 && 'border-b'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.iconColor)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-semibold text-sm">{announcement.title}</h4>
                              <Badge variant="outline" className={cn('text-xs', config.badgeColor)}>
                                {announcement.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground mb-2 line-clamp-3">
                              {announcement.message}
                            </p>
                            {createdDate && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(createdDate, { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsUnread(announcement.$id)
                            }}
                            title="Mark as unread"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDismiss(announcement.$id)
                            }}
                            title="Dismiss notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {isMultiple && index < readAnnouncements.length - 1 && (
                      <div className="px-3 py-1 text-center">
                        <div className="text-xs text-muted-foreground">
                          {readAnnouncements.length - index - 1} more notification{readAnnouncements.length - index - 1 !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

