'use client'

import { useState } from 'react'
import { AES256HMACSHA384HEX } from '@/lib/aes256-hmac'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Play, SendHorizontal, Globe, Code as CodeIcon, CheckCircle, AlertCircle } from 'lucide-react'

type EnvironmentId = 'sandbox' | 'production'

type BackendSnapshot = {
  status: number
  responseTime?: number
  headers: Record<string, string>
  body: any
}

type ValidationResult = {
  valid: boolean
  issues: string[]
}

const environments: { id: EnvironmentId; label: string; baseUrl: string; description: string }[] = [
  {
    id: 'sandbox',
    label: 'Sandbox',
    baseUrl: 'https://stage-txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId',
    description: 'Recommended for everyday encrypted status lookups.'
  },
  {
    id: 'production',
    label: 'Production',
    baseUrl: 'https://txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId',
    description: 'Live endpoint. Use only with audited credentials.'
  }
]

const validationContract = {
  status: 200,
  message: 'API_SUCCESSFULL_MESSAGE',
  data: {
    statusCode: '01',
    message: 'Data successfully processed'
  },
  errors: 'null'
} as const

const collectValidationIssues = (payload: any): string[] => {
  const issues: string[] = []
  if (!payload || typeof payload !== 'object') {
    return ['Response must be valid JSON.']
  }

  if (payload.status !== validationContract.status) {
    issues.push('status must equal 200.')
  }
  if (payload.message !== validationContract.message) {
    issues.push('message must equal "API_SUCCESSFULL_MESSAGE".')
  }
  if (payload.errors !== validationContract.errors) {
    issues.push('errors must equal the string "null".')
  }

  const data = payload.data
  if (!data || typeof data !== 'object') {
    issues.push('data must contain statusCode, message, and sabpaisaTxnId.')
  } else {
    if (data.statusCode !== validationContract.data.statusCode) {
      issues.push('data.statusCode must equal "01".')
    }
    if (data.message !== validationContract.data.message) {
      issues.push('data.message must equal "Data successfully processed".')
    }
    if (typeof data.sabpaisaTxnId !== 'string' || !data.sabpaisaTxnId.trim()) {
      issues.push('data.sabpaisaTxnId must be a non-empty string.')
    }
  }

  return issues
}

