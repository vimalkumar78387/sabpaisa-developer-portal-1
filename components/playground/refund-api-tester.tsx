'use client'

import { useMemo, useState } from 'react'
import { AES256HMACSHA384HEX } from '@/lib/aes256-hmac'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Copy, CheckCircle, AlertCircle, Clock, Globe, History, Code } from 'lucide-react'

type EnvironmentId = 'stage' | 'production'

interface ApiResponseRecord {
  status: number
  headers: Record<string, string>
  data: any
  rawBody: string
  timestamp: string
  responseTime?: number
}

interface HistoryEntry {
  id: string
  status: number
  timestamp: string
  environment: string
  requestUrl: string
}

const environments = [
  {
    id: 'stage',
    label: 'Stage',
    baseUrl: 'https://stage-gateway.sabpaisa.in/sabpaisa',
    description: 'Stage gateway for refund initiation and status validation.'
  },
  {
    id: 'production',
    label: 'Production',
    baseUrl: 'https://gateway.sabpaisa.in/sabpaisa',
    description: 'Live gateway for production refunds. Use only with live credentials.'
  }
] as const

export function RefundApiTester() {
  const [environmentId, setEnvironmentId] = useState<EnvironmentId>('production')
  const [clientCode, setClientCode] = useState('SPPT1')
  const [amount, setAmount] = useState('1.0')
  const [spTxnId, setSpTxnId] = useState('171600409251130529')
  const [clientTxnId, setClientTxnId] = useState('TESTING040925115251953')
  const [message, setMessage] = useState('I want my money refunded.')

  const [aesKey, setAesKey] = useState('')
  const [hmacKey, setHmacKey] = useState('')

  const [encryptedRefundQuery, setEncryptedRefundQuery] = useState('')
  const [requestPayload, setRequestPayload] = useState(
    JSON.stringify(
      {
        clientCode: 'SPPT1',
        refundQuery:
          'CA8DDB1318137F8427836951F43B905924611681BFE15D7C37D96D55FA0374C9F6FC44ABE4808D0C64C6E34877195CAF27522502519E77CD3430634ACD14A2E105D193CEC2DF1E556AD9257D4540152371955F562D5773B5DAAC36A639432DFB0F8DC3FB0CFCDDF5C90F8B1ECB17F99165FE4A6EB9CF510436F4318A5C00BAE89E3082EEC782E20B73AC4E738C968A53F9362BAA53B7D03CBC627230AE354A073A7E88B62C6C5DE07379B8485A1BC3D7863763FF66B5CDF9848C8BF994E2C9F108376E85E3DC38'
      },
      null,
      2
    )
  )
  const [response, setResponse] = useState<ApiResponseRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const [encryptionError, setEncryptionError] = useState<string | null>(null)
  const [decryptionError, setDecryptionError] = useState<string | null>(null)
  const [decryptedResponse, setDecryptedResponse] = useState<string | null>(null)
  const [decryptedStatus, setDecryptedStatus] = useState<string | null>(null)

  const activeEnvironment = environments.find((item) => item.id === environmentId) ?? environments[0]
  const requestUrl = `${activeEnvironment.baseUrl.replace(/\/$/, '')}/refund`
  const proxyPath = `/api/refund/${environmentId}`

  const plainRefundString = useMemo(
    () =>
      `clientCode=${clientCode}&amount=${amount}&spTxnId=${spTxnId}&clientTxnId=${clientTxnId}&message=${message}`,
    [clientCode, amount, spTxnId, clientTxnId, message]
  )

  const timelineSteps = useMemo(() => {
    if (!response) return []
    return [
      {
        label: 'Request dispatched',
        detail: `POST ${requestUrl}`,
        state: 'done' as const
      },
      {
        label: response.status >= 400 ? 'Error surfaced' : 'Response delivered',
        detail: `Status ${response.status}`,
        state: response.status >= 400 ? ('error' as const) : ('done' as const)
      },
      ...(response.responseTime
        ? [
            {
              label: 'Latency observed',
              detail: `${response.responseTime} ms overall`,
              state: 'info' as const
            }
          ]
        : [])
    ]
  }, [response, requestUrl])

  const curlCommand = useMemo(() => {
    const payload = requestPayload.replace(/\s+/g, ' ').trim()
    return `curl -X POST \\\n  '${requestUrl}' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Accept: application/json' \\\n  -d '${payload}'`
  }, [requestPayload, requestUrl])

  const handleEncryptRefund = async () => {
    const trimmedAesKey = aesKey.trim()
    const trimmedHmacKey = hmacKey.trim()

    if (!clientCode || !amount || !spTxnId || !clientTxnId || !message) {
      setEncryptionError('All refund fields are required before encryption.')
      return
    }
    if (!trimmedAesKey || !trimmedHmacKey) {
      setEncryptionError('Provide both AES and HMAC base64 keys.')
      return
    }
    setEncryptionError(null)
    try {
      const cipher = await AES256HMACSHA384HEX.encrypt(trimmedAesKey, trimmedHmacKey, plainRefundString)
      setEncryptedRefundQuery(cipher)
      setAesKey(trimmedAesKey)
      setHmacKey(trimmedHmacKey)
      setDecryptedResponse(null)
      setDecryptionError(null)
      setDecryptedStatus(null)
      setRequestPayload(
        JSON.stringify(
          {
            clientCode,
            refundQuery: cipher
          },
          null,
          2
        )
      )
    } catch (err) {
      console.error(err)
      setEncryptionError('Unable to encrypt refund payload. Verify keys and inputs.')
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const parsedBody = JSON.parse(requestPayload)
      const startedAt = performance.now()
      const fetchResponse = await fetch(proxyPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(parsedBody)
      })

      const responseText = await fetchResponse.text()
      let responseData: any = null
      try {
        responseData = responseText ? JSON.parse(responseText) : null
      } catch {
        responseData = { raw: responseText }
      }
      const headersObject = Object.fromEntries(fetchResponse.headers.entries())
      const duration = Math.round(performance.now() - startedAt)
      const record: ApiResponseRecord = {
        status: fetchResponse.status,
        data: responseData,
        rawBody: responseText,
        headers: headersObject,
        timestamp: new Date().toISOString(),
        responseTime: duration
      }
      setResponse(record)
      setHistory((prev) => [
        {
          id: `req_${Date.now()}`,
          status: record.status,
          timestamp: record.timestamp,
          environment: activeEnvironment.label,
          requestUrl
        },
        ...prev
      ].slice(0, 6))
    } catch (err) {
      console.error('Refund tester error:', err)
      const message =
        err instanceof Error ? err.message : 'Something went wrong while processing the refund request.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDecryptResponse = async () => {
    const trimmedAesKey = aesKey.trim()
    const trimmedHmacKey = hmacKey.trim()

    if (!trimmedAesKey || !trimmedHmacKey) {
      setDecryptionError('Provide the same AES and HMAC base64 keys used for encryption.')
      return
    }
    const encrypted =
      response?.data?.refundResponse ?? response?.refundResponse ?? response?.data?.data?.refundResponse
    if (!encrypted) {
      setDecryptionError('No refundResponse found in the latest response.')
      return
    }
    setDecryptionError(null)
    try {
      const plain = await AES256HMACSHA384HEX.decrypt(trimmedAesKey, trimmedHmacKey, encrypted)
      let formatted = plain
      let statusValue: string | null = null
      try {
        const parsed = JSON.parse(plain)
        formatted = JSON.stringify(parsed, null, 2)
        if (typeof parsed.status === 'string') {
          statusValue = parsed.status.toUpperCase()
        }
      } catch {
        statusValue =
          plain
            .split('&')
            .find((segment) => segment.toLowerCase().startsWith('status='))?.split('=')[1]
            ?.toUpperCase() ?? null
      }
      setDecryptedResponse(formatted)
      setDecryptedStatus(statusValue)
    } catch (err) {
      console.error(err)
      setDecryptionError('Unable to decrypt refund response. Check your keys and ciphertext.')
      setDecryptedStatus(null)
    }
  }

  const clearResults = () => {
    setResponse(null)
    setError(null)
    setDecryptedResponse(null)
    setDecryptionError(null)
    setEncryptedRefundQuery('')
    setDecryptedStatus(null)
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        // no-op
      })
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Refund API Request
            </CardTitle>
            <CardDescription className="space-y-3">
              <p>Encrypt refund payloads and test the refund initiation endpoint end-to-end.</p>
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
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{activeEnvironment.description}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-primary">Refund payload helper</h3>
                  <p className="text-xs text-muted-foreground">
                    Generate the encrypted refund query before calling the refund endpoint.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleEncryptRefund}>
                  <Play className="mr-2 h-4 w-4" />
                  Encrypt &amp; build payload
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Client code</Label>
                  <Input value={clientCode} onChange={(event) => setClientCode(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Amount</Label>
                  <Input value={amount} onChange={(event) => setAmount(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">SabPaisa transaction ID</Label>
                  <Input value={spTxnId} onChange={(event) => setSpTxnId(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Client transaction ID</Label>
                  <Input value={clientTxnId} onChange={(event) => setClientTxnId(event.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Message</Label>
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={2} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">Plain string</Label>
                <div className="max-h-48 overflow-x-auto rounded-lg border border-border/50">
                  <CodeBlock
                    code={plainRefundString}
                    language="text"
                    showLineNumbers={false}
                  />
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

              {encryptedRefundQuery ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase text-muted-foreground">refundQuery</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(encryptedRefundQuery)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CodeBlock code={encryptedRefundQuery} language="text" showLineNumbers={false} />
                  <p className="text-xs text-muted-foreground italic">
                    Next step: Click <span className="font-medium text-primary">Encrypt &amp; build payload</span>{' '}
                    whenever you need a fresh <code>refundQuery</code> for a new refund request.
                  </p>
                </div>
              ) : (
                !encryptionError && (
                  <p className="text-xs text-muted-foreground italic">
                    Click <span className="font-medium text-primary">Encrypt &amp; build payload</span> to generate{' '}
                    <code>refundQuery</code> for your request.
                  </p>
                )
              )}
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Endpoint:</span>{' '}
                <code className="text-[11px] sm:text-xs">{requestUrl}</code>
              </div>
              <Label className="text-sm font-medium text-foreground">Request body</Label>
              <Textarea
                value={requestPayload}
                onChange={(event) => setRequestPayload(event.target.value)}
                rows={8}
                spellCheck={false}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleTest} disabled={loading}>
                {loading ? 'Sending...' : 'Test refund API'}
              </Button>
              {(response || error) && (
                <Button type="button" variant="outline" onClick={clearResults} disabled={loading}>
                  Clear
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {response ? (
                response.status >= 200 && response.status < 300 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )
              ) : (
                <Clock className="h-5 w-5" />
              )}
              Refund API Response
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
                  <span className="text-muted-foreground">{response.responseTime}ms</span>
                )}
                <span className="text-muted-foreground">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!response && !error && (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Click &ldquo;Test refund API&rdquo; to view live responses.</p>
              </div>
            )}

            {response && (
              <Tabs defaultValue="response" className="w-full">
                <TabsList>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="response" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Response body</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(response.data ?? {}, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CodeBlock
                    code={JSON.stringify(response.data ?? {}, null, 2)}
                    language="json"
                    showLineNumbers={false}
                    wrapLongLines
                  />
                </TabsContent>
                <TabsContent value="headers" className="space-y-4">
                  <CodeBlock
                    code={JSON.stringify(response.headers ?? {}, null, 2)}
                    language="json"
                    showLineNumbers={false}
                    wrapLongLines
                  />
                </TabsContent>
                <TabsContent value="curl" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">cURL command</h4>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(curlCommand)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <CodeBlock code={curlCommand} language="bash" showLineNumbers={false} wrapLongLines />
                </TabsContent>
                <TabsContent value="timeline" className="space-y-3">
                  <ol className="space-y-3">
                    {timelineSteps.map((step, index) => {
                      const isError = step.state === 'error'
                      const isDone = step.state === 'done'
                      const Icon = isDone ? CheckCircle : isError ? AlertCircle : Clock
                      return (
                        <li
                          key={`${step.label}-${index}`}
                          className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                        >
                          <span
                            className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                              isDone
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : isError
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
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
            )}

            {error && !response && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {response && (
              <div className="mt-6 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Decrypt refundResponse</h4>
                    <p className="text-xs text-muted-foreground">
                      Use the same AES and HMAC keys to decrypt and review refund status details.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDecryptResponse}>
                    <Play className="mr-2 h-4 w-4" />
                    Decrypt response
                  </Button>
                </div>
                {decryptionError && <p className="text-xs text-destructive">{decryptionError}</p>}
                {decryptedResponse && (
                  <CodeBlock
                    code={decryptedResponse}
                    language="json"
                    showLineNumbers={false}
                    wrapLongLines
                  />
                )}
                {decryptedStatus && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Refund status:&nbsp;</span>
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
                Recent refund requests
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
                      <div className="text-xs uppercase text-muted-foreground">{item.environment}</div>
                      <div className="truncate text-sm font-medium text-foreground">{item.requestUrl}</div>
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
