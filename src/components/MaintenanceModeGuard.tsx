"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { Loader } from 'lucide-react'

export function MaintenanceModeGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin()

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/admin/system/settings')
        
        if (!response.ok) {
          // Try to parse as JSON, but handle HTML errors gracefully
          let data;
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            data = await response.json()
          } else {
            // If not JSON, read as text to see what we got
            const text = await response.text()
            console.error('Non-JSON response from settings API:', text.substring(0, 200))
            setIsMaintenanceMode(false)
            setIsLoading(false)
            return
          }
          
          console.error('Settings API error:', data)
          setIsMaintenanceMode(false)
          setIsLoading(false)
          return
        }
        
        const data = await response.json()
        
        if (data.success && data.settings) {
          setIsMaintenanceMode(data.settings.maintenanceMode || false)
        } else {
          setIsMaintenanceMode(false)
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error)
        setIsMaintenanceMode(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenanceMode()
    
    // Check every 30 seconds to stay updated
    const interval = setInterval(checkMaintenanceMode, 30000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Don't redirect if still loading or if user is admin
    if (isLoading || isAdminLoading || isMaintenanceMode === null) {
      return
    }

    // Allow admins to access admin routes even during maintenance
    const isAdminRoute = pathname?.startsWith('/admin')
    
    // Allow access to maintenance page itself
    if (pathname === '/maintenance') {
      return
    }

    // If maintenance mode is enabled and user is not admin, redirect to maintenance page
    if (isMaintenanceMode && !isAdmin) {
      router.push('/maintenance')
    }
    
    // If maintenance mode is disabled and we're on the maintenance page, redirect to home
    if (!isMaintenanceMode && pathname === '/maintenance') {
      router.push('/')
    }
  }, [isMaintenanceMode, isLoading, isAdminLoading, isAdmin, pathname, router])

  // Show loading state while checking
  if (isLoading || isAdminLoading || isMaintenanceMode === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    )
  }

  // If maintenance mode is enabled and user is not admin, show nothing (redirect will happen)
  if (isMaintenanceMode && !isAdmin && pathname !== '/maintenance') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

