import Link from 'next/link'

import { IntegrationKitViewer } from '@/components/docs/integration-kit-viewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { integrationCategories } from '@/lib/integration-kits'
import { ArrowRight, BookOpenCheck, Compass, Plug } from 'lucide-react'

const quickLinks = [
  {
    title: 'Getting started',
    description: 'Spin up your sandbox, retrieve API keys, and run your first test transaction.',
    href: '/docs/getting-started',
    icon: Compass,
  },
  {
    title: 'API reference',
    description: 'Explore every endpoint, parameter, and webhook signature in detail.',
    href: '/docs/payment-gateway',
    icon: BookOpenCheck,
  },
  {
    title: 'Webhook verification',
    description: 'Validate SabPaisa signatures and build resilient retry strategies.',
    href: '/docs/webhooks',
    icon: Plug,
  },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background shadow-xl">
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 px-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit rounded-full border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Documentation hub
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Everything you need to integrate SabPaisa with confidence
              </h1>
              <p className="text-lg text-muted-foreground">
                Dive into end-to-end guides, API schemas, webhook recipes, and compliance blueprints built for modern engineering teams.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="group gap-2 rounded-full px-6">
                <Link href="/docs/getting-started">
                  Start with the quickstart
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group gap-2 rounded-full border-primary/30 px-6">
                <Link href="/playground">
                  Test APIs in the playground
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Card key={link.title} className="border border-border/60 bg-background/80 shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-lg font-semibold text-foreground">{link.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm text-muted-foreground">
                      {link.description}
                    </CardDescription>
                    <Button asChild variant="ghost" className="group gap-2 p-0 text-sm font-semibold text-primary">
                      <Link href={link.href}>
                        Explore
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <IntegrationKitViewer categories={integrationCategories} />

      <div className="rounded-3xl border border-border/60 bg-muted/30 p-10 shadow-inner">
        <h2 className="text-2xl font-semibold">Need help?</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Can't find what you're looking for? Drop into the community forum for peer support or raise a ticket with our integration specialists.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link href="/community">Visit community forum</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
