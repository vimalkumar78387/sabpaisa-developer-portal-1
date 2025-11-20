'use client'

import type { ReactNode, MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureCard } from '@/components/ui/feature-card'
import {
  ArrowRight,
  Building2,
  Code,
  BookOpen,
  CreditCard,
  Cpu,
  Database,
  Globe,
  Laptop,
  Layers,
  MonitorCog,
  PlugZap,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Users,
  WalletMinimal,
  Workflow,
  Zap,
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const bezierStandard: [number, number, number, number] = [0.215, 0.61, 0.355, 1]
const bezierSlide: [number, number, number, number] = [0.19, 1, 0.22, 1]
const bezierRotate: [number, number, number, number] = [0.23, 1, 0.32, 1]

const fadeVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: custom, ease: bezierStandard },
  }),
}

const scaleVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: custom, ease: bezierStandard },
  }),
}

const slideLeftVariant: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: custom, ease: bezierSlide },
  }),
}

const slideRightVariant: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: custom, ease: bezierSlide },
  }),
}

const rotateVariant: Variants = {
  hidden: { opacity: 0, rotateX: -10, rotateY: 10 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
    transition: { duration: 0.9, delay: custom, ease: bezierRotate },
  }),
}

const heroMetrics = [
  { label: 'Monthly Transactions', value: '12M+' },
  { label: 'Success Rate', value: '99.9%' },
  { label: 'Average Latency', value: '<200ms' },
]

