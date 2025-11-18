'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown,
  Home,
  Book,
  Code,
  TestTube,
  Webhook,
  MessageSquare,
  Shield,
  FileText,
  Zap,
  CreditCard,
  Banknote,
  Link as LinkIcon,
  Building2,
  FormInput
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
  badge?: string
}

const docLink = (slug: string) => `/docs?kit=${slug}#${slug}`

const navigationItems: NavItem[] = [
  {
    title: 'Getting Started',
    icon: Home,
    href: '/'
  },
  {
    title: 'Products',
    icon: CreditCard,
    items: [
      {
        title: 'Payment Gateway',
        icon: CreditCard,
        href: '/docs/payment-gateway',
      },
      {
        title: 'E-NACH',
        icon: Banknote,
        href: '/docs/e-nach',
      },
      {
        title: 'Payment Link',
        icon: LinkIcon,
        href: '/docs/payment-link',
      },
      {
        title: 'B2B E-Collect',
        icon: Building2,
        href: '/docs/b2b-e-collect',
      },
      {
        title: 'QwikForms',
        icon: FormInput,
        href: '/docs/qwikforms',
      },
    ]
  },
  {
    title: 'Integration Modules',
    icon: Code,
    items: [
      {
        title: 'Server Integration',
        items: [
          { title: 'Java', href: docLink('server-integration-java') },
          { title: 'PHP', href: docLink('server-integration-php') },
          { title: 'Laravel', href: docLink('server-integration-laravel') },
          { title: 'Node.js', href: docLink('server-integration-nodejs') },
          { title: 'Python', href: docLink('server-integration-python') },
          { title: '.NET', href: docLink('server-integration-dotnet') }
        ]
      },
      {
        title: 'Web Integration',
        items: [
          { title: 'ReactJS', href: docLink('web-integration-reactjs') },
          { title: 'AngularJS', href: docLink('web-integration-angularjs') },
          { title: 'Vue.js', href: docLink('web-integration-vuejs') }
        ]
      },
      {
        title: 'Hybrid Integration',
        items: [
          { title: 'Flutter', href: docLink('hybrid-integration-flutter') },
          { title: 'React Native', href: docLink('hybrid-integration-react-native') },
          { title: 'Cordova', href: docLink('hybrid-integration-cordova') },
          { title: 'Capacitor', href: docLink('hybrid-integration-capacitor') },
          { title: 'Ionic', href: docLink('hybrid-integration-ionic') }
        ]
      },
      {
        title: 'Native Integration',
        items: [
          { title: 'iOS', href: docLink('native-integration-ios') },
          { title: 'Android', href: docLink('native-integration-android') }
        ]
      },
      {
        title: 'E-commerce Plugin',
        items: [
          { title: 'WooCommerce Plugin', href: docLink('ecommerce-plugin-woocommerce-plugin') },
          { title: 'Odoo', href: docLink('ecommerce-plugin-odoo') },
          { title: 'Wix', href: docLink('ecommerce-plugin-wix') },
          { title: 'OpenCart', href: docLink('ecommerce-plugin-opencart') }
        ]
      }
    ]
  },
  {
    title: 'API Reference',
    icon: Book,
    items: [
      {
        title: 'Transaction Enquiry API',
        href: docLink('api-reference-transaction-enquiry')
      },
      {
        title: 'Refund API',
        href: docLink('api-reference-refund')
      }
    ]
  },
  {
    title: 'API Playground',
    icon: TestTube,
    href: '/playground'
  },
  {
    title: 'Sandbox',
    icon: Zap,
    href: '/sandbox'
  },
  {
    title: 'Webhooks & IPN',
    icon: Webhook,
    href: '/docs/webhooks'
  },
  {
    title: 'Security & Compliance',
    icon: Shield,
    href: '/docs/security'
  },
  {
    title: 'Changelog',
    icon: FileText,
    href: '/changelog'
  },
  {
    title: 'Community',
    icon: MessageSquare,
    href: '/community'
  }
]

interface MainSidebarProps {
  className?: string
}

export function MainSidebar({ className }: MainSidebarProps) {
  const pathname = usePathname()
  const [currentHash, setCurrentHash] = useState<string>('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncHash = () => setCurrentHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  const isActive = (href?: string) => {
    if (!href) return false
    if (href.includes('#')) {
      const [hrefPath, hrefHash] = href.split('#')
      const matchesPath = pathname === hrefPath
      const matchesHash = currentHash === `#${hrefHash}`
      return matchesPath && matchesHash
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasActiveDescendant = (item: NavItem): boolean => {
    if (isActive(item.href)) {
      return true
    }
    if (item.items) {
      return item.items.some((child) => hasActiveDescendant(child))
    }
    return false
  }

  // Auto-expand parent items based on current path
  useEffect(() => {
    const newOpenItems = new Set<string>()
    const collectOpen = (items: NavItem[]) => {
      items.forEach((item) => {
        if (item.items && item.items.length > 0) {
          if (hasActiveDescendant(item)) {
            newOpenItems.add(item.title)
          }
          collectOpen(item.items)
        }
      })
    }

    collectOpen(navigationItems)
    setOpenItems(newOpenItems)
  }, [pathname, currentHash])

  const toggleItem = (title: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(title)) {
      newOpenItems.delete(title)
    } else {
      newOpenItems.add(title)
    }
    setOpenItems(newOpenItems)
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const Icon = item.icon
    const hasChildren = item.items && item.items.length > 0
    const isItemOpen = openItems.has(item.title)
    const active = isActive(item.href)
    const highlighted = hasChildren ? hasActiveDescendant(item) || isItemOpen : active

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isItemOpen}
          onOpenChange={() => toggleItem(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-2 px-3 font-normal",
                level > 0 && "ml-4",
                highlighted ? "bg-accent text-accent-foreground" : "hover:bg-transparent hover:text-foreground"
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              <span className="truncate">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronDown className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isItemOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="ml-4 space-y-1">
              {item.items!.map((subItem) => renderNavItem(subItem, level + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    const content = (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-auto py-2 px-3 font-normal",
          level > 0 && "ml-4"
        )}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Button>
    )

    if (item.href) {
      return (
        <Link key={item.title} href={item.href}>
          {content}
        </Link>
      )
    }

    return <div key={item.title}>{content}</div>
  }

  return (
    <Sidebar className={className}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => renderNavItem(item))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
