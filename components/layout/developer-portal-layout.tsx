'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface DeveloperPortalLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function DeveloperPortalLayout({ 
  children, 
  sidebar, 
  className 
}: DeveloperPortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="flex">
        {sidebar && (
          <aside className="hidden w-80 flex-none md:block">
            <div className="sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-y-auto border-r border-border/60 bg-background/80 px-4 py-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {sidebar}
            </div>
          </aside>
        )}

        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-5.5rem)] min-w-0',
            sidebar && 'md:ml-0'
          )}
        >
          {sidebar && (
            <div className="sticky top-[4.5rem] z-40 mb-6 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    Browse navigation
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex items-center justify-between pb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Navigation
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {sidebar}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