const capabilityHighlights = [
  {
    title: 'Unified Payment Stack',
    description:
      'Orchestrate cards, UPI, net banking, wallets, mandates, and payouts with a single integration surface.',
    icon: CreditCard,
    accent: 'from-sky-500/10 via-sky-500/5 to-transparent',
  },
  {
    title: 'Smart Risk Engine',
    description:
      'Adaptive fraud heuristics, token vaulting, and fine-grained velocity rules safeguard every transaction.',
    icon: Shield,
    accent: 'from-purple-500/10 via-purple-500/5 to-transparent',
  },
  {
    title: 'Observability Built-In',
    description:
      'Real-time dashboards, granular webhooks, and searchable logs keep your payment flows inspectable.',
    icon: MonitorCog,
    accent: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
]

const integrationFlows = [
  {
    step: '01',
    title: 'Authenticate securely',
    description:
      'Exchange your SabPaisa client code and secret for scoped tokens. Rotate keys without downtime.',
    icon: Shield,
  },
  {
    step: '02',
    title: 'Create payment intent',
    description:
      'Compose orders with multi-tender support, metadata, and idempotency to keep requests atomic.',
    icon: Code,
  },
  {
    step: '03',
    title: 'Launch hosted or embedded checkout',
    description:
      'Deliver a responsive checkout that adapts to device, SCA requirements, and preferred payment method.',
    icon: Laptop,
  },
  {
    step: '04',
    title: 'Capture events & reconcile',
    description:
      'Subscribe to webhooks, stream settlement events, and sync payouts with your internal ledgers.',
    icon: Workflow,
  },
]

const realtimeFeatures = [
  {
    title: 'Adaptive Routing',
    description: 'Dynamic BIN intelligence and failover routing maximise approval rates globally.',
    icon: Globe,
  },
  {
    title: 'Vaulted Credentials',
    description: 'Tokenise cards and mandates, reuse for subscriptions, and stay PCI DSS compliant.',
    icon: WalletMinimal,
  },
  {
    title: 'Actionable Insights',
    description: 'Surface latency, drop-off, and risk metrics with developer-first dashboards and APIs.',
    icon: Database,
  },
]

const developerQuotes = [
  {
    quote: "SabPaisa's documentation and SDKs let our team ship a compliant checkout in days, not weeks.",
    author: 'Priya Sharma',
    company: 'TechStart Solutions',
    role: 'Lead Developer',
  },
  {
    quote:
      'Sandbox credentials mirrored production perfectly. QA could script end-to-end payment journeys effortlessly.',
    author: 'Rahul Gupta',
    company: 'E-commerce Hub',
    role: 'Backend Engineer',
  },
  {
    quote: 'We scaled recurring mandates to millions of subscribers with observability and risk controls built-in.',
    author: 'Anjali Singh',
    company: 'FinTech Innovations',
    role: 'Senior Developer',
  },
]

const quickActions = [
  {
    title: 'API Reference',
    description: 'Complete REST and GraphQL schemas with copy-ready snippets.',
    icon: BookOpen,
    href: '/docs/api',
  },
  {
    title: 'Interactive Playground',
    description: 'Craft requests, inspect responses, and share test collections.',
    icon: Terminal,
    href: '/playground',
  },
  {
    title: 'Webhook Guide',
    description: 'Implement resilient IPN handling with signature validation.',
    icon: Zap,
    href: '/docs/webhooks',
  },
]

const clientLogos = [
  { src: '/logos/MAGADH.png', alt: 'SABPAISA' },
  { src: '/logos/BSEB.png', alt: 'BSEB' },
  { src: '/logos/RAIL.png', alt: 'RAIL' },
  { src: '/logos/DelhiJB.png', alt: 'DelhiJB' },
  { src: '/logos/MBC.png', alt: 'MBD' },
  { src: '/logos/BOIB.png', alt: 'BOI' },
]

const faqItems = [
  {
    question: 'What should I do if I receive a "Client Transaction ID is missing" error?',
    answer:
      'If you encounter this error, please verify the client transaction ID parameter. It is recommended to use a Client Transaction ID consisting of 10 to 18 digits.',
  },
  {
    question: 'How can I resolve the "Please Enable API Version" error?',
    answer:
      'To resolve this error, please contact your Account Manager and provide them with the relevant details regarding the issue you are experiencing.',
  },
  {
    question: 'Why am I seeing an "Authentication Failed" error?',
    answer:
      'An authentication failure typically indicates an issue with your keys. Please ensure that the AuthKey and AuthIV provided by your Account Manager are passed accurately and are valid.',
  },
  {
    question: 'What should I do if I have issues displaying the response?',
    answer:
      'If you experience difficulties with response display, confirm that the correct URL is specified in the callback URL parameter to facilitate proper rendering of the response.',
  },
  {
    question: 'What can I do if there is an issue with the Transaction Enquiry API?',
    answer:
      'For issues related to the Transaction Enquiry API, ensure that all mandatory parameters are correctly passed and verify that the encryption and decryption methods are implemented properly.',
  },
  {
    question: 'How do I address issues with encryption or decryption for transaction enquiries?',
    answer:
      'For any problems with encryption or decryption, please refer to the AES-128 logic as specified in the reference code provided for your platform.',
  },
  {
    question: 'Who should I contact for issues with the Refund API?',
    answer:
      'If you encounter issues with the Refund API, please reach out to your Account Manager for the necessary documentation and support.',
  },
  {
    question: 'What should I do when I see the error "You are not passing the payer name in a valid format"?',
    answer:
      'If you receive this error, check that the payer name is correctly formatted and free of special characters.',
  },
  {
    question: 'What should I do if I see the message "You are passing wrong credentials"?',
    answer:
      'When you encounter this message, please verify that all parameters are being passed correctly and ensure you are using the correct SabPaisa request URL.',
  },
  {
    question: 'What should I do if I have transaction-related issues?',
    answer:
      'For any transaction-related issues, please connect with the SabPaisa operations team, who will assist you in resolving your concerns.',
  },
]

type FaqItem = (typeof faqItems)[number]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const heroSampleSnippet = [
  'import PaymentForm from "sabpaisa-pg-dev";',
  '',
  'const SabPaisaPaymentForm = ({ formData, onResponse }) => {',
  '  return (',
  '    <PaymentForm',
  '      {...formData}',
  "      callbackFunction={onResponse}",
  "      env='stag' // Set to 'prod' for production",
  '    />',
  '  );',
  '};',
  '',
  'export default SabPaisaPaymentForm;'
].join('\n')

export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: true,
      lerp: 0.08,
    } as any)

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)

  const leftFaqs = faqItems.slice(0, 5)
  const rightFaqs = faqItems.slice(5)

  const toggleFaqItem = (index: number, event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    setActiveFaqIndex((prev) => (prev === index ? null : index))
  }

  const renderFaqColumn = (items: FaqItem[], offset: number) => (
    <div className="flex flex-col space-y-6 xl:space-y-7">
      {items.map((item, idx) => {
        const actualIndex = offset + idx
        const isOpen = activeFaqIndex === actualIndex

        return (
          <div
            key={`${item.question}-${actualIndex}`}
            className="relative overflow-hidden rounded-[30px] border border-border/60 bg-gradient-to-br from-background/95 via-background/70 to-primary/5 px-6 py-6 shadow-lg backdrop-blur transition hover:-translate-y-1.5 hover:shadow-2xl lg:px-8"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                {String(actualIndex + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={(event) => toggleFaqItem(actualIndex, event)}
                    className="flex-1 text-left text-base font-semibold leading-snug text-foreground transition hover:text-primary"
                    aria-expanded={isOpen}
                  >
                    {item.question}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => toggleFaqItem(actualIndex, event)}
                    aria-label="Toggle answer visibility"
                    className={cn(
                      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-lg font-semibold transition',
                      isOpen
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                    )}
                  >
                    +
                  </button>
                </div>
                {isOpen ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const shouldReduceMotion = useReducedMotion()
  const animated = !shouldReduceMotion
  const viewport = { once: true, amount: 0.25 }

  type AnimatedProps = {
    children: ReactNode
    className?: string
    variant?: typeof fadeVariant
    delay?: number
  }

  const AnimatedSection = ({ children, className, variant = fadeVariant, delay = 0 }: AnimatedProps) => {
    if (!animated) {
      return <section className={className}>{children}</section>
    }
    return (
      <motion.section
        className={className}
        variants={variant}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        custom={delay}
      >
        {children}
      </motion.section>
    )
  }

  const AnimatedDiv = ({ children, className, variant = fadeVariant, delay = 0 }: AnimatedProps) => {
    if (!animated) {
      return <div className={className}>{children}</div>
    }
    return (
      <motion.div
        className={className}
        variants={variant}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        custom={delay}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className="relative isolate">
      <Script id="faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(faqSchema)}
      </Script>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="relative h-full w-full">
          <div className="aurora-blob aurora-blob-one" />
          <div className="aurora-blob aurora-blob-two" />
          <div className="aurora-blob aurora-blob-three" />
          <div className="aurora-grid" />
        </div>
      </div>
      <main className="relative flex-1">
        <AnimatedSection className="relative overflow-hidden pb-24 pt-16 md:pt-20" variant={scaleVariant}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-background dark:from-blue-900/40 dark:via-purple-900/30" />
          <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <AnimatedDiv className="space-labelledby py-2" delay={0.05}>
                <Badge className="w-fit gap-2 rounded-full bg-white/90 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow dark:bg-white/5">
                  <Sparkles className="h-3.5 w-3.5" />
                  SabPaisa for Developers
                </Badge>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Transform Your Payment Journey,
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    From Code to Checkout
                  </span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                  Build resilient payment experiences with PCI level-1 security, real-time observability, and SDKs your
                  engineers will love. Handle one-time, recurring, or mandate-based flows with a single API contract.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="button-3d group gap-2 rounded-full px-8 py-6 text-base shadow-lg">
                    <Link href="/docs/getting-started">
                      Start building
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="button-3d group gap-2 rounded-full border-transparent bg-background/70 px-8 py-6 text-base backdrop-blur shadow-lg"
                  >
                    <Link href="/playground">
                      Launch playground
                      <PlugZap className="h-5 w-5 transition-transform group-hover:-rotate-6" />
                    </Link>
                  </Button>
                </div>
              </AnimatedDiv>

              <AnimatedDiv className="relative" delay={0.15} variant={scaleVariant}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-white/10 to-transparent backdrop-blur-lg dark:from-white/10 dark:via-white/5" />
                <div className="relative rounded-3xl border border-white/30 bg-background/80 p-6 shadow-2xl backdrop-blur">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Rocket className="h-4 w-4 text-primary" />
                      SabPaisaPaymentForm example
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-inner">
                      <pre className="max-h-[320px] overflow-x-auto whitespace-pre font-mono text-xs leading-6">
                        {heroSampleSnippet}
                      </pre>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {heroMetrics.map((metric, metricIdx) => (
                        <AnimatedDiv
                          key={metric.label}
                          className="rounded-2xl border border-white/20 bg-white/40 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-white/5 tilt-card"
                          delay={0.2 + metricIdx * 0.05}
                        >
                          <div className="text-sm font-semibold text-primary">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.label}</div>
                        </AnimatedDiv>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {capabilityHighlights.map((item, highlightIdx) => (
                <AnimatedDiv
                  key={item.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-background/70 p-6 shadow-lg backdrop-blur tilt-card"
                  delay={0.25 + highlightIdx * 0.08}
                  variant={highlightIdx % 2 === 0 ? slideRightVariant : slideLeftVariant}
                >
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', item.accent)} />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative border-y border-border/60 bg-muted/20 py-16" delay={0.1}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedDiv className="mb-12 space-y-6" delay={0.15}>
              <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Trusted by leading BFSI & enterprise teams
                </span>
                <span />
              </div>
              <div className="logo-marquee relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 py-6 shadow-sm">
                <div className="logo-marquee-track flex items-center gap-12 whitespace-nowrap py-2 text-muted-foreground">
                  {[...clientLogos, ...clientLogos].map((logo, idx) => (
                    <img
                      key={`${logo.alt}-${idx}`}
                      src={logo.src}
                      alt={logo.alt}
                      className="h-16 w-auto opacity-80 transition hover:opacity-100"
                    />
                  ))}
                </div>
              </div>
            </AnimatedDiv>
            <AnimatedDiv className="text-center" delay={0.2}>
              <Badge variant="outline" className="mb-4 gap-2 rounded-full border-primary/30 bg-primary/5 text-primary">
                Developer love
              </Badge>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">What builders ship with SabPaisa</h2>
              <p className="mt-3 text-base text-muted-foreground">
                API-first teams rely on our tooling, documentation, and support to go live quickly and scale with confidence.
              </p>
            </AnimatedDiv>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {developerQuotes.map((quote, index) => (
                <AnimatedDiv
                  key={quote.author}
                  className="group relative overflow-hidden rounded-3xl border border-border/40 bg-background/80 p-8 shadow-lg backdrop-blur transition-all duration-500 hover:border-primary/40 hover:shadow-2xl tilt-card"
                  delay={0.2 + index * 0.08}
                  variant={index % 2 === 0 ? slideRightVariant : slideLeftVariant}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-primary/10 blur-xl opacity-0 transition group-hover:opacity-80" />
                  <div className="absolute -top-8 right-4 text-7xl font-serif text-primary/10 group-hover:text-primary/20 transition">“</div>
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 transition group-hover:opacity-100" />
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(quote.author)}&background=4f46e5&color=fff`}
                          alt={quote.author}
                          className="relative h-12 w-12 rounded-full object-cover shadow-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{quote.author}</div>
                        <div className="text-xs text-muted-foreground">
                          {quote.role} · {quote.company}
                        </div>
                      </div>
                    </div>
                    <p className="mt-6 flex-1 text-sm leading-relaxed text-foreground/90 text-balance">
                      {quote.quote}
                    </p>
                    <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1">Integration</span>
                      <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1">Developer Experience</span>
                    </div>
                  </div>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative overflow-hidden bg-background py-20" delay={0.2}>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_65%)]" />
            <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent blur-3xl opacity-80" style={{ animation: 'orb-spin 35s linear infinite' }} />
            <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-gradient-to-tr from-primary/20 via-secondary/20 to-transparent blur-3xl opacity-70" style={{ animation: 'orb-pulse 6s ease-in-out infinite' }} />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <AnimatedDiv className="space-y-6" delay={0.25}>
                <Badge variant="outline" className="gap-2 rounded-full border-primary/30 bg-primary/5 text-primary">
                  <Layers className="h-3.5 w-3.5" />
                  Payment gateway blueprint
                </Badge>
                <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                  Production-ready primitives for every integration track
                </h2>
                <p className="text-base text-muted-foreground">
                  Whether you are embedding a widget, orchestrating server-to-server flows, or automating payouts,
                  SabPaisa provides robust primitives and tooling to keep your payment surface fast, reliable, and
                  compliant.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-dashed border-muted px-3 py-1">PCI DSS L1</span>
                  <span className="rounded-full border border-dashed border-muted px-3 py-1">Token vault</span>
                  <span className="rounded-full border border-dashed border-muted px-3 py-1">ISO 27001</span>
                  <span className="rounded-full border border-dashed border-muted px-3 py-1">GraphQL & REST</span>
                </div>
              </AnimatedDiv>

              <AnimatedDiv className="relative space-y-10" delay={0.3}>
                <div className="absolute left-4 top-0 bottom-0 hidden w-px bg-gradient-to-b from-primary/50 via-primary/10 to-transparent sm:block" />
                {integrationFlows.map((flow, flowIdx) => (
                  <AnimatedDiv
                    key={flow.title}
                    className="relative flex gap-4 sm:pl-10"
                    delay={0.32 + flowIdx * 0.08}
                    variant={flowIdx % 2 === 0 ? slideLeftVariant : slideRightVariant}
                  >
                    <span className="hidden h-10 w-10 flex-none items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-semibold text-primary sm:flex">
                      {flow.step}
                    </span>
                    <div className="flex-1 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-3 text-foreground">
                        <flow.icon className="h-5 w-5 text-primary" />
                        <h3 className="text-sm font-semibold">{flow.title}</h3>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{flow.description}</p>
                    </div>
                  </AnimatedDiv>
                ))}
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="bg-muted/10 py-20" delay={0.25}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedDiv className="mb-12 space-y-4 text-center" delay={0.3}>
              <Badge variant="outline" className="mx-auto w-fit rounded-full border-primary/40 bg-primary/5 text-primary">
                Realtime observability
              </Badge>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Stay ahead of every transaction</h2>
              <p className="text-base text-muted-foreground">
                Intelligent dashboards, actionable alerts, and replayable webhooks help you trace every rupee from intent
                to settlement.
              </p>
            </AnimatedDiv>
            <div className="grid gap-8 md:grid-cols-3">
              {realtimeFeatures.map((feature, featureIdx) => (
                <AnimatedDiv
                  key={feature.title}
                  className="rounded-2xl border border-border/60 bg-background/90 p-6 shadow-sm backdrop-blur"
                  delay={0.32 + featureIdx * 0.08}
                  variant={rotateVariant}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative overflow-hidden bg-muted/10 py-20" delay={0.35}>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),transparent_65%)]" />
            <div className="absolute -bottom-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-purple-500/15 to-transparent blur-3xl opacity-75" style={{ animation: 'orb-spin 40s linear infinite' }} />
            <div className="absolute top-[-15%] right-[-5%] h-80 w-80 rounded-full bg-gradient-to-tr from-primary/15 via-secondary/15 to-transparent blur-3xl opacity-65" style={{ animation: 'orb-pulse 7s ease-in-out infinite' }} />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedDiv className="mb-12 space-y-4 text-center" delay={0.4}>
              <Badge variant="outline" className="mx-auto w-fit rounded-full border-primary/40 bg-primary/5 text-primary">
                Developer shortcuts
              </Badge>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Jumpstart your integration</h2>
              <p className="text-base text-muted-foreground">
                High-impact actions to move from prototype to production without context switching.
              </p>
            </AnimatedDiv>
            <div className="grid gap-6 md:grid-cols-3">
              {quickActions.map((action) => (
                <FeatureCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  className="bg-background/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                />
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative overflow-hidden bg-background py-20" delay={0.4}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_45%)]" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl" />
            <div className="absolute inset-y-0 left-1/4 h-64 w-64 -translate-y-6 rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute inset-y-0 right-[-10%] h-72 w-72 rounded-full bg-purple-500/15 blur-[140px]" />
            <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.15), transparent 55%)' }} />
          </div>
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
            <AnimatedDiv className="space-y-4 text-center" delay={0.45}>
              <Badge variant="outline" className="mx-auto w-fit rounded-full border-primary/40 bg-primary/5 text-primary">
                Frequently asked
              </Badge>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Everything you need to know</h2>
              <p className="text-base text-muted-foreground">
                From certification timelines to webhook retries, we have detailed guides to keep you moving quickly.
              </p>
            </AnimatedDiv>
            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <AnimatedDiv delay={0.5} className="h-full">
                {renderFaqColumn(leftFaqs, 0)}
              </AnimatedDiv>
              <AnimatedDiv delay={0.55} className="h-full">
                {renderFaqColumn(rightFaqs, leftFaqs.length)}
              </AnimatedDiv>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <footer className="border-t border-border/60 bg-background/95 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center text-base text-muted-foreground sm:px-6 lg:px-8 md:flex-row md:justify-between md:text-left">
          <p className="order-1 md:order-none">Copyright © 2025 SabPaisa, All Rights Reserved.</p>

          <div className="order-3 flex flex-wrap items-center justify-center gap-4 md:order-none">
            <Image
              src="/logos/visa.jpg"
              alt="Visa"
              width={90}
              height={40}
              className="h-10 w-auto rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
            />
            <Image
              src="/logos/NPCI.png"
              alt="NPCI"
              width={110}
              height={40}
              className="h-10 w-auto rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
            />
            <Image
              src="/logos/RBI.png"
              alt="RBI"
              width={90}
              height={40}
              className="h-10 w-auto rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
            />
            <Image
              src="/logos/PCI.png"
              alt="PCI DSS"
              width={100}
              height={40}
              className="h-10 w-auto rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
            />
            <Image
              src="/logos/ISO.png"
              alt="ISO 27001"
              width={100}
              height={40}
              className="h-10 w-auto rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
            />
          </div>

          <Link
            href="/contact"
            className="order-2 font-medium text-foreground transition hover:text-primary md:order-none"
          >
            Contact support
          </Link>
        </div>
      </footer>
    </div>
  )
}
