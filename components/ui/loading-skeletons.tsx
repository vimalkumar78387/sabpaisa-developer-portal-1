import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted",
        "bg-size-200 bg-pos-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardSkeletonProps {
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function CardSkeleton({ 
  showHeader = true, 
  showFooter = false, 
  className 
}: CardSkeletonProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm animate-scaleIn",
      className
    )}>
      {showHeader && (
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      <div className="p-6 pt-0 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
      
      {showFooter && (
        <div className="flex items-center p-6 pt-0">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24 ml-auto" />
        </div>
      )}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full animate-fadeInUp">
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div 
            key={index} 
            className="border-b px-4 py-3"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4 animate-fadeInUp">
      <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function ApiResponseSkeleton() {
  return (
    <div className="space-y-4 animate-fadeInUp">
      {/* Response Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      {/* Response Body */}
      <div className="rounded-lg border bg-slate-950 p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 bg-slate-800" />
          <Skeleton className="h-4 w-24 bg-slate-800" />
        </div>
        <div className="pl-6 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16 bg-slate-700" />
            <Skeleton className="h-3 w-32 bg-slate-700" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-12 bg-slate-700" />
            <Skeleton className="h-3 w-20 bg-slate-700" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-20 bg-slate-700" />
            <Skeleton className="h-3 w-40 bg-slate-700" />
          </div>
        </div>
      </div>
      
      {/* Response Time */}
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function NavigationSkeleton() {
  return (
    <div className="space-y-2 animate-slideInDown">
      {Array.from({ length: 6 }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center space-x-3 px-3 py-2"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
      
      <div className="pt-4 space-y-2">
        <div className="flex items-center space-x-3 px-3 py-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="pl-8 space-y-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-1/2" />
          ))}
        </div>
      </div>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingDots({ className, size = 'md' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }
  
  return (
    <div className={cn('flex space-x-1', className)}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'rounded-full bg-primary animate-bounce',
            sizeClasses[size]
          )}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

export function PulseDot({ className }: { className?: string }) {
  return (
    <div className={cn(
      'w-2 h-2 bg-primary rounded-full animate-pulse-slow',
      className
    )} />
  )
}

export function PlaygroundLoadingSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8 animate-fadeInUp">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full max-w-2xl mb-6" />
          
          {/* Tab Switcher */}
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        
        {/* Quick Actions Grid */}
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} showHeader={true} showFooter={true} />
            ))}
          </div>
        </div>
        
        {/* API Explorer */}
        <div>
          <Skeleton className="h-8 w-36 mb-6" />
          
          {/* Tabs */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>
          
          {/* API Endpoints */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-16 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fadeInUp">
      {/* Header Skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <NavigationSkeleton />
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
              <div className="flex justify-center space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            
            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} showHeader={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}