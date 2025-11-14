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

const VideoEmbed = ({ url, title }: { url?: string; title: string }) => {
  if (!url) return null
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-lg pt-[56.25%]">
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full rounded-2xl"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}

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

const phpFlowSteps = [
  {
    title: 'Capture payer details',
    description: 'Merchant form gathers mandatory fields (payerName, payerEmail, payerMobile, amount) and generates a unique clientTxnId.'
  },
  {
    title: 'Encrypt request payload',
    description: 'PHP runtime concatenates parameters into key=value pairs, encrypts with AES256 HMAC-SHA384, and produces encData.'
  },
  {
    title: 'Submit to SabPaisa',
    description: 'POST encData + clientCode to the staging or production sabPaisaInit URL using application/x-www-form-urlencoded.'
  },
  {
    title: 'Hosted checkout',
    description: 'SabPaisa renders payment options, handles OTP/card/UPI verification, and debits the payer upon success.'
  },
  {
    title: 'Decrypt callback',
    description: 'Merchant receives encResponse on callbackUrl, decrypts it, and updates order status using status/statusCode and sabpaisaTxnId.'
  }
]

const nodeFlowSteps = [
  {
    title: 'Gather inputs server-side',
    description: 'Node.js controller collects mandatory payer fields and produces a fresh clientTxnId.'
  },
  {
    title: 'Build & encrypt payload',
    description: 'Concatenate key=value pairs, then encrypt with AES256 + HMAC-SHA384 helpers to derive encData.'
  },
  {
    title: 'Send HTTPS form POST',
    description: 'Submit encData and clientCode to the sabPaisaInit sandbox/live URL using application/x-www-form-urlencoded.'
  },
  {
    title: 'Hosted checkout & auth',
    description: 'SabPaisa renders payment UI where the payer completes OTP/card/UPI verification.'
  },
  {
    title: 'Process callback',
    description: 'Callback endpoint receives encResponse, decrypts it, and reconciles status/statusCode plus sabpaisaTxnId.'
  }
]

const laravelFlowSteps = [
  {
    title: 'Capture payer data',
    description: 'Laravel form gathers payerName, payerEmail, payerMobile, amount, and generates a unique clientTxnId.'
  },
  {
    title: 'Assemble encData string',
    description: 'Create the key=value& pairs in the documented order, then encrypt with AES-256-GCM + HMAC-SHA384 to produce HEX encData.'
  },
  {
    title: 'POST to SabPaisa',
    description: 'Submit encData and clientCode to the sabPaisaInit sandbox/live endpoint via Blade form or controller using application/x-www-form-urlencoded.'
  },
  {
    title: 'Customer completes checkout',
    description: 'SabPaisa hosts the payment UI where the payer authenticates using OTP/card/UPI and finishes the transaction.'
  },
  {
    title: 'Decrypt callback & update order',
    description: 'Callback route receives encResponse, decrypts it, reconciles status/statusCode, and renders the final response page.'
  }
]

const reactFlowSteps = [
  {
    title: 'Install sabpaisa-pg-dev',
    description: 'Add the sabpaisa-pg-dev package (npm install sabpaisa-pg-dev) and create a wrapper component.'
  },
  {
    title: 'Prepare form props',
    description: 'Load clientCode, trans credentials, authKey/authIV, callbackUrl, payer info, amount, and clientTxnId from secure config/state.'
  },
  {
    title: 'Render PaymentForm',
    description: 'Pass the props plus env (stag/prod) and sabPaisa init URL to PaymentForm so it can post encData + clientCode.'
  },
  {
    title: 'Customer completes checkout',
    description: 'SabPaisa hosts the payment UI, handles OTP/card/UPI and redirects back after payment.'
  },
  {
    title: 'Handle callbackFunction',
    description: 'React callback receives the response object; display status, notify backend, and refresh UI state.'
  }
]

const angularFlowSteps = [
  {
    title: 'Install sabpaisa-pg-sdk',
    description: 'Add the SDK (npm install sabpaisa-pg-sdk) and configure environment.ts with SabPaisa credentials.'
  },
  {
    title: 'Wire payment form',
    description: 'Create PaymentFormComponent that binds payer info, amount, channelId (npm), clientTxnId, callbackUrl, and env.'
  },
  {
    title: 'Call submitPaymentForm',
    description: 'Invoke submitPaymentForm(formState) to encrypt and redirect the payer to SabPaisa hosted checkout.'
  },
  {
    title: 'Handle redirect/callback',
    description: 'SabPaisa returns to /response with encResponse; capture it in ResponsePageComponent.'
  },
  {
    title: 'Decrypt with parsePaymentResponse',
    description: 'Use parsePaymentResponse(authKey, authIV) to render key/value pairs and update backend records.'
  }
]

const flutterFlowSteps = [
  {
    title: 'Install the SDK',
    description: 'Add sabpaisa_flutter:^0.2.2 to pubspec.yaml and run flutter packages get.'
  },
  {
    title: 'Configure Android',
    description: 'Set minSdkVersion ≥ 19, optionally add Proguard rules, then run flutter clean && flutter pub get.'
  },
  {
    title: 'Configure iOS',
    description: 'Update Podfile to platform :ios, \"10.0\", enable Bitcode/Swift 5, ensure use_frameworks!, and run pod install.'
  },
  {
    title: 'Wire the SabPaisa instance',
    description: 'Import sabpaisa_flutter, instantiate SabPaisa(), register EVENT_PAYMENT_SUCCESS / EVENT_PAYMENT_ERROR handlers, and build the payment options map.'
  },
  {
    title: 'Open checkout & handle callbacks',
    description: 'Call sabPaisa.open(options); use the event payload (TransactionResponsesModel) to update UI/order state or retry on failure.'
  }
]

const reactNativeFlowSteps: FlowListItem[] = [
  {
    title: 'Install the library',
    description: 'Add sabpaisa-react-lib-lite (plus @types) and install the specified peer dependencies.'
  },
  {
    title: 'Configure platforms',
    description: 'Use auto-linking on RN ≥ 0.60 or run react-native link; run pod install for iOS and reopen the workspace.'
  },
  {
    title: 'Prepare payment options',
    description: 'Populate the options map with payer details, merchant credentials, txn_id, amount, and callback URL.'
  },
  {
    title: 'Trigger checkout',
    description: 'Call SabPaisaCheckout.open(options) from your component.'
  },
  {
    title: 'Handle results',
    description: 'Resolve the promise to show success/failure alerts and update your backend.'
  }
]

type SummaryCard = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: { label: string; href?: string }[]
}

