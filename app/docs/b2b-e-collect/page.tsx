import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Shield, 
  CheckCircle,
  BarChart3,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Bulk Payment Collection',
    description: 'Process multiple business payments simultaneously with batch operations',
    icon: Users
  },
  {
    title: 'Advanced Reconciliation',
    description: 'Automated matching and reconciliation with detailed reporting',
    icon: BarChart3
  },
  {
    title: 'Multi-Entity Support',
    description: 'Manage collections for multiple business entities from one dashboard',
    icon: Building2
  },
  {
    title: 'Real-time Tracking',
    description: 'Monitor payment statuses with instant notifications and updates',
    icon: Clock
  }
]

const benefits = [
  { title: 'Reduce Manual Effort', description: 'Automate invoice generation and payment tracking' },
  { title: 'Improve Cash Flow', description: 'Faster collections with multiple payment options' },
  { title: 'Better Visibility', description: 'Real-time dashboards and comprehensive reporting' },
  { title: 'Enhanced Security', description: 'Bank-grade security for business transactions' },
  { title: 'Scalable Solution', description: 'Handle growing transaction volumes effortlessly' },
  { title: 'Compliance Ready', description: 'Built-in compliance with financial regulations' }
]


export default function B2BECollectPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">B2B E-Collect</h1>
            <Badge>Enterprise</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Streamline business-to-business payment collection with advanced features for bulk processing, automated reconciliation, and comprehensive reporting.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Enterprise Features</h2>
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

        {/* Business Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Business Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Enterprise Support</h3>
          <p className="text-muted-foreground mb-6">
            B2B E-Collect is designed for enterprise needs. Our dedicated support team ensures smooth integration and operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/contact/enterprise">Contact Enterprise Sales</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/api#b2b-collect">API Reference</Link>
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
