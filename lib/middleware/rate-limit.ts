import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; lastReset: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  message?: string
}

// Default key generator using IP address
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown'
  return ip
}

export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    keyGenerator = defaultKeyGenerator,
    message = 'Too many requests, please try again later.'
  } = options

  return function rateLimit(req: NextRequest): NextResponse | null {
    const key = keyGenerator(req)
    const now = Date.now()
    
    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key)
    
    if (!rateLimitData || now - rateLimitData.lastReset > windowMs) {
      // Initialize or reset the rate limit data
      rateLimitData = { count: 0, lastReset: now }
      rateLimitStore.set(key, rateLimitData)
    }
    
    // Check if limit exceeded
    if (rateLimitData.count >= maxRequests) {
      const timeRemaining = Math.ceil((rateLimitData.lastReset + windowMs - now) / 1000)
      
      return NextResponse.json(
        { 
          error: message,
          retryAfter: timeRemaining
        },
        { 
          status: 429,
          headers: {
            'Retry-After': timeRemaining.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitData.lastReset + windowMs).toISOString()
          }
        }
      )
    }
    
    // Increment counter
    rateLimitData.count++
    rateLimitStore.set(key, rateLimitData)
    
    return null // Allow request to continue
  }
}

// Predefined rate limit configurations
export const rateLimits = {
  // Strict rate limit for sensitive endpoints
  strict: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many requests to this sensitive endpoint. Please try again in 15 minutes.'
  }),
  
  // Moderate rate limit for API endpoints
  api: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'API rate limit exceeded. Please try again later.'
  }),
  
  // Lenient rate limit for search and general endpoints
  search: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Search rate limit exceeded. Please slow down your requests.'
  }),
  
  // Authentication rate limit
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => {
      const body = req.body as any
      const email = body?.email || 'unknown'
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
      return `auth-${email}-${ip}`
    },
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  })
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.lastReset > 60 * 60 * 1000) { // Remove entries older than 1 hour
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000) // Run every 10 minutes