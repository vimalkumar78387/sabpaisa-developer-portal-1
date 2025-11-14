'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import {
  Play,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  Globe,
  Plus,
  Trash2,
  History
} from 'lucide-react'
import { AES256HMACSHA384HEX } from '@/lib/aes256-hmac'

type EnvironmentId = 'sandbox' | 'staging' | 'production'

type HeaderEntry = { key: string; value: string }

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  title: string
  description: string
  category: string
  requiresAuth: boolean
  samplePayload?: any
  sampleResponse?: any
  defaultHeaders?: HeaderEntry[]
  environmentOverrides?: Partial<Record<EnvironmentId, string>>
}

const baseHeaderTemplate: HeaderEntry[] = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer your_api_key_here' },
  { key: 'X-Client-Code', value: 'your_client_code' }
]

const cloneHeaders = (entries: HeaderEntry[]) =>
  entries.map((entry) => ({ ...entry }))

const stringifySamplePayload = (payload?: unknown) => {
  if (!payload) return ''
  return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
}

const normalizeAssignmentExpression = (raw: string) => {
  const match = raw.match(/^[a-zA-Z_$][\w$]*\s*=\s*(.+)$/s)
  return match ? match[1].trim() : raw
}

const stripWrappingQuotes = (value: string) => value.replace(/^\s*['"]|['"]\s*$/g, '')

const parseUrlEncodedString = (value: string) => {
  const cleaned = stripWrappingQuotes(normalizeAssignmentExpression(value.trim()))
  const params = new URLSearchParams(cleaned)
  const result: Record<string, string> = {}
  params.forEach((paramValue, key) => {
    if (key) {
      result[key] = paramValue
    }
  })
  if (Object.keys(result).length === 0) {
    throw new Error('Invalid form payload. Provide key=value pairs separated by & characters.')
  }
  return result
}

const parseJsonPayload = (input: string) => {
  const parsed = JSON.parse(normalizeAssignmentExpression(input.trim()))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON payload must resolve to an object.')
  }
  return parsed as Record<string, unknown>
}

const parseRequestBodyInput = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Request payload is empty.')

  const firstChar = trimmed.trimStart()[0]
  if (firstChar === '{' || firstChar === '[') {
    return parseJsonPayload(trimmed)
  }

  try {
    return parseJsonPayload(trimmed)
  } catch {
    return parseUrlEncodedString(trimmed)
  }
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'create-payment',
    method: 'POST',
    endpoint: '/SabPaisa/sabPaisaInit?v=1',
    title: 'Create Payment',
    description: 'Trigger the SabPaisa hosted checkout session.',
    category: 'payments',
    requiresAuth: true,
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
      { key: 'Accept', value: 'text/html' }
    ],
    samplePayload: 'clientCode=DJ020&encData=PASTE_YOUR_ENCRYPTED_STRING&channelId=W',
    sampleResponse: {
      message: 'HTML checkout returned by SabPaisa.'
    }
  },
  {
    id: 'payment-status',
    method: 'GET',
    endpoint: '/api/v1/payments/{paymentId}/status',
    title: 'Payment Status',
    description: 'Check the status of a payment',
    category: 'payments',
    requiresAuth: true,
    sampleResponse: {
      paymentId: 'pay_abc123',
      status: 'completed',
      amount: 100000,
      currency: 'INR',
      completedAt: '2024-01-15T10:30:00Z'
    }
  },
  {
    id: 'create-mandate',
    method: 'POST',
    endpoint: '/api/v1/enach/mandates/create',
    title: 'Create E-NACH Mandate',
    description: 'Set up recurring payment mandate',
    category: 'enach',
    requiresAuth: true,
    samplePayload: {
      customerId: 'cust_12345',
      amount: 99900,
      frequency: 'monthly',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        bankAccount: {
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234'
        }
      }
    },
    sampleResponse: {
      mandateId: 'mandate_xyz789',
      status: 'pending',
      approvalUrl: 'https://enach.sabpaisa.com/approve/xyz789'
    }
  },
  {
    id: 'create-payment-link',
    method: 'POST',
    endpoint: '/api/v1/payment-links/create',
    title: 'Create Payment Link',
    description: 'Generate instant payment link',
    category: 'payment-links',
    requiresAuth: true,
    samplePayload: {
      amount: 25000,
      currency: 'INR',
      description: 'Payment for Invoice #001',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      expiryDate: '2024-03-15'
    },
    sampleResponse: {
      linkId: 'link_pll123',
      paymentUrl: 'https://pay.sabpaisa.com/link/pll123',
      shortUrl: 'https://spay.link/pll123',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }
  },
  {
    id: 'create-refund',
    method: 'POST',
    endpoint: '/api/v1/refunds/create',
    title: 'Create Refund',
    description: 'Process a payment refund',
    category: 'refunds',
    requiresAuth: true,
    samplePayload: {
      paymentId: 'pay_abc123',
      amount: 50000,
      reason: 'Customer request',
      notes: 'Partial refund for order cancellation'
    },
    sampleResponse: {
      refundId: 'refund_xyz456',
      status: 'processing',
      amount: 50000,
      estimatedSettlement: '2024-01-16T10:30:00Z'
    }
  },
  {
    id: 'refund-status',
    method: 'GET',
    endpoint: '/api/v1/refunds/{refundId}/status',
    title: 'Refund Status',
    description: 'Check the status of a refund',
    category: 'refunds',
    requiresAuth: true,
    sampleResponse: {
      refundId: 'refund_xyz456',
      status: 'completed',
      amount: 50000,
      processedAt: '2024-01-16T10:30:00Z'
    }
  },
  {
    id: 'mandate-status',
    method: 'GET',
    endpoint: '/api/v1/enach/mandates/{mandateId}/status',
    title: 'Mandate Status',
    description: 'Check E-NACH mandate status',
    category: 'enach',
    requiresAuth: true,
    sampleResponse: {
      mandateId: 'mandate_xyz789',
      status: 'active',
      nextDebitDate: '2024-02-01',
      totalDebits: 2,
      remainingDebits: 10
    }
  },
  {
    id: 'webhook-payment-success',
    method: 'POST',
    endpoint: '/webhooks/payment/success',
    title: 'Payment Success Webhook',
    description: 'Simulate payment success notification',
    category: 'webhooks',
    requiresAuth: false,
    samplePayload: {
      event: 'payment.success',
      paymentId: 'pay_abc123',
      orderId: 'order_123456',
      amount: 100000,
      currency: 'INR',
      status: 'completed',
      completedAt: '2024-01-15T10:30:00Z',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    sampleResponse: {
      received: true,
      message: 'Webhook processed successfully'
    }
  },
  {
    id: 'webhook-payment-failed',
    method: 'POST',
    endpoint: '/webhooks/payment/failed',
    title: 'Payment Failed Webhook',
    description: 'Simulate payment failure notification',
    category: 'webhooks',
    requiresAuth: false,
    samplePayload: {
      event: 'payment.failed',
      paymentId: 'pay_abc123',
      orderId: 'order_123456',
      amount: 100000,
      currency: 'INR',
      status: 'failed',
      failureReason: 'Insufficient funds',
      failedAt: '2024-01-15T10:30:00Z'
    },
    sampleResponse: {
      received: true,
      message: 'Webhook processed successfully'
    }
  },
  {
    id: 'transaction-enquiry',
    method: 'POST',
    endpoint: '/SPTxtnEnquiry/getTxnStatusByClientxnId',
    title: 'Transaction Enquiry',
    description: 'Retrieve live status for a client transaction ID.',
    category: 'transaction-enquiry',
    requiresAuth: true,
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ],
    environmentOverrides: {
      sandbox: 'https://stage-txnenquiry.sabpaisa.in',
      staging: 'https://stage-txnenquiry.sabpaisa.in',
      production: 'https://txnenquiry.sabpaisa.in'
    },
    samplePayload: {
      clientCode: 'DJ020',
      statusTransEncData: 'FAF63DFFCDA17834549C9D90ED546CE73D27241BA88BC1D29C57B40BF1C213A77B5F97EC93E6D1F4AEA8D0C39118B80F0547716B829C2929D08D54071EEFEC7D'
    },
    sampleResponse: {
      clientCode: 'DJ020',
      statusResponseData: '590ECBC8D9F015D166B5699C6491FE7A1BC1AA2AE0FED1B9FEFED090A6712F5C...'
    }
  }
]

