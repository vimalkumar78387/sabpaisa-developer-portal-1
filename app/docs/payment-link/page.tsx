import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  LinkIcon, 
  Zap, 
  Share, 
  QrCode, 
  CheckCircle,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Instant Generation',
    description: 'Generate payment links instantly without complex integration',
    icon: Zap
  },
  {
    title: 'Easy Sharing',
    description: 'Share via SMS, email, WhatsApp, or social media platforms',
    icon: Share
  },
  {
    title: 'QR Code Support',
    description: 'Auto-generated QR codes for mobile payments',
    icon: QrCode
  },
  {
    title: 'Mobile Optimized',
    description: 'Responsive payment pages that work on all devices',
    icon: Smartphone
  }
]

const useCases = [
  { title: 'Invoice Payments', description: 'Send payment links with invoices for quick settlement' },
  { title: 'Event Tickets', description: 'Sell event tickets with shareable payment links' },
  { title: 'Service Bookings', description: 'Accept payments for appointments and services' },
  { title: 'Product Sales', description: 'Sell products without setting up a full e-commerce site' },
  { title: 'Donations', description: 'Collect donations and fundraising payments' },
  { title: 'Subscription Plans', description: 'One-time payments for subscription activation' }
]


export default function PaymentLinkPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LinkIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Payment Link</h1>
            <Badge>Quick Setup</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Generate instant payment links for quick transactions without complex integrations. Perfect for invoices, bookings, and one-time payments.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">{useCase.title}</h4>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        <Separator className="my-12" />

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Ready to Start?</h3>
          <p className="text-muted-foreground mb-6">
            Payment Links are the fastest way to start accepting payments. Get started in minutes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/api#payment-links">API Reference</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/community">Join Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
