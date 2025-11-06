'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Play,
  Code,
  Settings,
  Zap,
  ArrowRight,
  Terminal,
  BookOpen,
  Rocket,
  ShieldCheck,
  Server,
  Clock3,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiTester } from '@/components/playground/api-tester'
import { RefundApiTester } from '@/components/playground/refund-api-tester'
import { cn } from '@/lib/utils'

const apiEndpoints = [
  { method: 'POST', endpoint: '/api/v1/payments/create', title: 'Create Payment', description: 'Initiate a new payment request', category: 'payments' },
  { method: 'GET', endpoint: '/api/v1/payments/{paymentId}/status', title: 'Payment Status', description: 'Check the status of a payment', category: 'payments' },
  { method: 'POST', endpoint: '/api/v1/payments/{paymentId}/capture', title: 'Capture Payment', description: 'Capture an authorized payment', category: 'payments' },
  { method: 'POST', endpoint: '/api/v1/refunds/create', title: 'Create Refund', description: 'Process a payment refund', category: 'refunds' },
  { method: 'GET', endpoint: '/api/v1/refunds/{refundId}/status', title: 'Refund Status', description: 'Check the status of a refund', category: 'refunds' },
  { method: 'POST', endpoint: '/api/v1/enach/mandates/create', title: 'Create E-NACH Mandate', description: 'Set up recurring payment mandate', category: 'enach' },
  { method: 'GET', endpoint: '/api/v1/enach/mandates/{mandateId}', title: 'Get Mandate Details', description: 'Retrieve mandate information', category: 'enach' },
  { method: 'POST', endpoint: '/SPTxtnEnquiry/getTxnStatusByClientxnId', title: 'Transaction Enquiry', description: 'Fetch live status for a client transaction ID.', category: 'transaction-enquiry' },
]

const runtimeSignals = [
  { title: 'Environment', value: 'Sandbox', hint: 'Mirrors production for UPI, cards, and mandates', icon: Server },
  { title: 'Security posture', value: 'PCI L1', hint: 'Token vaulting, HSM-backed keys, and anomaly alerts', icon: ShieldCheck },
  { title: 'Latency (p95)', value: '182ms', hint: 'Measured from Mumbai edge over the last hour', icon: Clock3 },
]

const quickActions = [
  { title: 'Test Payment Flow', description: 'Create a sample payment and test the complete flow', action: 'Try Now', category: 'payments' },
  { title: 'Webhook Testing', description: 'Test webhook endpoints with sample payloads', action: 'Test Webhooks', category: 'webhooks' },
  { title: 'E-NACH Simulation', description: 'Simulate E-NACH mandate creation and debit', action: 'Simulate', category: 'enach' },
  { title: 'Transaction Enquiry', description: 'Decrypt statusTransEncData and check a transaction status instantly.', action: 'Check Status', category: 'transaction-enquiry' },
  { title: 'Refund API', description: 'Encrypt refundQuery, trigger a refund request, and decrypt the live response.', action: 'Open Refund Tester', category: 'refunds' },
]

export default function PlaygroundPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState('payments')

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    if (selectedCategory === 'payments') {
      return endpoint.category === 'payments' || endpoint.category === 'payment-links'
    }
    return endpoint.category === selectedCategory
  })

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">API Playground</h1>
            <Badge variant="secondary">Interactive</Badge>
          </div>
          <p className="mb-6 text-xl text-muted-foreground">
            Test SabPaisa APIs interactively with real-time examples and responses. Perfect for development and integration testing.
          </p>

          <div className="mb-4 flex gap-2">
            <Button
              variant={activeSection === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveSection('overview')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeSection === 'interactive' ? 'default' : 'outline'}
              onClick={() => setActiveSection('interactive')}
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              Interactive Tester
            </Button>
          </div>
        </div>

        {activeSection === 'overview' ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {runtimeSignals.map(({ title, value, hint, icon: Icon }) => (
                <Card key={title} className="border border-border/60 bg-background/80 shadow-lg">
                  <CardContent className="flex items-start gap-4 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="space-y-1">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{title}</span>
                      <span className="block text-lg font-semibold text-foreground">{value}</span>
                      <span className="block text-xs text-muted-foreground">{hint}</span>
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
                <Rocket className="h-6 w-6 text-primary" />
                Quick Actions
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {quickActions.map((action, index) => (
                  <Card
                    key={action.title}
                    className={cn(
                      'interactive-card group relative cursor-pointer overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-xl',
                      'animate-fadeInUp'
                    )}
                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                    onClick={() => {
                      setActiveSection('interactive')
                      setSelectedCategory(action.category === 'webhooks' ? 'payments' : action.category)
                    }}
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2 text-lg transition-colors duration-300 group-hover:text-primary">
                        {action.title}
                        <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="w-fit transition-all duration-300 group-hover:border-primary group-hover:bg-primary/5"
                      >
                        {action.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="mb-4 transition-colors duration-300 group-hover:text-foreground/80">
                        {action.description}
                      </CardDescription>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {action.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-6 text-2xl font-semibold">API Explorer</h2>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  <TabsTrigger value="enach">E-NACH</TabsTrigger>
                  <TabsTrigger value="transaction-enquiry">Txn Enquiry</TabsTrigger>
                  <TabsTrigger value="webhooks" disabled>
                    Webhooks
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={selectedCategory} className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredEndpoints.map((endpoint) => (
                      <Card key={endpoint.endpoint} className="border border-border/60 bg-background/80">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-lg">
                            {endpoint.title}
                            <Badge variant="outline" className="uppercase">
                              {endpoint.method}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{endpoint.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{endpoint.endpoint}</span>
                          <Button asChild variant="ghost" size="sm">
                            <Link href="#interactive">Test</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div id="interactive">
            {selectedCategory === 'refunds' ? (
              <RefundApiTester />
            ) : (
              <ApiTester selectedCategory={selectedCategory} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
