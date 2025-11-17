'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IntegrationKitDoc, IntegrationKitDocContent } from './integration-kit-docs'

type IntegrationDocCategory = {
  id: string
  title: string
  kits: IntegrationKitDoc[]
}

type Props = {
  categories: IntegrationDocCategory[]
}

const resolveSelection = (
  categories: IntegrationDocCategory[],
  hash: string | null
): { categoryId: string; kitId: string } => {
  const fallbackCategory = categories[0]
  const fallbackKit = fallbackCategory?.kits[0]
  if (!fallbackCategory || !fallbackKit) {
    return { categoryId: '', kitId: '' }
  }

  if (hash) {
    for (const category of categories) {
      if (hash === category.id) {
        return { categoryId: category.id, kitId: category.kits[0]?.id ?? fallbackKit.id }
      }

      for (const kit of category.kits) {
        const composite = `${category.id}-${kit.id}`
        if (composite === hash) {
          return { categoryId: category.id, kitId: kit.id }
        }
      }
    }
  }

  return { categoryId: fallbackCategory.id, kitId: fallbackKit.id }
}

export function IntegrationDocExplorer({ categories }: Props) {
  const initialHash =
    typeof window === 'undefined' ? null : window.location.hash.replace('#', '')
  const initialSelection = resolveSelection(categories, initialHash)

  const [activeCategoryId, setActiveCategoryId] = useState(initialSelection.categoryId)
  const [activeKitId, setActiveKitId] = useState(initialSelection.kitId)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyHash = () => {
      const hash = window.location.hash.replace('#', '')
      const next = resolveSelection(categories, hash || null)
      setActiveCategoryId(next.categoryId)
      setActiveKitId(next.kitId)
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [categories])

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0]
  const activeKit =
    activeCategory?.kits.find((kit) => kit.id === activeKitId) ?? activeCategory?.kits[0]

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!activeCategory || !activeKit) return

    const targetHash = `${activeCategory.id}-${activeKit.id}`
    if (window.location.hash.replace('#', '') !== targetHash) {
      window.history.replaceState(null, '', `#${targetHash}`)
    }
  }, [activeCategory, activeKit])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cleanup = () => {
      document.body.classList.remove('print-mode')
      contentRef.current?.classList.remove('print-area')
    }
    window.addEventListener('afterprint', cleanup)
    return () => window.removeEventListener('afterprint', cleanup)
  }, [])

  const handleExport = () => {
    if (typeof window === 'undefined') return
    const node = contentRef.current
    if (!node) return

    document.body.classList.add('print-mode')
    node.classList.add('print-area')
    window.print()
  }

  if (!activeCategory || !activeKit) {
    return null
  }

  return (
    <div className="space-y-6">
      <div aria-hidden className="pointer-events-none">
        {categories.map((category) => (
          <span key={`${category.id}-anchor`} id={category.id} className="block h-0" />
        ))}
        {categories.flatMap((category) =>
          category.kits.map((kit) => (
            <span
              key={`${category.id}-${kit.id}-anchor`}
              id={`${category.id}-${kit.id}`}
              className="block h-0"
            />
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div ref={contentRef}>
        <IntegrationKitDocContent kit={activeKit} />
      </div>
    </div>
  )
}
