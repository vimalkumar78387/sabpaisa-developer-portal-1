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

export function IntegrationDocExplorer({ categories }: Props) {
  const firstCategory = categories[0]
  const firstKit = firstCategory?.kits[0]

  const [activeCategoryId, setActiveCategoryId] = useState(firstCategory?.id ?? '')
  const [activeKitId, setActiveKitId] = useState(firstKit?.id ?? '')
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash) return

      for (const category of categories) {
        if (hash === category.id) {
          setActiveCategoryId(category.id)
          setActiveKitId(category.kits[0]?.id ?? '')
          return
        }

        for (const kit of category.kits) {
          const composite = `${category.id}-${kit.id}`
          if (composite === hash) {
            setActiveCategoryId(category.id)
            setActiveKitId(kit.id)
            return
          }
        }
      }
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [categories])

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? firstCategory
  const activeKit = activeCategory?.kits.find((kit) => kit.id === activeKitId) ?? firstKit

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
