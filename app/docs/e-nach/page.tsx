import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Banknote, 
  RefreshCw, 
  Shield, 
  Calendar, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Automated Collections',
    description: 'Set up recurring payments for subscriptions, EMIs, and bills automatically',
    icon: RefreshCw
  },
  {
    title: 'RBI Compliant',
    description: 'Fully compliant with RBI guidelines for electronic mandate processing',
    icon: Shield
  },
  {
    title: 'Flexible Scheduling',
    description: 'Support for various payment frequencies - monthly, quarterly, yearly',
    icon: Calendar
  },
  {
    title: 'High Success Rate',
    description: 'Optimized processing with industry-leading success rates',
    icon: CheckCircle
  }
]

const mandateStates = [
  { state: 'Pending', description: 'Mandate request created, awaiting customer approval', color: 'bg-yellow-100 text-yellow-800' },
  { state: 'Active', description: 'Mandate approved and ready for debit', color: 'bg-green-100 text-green-800' },
  { state: 'Suspended', description: 'Mandate temporarily suspended', color: 'bg-orange-100 text-orange-800' },
  { state: 'Cancelled', description: 'Mandate cancelled by customer or merchant', color: 'bg-red-100 text-red-800' },
  { state: 'Expired', description: 'Mandate expired based on end date', color: 'bg-gray-100 text-gray-800' }
]

export default function ENachPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">E-NACH</h1>
            <Badge>Recurring Payments</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Automate recurring payment collection with Electronic National Automated Clearing House (E-NACH). Perfect for subscriptions, EMIs, and regular bill payments.
          </p>
        </div>

        {/* Alert */}
        <div className="mb-8">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">Important Note</h3>
                  <p className="text-sm text-orange-800">
                    E-NACH mandates require customer bank account verification and approval. The process typically takes 1-2 business days for activation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Mandate Lifecycle */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Mandate Lifecycle</h2>
          <div className="space-y-3">
            {mandateStates.map((mandate, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <Badge className={mandate.color}>{mandate.state}</Badge>
                <p className="text-sm">{mandate.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Best Practices</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Clear Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      Always inform customers about mandate amounts, frequency, and purposes before requesting approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Handle Failures Gracefully</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement retry logic for failed debits and provide clear failure reasons to customers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Monitor Mandate Health</h4>
                    <p className="text-sm text-muted-foreground">
                      Regularly check mandate status and proactively address issues to maintain high success rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Need Help with E-NACH?</h3>
          <p className="text-muted-foreground mb-6">
            E-NACH integration can be complex. Our support team is here to help you through the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/community">Join Community</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/api#enach">API Reference</Link>
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
