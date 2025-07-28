'use client'

import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code, Zap, Shield, Users, CreditCard, Banknote, LinkIcon, Building2, FormInput, BookOpen, TestTube, Webhook } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const developerQuotes = [
  {
    quote: "SabPaisa's API documentation is clear and comprehensive. Integration was seamless.",
    author: "Priya Sharma",
    company: "TechStart Solutions",
    role: "Lead Developer"
  },
  {
    quote: "The sandbox environment made testing payment flows incredibly easy and safe.",
    author: "Rahul Gupta",
    company: "E-commerce Hub",
    role: "Backend Engineer"
  },
  {
    quote: "Best payment gateway API I've worked with. Great developer experience.",
    author: "Anjali Singh",
    company: "FinTech Innovations",
    role: "Senior Developer"
  }
]

const sabPaisaProducts = [
  {
    title: 'Payment Gateway',
    description: 'Accept payments seamlessly with our robust payment gateway supporting multiple payment methods including cards, UPI, wallets, and net banking.',
    icon: CreditCard,
    href: '/docs/payment-gateway',
    badge: 'Popular'
  },
  {
    title: 'E-NACH',
    description: 'Automate recurring payments with Electronic National Automated Clearing House for subscriptions and EMIs.',
    icon: Banknote,
    href: '/docs/e-nach',
    badge: 'Recurring'
  },
  {
    title: 'Payment Link',
    description: 'Generate instant payment links for quick transactions without complex integrations.',
    icon: LinkIcon,
    href: '/docs/payment-link',
    badge: 'Quick Setup'
  },
  {
    title: 'B2B E-Collect',
    description: 'Streamline business-to-business payments with advanced collection and reconciliation features.',
    icon: Building2,
    href: '/docs/b2b-e-collect',
    badge: 'Enterprise'
  },
  {
    title: 'QwikForms',
    description: 'Create dynamic payment forms with customizable fields for various use cases.',
    icon: FormInput,
    href: '/docs/qwikforms',
    badge: 'Custom'
  }
]

const quickActions = [
  {
    title: 'API Documentation',
    description: 'Comprehensive API reference with examples',
    icon: BookOpen,
    href: '/docs/api'
  },
  {
    title: 'Interactive Playground',
    description: 'Test APIs in real-time with our playground',
    icon: TestTube,
    href: '/playground'
  },
  {
    title: 'Webhook Guide',
    description: 'Set up payment notifications and webhooks',
    icon: Webhook,
    href: '/docs/webhooks'
  }
]

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animate-delay-200" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge 
              variant="outline" 
              className="mb-6 animate-fadeInDown border-primary/20 bg-primary/5 hover-glow cursor-default"
            >
              🚀 Now supporting UPI, Cards, Wallets & More
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fadeInUp">
              Build Powerful
              <span className="gradient-text block mt-2 animate-morphGradient bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">Payment Solutions</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-8 animate-fadeInUp animate-delay-200">
              Complete payment infrastructure for developers. Integrate SabPaisa's robust APIs to accept payments, manage subscriptions, and scale your business with confidence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-300">
              <Button 
                asChild 
                size="xl" 
                variant="gradient"
                className="text-lg px-8 py-4 shadow-2xl"
              >
                <Link href="/docs/getting-started" className="flex items-center justify-center gap-2">
                  Start Building
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="xl" 
                className="text-lg px-8 py-4 hover:border-primary/50 hover:bg-primary/5"
              >
                <Link href="/playground" className="flex items-center justify-center gap-2">
                  <Code className="h-5 w-5" />
                  Try API Playground
                </Link>
              </Button>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-32 left-1/4 animate-bounce-slow animate-delay-500">
              <Zap className="h-6 w-6 text-primary/30" />
            </div>
            <div className="absolute top-48 right-1/4 animate-bounce-slow animate-delay-300">
              <Shield className="h-6 w-6 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Developer Quotes Section */}
      <section className="py-16 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl font-bold mb-4 gradient-text bg-gradient-to-r from-foreground to-muted-foreground">Trusted by Developers</h2>
            <p className="text-muted-foreground">What developers are saying about SabPaisa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {developerQuotes.map((quote, index) => (
              <div 
                key={index} 
                className={cn(
                  "bg-background/80 backdrop-blur-sm p-6 rounded-xl border shadow-lg",
                  "hover-lift transition-all duration-500 group",
                  "animate-fadeInUp"
                )}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-6xl text-primary/10 font-serif">"</div>
                  <p className="text-foreground mb-6 italic relative z-10 group-hover:text-primary/80 transition-colors duration-300">
                    {quote.quote}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full",
                    "flex items-center justify-center text-white font-semibold text-lg",
                    "group-hover:scale-110 transition-transform duration-300",
                    "shadow-lg group-hover:shadow-xl"
                  )}>
                    {quote.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-base group-hover:text-primary transition-colors duration-300">
                      {quote.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quote.role} at <span className="font-medium">{quote.company}</span>
                    </p>
                  </div>
                </div>
                
                {/* Quote decoration */}
                <div className="absolute bottom-2 right-4 text-4xl text-primary/5 font-serif group-hover:text-primary/10 transition-colors duration-300">"</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">SabPaisa Payment Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect payment solution for your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sabPaisaProducts.map((product, index) => (
              <FeatureCard
                key={index}
                title={product.title}
                description={product.description}
                icon={product.icon}
                href={product.href}
                badge={product.badge}
                badgeVariant="secondary"
                animated={true}
                glowEffect={true}
                featured={index === 0} // Make Payment Gateway featured
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started Quickly</h2>
            <p className="text-muted-foreground">Essential tools and resources for developers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <FeatureCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                href={action.href}
                animated={true}
                glowEffect={true}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose SabPaisa?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Lightning Fast Integration</h3>
                    <p className="text-muted-foreground">Get up and running in minutes with our comprehensive SDKs and clear documentation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Bank-Grade Security</h3>
                    <p className="text-muted-foreground">PCI DSS compliant with advanced fraud detection and secure payment processing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24/7 Developer Support</h3>
                    <p className="text-muted-foreground">Dedicated technical support team to help you integrate and scale successfully.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                  <span className="text-sm font-medium">API Response Time</span>
                  <Badge variant="secondary">~200ms</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                  <span className="text-sm font-medium">Success Rate</span>
                  <Badge variant="secondary">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                  <span className="text-sm font-medium">Payment Methods</span>
                  <Badge variant="secondary">20+</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg shadow-sm">
                  <span className="text-sm font-medium">Countries Supported</span>
                  <Badge variant="secondary">India</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who trust SabPaisa for their payment infrastructure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link href="/sign-up">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/docs">
                View Documentation
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}