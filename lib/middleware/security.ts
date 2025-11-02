import { NextRequest, NextResponse } from 'next/server'

export interface SecurityHeaders {
  'Content-Security-Policy'?: string
  'X-Frame-Options'?: string
  'X-Content-Type-Options'?: string
  'Referrer-Policy'?: string
  'X-XSS-Protection'?: string
  'Strict-Transport-Security'?: string
  'Permissions-Policy'?: string
}

// Default security headers
const defaultSecurityHeaders: SecurityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement (only in production)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', ')
}

export function addSecurityHeaders(
  response: NextResponse,
  customHeaders: Partial<SecurityHeaders> = {}
): NextResponse {
  const headers = { ...defaultSecurityHeaders, ...customHeaders }
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })
  
  return response
}

// API-specific security headers
export function addApiSecurityHeaders(response: NextResponse): NextResponse {
  return addSecurityHeaders(response, {
    // More lenient CSP for API endpoints
    'Content-Security-Policy': "default-src 'none'",
    // CORS headers can be added here if needed
  })
}

// Validate request headers for suspicious activity
export function validateRequestHeaders(req: NextRequest): string | null {
  const userAgent = req.headers.get('user-agent')
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return 'Suspicious or missing user agent'
  }
  
  // Check for known bot patterns (basic)
  const suspiciousBots = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'curl/7.1', // Very old curl versions
    'python-requests/1.0' // Very old requests
  ]
  
  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    return 'Suspicious user agent detected'
  }
  
  // Validate content length for POST requests
  const contentLength = req.headers.get('content-length')
  if (req.method === 'POST' && contentLength) {
    const length = parseInt(contentLength, 10)
    if (length > 10 * 1024 * 1024) { // 10MB limit
      return 'Request payload too large'
    }
  }
  
  return null // No issues detected
}

// IP whitelist/blacklist functionality
const ipBlacklist = new Set<string>()
const ipWhitelist = new Set<string>()

export function addToBlacklist(ip: string): void {
  ipBlacklist.add(ip)
}

export function addToWhitelist(ip: string): void {
  ipWhitelist.add(ip)
}

export function isIpBlocked(req: NextRequest): boolean {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
  
  // If whitelist exists and IP is not in it, block
  if (ipWhitelist.size > 0 && !ipWhitelist.has(ip)) {
    return true
  }
  
  // If IP is in blacklist, block
  if (ipBlacklist.has(ip)) {
    return true
  }
  
  return false
}

// CSRF protection for state-changing operations
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true
  }
  
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host = req.headers.get('host')
  
  // Check origin header
  if (origin) {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      return false
    }
  }
  
  // Check referer header as fallback
  if (!origin && referer) {
    const refererHost = new URL(referer).host
    if (refererHost !== host) {
      return false
    }
  }
  
  // If neither origin nor referer is present for state-changing requests, it's suspicious
  if (!origin && !referer) {
    return false
  }
  
  return true
}

// Security event logging
interface SecurityEvent {
  timestamp: Date
  type: string
  ip: string
  userAgent: string
  path: string
  details?: any
}

const securityEvents: SecurityEvent[] = []

export function logSecurityEvent(
  req: NextRequest,
  type: string,
  details?: any
): void {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
  
  const event: SecurityEvent = {
    timestamp: new Date(),
    type,
    ip,
    userAgent: req.headers.get('user-agent') || 'unknown',
    path: req.nextUrl.pathname,
    details
  }
  
  securityEvents.push(event)
  
  // Keep only last 1000 events to prevent memory issues
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000)
  }
  
  // In production, you would send this to a logging service
  console.warn('Security Event:', event)
}

export function getSecurityEvents(): SecurityEvent[] {
  return [...securityEvents] // Return copy to prevent mutations
}