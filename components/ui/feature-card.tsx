'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { 
  ArrowRight, 
  Sparkles,
  Book, 
  CreditCard, 
  Banknote, 
  Link as LinkIcon, 
  Building2, 
  RectangleEllipsis as FormInput,
  Code,
  Server,
  Globe,
  Layers,
  ShoppingCart,
  Smartphone,
  BookOpen,
  TestTube,
  Webhook
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon?: string | React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children?: React.ReactNode
  animated?: boolean
  glowEffect?: boolean
  featured?: boolean
  delay?: number
}

// Icon mapping for string names
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  CreditCard,
  Banknote,
  LinkIcon,
  Building2,
  FormInput,
  Code,
  Server,
  Globe,
  Layers,
  ShoppingCart,
  Smartphone,
  BookOpen,
  TestTube,
  Webhook
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  badge,
  badgeVariant = 'default',
  className,
  children,
  animated = true,
  glowEffect = false,
  featured = false,
  delay = 0
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get the icon component
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon
  const CardWrapper = href ? Link : 'div'
  
  return (
    <div 
      className={cn(
        "group",
        animated && "animate-fadeInUp",
        delay && `animate-delay-${delay}`
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardWrapper 
        href={href || ''} 
        className={href ? 'block' : ''}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={cn(
          "h-full relative overflow-hidden transition-all duration-500 ease-out",
          "border-2 hover:border-primary/30",
          "transform-gpu will-change-transform",
          href && "cursor-pointer interactive-card",
          glowEffect && "hover-glow",
          featured && "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
          className
        )}>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          {/* Featured sparkle effect */}
          {featured && (
            <div className="absolute top-4 right-4">
              <Sparkles className={cn(
                "h-4 w-4 text-primary transition-all duration-300",
                isHovered ? "animate-spin" : "animate-pulse-slow"
              )} />
            </div>
          )}
          
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                    "bg-gradient-to-br from-primary/10 to-primary/5",
                    "group-hover:from-primary/20 group-hover:to-primary/10",
                    "shadow-sm group-hover:shadow-md",
                    isHovered && "animate-pulse"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6 text-primary transition-all duration-300",
                      isHovered && "scale-110 rotate-3"
                    )} />
                  </div>
                )}
                <div>
                  <CardTitle className={cn(
                    "text-lg font-semibold transition-all duration-300",
                    "group-hover:text-primary",
                    featured && "text-xl"
                  )}>
                    {title}
                  </CardTitle>
                  {badge && (
                    <Badge 
                      variant={badgeVariant} 
                      className={cn(
                        "mt-2 text-xs transition-all duration-300",
                        "group-hover:scale-105",
                        featured && "bg-gradient-to-r from-primary to-primary/80 animate-shimmer"
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                </div>
              </div>
              {href && (
                <div className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  "group-hover:bg-primary/10 group-hover:scale-110",
                  isHovered && "animate-bounce"
                )}>
                  <ArrowRight className={cn(
                    "h-4 w-4 transition-all duration-300",
                    "text-muted-foreground group-hover:text-primary",
                    isHovered && "translate-x-1"
                  )} />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 relative z-10">
            <CardDescription className={cn(
              "text-sm text-muted-foreground mb-4 leading-relaxed",
              "group-hover:text-foreground/80 transition-colors duration-300"
            )}>
              {description}
            </CardDescription>
            {children}
            {href && (
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "mt-6 group-hover:border-primary group-hover:text-primary",
                  "transition-all duration-300 hover:scale-105"
                )}
              >
                Learn More
                <ArrowRight className={cn(
                  "h-3 w-3 ml-2 transition-transform duration-300",
                  isHovered && "translate-x-1"
                )} />
              </Button>
            )}
          </CardContent>
          
          {/* Bottom shine effect */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r",
            "from-transparent via-primary/50 to-transparent",
            "transform scale-x-0 group-hover:scale-x-100",
            "transition-transform duration-500 ease-out"
          )} />
        </Card>
      </CardWrapper>
    </div>
  )
}