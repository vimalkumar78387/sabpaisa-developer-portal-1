import { NextRequest, NextResponse } from 'next/server'

const envTargets: Record<string, string> = {
  sandbox: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
  staging: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
  production: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
}

const normalizeAssignment = (raw: string) => {
  const match = raw.match(/^[a-zA-Z_$][\w$]*\s*=\s*(.+)$/s)
  return match ? match[1].trim() : raw
}

const stripQuotes = (value: string) => value.replace(/^\s*['"]|['"]\s*$/g, '')

const parseFormBody = (input: string) => {
  const params = new URLSearchParams(stripQuotes(normalizeAssignment(input.trim())))
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    if (key) {
      result[key] = value
    }
  })
  if (Object.keys(result).length === 0) {
    throw new Error('Invalid form payload. Provide key=value pairs separated by & characters.')
  }
  return result
}

const parseJsonBody = (input: string) => {
  const parsed = JSON.parse(normalizeAssignment(input.trim()))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON payload must be an object.')
  }
  return parsed as Record<string, unknown>
}

const toFormString = (payload: Record<string, unknown>) => {
  const params = new URLSearchParams()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.append(key, String(value))
  })
  return params.toString()
}

export async function POST(req: NextRequest) {
  const env = req.nextUrl.searchParams.get('env') ?? 'sandbox'
  const targetUrl = envTargets[env] ?? envTargets.sandbox

  const rawBody = await req.text()
  if (!rawBody.trim()) {
    return NextResponse.json(
      { error: 'Request payload is empty' },
      { status: 400 }
    )
  }

  let parsed: Record<string, unknown>
  const contentType = req.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      parsed = parseJsonBody(rawBody)
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      parsed = parseFormBody(rawBody)
    } else {
      try {
        parsed = parseJsonBody(rawBody)
      } catch {
        parsed = parseFormBody(rawBody)
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to parse request payload.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const formBody = toFormString(parsed)

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html'
      },
      body: formBody,
      redirect: 'follow'
    })

    const html = await upstream.text()
    const upstreamContentType = upstream.headers.get('content-type') ?? 'text/html'

    return new NextResponse(html, {
      status: upstream.status,
      headers: {
        'content-type': upstreamContentType
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach SabPaisa endpoint.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