export function WebhookTester() {
  const [environmentId, setEnvironmentId] = useState<EnvironmentId>('sandbox')
  const [clientCode, setClientCode] = useState('DJ020')
  const [clientTxnId, setClientTxnId] = useState('TESTING090725110510177')
  const [aesKey, setAesKey] = useState('')
  const [hmacKey, setHmacKey] = useState('')

  const [backendSnapshot, setBackendSnapshot] = useState<BackendSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [encryptionError, setEncryptionError] = useState<string | null>(null)

  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [webhookError, setWebhookError] = useState<string | null>(null)
  const [webhookResponse, setWebhookResponse] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const activeEnvironment = environments.find((env) => env.id === environmentId) ?? environments[0]
  const proxyPath = `/api/txnenquiry/${environmentId}`

  const handleGenerateResponse = async () => {
    const trimmedClientCode = clientCode.trim()
    const trimmedClientTxnId = clientTxnId.trim()
    const trimmedAesKey = aesKey.trim()
    const trimmedHmacKey = hmacKey.trim()

    if (!trimmedClientCode || !trimmedClientTxnId) {
      setEncryptionError('Client code and client transaction ID are required.')
      return
    }
    if (!trimmedAesKey || !trimmedHmacKey) {
      setEncryptionError('Provide both AES and HMAC base64 keys.')
      return
    }

    setEncryptionError(null)
    setLoading(true)
    setError(null)
    setBackendSnapshot(null)
    setWebhookResponse(null)
    setWebhookError(null)
    setValidationResult(null)

    try {
      const plain = `clientCode=${trimmedClientCode}&clientTxnId=${trimmedClientTxnId}`
      const cipher = await AES256HMACSHA384HEX.encrypt(trimmedAesKey, trimmedHmacKey, plain)
      const payload = { clientCode: trimmedClientCode, statusTransEncData: cipher }

      const startedAt = performance.now()
      const fetchResponse = await fetch(proxyPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const rawText = await fetchResponse.text()
      let parsedBody: any = null
      try {
        parsedBody = rawText ? JSON.parse(rawText) : null
      } catch {
        parsedBody = { raw: rawText }
      }

      setBackendSnapshot({
        status: fetchResponse.status,
        responseTime: Math.round(performance.now() - startedAt),
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        body: parsedBody
      })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unable to generate the response. Verify the inputs and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendWebhook = async () => {
    if (!backendSnapshot?.body) {
      setWebhookError('Generate a response first, then forward it to your webhook.')
      return
    }
    if (!webhookUrl.trim()) {
      setWebhookError('Enter a webhook URL before sending the payload.')
      return
    }

    setWebhookError(null)
    setWebhookLoading(true)
    setValidationResult(null)
    setWebhookResponse(null)

    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendSnapshot.body)
      })

      const text = await response.text()
      let parsed: any = null
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        throw new Error('Webhook responded with non-JSON payload.')
      }

      setWebhookResponse(parsed)
      const issues = collectValidationIssues(parsed)
      setValidationResult({ valid: issues.length === 0, issues })
      if (issues.length > 0) {
        setWebhookError('Validation failed. Review the highlighted issues below.')
      }
    } catch (err) {
      console.error(err)
      setWebhookError(err instanceof Error ? err.message : 'Unable to deliver the webhook payload. Verify the URL and try again.')
    } finally {
      setWebhookLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2" id="webhook-tester">
      <div className="space-y-1.5">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CodeIcon className="h-4 w-4" />
              </span>
              Webhook Testing Interface
            </CardTitle>
            <CardDescription>
              Encrypt identifiers, ping the SabPaisa status endpoint, then replay the live response to your webhook URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-0">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Environment</p>
              <div className="flex flex-wrap gap-2">
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
                    <Badge className="rounded-full bg-primary/15 text-primary">
                      {env.id === 'sandbox' ? 'Recommended' : 'Live'}
                    </Badge>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{activeEnvironment.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Client Code</Label>
                <Input value={clientCode} onChange={(event) => setClientCode(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Client Transaction ID</Label>
                <Input value={clientTxnId} onChange={(event) => setClientTxnId(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">AES key (base64)</Label>
                <Input value={aesKey} onChange={(event) => setAesKey(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">HMAC key (base64)</Label>
                <Input value={hmacKey} onChange={(event) => setHmacKey(event.target.value)} />
              </div>
            </div>

            {encryptionError && <p className="text-xs text-destructive">{encryptionError}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handleGenerateResponse} disabled={loading}>
                <Play className="mr-2 h-4 w-4" />
                {loading ? 'Processing...' : 'Generate Payload'}
              </Button>
              {error && <span className="text-sm text-destructive">{error}</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {backendSnapshot ? <StatusBadge status={backendSnapshot.status} /> : <StatusPlaceholder />}
              SabPaisa Response
            </CardTitle>
            {backendSnapshot?.responseTime && (
              <CardDescription>Latency observed: {backendSnapshot.responseTime} ms</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {backendSnapshot ? (
              <CodeBlock
                code={JSON.stringify(backendSnapshot.body ?? {}, null, 2)}
                language="json"
                showLineNumbers={false}
                wrapLongLines
                className="rounded-2xl border border-border/60 bg-slate-950/90"
              />
            ) : (
              <p className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Generate a response to inspect the payload returned by the SabPaisa endpoint.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SendHorizontal className="h-4 w-4" />
              Webhook Delivery
            </CardTitle>
            <CardDescription>Forward the same payload to your webhook endpoint once a response is available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Webhook URL</Label>
              <Input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://example.com/webhook" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={handleSendWebhook} disabled={webhookLoading || !backendSnapshot}>
                <SendHorizontal className="mr-2 h-4 w-4" />
                {webhookLoading ? 'Sending...' : 'Send Webhook'}
              </Button>
              {webhookError && <span className="text-sm text-destructive">{webhookError}</span>}
              {!backendSnapshot && <span className="text-xs text-muted-foreground">Generate a response before triggering the webhook.</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Return Response</CardTitle>
            <CardDescription>Displays the JSON returned by your webhook endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            {webhookResponse ? (
              <CodeBlock
                code={JSON.stringify(webhookResponse, null, 2)}
                language="json"
                showLineNumbers={false}
                wrapLongLines
                className="rounded-2xl border border-border/60 bg-slate-950/90"
              />
            ) : (
              <p className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Send the payload to your webhook to inspect the response body here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Result</CardTitle>
            <CardDescription>Confirms whether the webhook reply matches the required schema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationResult ? (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3',
                  validationResult.valid
                    ? 'border-emerald-400/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-200'
                    : 'border-destructive/40 bg-destructive/10 text-destructive'
                )}
              >
                {validationResult.valid ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <div>
                  <p className="text-sm font-semibold">
                    {validationResult.valid ? 'Payload validated successfully.' : 'Validation failed.'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {validationResult.valid
                      ? 'Webhook response matches the expected structure.'
                      : 'Update your webhook response to satisfy the required contract.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Once you send a webhook, validation details will show up here.
              </p>
            )}

            {validationResult && validationResult.issues.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Issues detected</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-destructive">
                  {validationResult.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: number }) => {
  const variant = status >= 200 && status < 300 ? 'success' : 'error'
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
        variant === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
      )}
    >
      {status}
    </span>
  )
}

const StatusPlaceholder = () => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
    --
  </span>
)
