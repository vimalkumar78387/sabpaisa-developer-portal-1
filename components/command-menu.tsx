'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, PlugZap, MessageSquare, Code2, Sparkles, Layers, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CommandItem = {
  title: string
  href: string
  description?: string
  icon: LucideIcon
  keywords?: string[]
  badge?: string
}

type CommandGroup = {
  label: string
  items: CommandItem[]
}

const commandGroups: CommandGroup[] = [
  {
    label: 'Documentation',
    items: [
      {
        title: 'Getting Started',
        href: '/docs/getting-started',
        description: 'Kick off your first integration in minutes.',
        icon: Sparkles,
        keywords: ['quickstart', 'setup', 'guide'],
        badge: 'New',
      },
      {
        title: 'Payment Gateway',
        href: '/docs/payment-gateway',
        description: 'Accept UPI, cards, mandates, and more.',
        icon: Layers,
        keywords: ['payments', 'gateway', 'checkout'],
      },
      {
        title: 'Webhook Playbook',
        href: '/docs/webhooks',
        description: 'Verify signatures and handle async events.',
        icon: PlugZap,
        keywords: ['webhooks', 'ipn', 'events'],
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        title: 'API Playground',
        href: '/playground',
        description: 'Prototype requests and inspect live responses.',
        icon: Code2,
        keywords: ['api', 'tester', 'playground'],
      },
      {
        title: 'Sandbox Console',
        href: '/sandbox',
        description: 'Monitor mock transactions across environments.',
        icon: PlugZap,
        keywords: ['sandbox', 'testing'],
      },
    ],
  },
  {
    label: 'Community',
    items: [
      {
        title: 'Developer Forums',
        href: '/community',
        description: 'Discuss best practices with fellow builders.',
        icon: Users,
        keywords: ['community', 'forum', 'support'],
      },
      {
        title: 'Changelog',
        href: '/changelog',
        description: 'Follow the latest platform releases.',
        icon: MessageSquare,
        keywords: ['updates', 'release notes', 'changelog'],
      },
    ],
  },
  {
    label: 'Support',
    items: [
      {
        title: 'Contact Support',
        href: '/contact',
        description: 'Reach the SabPaisa integration specialists.',
        icon: BookOpen,
        keywords: ['support', 'help'],
      },
    ],
  },
]

type CommandMenuProps = {
  className?: string
  triggerClassName?: string
}

export function CommandMenu({ className, triggerClassName }: CommandMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      return commandGroups
    }

    const needle = query.trim().toLowerCase()
    return commandGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const haystack = [
            item.title,
            item.description,
            ...(item.keywords ?? []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(needle)
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [query])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  const hasResults = filteredGroups.some((group) => group.items.length > 0)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          'hidden md:flex h-9 min-w-[220px] items-center justify-between gap-3 rounded-full border-border/60 bg-background/80 px-3 text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 hover:bg-background hover:text-foreground',
          triggerClassName,
        )}
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Search docs, tools, and more…
        </span>
        <kbd className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            'max-w-xl overflow-hidden border-border/60 p-0 shadow-2xl',
            className,
          )}
          showCloseButton={false}
        >
          <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/80 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for?"
                className="h-10 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-3">
            {hasResults ? (
              filteredGroups.map((group) => (
                <Fragment key={group.label}>
                  <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="space-y-1 pb-3">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => handleSelect(item.href)}
                          className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-primary shadow-sm transition group-hover:border-primary/30 group-hover:text-primary-foreground group-hover:bg-primary/10">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                              {item.title}
                              {item.badge && (
                                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                  {item.badge}
                                </Badge>
                              )}
                            </span>
                            {item.description && (
                              <span className="mt-1 block text-sm text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Fragment>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-sm text-muted-foreground">
                <Search className="h-6 w-6 text-muted-foreground/70" />
                <p>No results found. Try a different keyword.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
