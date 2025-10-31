import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { 
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
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

const documentationSections = [
  {
    title: 'Products Documentation',
    description: 'Comprehensive guides for all SabPaisa payment products',
    items: [
      {
        title: 'Payment Gateway',
        description: 'Accept online payments with multiple payment methods',
        icon: CreditCard,
        href: '/docs/payment-gateway'
      },
      {
        title: 'E-NACH',
        description: 'Automated recurring payment collection',
        icon: Banknote,
        href: '/docs/e-nach'
      },
      {
        title: 'Payment Link',
        description: 'Generate instant payment links',
        icon: LinkIcon,
        href: '/docs/payment-link'
      },
      {
        title: 'B2B E-Collect',
        description: 'Business-to-business payment collection',
        icon: Building2,
        href: '/docs/b2b-e-collect'
      },
      {
        title: 'QwikForms',
        description: 'Dynamic payment forms with custom fields',
        icon: FormInput,
        href: '/docs/qwikforms'
      }
    ]
  },
  {
    title: 'Integration Modules',
    description: 'Choose the right integration approach for your platform',
    items: [
      {
        title: 'Server Integration',
        description: 'Server-to-server API integration',
        icon: Server,
        href: '/docs/integration/server'
      },
      {
        title: 'Web Integration',
        description: 'Client-side web integration',
        icon: Globe,
        href: '/docs/integration/web'
      },
      {
        title: 'Hybrid Integration',
        description: 'Combined server and client integration',
        icon: Layers,
        href: '/docs/integration/hybrid'
      },
      {
        title: 'E-commerce Platforms',
        description: 'Pre-built plugins for popular platforms',
        icon: ShoppingCart,
        href: '/docs/integration/ecommerce'
      },
      {
        title: 'Native Mobile',
        description: 'iOS and Android SDK integration',
        icon: Smartphone,
        href: '/docs/integration/native'
      }
    ]
  }
]

const quickLinks = [
  {
    title: 'API Reference',
    description: 'Complete API documentation with examples',
    href: '/docs/api',
    icon: Book
  },
  {
    title: 'Getting Started',
    description: 'Quick start guide for new developers',
    href: '/docs/getting-started',
    icon: Code
  }
]

export default function DocsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to integrate SabPaisa payment solutions into your applications.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickLinks.map((link, index) => (
              <FeatureCard
                key={index}
                title={link.title}
                description={link.description}
                icon={link.icon}
                href={link.href}
              />
            ))}
          </div>
        </div>

        {/* Documentation Sections */}
        {documentationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIndex) => (
                <FeatureCard
                  key={itemIndex}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  href={item.href}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Getting Help */}
        <div className="bg-muted/30 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/community">Visit Community Forum</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}