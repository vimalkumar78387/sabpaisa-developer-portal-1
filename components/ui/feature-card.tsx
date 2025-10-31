import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children?: React.ReactNode
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  badgeVariant = 'default',
  className,
  children
}: FeatureCardProps) {
  const CardWrapper = href ? Link : 'div'
  
  return (
    <CardWrapper href={href || ''} className={href ? 'block' : ''}>
      <Card className={cn(
        "h-full transition-all duration-200 hover:shadow-md border-2 hover:border-primary/20",
        href && "cursor-pointer hover:scale-[1.02]",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {badge && (
                  <Badge variant={badgeVariant} className="mt-1 text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
            </div>
            {href && (
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground mb-4">
            {description}
          </CardDescription>
          {children}
          {href && (
            <Button variant="outline" size="sm" className="mt-4">
              Learn More
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}