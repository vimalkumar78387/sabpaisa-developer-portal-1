import { NextRequest, NextResponse } from 'next/server'
import { rateLimits } from '@/lib/middleware/rate-limit'
import { addApiSecurityHeaders, validateRequestHeaders, logSecurityEvent } from '@/lib/middleware/security'

// Define the structure of our searchable content
interface SearchableContent {
  id: string
  title: string
  content: string
  url: string
  category: string
  tags: string[]
}

// Mock data representing our documentation content
// In a real application, this would come from a database or CMS
const documentationContent: SearchableContent[] = [
  // Getting Started
  {
    id: 'getting-started',
    title: 'Getting Started with SabPaisa',
    content: 'Welcome to SabPaisa Developer Portal. This guide will help you integrate SabPaisa payment solutions into your application. Start by setting up your account, obtaining API credentials, and making your first API call.',
    url: '/docs/getting-started',
    category: 'Documentation',
    tags: ['getting-started', 'setup', 'basics', 'introduction']
  },
  // Payment Gateway
  {
    id: 'payment-gateway',
    title: 'Payment Gateway Integration',
    content: 'SabPaisa Payment Gateway provides a secure and reliable way to accept online payments. Supports multiple payment methods including cards, UPI, net banking, and wallets. Easy integration with REST APIs and webhooks.',
    url: '/docs/payment-gateway',
    category: 'Products',
    tags: ['payment-gateway', 'cards', 'upi', 'netbanking', 'wallets', 'integration']
  },
  // E-NACH
  {
    id: 'e-nach',
    title: 'E-NACH Recurring Payments',
    content: 'Electronic National Automated Clearing House (E-NACH) for recurring payments. Perfect for subscriptions, EMIs, and regular bill payments. Automated mandate creation and payment processing.',
    url: '/docs/e-nach',
    category: 'Products',
    tags: ['e-nach', 'recurring', 'subscription', 'mandate', 'automated']
  },
  // Payment Link
  {
    id: 'payment-link',
    title: 'Payment Link Solution',
    content: 'Generate instant payment links without coding. Perfect for quick payments, invoicing, and social commerce. Share via SMS, email, or social media. Real-time payment notifications.',
    url: '/docs/payment-link',
    category: 'Products',
    tags: ['payment-link', 'instant', 'no-code', 'invoicing', 'social-commerce']
  },
  // B2B E-Collect
  {
    id: 'b2b-e-collect',
    title: 'B2B E-Collect Enterprise',
    content: 'Enterprise-grade collection solution for B2B payments. Bulk payment processing, corporate banking integration, reconciliation tools, and detailed reporting for large-scale operations.',
    url: '/docs/b2b-e-collect',
    category: 'Products',
    tags: ['b2b', 'enterprise', 'bulk-payments', 'corporate', 'reconciliation']
  },
  // QwikForms
  {
    id: 'qwikforms',
    title: 'QwikForms Custom Forms',
    content: 'Create custom payment forms without coding. Drag-and-drop form builder, conditional logic, multiple payment options, and seamless integration with your existing workflows.',
    url: '/docs/qwikforms',
    category: 'Products',
    tags: ['qwikforms', 'custom-forms', 'drag-drop', 'no-code', 'conditional-logic']
  },
  // Security
  {
    id: 'security',
    title: 'Security & Compliance',
    content: 'Enterprise-grade security with PCI DSS Level 1 compliance, ISO 27001 certification, SOC 2 Type II audit, GDPR compliance, and RBI guidelines adherence. Advanced encryption and fraud detection.',
    url: '/docs/security',
    category: 'Security',
    tags: ['security', 'compliance', 'pci-dss', 'iso-27001', 'encryption', 'fraud-detection']
  },
  // Webhooks
  {
    id: 'webhooks',
    title: 'Webhooks & IPN',
    content: 'Instant Payment Notifications (IPN) and webhooks for real-time payment updates. Secure webhook verification, retry mechanisms, and comprehensive event handling for seamless integration.',
    url: '/docs/webhooks',
    category: 'Integration',
    tags: ['webhooks', 'ipn', 'real-time', 'notifications', 'events', 'integration']
  },
  // API Playground
  {
    id: 'playground',
    title: 'API Playground',
    content: 'Interactive API testing environment. Test all SabPaisa APIs in real-time, explore endpoints, view responses, and generate code samples for quick integration and development.',
    url: '/playground',
    category: 'Tools',
    tags: ['api', 'playground', 'testing', 'interactive', 'endpoints', 'code-samples']
  },
  // Sandbox
  {
    id: 'sandbox',
    title: 'Stage Overview',
    content: 'Monitor stage-environment payment data, test credentials, and mock responses without touching production. Includes recommended test cards, UPI IDs, and scenario guides.',
    url: '/sandbox',
    category: 'Tools',
    tags: ['stage', 'sandbox', 'testing', 'test-credentials', 'mock-data']
  },
  // Changelog
  {
    id: 'changelog',
    title: 'Changelog & Release Notes',
    content: 'Stay updated with the latest features, improvements, and bug fixes. Version history, API changes, migration guides, and upcoming features roadmap.',
    url: '/changelog',
    category: 'Updates',
    tags: ['changelog', 'releases', 'updates', 'version-history', 'migration', 'roadmap']
  },
  // Community
  {
    id: 'community',
    title: 'Developer Community',
    content: 'Join the SabPaisa developer community. Get help, share knowledge, discuss integration challenges, and connect with other developers building payment solutions.',
    url: '/community',
    category: 'Support',
    tags: ['community', 'support', 'developers', 'forum', 'help', 'discussion']
  }
]

