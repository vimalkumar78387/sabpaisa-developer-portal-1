import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Key, 
  Code, 
  Zap, 
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

const quickStartSteps = [
  {
    title: 'Create Account',
    description: 'Sign up for a SabPaisa developer account to get your API credentials',
    icon: CheckCircle,
    completed: false
  },
  {
    title: 'Get API Keys',
    description: 'Generate your test and live API keys from the dashboard',
    icon: Key,
    completed: false
  },
  {
    title: 'Choose Integration',
    description: 'Select the integration method that best fits your application',
    icon: Code,
    completed: false
  },
  {
    title: 'Test Payment',
    description: 'Make your first test payment using our sandbox environment',
    icon: Zap,
    completed: false
  }
]

const integrationOptions = [
  {
    title: 'Server-Side Integration',
    description: 'Backend API integration for secure payment processing',
    href: '/docs?kit=server-integration#server-integration',
    badge: 'Recommended'
  },
  {
    title: 'Client-Side Integration',
    description: 'Frontend JavaScript integration for web applications',
    href: '/docs?kit=web-integration#web-integration',
    badge: 'Quick Setup'
  },
  {
    title: 'Mobile SDK',
    description: 'Native mobile SDKs for iOS and Android applications',
    href: '/docs?kit=native-integration#native-integration',
    badge: 'Mobile'
  }
]

const sampleCode = `import React, { useState } from "react";
import SabPaisaPaymentForm from "./SabPaisaPaymentForm";

const App = () => {
  const [paymentData, setPaymentData] = useState({
    clientCode: "YOUR_CLIENT_CODE",
    transUserName: "YOUR_USERNAME",
    transUserPassword: "YOUR_PASSWORD",
    authKey: "YOUR_ENCRYPTION_KEY",
    authIV: "YOUR_ENCRYPTION_IV",
    callbackUrl: "https://your-site.com/callback",
    clientTxnId: "123345555557",
    payerName: "John Doe",
    payerEmail: "john@example.com",
    payerMobile: "9876543210",
    amount: "100.00",
    channelId: "npm",
    url: "https://secure.sabpaisa.in/SabPaisa/sabPaisaInit?v=1",
  });

  const handlePaymentResponse = (response) => {
    console.log("Payment Gateway Response:", response);
  };

  return (
    <div>
      <h1>React SabPaisa Payment Integration</h1>
      <SabPaisaPaymentForm
        formData={paymentData}
        onResponse={handlePaymentResponse}
      />
    </div>
  );
};

export default App;`

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-xl text-muted-foreground">
            Start accepting payments with SabPaisa in just a few steps. This guide will help you integrate payment processing into your application quickly and securely.
          </p>
        </div>

        {/* Quick Start Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
          <div className="grid gap-4">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className={step.completed ? 'border-green-200 bg-green-50/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${step.completed ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Step {index + 1}: {step.title}
                      </CardTitle>
                      {step.completed && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Integration Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Choose Your Integration</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {integrationOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    {option.badge && (
                      <Badge variant="secondary">{option.badge}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{option.description}</CardDescription>
                  <Button asChild variant="outline" size="sm">
                    <Link href={option.href}>
                      Learn More
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Sample Code */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sample Code</h2>
          <p className="text-muted-foreground mb-6">
            Here's a basic example of how to create a payment request using the SabPaisa JavaScript SDK:
          </p>
          <CodeBlock 
            code={sampleCode} 
            language="javascript" 
            filename="payment-integration.js"
          />
        </div>

        <Separator className="my-12" />

        {/* Environment Setup */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Environment Setup</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Sandbox Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use sandbox for testing and development. No real money is processed.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Staging URL:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">sandbox</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Production Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use production for live transactions. Real money will be processed.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Live URL:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">production</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Explore Products</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn about different SabPaisa payment products and choose the right one for your needs.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/payment-gateway">
                  View Products
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Try API Playground</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Test API endpoints interactively with our built-in playground tool.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/playground">
                  Open Playground
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
