'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDown } from 'lucide-react'

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col bg-background border-r",
      className
    )}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center h-16 px-6 border-b", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto py-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-3 py-2", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
      className
    )}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps {
  children: React.ReactNode
  href?: string
  isActive?: boolean
  hasChildren?: boolean
  level?: number
  onClick?: () => void
  className?: string
}

const SidebarMenuItem = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuItemProps
>(({ children, href, isActive, hasChildren, level = 0, onClick, className, ...props }, ref) => (
  <Button
    ref={ref}
    variant={isActive ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start text-left h-auto py-2 px-3 font-normal",
      level > 0 && `ml-${level * 4}`,
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
    {hasChildren && <ChevronDown className="ml-auto h-4 w-4" />}
  </Button>
))
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

const SidebarMenuSub = React.forwardRef<HTMLDivElement, SidebarMenuSubProps>(
  ({ className, isOpen, children, ...props }, ref) => (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        ref={ref}
        className={cn("ml-4 space-y-1", className)}
        {...props}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
)
SidebarMenuSub.displayName = "SidebarMenuSub"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
}