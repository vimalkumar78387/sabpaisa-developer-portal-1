'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  TestTube,
  ArrowRight,
  Copy,
  Code
} from 'lucide-react'
import Link from 'next/link'
import { CodeBlock } from '@/components/ui/code-block'

const stageCredentials = {
  'Client Code': 'DJ020',
  Username: 'DJL754@sp',
  Password: '4q3qhgmJNM4m',
  'Authentication KEY': 'ISTrmmDC2bTvkxzlDRrVguVwetGS8xC/UFPsp6w+Itg',
  'Authentication IV': 'M+aUFgRMPq7ci+Cmoytp3KJ2GPBOwO72Z2Cjbr55zY7++pT9mLES2M5cIblnBta',
  'Endpoint URL': 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit'
}

const testCards = [
  {
    type: 'Debit Card',
    label: 'Visa',
    number: '4029 4845 8989 7107',
    expiry: '12/30',
    cvv: '234',
    description: 'Standard debit card for success scenarios'
  },
  {
    type: 'Credit Card',
    label: 'Visa',
    number: '4000 0200 0000 0000',
    expiry: '12/30',
    cvv: '234',
    description: 'Credit card to simulate card-not-present flows'
  },
  {
    type: 'Debit Card',
    label: 'RuPay',
    number: '6521 2177 3196 0214',
    expiry: '12/35',
    cvv: '234',
    description: 'RuPay debit card for domestic routing tests'
  }
]

const testScenarios = [
  {
    title: 'Basic Payment Flow',
    description: 'Test end-to-end payment processing',
    steps: [
      'Create payment request',
      'Redirect to payment page',
      'Complete payment with test card',
      'Verify webhook notification',
      'Check payment status'
    ]
  },
  {
    title: 'Failed Payment Handling',
    description: 'Test error scenarios and failure handling',
    steps: [
      'Create payment with declined card',
      'Handle payment failure response',
      'Verify error webhook',
      'Implement retry mechanism'
    ]
  },
  {
    title: 'Refund Processing',
    description: 'Test refund creation and processing',
    steps: [
      'Complete successful payment',
      'Initiate refund request',
      'Check refund status',
      'Verify refund webhook'
    ]
  },
  {
    title: 'E-NACH Mandate Setup',
    description: 'Test recurring payment setup',
    steps: [
      'Create mandate request',
      'Complete bank authentication',
      'Verify mandate status',
      'Test first debit'
    ]
  }
]

export default function StageOverviewPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Stage Overview</h1>
            <Badge variant="secondary">Test Mode</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Snapshot of the SabPaisa stage environment for integration development. Validate your setup and monitor test data without touching live transactions.
          </p>
        </div>

        {/* Quick Setup */}
        <div className="mb-8">
          <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Quick Setup Guide
              </CardTitle>
              <CardDescription>
                Get started with sandbox testing in under 5 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <h4 className="font-medium mb-1">Get Credentials</h4>
                  <p className="text-sm text-muted-foreground">Copy sandbox API keys below</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <h4 className="font-medium mb-1">Configure Environment</h4>
                  <p className="text-sm text-muted-foreground">Set base URL to sandbox</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <h4 className="font-medium mb-1">Start Testing</h4>
                  <p className="text-sm text-muted-foreground">Use test cards and scenarios</p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Button asChild>
                  <Link href="#credentials">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="test-data">Test Card Details</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>
          
          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Stage Credentials</h2>
              <p className="text-muted-foreground mb-6">
                Use these credentials for all your sandbox testing. These keys are safe to use in your development environment.
              </p>
              
              <div className="grid gap-4">
                {Object.entries(stageCredentials).map(([key, value]) => (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{key}</CardTitle>
                          <CardDescription className="font-mono text-sm">{value}</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
                <CodeBlock
                  code={`// Environment Variables
SABPAISA_CLIENT_CODE=${stageCredentials['Client Code']}
SABPAISA_USERNAME=${stageCredentials.Username}
SABPAISA_PASSWORD=${stageCredentials.Password}
SABPAISA_AUTH_KEY=${stageCredentials['Authentication KEY']}
SABPAISA_AUTH_IV=${stageCredentials['Authentication IV']}
SABPAISA_ENDPOINT_URL=${stageCredentials['Endpoint URL']}
SABPAISA_ENVIRONMENT=stage`}
                  language="bash"
                  showLineNumbers={false}
                />
              </div>
            </div>
          </TabsContent>

          {/* Test Card Details Tab */}
          <TabsContent value="test-data" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Test Card Details</h2>
              <p className="text-muted-foreground mb-6">
                Use these stage-approved card numbers and UPI IDs to simulate different payment scenarios in your integration.
              </p>
              
              <div className="space-y-4">
                {testCards.map((card, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {card.type}
                        <Badge variant="secondary">{card.label}</Badge>
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <span className="text-muted-foreground">Card Number:</span>
                          <div className="font-mono">{card.number}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expiry Time:</span>
                          <div className="font-mono">{card.expiry}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CVV:</span>
                          <div className="font-mono">{card.cvv}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      UPI ID
                      <Badge variant="outline">Stage</Badge>
                    </CardTitle>
                    <CardDescription>Stage-friendly UPI handle for intent flows</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <span className="text-muted-foreground">UPI:</span>
                    <div className="font-mono">merchant@sabpaisa</div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* Test Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Test Scenarios</h2>
              <p className="text-muted-foreground mb-6">
                Follow these predefined scenarios to test different aspects of your integration.
              </p>
              
              <div className="grid gap-6">
                {testScenarios.map((scenario, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{scenario.title}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {scenario.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-medium">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <TestTube className="mr-2 h-3 w-3" />
                          Run Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <Code className="mr-2 h-3 w-3" />
                          View Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Stage Limitations</CardTitle>
            <CardDescription>
              Important limitations to keep in mind while testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Stage transactions are not processed with real banks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Rate limiting is more lenient in stage (1000 requests/minute)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Webhook delivery may have delays up to 5 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Test data resets every 30 days</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
