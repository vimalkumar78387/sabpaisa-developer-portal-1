'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock } from '@/components/ui/code-block'
import type { IntegrationCategory, ParameterSpec } from '@/lib/integration-kits'

type Props = {
  categories: IntegrationCategory[]
}

type Selection = {
  categoryId: string
  kitId: string
}

const ParameterTable = ({ items }: { items: ParameterSpec[] }) => (
  <div className="overflow-x-auto rounded-md border border-border/60">
    <table className="w-full text-sm">
      <thead className="bg-muted/40 text-left text-muted-foreground">
        <tr>
          <th className="px-3 py-2 font-medium text-foreground">Name</th>
          <th className="px-3 py-2 font-medium text-foreground">Type</th>
          <th className="px-3 py-2 font-medium text-foreground">Required</th>
          <th className="px-3 py-2 font-medium text-foreground">Description</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {items.map((item) => (
          <tr key={item.name}>
            <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
            <td className="px-3 py-2 text-muted-foreground">{item.type}</td>
            <td className="px-3 py-2 text-muted-foreground">{item.required ? 'Yes' : 'No'}</td>
            <td className="px-3 py-2 text-muted-foreground">{item.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const resolveSelection = (categories: IntegrationCategory[], hash: string | null): Selection => {
  const fallbackCategory = categories[0]
  const fallbackKit = fallbackCategory?.kits[0]
  if (!fallbackCategory || !fallbackKit) {
    return { categoryId: '', kitId: '' }
  }

  if (!hash) {
    return { categoryId: fallbackCategory.id, kitId: fallbackKit.id }
  }

  const sanitized = hash.replace('#', '')
  for (const category of categories) {
    if (sanitized === category.id && category.kits[0]) {
      return { categoryId: category.id, kitId: category.kits[0].id }
    }
    for (const kit of category.kits) {
      if (sanitized === `${category.id}-${kit.id}`) {
        return { categoryId: category.id, kitId: kit.id }
      }
    }
  }

  return { categoryId: fallbackCategory.id, kitId: fallbackKit.id }
}

export const IntegrationKitViewer = ({ categories }: Props) => {
  const [selection, setSelection] = useState<Selection>(() => resolveSelection(categories, null))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncFromHash = () => {
      setSelection(resolveSelection(categories, window.location.hash))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [categories])

  const activeCategory = useMemo(() => {
    return categories.find((cat) => cat.id === selection.categoryId) ?? categories[0]
  }, [categories, selection.categoryId])

  const activeKit = useMemo(() => {
    return activeCategory?.kits.find((kit) => kit.id === selection.kitId) ?? activeCategory?.kits[0]
  }, [activeCategory, selection.kitId])

  useEffect(() => {
    if (!activeCategory || !activeKit || typeof window === 'undefined') return
    const targetHash = `${activeCategory.id}-${activeKit.id}`
    if (window.location.hash !== `#${targetHash}`) {
      window.history.replaceState(null, '', `#${targetHash}`)
    }
  }, [activeCategory, activeKit])

  if (!activeCategory || !activeKit) {
    return null
  }

  const handleCategoryClick = (categoryId: string) => {
    const nextCategory = categories.find((cat) => cat.id === categoryId)
    const defaultKit = nextCategory?.kits[0]
    if (!nextCategory || !defaultKit) return
    setSelection({ categoryId, kitId: defaultKit.id })
  }

  const handleKitClick = (kitId: string) => {
    setSelection({ categoryId: activeCategory.id, kitId })
  }

  return (
    <div className=
    "space-y-8" id="integration-kits"
  >
    <div className="space-y-2">
      <Badge variant="outline" className="uppercase tracking-tight text-xs">
        Integration Kits
      </Badge>
      <h2 className="text-2xl font-semibold">Developer playbooks by integration surface</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Select a platform to reveal the exact request templates, signature format, and environment endpoints for that kit.
      </p>
    </div>

    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={category.id === activeCategory.id ? 'default' : 'outline'}
            onClick={() => handleCategoryClick(category.id)}
            size="sm"
          >
            {category.title}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeCategory.kits.map((kit) => (
          <Button
            key={kit.id}
            variant={kit.id === activeKit.id ? 'secondary' : 'ghost'}
            onClick={() => handleKitClick(kit.id)}
            size="sm"
            className="capitalize gap-2 rounded-full px-3"
          >
            <span className="relative h-5 w-5 overflow-hidden rounded-full border border-border/40 bg-background/80">
              <Image src={kit.logo} alt={`${kit.name} logo`} width={20} height={20} className="object-contain" />
            </span>
            {kit.name}
          </Button>
        ))}
      </div>
    </div>

    <section id={`${activeCategory.id}-${activeKit.id}`} className="scroll-mt-32">
      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="relative h-12 w-12 overflow-hidden rounded-2xl border border-border/60 bg-background">
                <Image src={activeKit.logo} alt={`${activeKit.name} logo`} width={48} height={48} className="object-contain" />
              </span>
              <CardTitle className="text-lg font-semibold">{activeKit.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary">
              {activeCategory.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{activeKit.introduction}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">Sample code:</span>
            <Link href={activeKit.sampleCode.url} target="_blank" className="text-primary hover:underline">
              {activeKit.sampleCode.label}
            </Link>
          </div>

          {activeKit.videoUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Integration walkthrough</h4>
              <p className="text-sm text-muted-foreground">Watch the full implementation flow directly within the portal.</p>
              <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm pt-[56.25%]">
                <iframe
                  src={activeKit.videoUrl}
                  title={`${activeKit.name} integration video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 h-full w-full rounded-t-xl"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-foreground">Staging & production URLs</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="text-xs font-medium uppercase tracking-tight text-muted-foreground">Staging</div>
                <code className="mt-1 block break-all text-sm">{activeKit.environments.staging}</code>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="text-xs font-medium uppercase tracking-tight text-muted-foreground">Production</div>
                <code className="mt-1 block break-all text-sm">{activeKit.environments.production}</code>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Request format</h4>
            <p className="text-sm text-muted-foreground">{activeKit.request.summary}</p>
            <CodeBlock code={activeKit.request.sample} language={activeKit.request.language} />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Request parameters</h4>
            <ParameterTable items={activeKit.requestParameters} />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Encryption / Decryption</h4>
            <p className="mt-2 text-sm text-muted-foreground">{activeKit.encryption}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Response format</h4>
            <p className="text-sm text-muted-foreground">{activeKit.response.summary}</p>
            <CodeBlock code={activeKit.response.sample} language={activeKit.response.language} />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Response parameters</h4>
            <ParameterTable items={activeKit.responseParameters} />
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
)

  }