const environments = [
  {
    id: 'sandbox',
    label: 'Sandbox',
    baseUrl: 'https://stage-securepay.sabpaisa.in',
    badge: 'Recommended',
    description: 'Synthetic data with real-time webhook simulation.'
  },
  {
    id: 'staging',
    label: 'Staging',
    baseUrl: 'https://stage-securepay.sabpaisa.in',
    badge: 'Preview',
    description: 'Mirror of production with throttled limits for dry-runs.'
  },
  {
    id: 'production',
    label: 'Production',
    baseUrl: 'https://securepay.sabpaisa.in',
    badge: 'Live',
    description: 'Billable environment. Requests are processed for real customers.'
  }
] as const

interface ApiTesterProps {
  selectedCategory?: string
}

export function ApiTester({ selectedCategory = 'payments' }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
    apiEndpoints.find(e => e.category === selectedCategory) || apiEndpoints[0]
  )
  const [environmentId, setEnvironmentId] = useState<EnvironmentId>('sandbox')
  const [requestPayload, setRequestPayload] = useState(
    stringifySamplePayload(selectedEndpoint.samplePayload)
  )
  const [pathParams, setPathParams] = useState<Record<string, string>>(() => {
    const matches = selectedEndpoint.endpoint.match(/\{([^}]+)\}/g)
    if (!matches) return {}
    return matches.reduce<Record<string, string>>((acc, param) => {
      const key = param.slice(1, -1)
      acc[key] = ''
      return acc
    }, {})
  })
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [headerEntries, setHeaderEntries] = useState<HeaderEntry[]>(
    cloneHeaders(selectedEndpoint.defaultHeaders ?? baseHeaderTemplate)
  )
  const [history, setHistory] = useState<
    Array<{ id: string; status: number; method: string; endpoint: string; timestamp: string; environment: string }>
  >([])
  const [txnClientCode, setTxnClientCode] = useState('DJ020')
  const [txnClientTxnId, setTxnClientTxnId] = useState('TESTING090725110510177')
  const [aesKey, setAesKey] = useState('')
  const [hmacKey, setHmacKey] = useState('')
  const [encryptedStatusData, setEncryptedStatusData] = useState('')
  const [decryptedResponse, setDecryptedResponse] = useState<string | null>(null)
  const [encryptionError, setEncryptionError] = useState<string | null>(null)
  const [decryptionError, setDecryptionError] = useState<string | null>(null)
  const [decryptedStatus, setDecryptedStatus] = useState<string | null>(null)

  const activeEnvironment = environments.find((env) => env.id === environmentId) ?? environments[0]
  const isTransactionEnquiry = selectedEndpoint.id === 'transaction-enquiry'
  const isHostedCheckoutRequest = selectedEndpoint.id === 'create-payment'

  const headers = headerEntries.reduce<Record<string, string>>((acc, entry) => {
    if (entry.key.trim()) {
      acc[entry.key.trim()] = entry.value
    }
    return acc
  }, {})

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    if (selectedCategory === 'payments') {
      return endpoint.category === 'payments' || endpoint.category === 'payment-links'
    }
    return endpoint.category === selectedCategory
  })

  const handleEndpointChange = (endpointId: string) => {
    const endpoint = apiEndpoints.find((item) => item.id === endpointId)
    if (!endpoint) return

    setSelectedEndpoint(endpoint)
    setRequestPayload(stringifySamplePayload(endpoint.samplePayload))
    setResponse(null)
    setError(null)
    setRetryCount(0)
    setHeaderEntries(cloneHeaders(endpoint.defaultHeaders ?? baseHeaderTemplate))

    const matches = endpoint.endpoint.match(/\{([^}]+)\}/g)
    setPathParams(() => {
      if (!matches) return {}
      return matches.reduce<Record<string, string>>((acc, param) => {
        const key = param.slice(1, -1)
        acc[key] = ''
        return acc
      }, {})
    })

    if (endpoint.environmentOverrides) {
      const preferredEnv = Object.keys(endpoint.environmentOverrides)[0] as EnvironmentId
      if (preferredEnv) {
        setEnvironmentId(preferredEnv)
      }
    } else {
      setEnvironmentId('sandbox')
    }

    if (endpoint.id === 'transaction-enquiry') {
      setEncryptedStatusData('')
      setDecryptedResponse(null)
      setEncryptionError(null)
      setDecryptionError(null)
    }
  }

  const resolvedEndpoint = selectedEndpoint.endpoint.replace(/\{([^}]+)\}/g, (_match, key) => {
    return pathParams[key] ? pathParams[key] : `{${key}}`
  })
  const baseUrlForRequest = (
    selectedEndpoint.environmentOverrides?.[environmentId] ?? activeEnvironment.baseUrl
  ).replace(/\/$/, '')
  const requestPath = resolvedEndpoint.startsWith('/') ? resolvedEndpoint : `/${resolvedEndpoint}`
  const requestUrl = `${baseUrlForRequest}${requestPath}`

  const timelineSteps = useMemo(() => {
    if (!response) return []
    const steps = [
      {
        label: 'Request dispatched',
        detail: `${selectedEndpoint.method} ${requestUrl}`,
        state: 'done' as const
      },
      {
        label: 'Gateway processing',
        detail:
          response.status >= 500 ? 'Processing interrupted' : 'Routing via SabPaisa orchestration layer',
        state: response.status >= 500 ? ('error' as const) : ('done' as const)
      },
      {
        label: response.status >= 400 ? 'Error surfaced' : 'Response delivered',
        detail: `Status ${response.status}`,
        state: response.status >= 400 ? ('error' as const) : ('done' as const)
      }
    ]
    if (response.responseTime) {
      steps.push({
        label: 'Latency observed',
        detail: `${response.responseTime} ms overall`,
        state: 'info' as const
      })
    }
    return steps
  }, [response, requestUrl, selectedEndpoint.method])

  const curlCommand = useMemo(() => {
    const headerLines = Object.entries(headers)
      .map(([key, value]) => `  -H '${key}: ${value}'`)
      .join(' \\\n')
    const compactPayload = requestPayload.replace(/\s+/g, ' ').trim()
    const payloadLine =
      (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && compactPayload.length
        ? ` \\\n  -d '${compactPayload}'`
        : ''
    const headersSection = headerLines ? ` \\\n${headerLines}` : ''
    return `curl -X ${selectedEndpoint.method} \\\n  '${requestUrl}'${headersSection}${payloadLine}`
  }, [headers, requestPayload, requestUrl, selectedEndpoint.method])

  const plainStatusString = useMemo(
    () => `clientCode=${txnClientCode}&clientTxnId=${txnClientTxnId}`,
    [txnClientCode, txnClientTxnId]
  )

  useEffect(() => {
    if (!isTransactionEnquiry) {
      setEncryptedStatusData('')
      setDecryptedResponse(null)
      setDecryptedStatus(null)
      setEncryptionError(null)
      setDecryptionError(null)
    }
  }, [isTransactionEnquiry])

  const handleEncryptStatus = async () => {
    if (!txnClientCode || !txnClientTxnId) {
      setEncryptionError('Client code and transaction ID are required.')
      return
    }
    if (!aesKey || !hmacKey) {
      setEncryptionError('Please provide both AES and HMAC base64 keys.')
      return
    }
    setEncryptionError(null)
    try {
      const cipher = await AES256HMACSHA384HEX.encrypt(aesKey, hmacKey, plainStatusString)
      setEncryptedStatusData(cipher)
    setDecryptedResponse(null)
    setDecryptionError(null)
    setDecryptedStatus(null)
    setRequestPayload(
      JSON.stringify(
        {
          clientCode: txnClientCode,
            statusTransEncData: cipher
          },
          null,
          2
        )
      )
    } catch (err) {
      console.error(err)
      setEncryptionError('Unable to encrypt. Verify keys and try again.')
    }
  }

  const handleDecryptResponse = async () => {
    if (!aesKey || !hmacKey) {
      setDecryptionError('Provide the same AES and HMAC base64 keys used for encryption.')
      return
    }
    const encrypted = response?.data?.statusResponseData ?? response?.statusResponseData
    if (!encrypted) {
      setDecryptionError('No statusResponseData found in the latest response.')
      return
    }
    setDecryptionError(null)
    try {
      const plain = await AES256HMACSHA384HEX.decrypt(aesKey, hmacKey, encrypted)
      setDecryptedResponse(plain)
      const statusValue =
        plain
          .split('&')
          .find((segment) => segment.toLowerCase().startsWith('status='))?.split('=')[1] ?? null
      setDecryptedStatus(statusValue ? statusValue.toUpperCase() : null)
    } catch (err) {
      console.error(err)
      setDecryptionError('Unable to decrypt the response. Check your keys and ciphertext.')
      setDecryptedStatus(null)
    }
  }

  const performRealRequest = async () => {
    const requiresBody = selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT'
    let parsedBody: Record<string, unknown> | undefined
    let bodyPayload: BodyInit | undefined

    if (requiresBody) {
      if (isHostedCheckoutRequest) {
        parsedBody = parseRequestBodyInput(requestPayload)
        const params = new URLSearchParams()
        Object.entries(parsedBody).forEach(([key, value]) => {
          if (value === undefined || value === null) return
          params.append(key, String(value))
        })
        bodyPayload = params.toString()
      } else {
        try {
          parsedBody = JSON.parse(requestPayload)
        } catch (parseError) {
          throw new Error('Invalid JSON in request payload')
        }
        if (
          isTransactionEnquiry &&
          (!parsedBody || !('statusTransEncData' in parsedBody))
        ) {
          throw new Error('statusTransEncData missing. Click “Encrypt & build payload” first.')
        }
        bodyPayload = JSON.stringify(parsedBody)
      }
    }

    const started = performance.now()
    const targetUrl = isTransactionEnquiry
      ? `/api/txnenquiry/${environmentId}`
      : isHostedCheckoutRequest
      ? `/api/payment/init?env=${environmentId}`
      : requestUrl
    let res: Response
    const outboundHeaders = { ...headers }
    if (isHostedCheckoutRequest) {
      outboundHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
      outboundHeaders['Accept'] = 'text/html'
    }

    try {
      if (isTransactionEnquiry) {
        res = await fetch(targetUrl, {
          method: 'POST',
          headers: outboundHeaders,
          body: JSON.stringify(parsedBody ?? {})
        })
      } else {
        res = await fetch(targetUrl, {
          method: selectedEndpoint.method,
          headers: outboundHeaders,
          body: requiresBody ? bodyPayload : undefined
        })
      }
    } catch (networkError) {
      throw new Error(
        isTransactionEnquiry
          ? 'Unable to reach the transaction enquiry proxy route.'
          : 'Network error or CORS limitation prevented calling the endpoint.'
      )
    }

    const elapsed = Math.floor(performance.now() - started)

    const status = res.status
    const headerObj: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      headerObj[key] = value
    })
    const contentType = res.headers.get('content-type') ?? ''
    headerObj['content-type'] = contentType

    let data: any = null
    if (contentType.includes('application/json')) {
      try {
        data = await res.json()
      } catch {
        data = null
      }
    } else {
      data = await res.text()
    }

    setResponse({
      status,
      headers: headerObj,
      data,
      timestamp: new Date().toISOString(),
      responseTime: elapsed
    })

    if (status < 200 || status >= 300) {
      setError(`Request completed with status ${status}.`)
    }

    const requestId = headerObj['x-request-id'] ?? `req_${Date.now()}`
    setHistory((prev) => {
      const entry = {
        id: requestId,
        status,
        method: selectedEndpoint.method,
        endpoint: requestUrl,
        timestamp: new Date().toISOString(),
        environment: activeEnvironment.label
      }
      return [entry, ...prev].slice(0, 6)
    })

    if (status >= 200 && status < 300) {
      setRetryCount(0)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setResponse(null)
    setError(null)
    setDecryptedResponse(null)
    setDecryptionError(null)

    try {
      if (isTransactionEnquiry || isHostedCheckoutRequest) {
        await performRealRequest()
        return
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate different response scenarios
      const shouldSucceed = Math.random() > 0.1 // 90% success rate
      
      if (shouldSucceed) {
        const requestId = `req_${Date.now()}`
        const mockResponse = {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'x-request-id': requestId,
            'x-ratelimit-remaining': '999',
            'x-ratelimit-reset': new Date(Date.now() + 3600000).toISOString()
          },
          data: selectedEndpoint.sampleResponse || { success: true, message: 'Request processed successfully' },
          timestamp: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 300) + 100
        }
        setResponse(mockResponse)
        setHistory((prev) => {
          const entry = {
            id: requestId,
            status: mockResponse.status,
            method: selectedEndpoint.method,
            endpoint: requestUrl,
            timestamp: mockResponse.timestamp,
            environment: activeEnvironment.label
          }
          return [entry, ...prev].slice(0, 6)
        })
        setRetryCount(0) // Reset retry count on success
      } else {
        // Simulate error responses
        const errorResponses = [
          { status: 400, error: 'Bad Request', message: 'Invalid request payload' },
          { status: 401, error: 'Unauthorized', message: 'Invalid API key' },
          { status: 422, error: 'Validation Error', message: 'Required field missing: amount' },
          { status: 429, error: 'Rate Limited', message: 'Too many requests' },
          { status: 500, error: 'Internal Server Error', message: 'Something went wrong on our end' }
        ]
        const randomError = errorResponses[Math.floor(Math.random() * errorResponses.length)]
        const requestId = `req_${Date.now()}`
        setResponse({
          ...randomError,
          headers: {
            'content-type': 'application/json',
            'x-request-id': requestId
          },
          timestamp: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 200) + 50
        })
        setHistory((prev) => {
          const entry = {
            id: requestId,
            status: randomError.status,
            method: selectedEndpoint.method,
            endpoint: requestUrl,
            timestamp: new Date().toISOString(),
            environment: activeEnvironment.label
          }
          return [entry, ...prev].slice(0, 6)
        })
      }
    } catch (error) {
      console.error('API Test Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong processing your request'
      setError(errorMessage)
      setResponse({
        status: 500,
        error: 'Request Failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 100) + 50
      })
      setHistory((prev) => {
        const entry = {
          id: `req_${Date.now()}`,
          status: 500,
          method: selectedEndpoint.method,
          endpoint: requestUrl,
          timestamp: new Date().toISOString(),
          environment: activeEnvironment.label
        }
        return [entry, ...prev].slice(0, 6)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    handleTest()
  }

  const clearResults = () => {
    setResponse(null)
    setError(null)
    setRetryCount(0)
    setDecryptedResponse(null)
    setDecryptionError(null)
    setEncryptionError(null)
    setDecryptedStatus(null)
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        // no-op fallback
      })
    }
  }

  useEffect(() => {
    const firstMatch =
      apiEndpoints.find((endpoint) => endpoint.category === selectedCategory) || apiEndpoints[0]

    setSelectedEndpoint(firstMatch)
    setRequestPayload(JSON.stringify(firstMatch.samplePayload || {}, null, 2))
    setResponse(null)
    setError(null)
    setRetryCount(0)
    setHeaderEntries(cloneHeaders(firstMatch.defaultHeaders ?? baseHeaderTemplate))

    const matches = firstMatch.endpoint.match(/\{([^}]+)\}/g)
    if (matches) {
      setPathParams(
        matches.reduce<Record<string, string>>((acc, param) => {
          const key = param.slice(1, -1)
          acc[key] = ''
          return acc
        }, {})
      )
    } else {
      setPathParams({})
    }

    if (firstMatch.environmentOverrides) {
      const preferredEnv = Object.keys(firstMatch.environmentOverrides)[0] as EnvironmentId
      if (preferredEnv) {
        setEnvironmentId(preferredEnv)
      }
    } else {
      setEnvironmentId('sandbox')
    }

    if (firstMatch.id === 'transaction-enquiry') {
      setEncryptedStatusData('')
      setDecryptedResponse(null)
      setEncryptionError(null)
      setDecryptionError(null)
    }
  }, [selectedCategory])

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Request Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Request
            </CardTitle>
            <CardDescription className="space-y-3">
              <p>Configure and test API endpoints interactively.</p>
              <div className="flex flex-wrap items-center gap-2">
                {environments.map((env) => (
                  <Button
                    key={env.id}
                    type="button"
                    size="sm"
                    variant={environmentId === env.id ? 'default' : 'outline'}
                    className="flex items-center gap-2 rounded-full"
                    onClick={() => setEnvironmentId(env.id)}
                  >
                    <Globe className="h-4 w-4" />
                    {env.label}
                    <Badge className="rounded-full bg-primary/15 text-primary">{env.badge}</Badge>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeEnvironment.description}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTransactionEnquiry && (
              <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Transaction enquiry helper</h3>
                    <p className="text-xs text-muted-foreground">
                      Generate the encrypted payload before invoking the live status API.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEncryptStatus}>
                    <Play className="mr-2 h-4 w-4" />
                    Encrypt &amp; build payload
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Client code</Label>
                    <Input
                      value={txnClientCode}
                      onChange={(event) => setTxnClientCode(event.target.value)}
                      placeholder="DJ020"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Client transaction ID</Label>
                    <Input
                      value={txnClientTxnId}
                      onChange={(event) => setTxnClientTxnId(event.target.value)}
                      placeholder="TESTING090725110510177"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Plain string</Label>
                  <CodeBlock code={plainStatusString} language="text" showLineNumbers={false} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">AES key (base64)</Label>
                    <Input
                      value={aesKey}
                      onChange={(event) => setAesKey(event.target.value)}
                      placeholder="Base64 encoded AES key"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">HMAC key (base64)</Label>
                    <Input
                      value={hmacKey}
                      onChange={(event) => setHmacKey(event.target.value)}
                      placeholder="Base64 encoded HMAC key"
                    />
                  </div>
                </div>

                {encryptionError && <p className="text-xs text-destructive">{encryptionError}</p>}

                {encryptedStatusData ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase text-muted-foreground">
                        statusTransEncData
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(encryptedStatusData)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <CodeBlock code={encryptedStatusData} language="text" showLineNumbers={false} />
                    <p className="text-xs text-muted-foreground italic">
                      Next step: Click <span className="font-medium text-primary">Encrypt &amp; build payload</span> for encrypting the payload and sending it into the request.
                    </p>
                  </div>
                ) : (
                  !encryptionError && (
                    <p className="text-xs text-muted-foreground italic">
                      Click <span className="font-medium text-primary">Encrypt &amp; build payload</span> to generate <code>statusTransEncData</code> for your request.
                    </p>
                  )
                )}
              </div>
            )}

            {/* Endpoint Selection */}
            <div className="space-y-2">
              <Label>Select Endpoint</Label>
              <Select value={selectedEndpoint.id} onValueChange={handleEndpointChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredEndpoints.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <span>{endpoint.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Method and URL */}
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={selectedEndpoint.method === 'POST' ? 'default' : 'secondary'}>
                  {selectedEndpoint.method}
                </Badge>
                <code className="flex-1 overflow-x-auto rounded bg-background/80 px-2 py-1 text-sm">
                  {requestUrl}
                </code>
              </div>
              {selectedEndpoint.endpoint !== resolvedEndpoint && (
                <p className="text-xs text-muted-foreground">
                  Path parameters resolved to&nbsp;
                  <code className="rounded bg-background/70 px-1 py-0.5">{resolvedEndpoint}</code>
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedEndpoint.description}
            </p>

            {/* Headers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setHeaderEntries((prev) => [...prev, { key: '', value: '' }])}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add header
                </Button>
              </div>
              <div className="space-y-2">
                {headerEntries.map((entry, index) => (
                  <div key={`header-${index}`} className="flex items-center gap-2">
                    <Input
                      value={entry.key}
                      placeholder="Header name"
                      className="text-sm"
                      onChange={(e) => {
                        const value = e.target.value
                        setHeaderEntries((prev) => {
                          const next = [...prev]
                          next[index] = { ...next[index], key: value }
                          return next
                        })
                      }}
                    />
                    <Input
                      value={entry.value}
                      placeholder="Header value"
                      className="text-sm"
                      onChange={(e) => {
                        const value = e.target.value
                        setHeaderEntries((prev) => {
                          const next = [...prev]
                          next[index] = { ...next[index], value }
                          return next
                        })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setHeaderEntries((prev) => prev.filter((_, idx) => idx !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
              <div className="space-y-2">
                <Label>Request Body</Label>
                {isHostedCheckoutRequest && (
                  <p className="text-xs text-muted-foreground">
                    Paste either raw form data (<code>clientCode=DJ020&amp;encData=...</code>) or a JSON object with
                    <code>clientCode</code> and <code>encData</code>. The request will be sent as
                    <code> application/x-www-form-urlencoded</code> to the SabPaisa gateway.
                  </p>
                )}
                <Textarea
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder={isHostedCheckoutRequest ? 'clientCode=DJ020&encData=...' : 'Enter JSON payload...'}
                />
              </div>
            )}

            {/* Path Parameters */}
            {selectedEndpoint.endpoint.includes('{') && (
              <div className="space-y-2">
                <Label>Path Parameters</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Replace path parameters in the endpoint URL above
                </div>
                <div className="space-y-2">
                  {selectedEndpoint.endpoint.match(/\{([^}]+)\}/g)?.map((param, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded min-w-[100px]">
                        {param}
                      </code>
                      <Input 
                        value={pathParams[param.slice(1, -1)] || ''}
                        placeholder={`Enter ${param.slice(1, -1)}`}
                        className="text-sm"
                        onChange={(e) =>
                          setPathParams((prev) => ({
                            ...prev,
                            [param.slice(1, -1)]: e.target.value
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleTest} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Test API
                  </>
                )}
              </Button>
              {(response || error) && (
                <Button 
                  variant="outline" 
                  onClick={clearResults}
                  disabled={loading}
                >
                  Clear
                </Button>
              )}
            </div>
            
            {/* Error display and retry */}
            {error && !loading && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Request Failed</p>
                    <p className="text-xs text-destructive/80 mt-1">{error}</p>
                    {retryCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Retry attempts: {retryCount}/3
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      disabled={retryCount >= 3}
                      className="mt-2"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      {retryCount >= 3 ? 'Max retries reached' : 'Retry'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Response */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {response ? (
                response.status === 200 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )
              ) : (
                <Clock className="h-5 w-5" />
              )}
              Response
            </CardTitle>
            {response && (
              <div className="flex items-center gap-4 text-sm">
                <Badge 
                  variant={
                    response.status >= 200 && response.status < 300 
                      ? 'secondary' 
                      : response.status >= 400 && response.status < 500
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {response.status}
                </Badge>
                {response.responseTime && (
                  <span className="text-muted-foreground">
                    {response.responseTime}ms
                  </span>
                )}
                {response.timestamp && (
                  <span className="text-muted-foreground">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!response && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Test API" to see the response</p>
              </div>
            )}

            {response && (
              <>
                {isHostedCheckoutRequest && (
                  <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs leading-5 text-primary">
                    SabPaisa returns the entire hosted checkout HTML for <code>create-payment</code>. We stream that markup
                    directly into the iframe below so you can preview the redirect without pop-ups. Use "Copy HTML" if you'd
                    like to drop the response in a new tab or template.
                  </div>
                )}
                <Tabs defaultValue="response" className="w-full">
                <TabsList>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response" className="space-y-4">
                  {isHostedCheckoutRequest && typeof response.data === 'string' && (response.headers?.['content-type'] ?? '').includes('text/html') ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">HTML Response</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(response.data)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <iframe
                        title="SabPaisa Checkout Preview"
                        srcDoc={response.data}
                        className="h-[520px] w-full rounded-2xl border border-border/60 bg-muted/10"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Response Body</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(response.data || response, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <CodeBlock
                        code={JSON.stringify(response.data || response, null, 2)}
                        language="json"
                        showLineNumbers={false}
                      />
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="headers" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Response Headers</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(response.headers || {}, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CodeBlock
                    code={JSON.stringify(response.headers || {}, null, 2)}
                    language="json"
                    showLineNumbers={false}
                  />
                </TabsContent>
                
                <TabsContent value="curl" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">cURL Command</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(curlCommand)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CodeBlock code={curlCommand} language="bash" showLineNumbers={false} />
                </TabsContent>

                <TabsContent value="timeline" className="space-y-3">
                  <ol className="space-y-3">
                    {timelineSteps.map((step, index) => {
                      const isError = step.state === 'error'
                      const isDone = step.state === 'done'
                      const Icon = isDone ? CheckCircle : isError ? AlertCircle : Clock
                      return (
                        <li key={`${step.label}-${index}`} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                          <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${isDone ? 'bg-emerald-500/10 text-emerald-500' : isError ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{step.label}</p>
                            <p className="text-xs text-muted-foreground">{step.detail}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </TabsContent>
              </Tabs>
              </>
            )}
            {isTransactionEnquiry && response && (
              <div className="mt-6 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Decrypt statusResponseData</h4>
                    <p className="text-xs text-muted-foreground">
                      Use the same AES and HMAC keys from the encryption step to inspect the status payload.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDecryptResponse}>
                    <Play className="mr-2 h-4 w-4" />
                    Decrypt response
                  </Button>
                </div>
                {decryptionError && <p className="text-xs text-destructive">{decryptionError}</p>}
                {decryptedResponse && (
                  <CodeBlock code={decryptedResponse} language="text" showLineNumbers={false} />
                )}
                {decryptedStatus && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Transaction status:&nbsp;</span>
                    <span className="font-semibold text-primary">{decryptedStatus}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge
                      variant={
                        item.status >= 200 && item.status < 300
                          ? 'secondary'
                          : item.status >= 400 && item.status < 500
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                        <span>{item.method}</span>
                        <Badge variant="outline" className="rounded-full">
                          {item.environment}
                        </Badge>
                      </div>
                      <div className="truncate text-sm font-medium text-foreground">
                        {item.endpoint}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:min-w-[120px]">
                    <span className="text-xs text-muted-foreground sm:text-right">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setHistory((prev) => prev.filter((historyItem) => historyItem.id !== item.id))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
