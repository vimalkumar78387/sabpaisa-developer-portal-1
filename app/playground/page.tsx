'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Code, 
  Settings, 
  Zap,
  ArrowRight,
  Terminal,
  BookOpen,
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import { ApiTester } from '@/components/playground/api-tester'
import { cn } from '@/lib/utils'

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/v1/payments/create',
    title: 'Create Payment',
    description: 'Initiate a new payment request',
    category: 'Payments'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/payments/{paymentId}/status',
    title: 'Payment Status',
    description: 'Check the status of a payment',
    category: 'Payments'
  },
  {
    method: 'POST',
    endpoint: '/api/v1/payments/{paymentId}/capture',
    title: 'Capture Payment',
    description: 'Capture an authorized payment',
    category: 'Payments'
  },
  {
    method: 'POST',
    endpoint: '/api/v1/refunds/create',
    title: 'Create Refund',
    description: 'Process a payment refund',
    category: 'Refunds'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/refunds/{refundId}/status',
    title: 'Refund Status',
    description: 'Check the status of a refund',
    category: 'Refunds'
  },
  {
    method: 'POST',
    endpoint: '/api/v1/enach/mandates/create',
    title: 'Create E-NACH Mandate',
    description: 'Set up recurring payment mandate',
    category: 'E-NACH'
  },
  {
    method: 'GET',
    endpoint: '/api/v1/enach/mandates/{mandateId}',
    title: 'Get Mandate Details',
    description: 'Retrieve mandate information',
    category: 'E-NACH'
  }
]

const quickActions = [
  {
    title: 'Test Payment Flow',
    description: 'Create a sample payment and test the complete flow',
    action: 'Try Now',
    category: 'Payment Gateway'
  },
  {
    title: 'Webhook Testing',
    description: 'Test webhook endpoints with sample payloads',
    action: 'Test Webhooks',
    category: 'Webhooks'
  },
  {
    title: 'E-NACH Simulation',
    description: 'Simulate E-NACH mandate creation and debit',
    action: 'Simulate',
    category: 'E-NACH'
  }
]

export default function PlaygroundPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'interactive'>('overview')
  const [selectedCategory, setSelectedCategory] = useState('payments')

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">API Playground</h1>
            <Badge variant="secondary">Interactive</Badge>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Test SabPaisa APIs interactively with real-time examples and responses. Perfect for development and integration testing.
          </p>
          
          {/* Section Switcher */}
          <div className="flex gap-2 mb-4">
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

        {/* Content based on active section */}
        {activeSection === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 animate-fadeInUp flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary animate-bounce-slow" />
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index} 
                    className={cn(
                      "interactive-card cursor-pointer group relative overflow-hidden",
                      "animate-fadeInUp"
                    )}
                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                    onClick={() => {
                      setActiveSection('interactive')
                      if (action.category === 'E-NACH') setSelectedCategory('enach')
                      else if (action.category === 'Webhooks') setSelectedCategory('webhooks')
                      else setSelectedCategory('payments')
                    }}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                        {action.title}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className="w-fit group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300"
                      >
                        {action.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="mb-4 group-hover:text-foreground/80 transition-colors duration-300">
                        {action.description}
                      </CardDescription>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {action.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* API Explorer */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">API Explorer</h2>
              
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  <TabsTrigger value="enach">E-NACH</TabsTrigger>
                  <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payments" className="space-y-4">
                  <div className="grid gap-4">
                    {apiEndpoints.filter(endpoint => endpoint.category === 'Payments').map((endpoint, index) => (
                      <Card key={index} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                                {endpoint.method}
                              </Badge>
                              <div>
                                <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                                <code className="text-sm text-muted-foreground">{endpoint.endpoint}</code>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveSection('interactive')}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Try It
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{endpoint.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="refunds" className="space-y-4">
                  <div className="grid gap-4">
                    {apiEndpoints.filter(endpoint => endpoint.category === 'Refunds').map((endpoint, index) => (
                      <Card key={index} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                                {endpoint.method}
                              </Badge>
                              <div>
                                <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                                <code className="text-sm text-muted-foreground">{endpoint.endpoint}</code>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveSection('interactive')}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Try It
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{endpoint.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="enach" className="space-y-4">
                  <div className="grid gap-4">
                    {apiEndpoints.filter(endpoint => endpoint.category === 'E-NACH').map((endpoint, index) => (
                      <Card key={index} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                                {endpoint.method}
                              </Badge>
                              <div>
                                <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                                <code className="text-sm text-muted-foreground">{endpoint.endpoint}</code>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setActiveSection('interactive')}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Try It
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{endpoint.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="webhooks" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Webhook Testing</CardTitle>
                      <CardDescription>
                        Test webhook endpoints with sample payloads to ensure your integration handles notifications correctly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Payment Success Webhook</h4>
                            <p className="text-sm text-muted-foreground">Test successful payment notification</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveSection('interactive')}
                          >
                            <Play className="mr-2 h-3 w-3" />
                            Send Test
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Payment Failed Webhook</h4>
                            <p className="text-sm text-muted-foreground">Test failed payment notification</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveSection('interactive')}
                          >
                            <Play className="mr-2 h-3 w-3" />
                            Send Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {/* Interactive API Tester */}
        {activeSection === 'interactive' && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Interactive API Tester</h2>
              <p className="text-muted-foreground">
                Test API endpoints in real-time with customizable payloads and see instant responses.
              </p>
            </div>
            <ApiTester selectedCategory={selectedCategory} />
          </div>
        )}

        {/* Setup Instructions - Only show in overview mode */}
        {activeSection === 'overview' && (
          <div className="bg-muted/30 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Setup Required</h3>
                <p className="text-muted-foreground mb-4">
                  To use the API Playground, you'll need to configure your API credentials and environment settings.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link href="/settings/api">
                      Configure API Keys
                      <Settings className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/docs/api">
                      View API Documentation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}