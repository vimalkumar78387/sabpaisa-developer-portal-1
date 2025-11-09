'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, Server, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

type RequestParameter = {
  name: string
  type: string
  required: boolean
  description: string
}

type ResponseParameter = {
  name: string
  type: string
  description: string
}

export type IntegrationKitDoc = {
  id: string
  name: string
  overview: {
    purpose: string
    useCases: string[]
    prerequisites: string[]
    setup: string[]
  }
  sampleCodeLink: string
  endpoints: {
    sandbox: string
    production: string
  }
  requestFormat: {
    transport: string
    headers: string[]
    bodyNotes: string[]
  }
  requestParameters: RequestParameter[]
  sampleEncryptedRequest: string
  sampleDecryptedRequest: string
  responseFormat: {
    transport: string
    notes: string[]
  }
  responseParameters: ResponseParameter[]
  sampleEncryptedResponse: string
  sampleDecryptedResponse: string
  integrationVideoLink?: string
}

type IntegrationKitDocsProps = {
  title: string
  description: string
  kits: IntegrationKitDoc[]
  id?: string
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-foreground">{children}</h3>
)

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <SectionHeading>{title}</SectionHeading>
    {children}
  </section>
)

const ParameterTable = ({
  data,
  caption
}: {
  data: Array<RequestParameter | ResponseParameter>
  caption: string
}) => {
  const includeRequiredColumn = data.length > 0 && 'required' in data[0]

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-background/60">
      <table className="w-full text-left text-sm">
        <caption className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {caption}
        </caption>
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium text-foreground">Parameter</th>
            <th className="px-4 py-3 font-medium text-foreground">Type</th>
            {includeRequiredColumn && (
              <th className="px-4 py-3 font-medium text-foreground">Required</th>
            )}
            <th className="px-4 py-3 font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((param) => (
            <tr key={param.name}>
              <td className="px-4 py-3 font-medium text-foreground">{param.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{param.type}</td>
              {includeRequiredColumn && 'required' in param && (
                <td className="px-4 py-3 text-muted-foreground">{param.required ? 'Yes' : 'No'}</td>
              )}
              <td className="px-4 py-3 text-muted-foreground">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CodeBlock = ({
  content,
  language = 'json'
}: {
  content: string
  language?: string
}) => (
  <pre className={cn(
    'overflow-x-auto rounded-2xl border border-border/60 bg-slate-950/90 p-4 text-sm text-slate-100',
    language !== 'text' && 'language-' + language
  )}>
    <code>{content}</code>
  </pre>
)

const getEmbedUrl = (url?: string | null) => {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (host.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const videoId = parsed.searchParams.get('v')
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return url
      }
    }

    return url
  } catch (error) {
    return null
  }
}

const javaFlowSteps = [
  {
    title: 'Collect payer intent',
    description: 'Gather mandatory payer details (name, email, mobile, amount) and generate a unique clientTxnId on your platform.'
  },
  {
    title: 'Encrypt & submit',
    description: 'Concatenate request parameters, encrypt with AES256 + HMAC-SHA384 to produce encData, and POST encData/clientCode to the sandbox or production init URL.'
  },
  {
    title: 'Payer authenticates',
    description: 'SabPaisa renders the hosted checkout where the payer selects a payment option and completes OTP/card/UPI verification.'
  },
  {
    title: 'Gateway processes',
    description: 'SabPaisa routes the transaction, handles bank responses, and issues the final status code with sabpaisaTxnId.'
  },
  {
    title: 'Merchant reconciles',
    description: 'Receive encResponse on callbackUrl, decrypt it, persist the details, and update the order state based on status/statusCode.'
  }
]

type JavaSummaryCard = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: { label: string; href?: string }[]
}

