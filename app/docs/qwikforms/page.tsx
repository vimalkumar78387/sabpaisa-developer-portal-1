import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FormInput, 
  Palette, 
  Zap, 
  Shield, 
  CheckCircle,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Drag & Drop Builder',
    description: 'Create custom payment forms with intuitive visual builder',
    icon: FormInput
  },
  {
    title: 'Custom Branding',
    description: 'Match your brand with custom colors, logos, and styling',
    icon: Palette
  },
  {
    title: 'Smart Validation',
    description: 'Built-in form validation with real-time error checking',
    icon: Shield
  },
  {
    title: 'Mobile Responsive',
    description: 'Forms that look perfect on all devices and screen sizes',
    icon: Smartphone
  }
]
export default function QwikFormsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FormInput className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">QwikForms</h1>
            <Badge>Custom</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Create dynamic payment forms with customizable fields, smart validation, and seamless payment integration. Perfect for registrations, subscriptions, donations, and more.
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

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Start Building Forms</h3>
          <p className="text-muted-foreground mb-6">
            QwikForms makes it easy to create professional payment forms without any coding. Get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/api#qwikforms">API Reference</Link>
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