// Search function with fuzzy matching and scoring
function searchContent(query: string, filters: any = {}): SearchableContent[] {
  if (!query || query.trim().length === 0) {
    return documentationContent
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
  
  const results = documentationContent
    .map(item => {
      let score = 0
      const searchableText = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase()
      
      // Title matches get higher score
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        score += 50
      }
      
      // Count matches for each search term
      searchTerms.forEach(term => {
        const titleMatches = (item.title.toLowerCase().match(new RegExp(term, 'g')) || []).length
        const contentMatches = (item.content.toLowerCase().match(new RegExp(term, 'g')) || []).length
        const tagMatches = item.tags.some(tag => tag.includes(term)) ? 5 : 0
        
        score += titleMatches * 10 + contentMatches * 2 + tagMatches
      })
      
      return { ...item, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  // Apply category filter if provided
  if (filters.category && filters.category !== 'all') {
    return results.filter(item => item.category.toLowerCase() === filters.category.toLowerCase())
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimits.search(request)
    if (rateLimitResult) {
      logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', { endpoint: 'search' })
      return rateLimitResult
    }
    
    // Validate request headers
    const headerValidation = validateRequestHeaders(request)
    if (headerValidation) {
      logSecurityEvent(request, 'SUSPICIOUS_REQUEST', { reason: headerValidation })
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Validate search parameters
    if (limit > 50) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 50 results' },
        { status: 400 }
      )
    }

    const results = searchContent(query, { category }).slice(0, limit)

    const response = NextResponse.json({
      query,
      results,
      total: results.length,
      categories: ['All', 'Documentation', 'Products', 'Security', 'Integration', 'Tools', 'Updates', 'Support']
    })
    
    return addApiSecurityHeaders(response)
  } catch (err: unknown) {
    console.error('Search API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logSecurityEvent(request, 'API_ERROR', { error: errorMessage })
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addApiSecurityHeaders(response)
  }
}

// Get all available categories
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimits.api(request)
    if (rateLimitResult) {
      logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', { endpoint: 'search-post' })
      return rateLimitResult
    }
    
    // Validate request headers
    const headerValidation = validateRequestHeaders(request)
    if (headerValidation) {
      logSecurityEvent(request, 'SUSPICIOUS_REQUEST', { reason: headerValidation })
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { action } = body

    if (action === 'get-categories') {
      const categories = [...new Set(documentationContent.map(item => item.category))]
      const response = NextResponse.json({ categories: ['All', ...categories] })
      return addApiSecurityHeaders(response)
    }

    if (action === 'get-tags') {
      const allTags = documentationContent.flatMap(item => item.tags)
      const uniqueTags = [...new Set(allTags)].sort()
      const response = NextResponse.json({ tags: uniqueTags })
      return addApiSecurityHeaders(response)
    }

    const response = NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    return addApiSecurityHeaders(response)
  } catch (err: unknown) {
    console.error('Search API POST error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logSecurityEvent(request, 'API_ERROR', { error: errorMessage, method: 'POST' })
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addApiSecurityHeaders(response)
  }
}