const javaSummaryCards: JavaSummaryCard[] = [
  {
    title: 'Environment readiness',
    icon: Server,
    items: [
      { label: 'Sandbox: https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Production: https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1', href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Generate a unique clientTxnId for every attempt' }
    ]
  },
  {
    title: 'SabPaisa coordination',
    icon: ShieldCheck,
    items: [
      { label: 'Request seamless flag enablement from SabPaisa backend team' },
      { label: 'Securely store clientCode, authKey/authIV, transaction username & password' },
      { label: 'Complete UAT cycle before switching to live credentials' }
    ]
  }
]

type FlowListItem = {
  title: string
  description?: string
}

const FlowList = ({ items }: { items: FlowListItem[] }) => (
  <ol className="space-y-4">
    {items.map((item, index) => (
      <li
        key={`${item.title}-${index}`}
        className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      </li>
    ))}
  </ol>
)

const KitSections = ({ kit }: { kit: IntegrationKitDoc }) => {
  const [isOnline, setIsOnline] = useState(true)
  const suppressMedia = kit.id === 'transaction-enquiry' || kit.id === 'refund'
  const embedUrl = suppressMedia ? null : getEmbedUrl(kit.integrationVideoLink)
  const hideSampleLink = suppressMedia
  const showSampleLink = Boolean(kit.sampleCodeLink) && !hideSampleLink

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateStatus = () => setIsOnline(window.navigator.onLine)
    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return (
    <div className="space-y-8 text-sm leading-6 text-muted-foreground">
      <SubSection title="Overview of the Integration Process">
        <p className="text-base text-foreground">{kit.overview.purpose}</p>
      </SubSection>

      {embedUrl && (
        <SubSection title="Integration walkthrough">
          <div className="space-y-4">
            {!isOnline && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Video playback requires connectivity</p>
                  <p>If streaming is blocked, open the walkthrough directly on YouTube.</p>
                  {kit.integrationVideoLink && (
                    <Link href={kit.integrationVideoLink} target="_blank" className="text-primary hover:underline">
                      Watch on YouTube
                    </Link>
                  )}
                </div>
              </div>
            )}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-lg pt-[56.25%]">
              <iframe
                src={embedUrl}
                title={`${kit.name} integration walkthrough`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-2xl"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </SubSection>
      )}

      {kit.id === 'java' ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {javaSummaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <card.icon className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-semibold">{card.title}</h4>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {card.items.map((item) =>
                    item.href ? (
                      <li key={item.label}>
                        <Link href={item.href} target="_blank" className="text-primary hover:underline">
                          {item.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={item.label}>{item.label}</li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <SubSection title="Prerequisites">
            <FlowList items={kit.overview.prerequisites.map((title) => ({ title }))} />
          </SubSection>

          <SubSection title="Setup outline">
            <FlowList items={kit.overview.setup.map((title) => ({ title }))} />
          </SubSection>

          <SubSection title="Integration flow">
            <FlowList items={javaFlowSteps} />
          </SubSection>
        </div>
      ) : (
        <div className="grid gap-6 pt-2 md:grid-cols-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Typical use cases</h4>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {kit.overview.useCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prerequisites</h4>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {kit.overview.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Setup outline</h4>
            <ul className="mt-2 list-decimal space-y-1 pl-4">
              {kit.overview.setup.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showSampleLink && (
        <SubSection title="Sample code link">
          <Link
            href={kit.sampleCodeLink}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
          >
            View reference implementation
          </Link>
        </SubSection>
      )}

      <SubSection title="Production and Live URL">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sandbox</p>
            <code className="mt-2 block break-all text-foreground">{kit.endpoints.sandbox}</code>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Production</p>
            <code className="mt-2 block break-all text-foreground">{kit.endpoints.production}</code>
          </div>
        </div>
      </SubSection>

      <SubSection title="Request Format">
        <div className="space-y-3 text-sm">
          <p className="text-foreground">{kit.requestFormat.transport}</p>
          {kit.requestFormat.headers.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Headers</h5>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {kit.requestFormat.headers.map((header) => (
                  <li key={header}>{header}</li>
                ))}
              </ul>
            </div>
          )}
          {kit.requestFormat.bodyNotes.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Body structure</h5>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {kit.requestFormat.bodyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SubSection>

      <SubSection title="Table of Request Parameters">
        <ParameterTable data={kit.requestParameters} caption="API request parameters" />
      </SubSection>

      <SubSection title="Sample Encrypted Request">
        <CodeBlock content={kit.sampleEncryptedRequest} language="text" />
      </SubSection>

      <SubSection title="Sample Decrypted Request">
        <CodeBlock content={kit.sampleDecryptedRequest} language="json" />
      </SubSection>

      <SubSection title="Response Format">
        <div className="space-y-3 text-sm">
          <p className="text-foreground">{kit.responseFormat.transport}</p>
          {kit.responseFormat.notes.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {kit.responseFormat.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </SubSection>

      <SubSection title="Table of Response Parameters">
        <ParameterTable data={kit.responseParameters} caption="Gateway response parameters" />
      </SubSection>

      <SubSection title="Sample Encrypted Response">
        <CodeBlock content={kit.sampleEncryptedResponse} language="text" />
      </SubSection>

      <SubSection title="Sample Decrypted Response">
        <CodeBlock content={kit.sampleDecryptedResponse} language="json" />
      </SubSection>
    </div>
  )
}
export function IntegrationKitDocContent({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <article className="space-y-8 rounded-3xl border border-border/60 bg-background/80 p-8 shadow-lg backdrop-blur">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{kit.name}</h2>
      </header>
      <KitSections kit={kit} />
    </article>
  )
}

export function IntegrationKitDocs({ title, description, kits, id }: IntegrationKitDocsProps) {
  return (
    <div className="space-y-10" id={id}>
      <header className="space-y-3 scroll-mt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
          Integration playbook
        </p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base text-muted-foreground">{description}</p>
      </header>

      <div className="space-y-6">
        {kits.map((kit) => (
          <details
            key={kit.id}
            className="group rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 text-left text-lg font-semibold text-foreground">
              <span>{kit.name}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground transition group-open:text-primary">
                {`View details`}
              </span>
            </summary>

            <div className="mt-6">
              <KitSections kit={kit} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