const javaSummaryCards: SummaryCard[] = [
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

const phpSummaryCards: SummaryCard[] = [
  {
    title: 'Runtime checklist',
    icon: Server,
    items: [
      {
        label: 'Sandbox: https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      {
        label: 'Production: https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      { label: 'POST only encData + clientCode via application/x-www-form-urlencoded' }
    ]
  },
  {
    title: 'SabPaisa coordination',
    icon: ShieldCheck,
    items: [
      { label: 'Request seamless flag enablement from SabPaisa support' },
      { label: 'Securely store clientCode, authKey/authIV, transaction username/password, and callbackUrl' },
      { label: 'Ensure callbackUrl is HTTPS and publicly reachable for encResponse' }
    ]
  }
]

const nodeSummaryCards: SummaryCard[] = [
  {
    title: 'Server runtime basics',
    icon: Server,
    items: [
      {
        label: 'Sandbox: https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      {
        label: 'Production: https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      { label: 'POST encData + clientCode using fetch/axios with application/x-www-form-urlencoded' }
    ]
  },
  {
    title: 'Operational coordination',
    icon: ShieldCheck,
    items: [
      { label: 'Ensure SabPaisa seamless flag + UAT credentials are active for your merchant code' },
      { label: 'Store clientCode, authKey/authIV, transUserName/password securely (dotenv/secret manager)' },
      { label: 'Expose HTTPS callbackUrl so SabPaisa can POST encResponse back to Node.js' }
    ]
  }
]

const laravelSummaryCards: SummaryCard[] = [
  {
    title: 'Runtime checklist',
    icon: Server,
    items: [
      {
        label: 'Sandbox: https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      {
        label: 'Production: https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
        href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      },
      { label: 'Use Blade form or controller POST with @csrf and send only encData + clientCode' }
    ]
  },
  {
    title: 'SabPaisa coordination',
    icon: ShieldCheck,
    items: [
      { label: 'Ensure SabPaisa enables seamless flag and shares client code, authKey, authIV, username, password' },
      { label: 'Store credentials in .env or secret manager; never expose to the browser' },
      { label: 'Callback route must be public HTTPS so SabPaisa can POST encResponse' }
    ]
  }
]

const reactSummaryCards: SummaryCard[] = [
  {
    title: 'App prerequisites',
    icon: Server,
    items: [
      { label: 'Install: npm install sabpaisa-pg-dev' },
      { label: 'Staging init URL: https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Production init URL: https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1', href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' }
    ]
  },
  {
    title: 'Credential hygiene',
    icon: ShieldCheck,
    items: [
      { label: 'Keep clientCode, authKey, authIV, trans credentials in env/secure storage' },
      { label: 'Use env="stag" for testing and env="prod" for live traffic' },
      { label: 'Ensure callbackUrl is HTTPS so SabPaisa can POST encResponse' }
    ]
  }
]

const angularSummaryCards: SummaryCard[] = [
  {
    title: 'Workspace checklist',
    icon: Server,
    items: [
      { label: 'Node 20.19.0 + npm 10+' },
      { label: 'Install: npm install sabpaisa-pg-sdk' },
      { label: 'Sandbox init URL', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' }
    ]
  },
  {
    title: 'Credential hygiene',
    icon: ShieldCheck,
    items: [
      { label: 'Keep clientCode/trans creds/authKey/authIV in environment.ts' },
      { label: 'Expose HTTPS callback route (e.g., /response)' },
      { label: 'Switch env prop between STAG and PROD as you deploy' }
    ]
  }
]

const flutterSummaryCards: SummaryCard[] = [
  {
    title: 'App prerequisites',
    icon: Server,
    items: [
      { label: 'Flutter SDK with Android (API 19+) and iOS (10.0+) toolchains ready' },
      { label: 'Staging init URL', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Production init URL', href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' }
    ]
  },
  {
    title: 'SabPaisa configuration',
    icon: ShieldCheck,
    items: [
      { label: 'Keep client_code, user_name, password, aes_key, aes_iv in secure storage' },
      { label: 'Register SDK event listeners before calling sabPaisa.open' },
      { label: 'Ensure callback_url is HTTPS and reachable for encResponse' }
    ]
  }
]
const reactNativeSummaryCards: SummaryCard[] = [
  {
    title: 'Project prerequisites',
    icon: Server,
    items: [
      { label: 'React Native 0.60+ project (auto-linking ready)' },
      { label: 'Node.js v14+ with npm or yarn installed' },
      { label: 'SabPaisa merchant credentials (client code, auth key, auth IV, username, password)' }
    ]
  },
  {
    title: 'SabPaisa configuration',
    icon: ShieldCheck,
    items: [
      { label: 'Keep credentials in secure storage; never hardcode in JS bundles' },
      { label: 'Ensure callback_url is HTTPS and reachable for encResponse' },
      { label: 'Use staging init URL for testing before switching to live' }
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

function FlutterCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6">
      <SubSection title="Integration walkthrough">
        <VideoEmbed url="https://youtu.be/sRHGb6nd8Rg?si=lUsKFoHpQN3Mhbjg" title="Flutter integration walkthrough" />
      </SubSection>

      {summaryCardsByKit.flutter && (
        <div className="grid gap-4 md:grid-cols-2">
          {summaryCardsByKit.flutter!.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link href={item.href} target="_blank" className="text-primary hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <SubSection title="Reference code">
        <div className="overflow-hidden rounded-2xl border border-border/60 text-sm">
          <div className="divide-y divide-border/60">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Reference Code</span>
              <Link href={kit.sampleCodeLink} target="_blank" className="text-primary hover:underline">
                Open Sample Code
              </Link>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Staging URL</span>
              <code className="break-all text-muted-foreground">{kit.endpoints.sandbox}</code>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Live URL</span>
              <code className="break-all text-muted-foreground">{kit.endpoints.production}</code>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Pre-requisite steps for integration">
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {flutterPrerequisites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SubSection>

      <SubSection title="Installation">
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          {flutterInstallationSteps.map((step) => (
            <li key={step.title}>
              <p className="text-foreground">{step.title}</p>
              {step.code && <CodeBlock content={step.code} language="text" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Android Configuration">
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          {flutterAndroidSteps.map((step) => (
            <li key={step.title}>
              <p className="text-foreground">{step.title}</p>
              {step.code && <CodeBlock content={step.code} language="text" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="iOS Configuration">
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          {flutterIosSteps.map((step) => (
            <li key={step.title}>
              <p className="text-foreground">{step.title}</p>
              {step.code && <CodeBlock content={step.code} language="text" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Usage">
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          {flutterUsageSteps.map((step) => (
            <li key={step.title}>
              <p className="text-foreground">{step.title}</p>
              {step.code && <CodeBlock content={step.code} language="dart" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Table of parameters to be used in request">
        <ParameterTable data={kit.requestParameters} caption="SabPaisa request parameters" />
      </SubSection>

      <SubSection title="Response Parameter Table">
        <ParameterTable data={kit.responseParameters} caption="SabPaisa response parameters" />
      </SubSection>

      <SubSection title="Troubleshooting">
        <ul className="space-y-3 text-sm">
          {flutterTroubleshooting.map((item) => (
            <li key={item.title}>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </SubSection>
    </div>
  )
}

function ReactNativeCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <p className="text-foreground">{reactNativeIntroduction}</p>
      </SubSection>

      <SubSection title="Integration walkthrough">
        <VideoEmbed url="https://youtu.be/DcgbV7Xi-3g?si=uLO-yCgO6jTGtIOV" title="React Native integration walkthrough" />
      </SubSection>

      {summaryCardsByKit['react-native'] && (
        <div className="grid gap-4 md:grid-cols-2">
          {summaryCardsByKit['react-native']!.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link href={item.href} target="_blank" className="text-primary hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <SubSection title="Reference code">
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <div className="divide-y divide-border/60">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Reference Code</span>
              <Link href={kit.sampleCodeLink} target="_blank" className="text-primary hover:underline">
                Open Sample Code
              </Link>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Staging URL</span>
              <code className="break-all text-muted-foreground">{kit.endpoints.sandbox}</code>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Live URL</span>
              <code className="break-all text-muted-foreground">{kit.endpoints.production}</code>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Pre-requisites">
        <ol className="list-decimal space-y-2 pl-5">
          {reactNativePrerequisites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Installation">
        <ol className="list-decimal space-y-3 pl-5">
          {reactNativeInstallationSteps.map((step) => (
            <li key={step.title}>
              <p className="text-foreground">{step.title}</p>
              {step.code && <CodeBlock content={step.code} language="bash" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="⚙️ Platform-Specific Setup">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">Android Setup</h4>
            <ul className="mt-2 space-y-2">
              {reactNativeAndroidSteps.map((step) => (
                <li key={step.title}>
                  <p className="font-medium text-foreground">{step.title}</p>
                  {step.description && <p className="text-muted-foreground">{step.description}</p>}
                  {step.code && <CodeBlock content={step.code} language="bash" />}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">iOS Setup</h4>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              {reactNativeIosSteps.map((step) => (
                <li key={step.title}>
                  <p className="text-foreground">{step.title}</p>
                  {step.description && <p className="text-muted-foreground">{step.description}</p>}
                  {step.code && <CodeBlock content={step.code} language="bash" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SubSection>

      <SubSection title="Implementation">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground">1. Import the library</p>
            <CodeBlock content={reactNativeImportSnippet} language="tsx" />
          </div>
          <div>
            <p className="font-semibold text-foreground">2. Configure payment options</p>
            <CodeBlock content={reactNativeOptionsSnippet} language="tsx" />
          </div>
          <div>
            <p className="font-semibold text-foreground">3. Handle checkout promise</p>
            <CodeBlock content={reactNativeButtonSnippet} language="tsx" />
          </div>
          <div>
            <p className="font-semibold text-foreground">4. Trigger payment on button click</p>
            <CodeBlock content={reactNativeComponentSnippet} language="tsx" />
          </div>
        </div>
      </SubSection>

      <SubSection title="Parameters to be used in request">
        <ParameterTable data={kit.requestParameters} caption="SabPaisa request parameters" />
      </SubSection>

      <SubSection title="Response Parameter Table">
        <ParameterTable data={kit.responseParameters} caption="SabPaisa response parameters" />
      </SubSection>

      <SubSection title="⚠️ Troubleshooting">
        <ul className="space-y-3">
          {reactNativeTroubleshooting.map((item) => (
            <li key={item.title}>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </SubSection>
    </div>
  )
}
const KitSections = ({ kit }: { kit: IntegrationKitDoc }) => {
  const [isOnline, setIsOnline] = useState(true)
  const suppressMedia =
    kit.id === 'transaction-enquiry' || kit.id === 'refund' || customVideoKits.has(kit.id)
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

  const summaryCards = summaryCardsByKit[kit.id] ?? []
  const integrationFlow = integrationFlowByKit[kit.id]
  const isEnhancedKit = enhancedKits.has(kit.id)
  const sampleTitles = sampleSectionTitleMap[kit.id] ?? sampleSectionTitleMap.default

  if (kit.id === 'react-native') {
    return <ReactNativeCustomSections kit={kit} />
  }

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

      {kit.id === 'flutter' ? (
        <FlutterCustomSections kit={kit} />
      ) : isEnhancedKit ? (
        <div className="space-y-6">
          {summaryCards.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {summaryCards.map((card) => (
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
          )}

          <SubSection title="Prerequisites">
            <FlowList items={kit.overview.prerequisites.map((title) => ({ title }))} />
          </SubSection>

          <SubSection title="Setup outline">
            <FlowList items={kit.overview.setup.map((title) => ({ title }))} />
          </SubSection>

          {integrationFlow?.length ? (
            <SubSection title="Integration flow">
              <FlowList items={integrationFlow} />
            </SubSection>
          ) : null}
        </div>
      ) : (
        (() => {
          const fallbackSections = []
          if (kit.overview.useCases.length > 0) {
            fallbackSections.push({
              title: 'Typical use cases',
              items: kit.overview.useCases,
              listClass: 'list-disc'
            })
          }
          fallbackSections.push({
            title: 'Prerequisites',
            items: kit.overview.prerequisites,
            listClass: 'list-disc'
          })
          fallbackSections.push({
            title: 'Setup outline',
            items: kit.overview.setup,
            listClass: 'list-decimal'
          })

          const gridColumns =
            fallbackSections.length >= 3
              ? 'md:grid-cols-3'
              : fallbackSections.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-1'

          return (
            <div className={`grid gap-6 pt-2 ${gridColumns}`}>
              {fallbackSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </h4>
                  <ul className={`mt-2 ${section.listClass} space-y-1 pl-4`}>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        })()
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

      {!hideFormatSections.has(kit.id) && (
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
      )}

      <SubSection title="Table of Request Parameters">
        <ParameterTable data={kit.requestParameters} caption="API request parameters" />
      </SubSection>

      <SubSection title={sampleTitles.requestEncrypted}>
        <CodeBlock content={kit.sampleEncryptedRequest} language="text" />
      </SubSection>

      <SubSection title={sampleTitles.requestDecrypted}>
        <CodeBlock content={kit.sampleDecryptedRequest} language="json" />
      </SubSection>

      {!hideFormatSections.has(kit.id) && (
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
      )}

      <SubSection title="Table of Response Parameters">
        <ParameterTable data={kit.responseParameters} caption="Gateway response parameters" />
      </SubSection>

      <SubSection title={sampleTitles.responseEncrypted}>
        <CodeBlock content={kit.sampleEncryptedResponse} language="text" />
      </SubSection>

      <SubSection title={sampleTitles.responseDecrypted}>
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
const sampleSectionTitleMap: Record<
  string,
  {
    requestEncrypted: string
    requestDecrypted: string
    responseEncrypted: string
    responseDecrypted: string
  }
> = {
  default: {
    requestEncrypted: 'Sample Encrypted Request',
    requestDecrypted: 'Sample Decrypted Request',
    responseEncrypted: 'Sample Encrypted Response',
    responseDecrypted: 'Sample Decrypted Response'
  },
  angularjs: {
    requestEncrypted: 'payment-gateway-form.component.ts (excerpt)',
    requestDecrypted: 'submitPaymentForm payload',
    responseEncrypted: 'Sample encrypted callback payload (encResponse)',
    responseDecrypted: 'Callback payload forwarded by SabPaisa'
  },
  reactjs: {
    requestEncrypted: 'SabPaisaPaymentForm.js + App.js snippet',
    requestDecrypted: 'Props passed to PaymentForm',
    responseEncrypted: 'handlePaymentResponse console output',
    responseDecrypted: 'Fields returned in callbackFunction'
  },
  flutter: {
    requestEncrypted: 'Usage example (sabpaisa_flutter)',
    requestDecrypted: 'Payment options map passed to sabPaisa.open',
    responseEncrypted: 'Event callbacks (EVENT_PAYMENT_SUCCESS / ERROR)',
    responseDecrypted: 'TransactionResponsesModel payload'
  }
}
const pythonFlowSteps = [
  {
    title: 'Capture payer inputs',
    description: 'Merchant form gathers mandatory fields and generates a unique clientTxnId.'
  },
  {
    title: 'Encrypt request string',
    description: 'Concatenate key=value pairs, encrypt with AES + HMAC to produce encData.'
  },
  {
    title: 'Submit to SabPaisa',
    description: 'POST encData and clientCode to sabPaisaInit over HTTPS form.'
  },
  {
    title: 'Hosted checkout',
    description: 'Payer completes OTP/card/UPI on SabPaisa.'
  },
  {
    title: 'Decrypt callback',
    description: 'Receive encResponse on callbackUrl, decrypt, and update order state.'
  }
]

const dotnetFlowSteps = [
  {
    title: 'Collect payer details',
    description: 'ASP.NET form captures payerName, payerEmail, amount, and clientTxnId.'
  },
  {
    title: 'Encrypt plain string',
    description: 'Build key=value request string and encrypt to form encData.'
  },
  {
    title: 'POST encData/clientCode',
    description: 'Submit hidden fields to SabPaisa init URL via HTTPS.'
  },
  {
    title: 'Customer pays on SabPaisa',
    description: 'Hosted page handles OTP/card/UPI flows and returns a status code.'
  },
  {
    title: 'Handle encResponse',
    description: 'Decrypt callback response and reconcile status/statusCode.'
  }
]
const pythonSummaryCards: SummaryCard[] = [
  {
    title: 'Environment readiness',
    icon: Server,
    items: [
      { label: 'Python 3.10+ with requests/httpx installed' },
      { label: 'Sandbox init URL', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Live init URL', href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' }
    ]
  },
  {
    title: 'SabPaisa requirements',
    icon: ShieldCheck,
    items: [
      { label: 'Request seamless flag + UAT credentials from SabPaisa' },
      { label: 'Store clientCode, trans credentials, authKey/authIV securely' },
      { label: 'Expose HTTPS callbackUrl to accept encResponse' }
    ]
  }
]

const dotnetSummaryCards: SummaryCard[] = [
  {
    title: 'Runtime checklist',
    icon: Server,
    items: [
      { label: 'ASP.NET/Core app with HTTPS enabled' },
      { label: 'Sandbox init URL', href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' },
      { label: 'Production init URL', href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1' }
    ]
  },
  {
    title: 'Credential hygiene',
    icon: ShieldCheck,
    items: [
      { label: 'Keep clientCode, authKey/authIV, trans credentials outside source control' },
      { label: 'Generate unique clientTxnId for each payment attempt' },
      { label: 'Callback route must be HTTPS and publicly reachable' }
    ]
  }
]

const summaryCardsByKit: Record<string, SummaryCard[] | undefined> = {
  java: javaSummaryCards,
  php: phpSummaryCards,
  nodejs: nodeSummaryCards,
  laravel: laravelSummaryCards,
  reactjs: reactSummaryCards,
  angularjs: angularSummaryCards,
  python: pythonSummaryCards,
  dotnet: dotnetSummaryCards,
  flutter: flutterSummaryCards,
  'react-native': reactNativeSummaryCards
}

const integrationFlowByKit: Record<string, FlowListItem[] | undefined> = {
  java: javaFlowSteps,
  php: phpFlowSteps,
  nodejs: nodeFlowSteps,
  laravel: laravelFlowSteps,
  reactjs: reactFlowSteps,
  angularjs: angularFlowSteps,
  python: pythonFlowSteps,
  dotnet: dotnetFlowSteps,
  flutter: flutterFlowSteps,
  'react-native': reactNativeFlowSteps
}


const enhancedKits = new Set(['java', 'php', 'nodejs', 'laravel', 'reactjs', 'angularjs', 'python', 'dotnet', 'flutter', 'react-native'])
const customVideoKits = new Set(['flutter', 'react-native'])
const hideFormatSections = new Set(['flutter', 'react-native'])

const flutterIntroduction =
  'This guide provides step-by-step instructions for integrating the SabPaisa Flutter SDK into your mobile application, enabling you to accept payments via SabPaisa.'

const reactNativeIntroduction =
  'This document provides a detailed, step-by-step guide for integrating the SabPaisa Payment Gateway into your React Native application using the sabpaisa-react-lib-lite library.'

const reactNativePrerequisites = [
  'React Native project running version 0.60 or higher (auto-linking supported).',
  'Node.js v14+ with npm or yarn installed.',
  'SabPaisa merchant credentials: Client Code, Auth Key, Auth IV, Username, and Password.'
]

const reactNativeInstallCommand = `npm install sabpaisa-react-lib-lite @types/sabpaisa-react-lib-lite
# OR
yarn add sabpaisa-react-lib-lite @types/sabpaisa-react-lib-lite`

const reactNativePeerDepsCommand = `npm install react react-native @react-native-community/cli
# OR
yarn add react react-native @react-native-community/cli`

const reactNativeInstallationSteps = [
  {
    title: 'Install the sabpaisa-react-lib-lite library and type definitions.',
    code: reactNativeInstallCommand
  },
  {
    title: 'Install the required peer dependencies.',
    code: reactNativePeerDepsCommand
  }
]

const reactNativeAndroidSteps = [
  {
    title: 'React Native v0.60 or higher',
    description: 'Auto-linking is supported; no manual linking steps are required.'
  },
  {
    title: 'React Native below 0.60',
    description: 'Run the linking command to connect native modules.',
    code: 'react-native link sabpaisa-react-lib-lite'
  }
]

const reactNativeIosSteps = [
  {
    title: 'Install CocoaPods dependencies',
    code: `cd ios
pod install`
  },
  {
    title: 'Reopen the workspace',
    description: 'Open the .xcworkspace file in Xcode (not the .xcodeproj) after installing pods.'
  }
]

const reactNativeImportSnippet = `import { SabPaisaCheckout } from 'sabpaisa-react-lib-lite';`

const reactNativeOptionsSnippet = `const options = {
  first_name: 'Vimal',
  last_name: 'kumar',
  currency: 'INR',
  mobile_number: '9999999999',
  email_id: 'john.doe@example.com',
  client_code: 'DJ020',
  aes_iv: '<your-aes-iv>',
  aes_key: '<your-aes-key>',
  user_name: '<your-username>',
  password: '<your-password>',
  env: 'staging',
  txn_id: 'TXN123456789',
  amount: '100',
  callback_url: 'https://yourdomain.com/callback',
  udf1: 'Optional Field 1',
  udf2: 'Optional Field 2'
  // ... udf3 through udf20 as needed
};`

const reactNativeButtonSnippet = `SabPaisaCheckout.open(options)
  .then((response) => {
    console.log('Payment Success:', response)
    alert('Payment Successful! Txn ID: ' + response.clientTxnId)
  })
  .catch((error) => {
    console.error('Payment Error:', error)
    alert('Payment Failed: ' + (error.status || 'Unknown error'))
  })`

const reactNativeComponentSnippet = `import React from 'react'
import { Button } from 'react-native'
import { SabPaisaCheckout } from 'sabpaisa-react-lib-lite'

export function PayWithSabPaisa() {
  const initiatePayment = () => {
    const options = {
      first_name: 'Vimal',
      last_name: 'kumar',
      currency: 'INR',
      mobile_number: '9999999999',
      email_id: 'john.doe@example.com',
      client_code: 'DJ020',
      aes_iv: '<your-aes-iv>',
      aes_key: '<your-aes-key>',
      user_name: '<your-username>',
      password: '<your-password>',
      env: 'staging',
      txn_id: 'TXN123456789',
      amount: '100',
      callback_url: 'https://yourdomain.com/callback',
      udf1: 'Optional Field 1',
      udf2: 'Optional Field 2'
    }

    SabPaisaCheckout.open(options)
      .then((response) => {
        console.log('Payment Success:', response)
        alert('Payment Successful! Txn ID: ' + response.clientTxnId)
      })
      .catch((error) => {
        console.error('Payment Error:', error)
        alert('Payment Failed: ' + (error.status || 'Unknown error'))
      })
  }

  return <Button title="Pay via SabPaisa" onPress={initiatePayment} />
}`

const reactNativeTroubleshooting = [
  {
    title: 'Metro bundler issues',
    description:
      'If VirtualizedList or bundler errors appear, reinstall Metro and @react-native/virtualized-lists: npm install metro @react-native/virtualized-lists --save-dev.'
  },
  {
    title: 'iOS build errors',
    description:
      'Ensure pod install completes successfully and always open the .xcworkspace file when building the iOS app.'
  },
  {
    title: 'Android linking issues',
    description:
      'React Native ≥ 0.60 relies on auto-linking. For earlier versions, run react-native link sabpaisa-react-lib-lite.'
  }
]

const flutterPrerequisites = [
  'Flutter SDK should be installed and properly set up.',
  'Android Configuration: Minimum API level 19 or higher for the Android app.',
  'iOS Configuration: Deployment target 10.0 or higher with Bitcode enabled and CocoaPods up to date.'
]

const flutterInstallationSteps = [
  {
    title: 'Step 1: Open your Flutter project.'
  },
  {
    title: 'Step 2: Add sabpaisa_flutter:^0.2.2 to pubspec.yaml.',
    code: `dependencies:
  sabpaisa_flutter: ^0.2.2`
  },
  {
    title: 'Step 3: Run flutter packages get to fetch the SDK.',
    code: `flutter packages get`
  }
]

const flutterGradleMinSdk = `defaultConfig {
  minSdkVersion 19 // Ensure this is set to 19 or higher
}`

const flutterProguardRules = `-keepattributes *Annotation*
-dontwarn com.SabPaisa.**
-keep class com.SabPaisa.** {*;}
-optimizations !method/inlining/`

const flutterGradleSyncCommands = `flutter clean
flutter pub get`

const flutterAndroidSteps = [
  {
    title: 'Step 1: Set the minimum SDK version in android/app/build.gradle.',
    code: flutterGradleMinSdk
  },
  {
    title: 'Step 2: (Optional) Add Proguard rules if using minification.',
    code: flutterProguardRules
  },
  {
    title: 'Step 3: Sync Gradle after updates.',
    code: flutterGradleSyncCommands
  }
]

const flutterPodPlatform = `platform :ios, '10.0'`

const flutterPodPostInstall = `post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_BITCODE'] = 'YES'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
end`

const flutterPodInstallCommands = `cd ios
pod install`

const flutterIosSteps = [
  {
    title: 'Step 1: Set the minimum iOS deployment target to 10.0 or higher in Podfile.',
    code: flutterPodPlatform
  },
  {
    title: 'Step 2: Enable Bitcode and Swift 5 in the Podfile post-install hook.',
    code: flutterPodPostInstall
  },
  {
    title: 'Step 3: Install CocoaPods dependencies (re-run if sabpaisa_flutter Swift headers are missing and ensure use_frameworks! is present).',
    code: flutterPodInstallCommands
  },
  {
    title: 'Step 4: Increase the deployment target if Pods require it (platform :ios, \'10.0\') and rerun pod install.'
  }
]

const flutterUsageImport = `import 'package:sabpaisa_flutter/sabpaisa_flutter.dart';`

const flutterUsageInstantiate = `late SabPaisa sabPaisa = SabPaisa();`

const flutterUsageListeners = `sabPaisa.on(SabPaisa.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
sabPaisa.on(SabPaisa.EVENT_PAYMENT_ERROR, _handlePaymentError);

void _handlePaymentSuccess(TransactionResponsesModel response) {
  // Handle successful payment
}

void _handlePaymentError(TransactionResponsesModel response) {
  // Handle failed payment
}`

const flutterPaymentOptions = `Map<String, Object> getPaymentOptions() {
  return {
    'first_name': 'John',
    'last_name': 'Doe',
    'currency': 'INR',
    'mobile_number': '9999999999',
    'email_id': 'john.doe@example.com',
    'client_code': 'DJ020',
    'aes_iv': 'M+aUFgRMPq7ci+Cmoytp3KJ2GPBOwO72Z2Cjbr55zY7++pT9mLES2M5cIblnBtaX',
    'aes_key': 'ISTrmmDC2bTvkxzlDRrVguVwetGS8xC/UFPsp6w+Itg=',
    'user_name': 'JohnDoe',
    'password': 'password123',
    'env': 'staging', // Use 'prod' for production
    'txn_id': '<Unique Transaction Id>',
    'amount': '1000',
    'callback_url': 'http://localhost:8082'
    // Add any other user-defined fields here
  };
}`

const flutterUsageOpen = `sabPaisa.open(getPaymentOptions());`

const flutterUsageSteps = [
  {
    title: 'Step 1: Import the SDK.',
    code: flutterUsageImport
  },
  {
    title: 'Step 2: Initialize the SabPaisa instance.',
    code: flutterUsageInstantiate
  },
  {
    title: 'Step 3: Set up event listeners for payment success/failure.',
    code: flutterUsageListeners
  },
  {
    title: 'Step 4: Configure payment options using a Dart map.',
    code: flutterPaymentOptions
  },
  {
    title: 'Step 5: Open the SabPaisa payment checkout.',
    code: flutterUsageOpen
  }
]

const flutterTroubleshooting = [
  {
    title: 'iOS compatibility error',
    description:
      'If CocoaPods cannot find compatible versions for sabpaisa_flutter, ensure the deployment target is 10.0 or higher and rerun pod install.'
  },
  {
    title: 'Gradle build issues (Android)',
    description:
      'Errors such as "uses-sdk:minSdkVersion 16 cannot be smaller than version 19" indicate minSdkVersion must be raised to 19 in android/app/build.gradle.'
  },
  {
    title: 'Bitcode issues (iOS)',
    description: 'Set ENABLE_BITCODE to YES in the Podfile post-install hook and run pod install again.'
  },
  {
    title: 'Swift header not found (iOS)',
    description:
      'If sabpaisa_flutter/SabPaisaFlutter-Swift.h is missing, add use_frameworks! to Podfile and rerun pod install.'
  }
]
