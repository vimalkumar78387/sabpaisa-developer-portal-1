'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  <div className="flex items-center gap-3">
    <span className="inline-block h-8 w-1.5 rounded-full bg-gradient-to-b from-primary/90 to-primary/60" />
    <h3 className="text-lg font-semibold text-foreground">{children}</h3>
  </div>
)

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm shadow-black/5 backdrop-blur">
    <div className="space-y-4">
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
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
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-sm">
      <table className="w-full text-left text-sm">
        <caption className="px-6 py-4 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {caption}
        </caption>
        <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium text-foreground">Parameter</th>
            <th className="px-6 py-3 font-medium text-foreground">Type</th>
            {includeRequiredColumn && (
              <th className="px-6 py-3 font-medium text-foreground">Required</th>
            )}
            <th className="px-6 py-3 font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-background/80">
          {data.map((param) => (
            <tr key={param.name}>
              <td className="px-6 py-4 font-medium text-foreground">{param.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{param.type}</td>
              {includeRequiredColumn && 'required' in param && (
                <td className="px-6 py-4 text-muted-foreground">{param.required ? 'Yes' : 'No'}</td>
              )}
              <td className="px-6 py-4 text-muted-foreground">{param.description}</td>
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
    'overflow-x-auto rounded-3xl border border-border/60 bg-slate-950/90 p-4 text-sm text-slate-100 shadow-inner shadow-black/40',
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

const odooSummaryCards: SummaryCard[] = [
  {
    title: 'System prerequisites',
    icon: Server,
    items: [
      { label: 'Odoo 18.0 (or compatible) running instance' },
      { label: 'Access to server filesystem for addons' },
      { label: 'Ability to restart Odoo services' }
    ]
  },
  {
    title: 'SabPaisa requirements',
    icon: ShieldCheck,
    items: [
      { label: 'Active SabPaisa merchant account' },
      { label: 'Client code, username, password, auth key & IV' },
      { label: 'Staging and live PG URLs' }
    ]
  }
]

const iosSummaryCards: SummaryCard[] = [
  {
    title: 'Environment readiness',
    icon: Server,
    items: [
      { label: 'Mac with Xcode 13+ installed' },
      { label: 'Target iOS 11 or higher' },
      { label: 'Swift Package Manager configured' }
    ]
  },
  {
    title: 'SabPaisa resources',
    icon: ShieldCheck,
    items: [
      { label: 'SabPaisa Swift package URL + Alamofire dependency' },
      { label: 'Merchant credentials (client code, auth key/IV, username/password)' },
      { label: 'Access to staging and live init URLs' }
    ]
  }
]

type FlowListItem = {
  title: string
  description?: string
}

const FlowList = ({ items }: { items: FlowListItem[] }) => (
  <ol className="grid gap-4 md:grid-cols-2">
    {items.map((item, index) => (
      <li
        key={`${item.title}-${index}`}
        className="relative h-full rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background/95 to-muted/30 p-5 shadow-sm shadow-black/5"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">{item.title}</p>
            {item.description && <p className="text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      </li>
    ))}
  </ol>
)

const androidPaymentStatusCodes = [
  { code: '0000', description: 'Success', action: 'Update transaction as successful.' },
  { code: '0300', description: 'Failed', action: 'Update transaction as failed.' },
  { code: '0100', description: 'Initiated / Not Completed', action: 'Mark transaction as not completed.' },
  { code: '0200', description: 'Aborted', action: 'Update transaction as aborted.' },
  { code: '0999', description: 'Unknown Response', action: 'Make a request using transaction enquiry.' },
  { code: '0400 (Challan)', description: 'CHALLAN_GENERATED', action: 'Update challan status as generated and follow up later.' },
  { code: '404', description: 'TRANSACTION NOT FOUND', action: 'ClientTxnId not found; update as failed.' }
]

const androidPrerequisites = [
  'Android Studio 4.0 or higher installed.',
  'API level 21 (Android 5.0) or higher for the app.',
  'sabaPaisapaymentgateway.aar file provided by SabPaisa.',
  'Access to SabPaisa UAT credentials.'
]

const androidSummaryCards: SummaryCard[] = [
  {
    title: 'Environment readiness',
    icon: Server,
    items: [
      { label: 'Android Studio 4.0+ with API level 21+' },
      { label: 'Java/Kotlin module configured in the project' },
      { label: 'Gradle sync succeeds after adding the SDK' }
    ]
  },
  {
    title: 'SabPaisa resources',
    icon: ShieldCheck,
    items: [
      { label: 'sabaPaisapaymentgateway.aar supplied by SabPaisa' },
      { label: 'Sandbox credentials for UAT verification' },
      { label: 'Staging and production init URLs ready' }
    ]
  }
]

const androidProcessFlow = [
  'The payer enters payment details on the merchant interface.',
  'Payer selects the payment method and confirms payment.',
  'Payer provides verification details (OTP, card info, UPI PIN).',
  'SabPaisa processes the payment and sends the response back.',
  'Merchant app/platform processes the response and updates status.'
]

const androidIntegrationSteps = [
  {
    title: '1. Add SDK',
    description:
      'Import the provided .aar file as a library dependency (Open Module Settings → Add → AAR dependency).',
    details: ['Ensure the SabPaisa SDK appears under Module dependencies.']
  },
  {
    title: '2. Sync the Project',
    description: 'Sync Gradle so the SDK dependency is fully resolved.'
  },
  {
    title: '3. UI Implementation',
    description: 'Add a “Pay Now” button (or preferred UI element) and call the payment launcher from its click handler.'
  },
  {
    title: '4. SDK Initialization',
    description: 'Configure SabPaisaPaymentGateway with payer details and SabPaisa credentials.',
    java: `private void initiatePayment() {
    SabPaisaPaymentGateway config = new SabPaisaPaymentGateway();
    config.setPayerName("bhargava");
    config.setPayerEmail("test@gmail.com");
    config.setPayerMobile("1234567890");
    config.setClientTxnId(generateShortUUID());
    config.setAmount("1.00");
    config.setClientCode("TM001");
    config.setTransUserName("spuser_2013");
    config.setTransUserPassword("RIADA_SP336");
    config.setSabPaisaUrl("https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1");
    config.setAuthKey("kaY9AIhuJZNvKGp2");
    config.setAuthIV("YN2v8qQcU3rGfA1y");
    Intent intent = new Intent(this, PaymentGatewayActivity.class);
    intent.putExtra(PaymentGatewayActivity.EXTRA_PAYMENT_CONFIG, config);
    startActivityForResult(intent, PAYMENT_REQUEST_CODE);
}`,
    kotlin: `private fun initiatePayment() {
    val config = SabPaisaPaymentGateway().apply {
        setPayerName("bhargava")
        setPayerEmail("test@gmail.com")
        setPayerMobile("1234567890")
        setClientTxnId(generateShortUUID())
        setAmount("1.00")
        setClientCode("DJ020")
        setTransUserName("DJL754@sp")
        setTransUserPassword("4q3qhgmJNM4m")
        setSabPaisaUrl("https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1")
        setAuthKey("hYSilho3Dz4SAT2B")
        setAuthIV("s8WcZ8OGw11cAUFG")
    }
    val intent = Intent(this, PaymentGatewayActivity::class.java)
    intent.putExtra(PaymentGatewayActivity.EXTRA_PAYMENT_CONFIG, config)
    startActivityForResult(intent, PAYMENT_REQUEST_CODE)
}`
  },
  {
    title: '5. Trigger Payment',
    description: 'Call startActivityForResult(...) with PAYMENT_REQUEST_CODE and handle the result inside onActivityResult.'
  }
]

const androidResponseHandlingJava = `@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == PAYMENT_REQUEST_CODE) {
        if (resultCode == RESULT_OK && data != null) {
            PaymentResponse response = data.getParcelableExtra(PaymentGatewayActivity.EXTRA_PAYMENT_RESPONSE);
            if (response != null) {
                showResponseScreen(response);
            } else {
                resetToPaymentScreen();
            }
        } else {
            resetToPaymentScreen();
        }
    }
}`

const androidResponseHandlingKotlin = `override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == PAYMENT_REQUEST_CODE) {
        if (resultCode == RESULT_OK && data != null) {
            val response: PaymentResponse? = data.getParcelableExtra(PaymentGatewayActivity.EXTRA_PAYMENT_RESPONSE)
            if (response != null) {
                showResponseScreen(response)
            } else {
                resetToPaymentScreen()
            }
        } else {
            resetToPaymentScreen()
        }
    }
}`

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

      {androidSummaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {androidSummaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-muted-foreground">
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

      <SubSection title="Pre-requisite steps for integration">
        <FlowList items={flutterPrerequisites.map((title) => ({ title }))} />
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

function IOSCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <p className="text-foreground">{iosIntroduction}</p>
      </SubSection>

      <SubSection title="Reference code">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Sample project</span>
              <Link href={kit.sampleCodeLink} target="_blank" className="text-primary hover:underline">
                Open iOS sample
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staging URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.sandbox}</code>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.production}</code>
            </div>
          </div>
        </div>
      </SubSection>

      {iosSummaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {iosSummaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-muted-foreground">
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
        <FlowList items={iosPrerequisites.map((title) => ({ title }))} />
      </SubSection>

      <SubSection title="Steps to follow">
        <ol className="space-y-4">
          {iosSteps.map((step) => (
            <li key={step.title} className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm">
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="text-muted-foreground">{step.description}</p>
              {step.code && <CodeBlock content={step.code} language="swift" />}
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Response variables">
        <CodeBlock content={iosResponseVariables} language="text" />
      </SubSection>

      <SubSection title="Other points to note">
        <ul className="space-y-4">
          {iosOtherPoints.map((item) => (
            <li key={item.title} className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
              {item.code && <CodeBlock content={item.code} language="swift" />}
            </li>
          ))}
        </ul>
      </SubSection>
    </div>
  )
}

function WooCommerceCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <p className="text-foreground">{wooIntroduction}</p>
        <Link
          href="https://srslivetech-my.sharepoint.com/:u:/g/personal/vimal_vishwakarma_sabpaisa_in/Ef8mXogjg-tFrSD62zdN7r0BN3f9RPLvHJsaG-JOsZ49yw?e=92FJrl"
          target="_blank"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Download Plugin
        </Link>
      </SubSection>

      <SubSection title="Integration walkthrough">
        <VideoEmbed url="https://youtu.be/7HjyC5m5j2g?si=6Tt9Be0s3B3DlMOy" title="WooCommerce integration walkthrough" />
      </SubSection>

      {wooSummaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {wooSummaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item.label}>{item.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <SubSection title="Overview of the Integration Process">
        <FlowList items={wooProcessSteps.map((title) => ({ title }))} />
      </SubSection>

      <SubSection title="Endpoint URLs & Downloads">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staging URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.sandbox}</code>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.production}</code>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Plugin Installation and Setup">
        <ol className="list-decimal space-y-4 pl-5">
          {wooInstallationSteps.map((step) => (
            <li key={step.title}>
              <p className="font-semibold text-foreground">{step.title}</p>
              <p className="text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Testing the Integration">
        <p className="text-muted-foreground">
          After configuration, place test orders using the staging URL to confirm end-to-end payment flow. Once validated, switch the
          plugin to the live URL for production transactions.
        </p>
      </SubSection>
    </div>
  )
}

function WixCustomSections() {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <div className="space-y-3 text-foreground">
          {wixIntroductionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </SubSection>

      <SubSection title="Reference Codes & Endpoint URLs">
        <div className="grid gap-4 md:grid-cols-2">
          {wixReferenceEntries.map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entry.label}</p>
              <Link href={entry.href} target="_blank" className="mt-2 block break-all text-sm font-medium text-primary">
                {entry.href}
              </Link>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Process Flow">
        <FlowList items={wixProcessFlow} />
      </SubSection>

      <SubSection title="Pre-requisites">
        <FlowList items={wixPrerequisites} />
        <Image
          src="/wix1.png"
          alt="Wix advanced developer platform requirement screenshot"
          width={800}
          height={450}
          className="rounded-2xl border border-border/60"
        />
      </SubSection>

      <SubSection title="Pg URLs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staging / Test</p>
            <code className="mt-2 block break-all text-foreground">https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1</code>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Production / Live</p>
            <code className="mt-2 block break-all text-foreground">https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1</code>
          </div>
        </div>
      </SubSection>

      <SubSection title="Create a SabPaisa payment plugin">
        <div className="space-y-4 text-muted-foreground">
          <p>
            The first step in setting up the SabPaisa plugin is to add it to your site. This process creates a new folder in the Service
            Plugins section of the Velo Sidebar that contains the files for your code.
          </p>
          <ol className="list-decimal space-y-4 pl-5">
            <li>
              <p>With Velo Dev Mode enabled, click Public & Backend &#123; &#125; on the Velo Sidebar.</p>
            </li>
            <li>
              <div className="space-y-2">
                <p>Scroll down to Service Plugins.</p>
                <Image
                  src="/wix2.png"
                  alt="Service plugins section screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
            <li>
              <p>Hover over Service Plugins and click (+).</p>
            </li>
            <li>
              <div className="space-y-2">
                <p>Select Payment.</p>
                <Image
                  src="/wix3.png"
                  alt="Select payment plugin screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
            <li>
              <div className="space-y-2">
                <p>Enter the plugin name as "SabPaisa" and click Add & Edit Code.</p>
                <p>5.1 The name cannot contain spaces or special characters.</p>
              </div>
            </li>
          </ol>
        </div>
      </SubSection>

      <SubSection title="Implement the plugin">
        <div className="space-y-4 text-muted-foreground">
          <p>
            The procedure in the previous section creates a folder in the Service Plugins section of the Velo Sidebar called
            payment-provider. Inside this is another folder with the name of SabPaisa, containing SabPaisa-config.js and SabPaisa.js.
          </p>
          <Image
            src="/wix4.png"
            alt="SabPaisa plugin files in Velo screenshot"
            width={800}
            height={450}
            className="rounded-2xl border border-border/60"
          />
          <p>To implement your plugin, you need to:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Add SabPaisa code in these files to integrate with SabPaisa.</li>
            <li>Expose HTTP endpoints on your site that SabPaisa uses to send updates about transactions.</li>
          </ol>
          <p>Here are some guidelines for setting up the code.</p>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="font-semibold text-foreground">(SabPaisa-config.js):</p>
              <p>
                The code in this file defines a function named <code>getConfig()</code> that returns an object containing the values used to
                display information about the SabPaisa plugin in three different locations on your site.
              </p>
              <p>a) The Connect page where you connect a SabPaisa plugin to your site.</p>
              <Image
                src="/wix5.png"
                alt="Connect SabPaisa plugin screenshot"
                width={800}
                height={450}
                className="rounded-2xl border border-border/60"
              />
              <p>b) The Accept Payments page where you see the payment methods you have connected.</p>
              <Image
                src="/wix6.png"
                alt="Accept payments page screenshot"
                width={800}
                height={450}
                className="rounded-2xl border border-border/60"
              />
              <p>c) The Checkout page where visitors finalize their shipping and payment details.</p>
              <Image
                src="/wix7.png"
                alt="Checkout page payment option screenshot"
                width={800}
                height={450}
                className="rounded-2xl border border-border/60"
              />
              <p>
                2. Copy the code from{' '}
                <Link
                  href="https://bitbucket.org/sabpaisa-wp-29/wix-integration-kit/src/wix_kit/SabPaisa-config.js"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  SabPaisa-config.js
                </Link>{' '}
                and paste it in your file.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-foreground">(SabPaisa.js):</p>
              <p>
                1. The code in this file defines the <code>connectAccount()</code> and <code>createTransaction()</code> functions. These are
                called by Wix at different points in the payment processing flow.
              </p>
              <p>
                1.1 <code>connectAccount()</code> is called when you click the Connect button on the Connect page in your dashboard. Use it
                to create a new account for the SabPaisa plugin and return the account information to Wix.
              </p>
              <p>
                1.2 <code>createTransaction()</code> is called when a site visitor clicks the Place Order button on your site’s Checkout
                page. Use it to send a request to SabPaisa to create a new transaction.
              </p>
              <p>
                2. NOTE: Review the sample code in{' '}
                <Link
                  href="https://bitbucket.org/sabpaisa-wp-29/wix-integration-kit/src/wix_kit/SabPaisa.js"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  SabPaisa.js
                </Link>{' '}
                for the <code>connectAccount()</code> and <code>createTransaction()</code> implementations.
              </p>
              <p>
                2.1 After the transaction is completed, create the <code>http-functions.js</code> file to receive updates from SabPaisa
                about success or failure.
              </p>
              <p>2.2 Provide the callback URL to SabPaisa as part of the request to create the transaction.</p>
              <p>
                2.3 Use the <code>submitEvent()</code> function in your endpoint logic to mark the transaction as completed so the related
                order appears in the Orders tab.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-foreground">(http-functions.js):</p>
              <p>
                Note: When you create a transaction with SabPaisa, you must provide a callback URL for an HTTP endpoint that SabPaisa uses
                to send status updates.
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Click Public & Backend &#123; &#125; on the Velo Sidebar.</li>
                <li>
                  <div className="space-y-2">
                    <p>Scroll down to Backend.</p>
                    <Image
                      src="/wix8.png"
                      alt="Navigate to backend section screenshot"
                      width={800}
                      height={450}
                      className="rounded-2xl border border-border/60"
                    />
                  </div>
                </li>
                <li>Hover over Backend and click (+).</li>
                <li>
                  <div className="space-y-2">
                    <p>Select Expose site API Option.</p>
                    <Image
                      src="/wix9.png"
                      alt="Expose site API option screenshot"
                      width={800}
                      height={450}
                      className="rounded-2xl border border-border/60"
                    />
                  </div>
                </li>
                <li>
                  <div className="space-y-2">
                    <p>After selecting the Expose site API option a file will be created.</p>
                    <Image
                      src="/wix10.png"
                      alt="New API file screenshot"
                      width={800}
                      height={450}
                      className="rounded-2xl border border-border/60"
                    />
                  </div>
                </li>
                <li>Copy the code from the provided http-functions.js sample.</li>
                <li>Paste the code into your http-functions.js file.</li>
                <li>
                  This file contains the callback URL logic where SabPaisa sends responses. It redirects to the required response pages and
                  updates transaction status based on the SabPaisa response.
                </li>
              </ol>
              <p>
                Note: A webhook function is also provided to update pending transactions directly on the server.
              </p>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="How to put the callback success & failure URLs in the create transaction">
        <div className="space-y-2 text-muted-foreground">
          <p>Success Url: "Mention your site url/_functions/updateTransaction"</p>
          <p>Failure Url: "Mention your site url/_functions/updateTransaction"</p>
          <p>Webhook Url: "Mention your site url/_functions/Webhook"</p>
        </div>
      </SubSection>

      <SubSection title="Deploy the plugin">
        <div className="space-y-4 text-muted-foreground">
          <p>Once your code files are ready, deploy the SabPaisa plugin and enable it on your site’s dashboard.</p>
          <ol className="list-decimal space-y-4 pl-5">
            <li>
              <div className="space-y-2">
                <p>Publish your site.</p>
                <Image
                  src="/wix11.png"
                  alt="Publish Wix site screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
            <li>Go to the Accept Payments settings on your site’s dashboard.</li>
            <li>
              <div className="space-y-2">
                <p>Find SabPaisa in your service plugins list and click Connect.</p>
                <Image
                  src="/wix12.png"
                  alt="Connect SabPaisa in Accept Payments screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
            <li>
              <div className="space-y-2">
                <p>Enter the account credential information shared by your SabPaisa account manager and click Connect.</p>
                <Image
                  src="/wix13.png"
                  alt="Enter SabPaisa credentials screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
            <li>
              <div className="space-y-2">
                <p>Once deployed, the SabPaisa payment option appears on your site’s Checkout page.</p>
                <Image
                  src="/wix14.png"
                  alt="SabPaisa payment option on checkout screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
                <p>After clicking the Place Order & Pay button, the SabPaisa checkout page opens.</p>
                <Image
                  src="/wix15.png"
                  alt="SabPaisa hosted checkout screenshot"
                  width={800}
                  height={450}
                  className="rounded-2xl border border-border/60"
                />
              </div>
            </li>
          </ol>
        </div>
      </SubSection>
    </div>
  )
}

function OpenCartCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <div className="space-y-3 text-foreground">
          {openCartIntroductionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </SubSection>

      <SubSection title="Integration walkthrough">
        <VideoEmbed url="https://youtu.be/ACRS_K67RvQ?si=0TKXeOin8xlh8QZf" title="OpenCart integration walkthrough" />
      </SubSection>

      {openCartSummaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {openCartSummaryCards.map((card) => (
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

      <SubSection title="Endpoint URLs & Reference Code">
        <div className="grid gap-4 sm:grid-cols-3">
          {openCartReferenceEntries.map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entry.label}</p>
              <Link href={entry.href} target="_blank" className="mt-2 block break-all text-sm font-medium text-primary">
                {entry.href}
              </Link>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Compatibilities & dependencies">
        <FlowList items={openCartCompatibilities} />
      </SubSection>

      <SubSection title="Download plugin">
        <div className="space-y-3">
          <p>Download Plugin : {openCartDownloadLink}</p>
          <Link
            href={openCartDownloadLink}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Download Plugin
          </Link>
        </div>
      </SubSection>

      <SubSection title="Configure OpenCart">
        <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
          {openCartConfigurationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </SubSection>
    </div>
  )
}

function OdooCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <p className="text-foreground">{odooIntroduction}</p>
      </SubSection>

      {odooSummaryCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {odooSummaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-foreground">
                <card.icon className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold">{card.title}</h4>
              </div>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                {card.items.map((item) => (
                  <li key={item.label} className="text-sm">
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

      <SubSection title="Process Flow">
        <FlowList items={odooProcessFlow} />
        <p className="text-sm text-muted-foreground">
          This structured process ensures a seamless integration of SabPaisa's Payment Gateway within Odoo, providing a secure and efficient
          payment solution.
        </p>
      </SubSection>

      <SubSection title="Prerequisites">
        <FlowList items={odooPrerequisites} />
      </SubSection>

      <SubSection title="Pg URLs">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staging / Test</p>
            <code className="mt-2 block break-all text-foreground">{kit.endpoints.sandbox}</code>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Production / Live</p>
            <code className="mt-2 block break-all text-foreground">{kit.endpoints.production}</code>
          </div>
        </div>
      </SubSection>

      {odooSteps.map((step) => (
        <SubSection key={step.title} title={step.title}>
          <div className="space-y-3 text-muted-foreground">
            {step.content.map((entry, idx) =>
              entry.type === 'text' ? (
                <p key={`${step.title}-text-${idx}`}>{entry.content}</p>
              ) : (
                <Image
                  key={`${step.title}-image-${idx}`}
                  src={entry.src}
                  alt={entry.alt}
                  width={960}
                  height={540}
                  className="rounded-2xl border border-border/60"
                />
              )
            )}
          </div>
        </SubSection>
      ))}
    </div>
  )
}

function AndroidCustomSections({ kit }: { kit: IntegrationKitDoc }) {
  return (
    <div className="space-y-6 text-sm">
      <SubSection title="Introduction">
        <p className="text-foreground">{androidIntroduction}</p>
      </SubSection>

      <SubSection title="Integration walkthrough">
        <VideoEmbed url="https://youtu.be/XsNkVFtq7Ns?si=ms5CXwGiW53sRTGR" title="Android integration walkthrough" />
      </SubSection>

      <SubSection title="Reference code">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Java Reference</span>
              <Link href="https://bitbucket.org/sabpaisa-wp-29/android-version-2.0/src/master/" target="_blank" className="text-primary hover:underline">
                View Java sample
              </Link>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">Kotlin Reference</span>
              <Link href="https://bitbucket.org/sabpaisa-wp-29/android_kotlinv2.0/src/master/" target="_blank" className="text-primary hover:underline">
                View Kotlin sample
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staging URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.sandbox}</code>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live URL</p>
              <code className="mt-2 block break-all text-foreground">{kit.endpoints.production}</code>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Pre-requisite steps for integration">
        <FlowList items={androidPrerequisites.map((title) => ({ title }))} />
      </SubSection>

      <SubSection title="Process flow">
        <FlowList items={androidProcessFlow.map((title) => ({ title }))} />
      </SubSection>

      <SubSection title="Integration guidelines">
        <ol className="space-y-4">
          {androidIntegrationSteps.map((step) => (
            <li key={step.title} className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-muted-foreground">{step.description}</p>
                {step.details && (
                  <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                    {step.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
                {step.java && (
                  <>
                    <p className="font-semibold text-foreground">Sample request (Java)</p>
                    <CodeBlock content={step.java} language="java" />
                  </>
                )}
                {step.kotlin && (
                  <>
                    <p className="font-semibold text-foreground">Sample request (Kotlin)</p>
                    <CodeBlock content={step.kotlin} language="kotlin" />
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection title="Payment Request Parameters Table">
        <ParameterTable data={kit.requestParameters} caption="SabPaisa request parameters" />
      </SubSection>

      <SubSection title="Payment Response Handling">
        <div className="space-y-4 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">1. Merchant provides custom callback URL</p>
            <p>SabPaisa sends an encrypted response to the provided callback URL via GET. Decrypt and process the response on your server.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">2. No callback URL provided</p>
            <p>SabPaisa sends the decrypted response back to the app via <code>onActivityResult</code>. Handle success/failure inside the activity.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Sample response handling (Java)</p>
            <CodeBlock content={androidResponseHandlingJava} language="java" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Sample response handling (Kotlin)</p>
            <CodeBlock content={androidResponseHandlingKotlin} language="kotlin" />
          </div>
        </div>
      </SubSection>

      <SubSection title="Payment Response Parameters Table">
        <ParameterTable data={kit.responseParameters} caption="SabPaisa response parameters" />
      </SubSection>

      <SubSection title="Payment status code">
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground">Status Code</th>
                <th className="px-4 py-3 font-medium text-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-foreground">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {androidPaymentStatusCodes.map((item) => (
                <tr key={item.code}>
                  <td className="px-4 py-3 font-medium text-foreground">{item.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  if (kit.id === 'woocommerce-plugin') {
    return <WooCommerceCustomSections kit={kit} />
  }

  if (kit.id === 'opencart') {
    return <OpenCartCustomSections kit={kit} />
  }

  if (kit.id === 'wix') {
    return <WixCustomSections />
  }

  if (kit.id === 'odoo') {
    return <OdooCustomSections kit={kit} />
  }

  if (kit.id === 'ios') {
    return <IOSCustomSections kit={kit} />
  }

  if (kit.id === 'android') {
    return <AndroidCustomSections kit={kit} />
  }

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

const wooSummaryCards: SummaryCard[] = [
  {
    title: 'System requirements',
    icon: Server,
    items: [
      { label: 'WordPress 3.9.2 or higher' },
      { label: 'WooCommerce 2.4 or higher' },
      { label: 'Admin access to install plugins' }
    ]
  },
  {
    title: 'SabPaisa resources',
    icon: ShieldCheck,
    items: [
      { label: 'Plugin package downloaded from SabPaisa' },
      { label: 'Merchant credentials (client code, username, password)' },
      { label: 'Authentication key and IV' }
    ]
  }
]

const openCartSummaryCards: SummaryCard[] = [
  {
    title: 'Platform readiness',
    icon: Server,
    items: [
      { label: 'OpenCart 1.5 / 2.x / 3.x storefront with admin access' },
      { label: 'PHP + MySQL hosting with FTP or file manager access' },
      { label: 'Ability to upload and enable custom extensions' }
    ]
  },
  {
    title: 'SabPaisa credentials',
    icon: ShieldCheck,
    items: [
      { label: 'Client code, authentication IV, auth key' },
      { label: 'SabPaisa username and password' },
      { label: 'Official SabPaisa OpenCart plugin package' }
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
  'woocommerce-plugin': wooSummaryCards,
  opencart: openCartSummaryCards,
  odoo: odooSummaryCards,
  ios: iosSummaryCards,
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


const enhancedKits = new Set(['java', 'php', 'nodejs', 'laravel', 'reactjs', 'angularjs', 'python', 'dotnet', 'flutter', 'react-native', 'woocommerce-plugin', 'odoo'])
const customVideoKits = new Set(['flutter', 'react-native', 'android', 'woocommerce-plugin'])
const hideFormatSections = new Set(['flutter', 'react-native', 'android', 'ios', 'woocommerce-plugin', 'odoo', 'wix', 'opencart'])

const androidIntroduction =
  'This document provides a comprehensive guide for integrating the SabPaisa Payment Gateway SDK into Android apps, covering prerequisites, SDK setup, request/response handling, and payment status management.'

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

const iosIntroduction =
  'This document explains how to embed the SabPaisa Payment Gateway inside native iOS apps using the SabPaisa SDK, covering prerequisites, setup, and response handling.'

const iosPrerequisites = [
  'Mac OS with Xcode 13 or higher installed',
  'Minimum supported iOS version: 11',
  'SabPaisa merchant credentials and SDK access'
]

const iosSteps = [
  {
    title: 'Step 1 — Copy the onClick handler',
    description:
      'Refer to ViewController.swift in the reference kit, copy the onClick function, import SabPaisa_IOS_Sdk, and invoke it when you want to open the SabPaisa SDK.'
  },
  {
    title: 'Step 2 — Import the SDK via Swift Package Manager',
    description:
      'Add the package https://bitbucket.org/sabpaisa-wp-29/ios_sp_framework-v.1.0/src/main/ and include Alamofire (https://github.com/Alamofire/Alamofire.git) as a dependency.'
  },
  {
    title: 'Step 3 — Sync resources on app launch',
    description: 'Call SabPaisaImageSync().sync() inside viewDidLoad so images and assets are prepared.',
    code: `override func viewDidLoad() {
    super.viewDidLoad()
    SabPaisaImageSync().sync()
}`
  },
  {
    title: 'Step 4 — Map response fields',
    description:
      'Use the TransactionResponse object returned by the SDK; it exposes payerName, statusCode, sabpaisaTxnId, udf fields, etc. Handle them to update your backend/UI.'
  }
]

const iosResponseVariables = `response.payerName
response.payerEmail
response.payerMobile
response.clientTxnId
response.payerAddress
response.amount
response.clientCode
response.paidAmount
response.paymentMode
response.bankName
response.amountType
response.status
response.statusCode
response.challanNumber
response.sibpaisatxnId
response.sibpaisaMessage
response.bankMessage
response.bankErrorCode
response.bankTxnId
response.transferDate
response.udf1 ... response.udf20`

const iosOtherPoints = [
  {
    title: 'TransactionResponse class',
    description: 'Use TransactionResponse for all information you need at the end of a transaction.'
  },
  {
    title: 'Disable SabPaisa success/failure screens',
    description: 'Set sabpaisaPaymentScreenEnabled to false when initializing SdkInitModel.',
    code: `vc.sdkInitModel = SdkInitModel(
    firstName: firstName,
    lastName: lastname,
    secKey: secKey,
    secInivialVector: secInivialVector,
    transUserName: transUserName,
    transUserPassword: transUserPassword,
    clientCode: clientCodeName,
    amount: Float(amount),
    emailAddress: emailId,
    mobileNumber: mobileNumber,
    isProd: true,
    baseUrl: baseUrl,
    initiUrl: initUrl,
    transactionEnquiryUrl: transactionEnqUrl,
    salutation: "Hi, ",
    sabpaisaPaymentScreenEnabled: false
)`
  },
  {
    title: 'Add callbackUrl parameter',
    description: 'Provide a callbackUrl when creating SdkInitModel if you want SabPaisa to call your endpoint.',
    code: `vc.sdkInitModel = SdkInitModel(
    firstName: firstName,
    lastName: lastname,
    secKey: secKey,
    secInivialVector: secInivialVector,
    transUserName: transUserName,
    transUserPassword: transUserPassword,
    clientCode: clientCodeName,
    amount: Float(amount),
    emailAddress: emailId,
    mobileNumber: mobileNumber,
    isProd: true,
    baseUrl: baseUrl,
    initiUrl: initUrl,
    transactionEnquiryUrl: transactionEnqUrl,
    salutation: "Hi, ",
    sabpaisaPaymentScreenEnabled: true
),
callbackUrl: "http://yourserveraddress.com/getData")`
  }
]

const odooIntroduction =
  "Integrating the SabPaisa Payment Gateway with your Odoo system enables secure and efficient online payment processing, offering your customers a seamless transaction experience. SabPaisa supports various payment methods, including credit cards, debit cards, net banking, UPI, and wallets, catering to a wide customer base."

const odooPrerequisites: FlowListItem[] = [
  {
    title: 'Odoo Installation',
    description: 'A running instance of Odoo (version 18.0 or compatible).'
  },
  {
    title: 'SabPaisa Merchant Account',
    description: 'An active merchant account with SabPaisa.'
  },
  {
    title: 'API Credentials',
    description: 'Client code, username, password, Auth Key, and Auth IV obtained from SabPaisa.'
  }
]

const odooProcessFlow: FlowListItem[] = [
  {
    title: 'Step 1: Download the SabPaisa Payment Gateway Module',
    description: 'Begin by downloading the official SabPaisa Payment Gateway module required for integration with Odoo.'
  },
  {
    title: 'Step 2: Install the Module in Odoo',
    description: 'Upload and install the downloaded module so that payment gateway features are available inside Odoo.'
  },
  {
    title: 'Step 3: Configure the Payment Gateway',
    description: 'Open the payment provider configuration and enter the necessary credentials and parameters.'
  },
  {
    title: 'Step 4: Test the Payment Gateway',
    description: 'Perform test transactions to ensure the payment gateway is functioning correctly.'
  },
  {
    title: 'Step 5: Activate Live Mode',
    description: 'Once testing succeeds, switch to live mode to process real customer payments.'
  }
]

type OdooStepContent =
  | { type: 'text'; content: string }
  | { type: 'image'; src: string; alt: string }

const odooSteps: { title: string; content: OdooStepContent[] }[] = [
  {
    title: 'Step 1: Download the SabPaisa Payment Gateway Module',
    content: [
      { type: 'text', content: '1. Access the Module: https://apps.odoo.com/apps/modules/18.0/payment_sabpaisa' },
      { type: 'image', src: '/odoo1.png', alt: 'Odoo Apps download module screenshot' },
      { type: 'text', content: '2. Click “Download” and save the module file (ZIP format) on your system.' }
    ]
  },
  {
    title: 'Step 2: Install the SabPaisa Payment Gateway Module in Odoo',
    content: [
      { type: 'text', content: 'Manual Installation via File Upload' },
      { type: 'text', content: '1. Upload the Module to Your Odoo Add-ons Directory:' },
      { type: 'text', content: 'a. Extract the downloaded ZIP file.' },
      { type: 'text', content: 'b. Move the extracted folder to the addons directory: \\odoo\\server\\odoo\\addons' },
      { type: 'text', content: 'c. Ensure the folder name matches the module’s technical name.' },
      { type: 'text', content: '2. Restart the Odoo service' },
      { type: 'text', content: 'a. Restart the Odoo service to recognize the new module.' },
      { type: 'text', content: '3. Update the Apps List:' },
      { type: 'text', content: 'a. Log in to Odoo → Go to Apps → Click “Update Apps List”.' },
      { type: 'image', src: '/odoo2.png', alt: 'Update apps list screenshot' },
      { type: 'text', content: 'b. Search for the SabPaisa module and click “ACTIVATE.”' },
      { type: 'image', src: '/odoo3.png', alt: 'Activate module screenshot' }
    ]
  },
  {
    title: 'Step 3: Configure the Payment Gateway',
    content: [
      { type: 'text', content: '1. Navigate to the Payment Provider Section:' },
      { type: 'text', content: 'a. Go to Invoicing / Accounting → Configuration → Payment Provider.' },
      { type: 'text', content: '2. Select the Installed Payment Gateway:' },
      { type: 'text', content: 'a. Find the SabPaisa payment gateway in the list.' },
      { type: 'image', src: '/odoo4.png', alt: 'Payment providers list screenshot' },
      { type: 'text', content: 'b. Click on SabPaisa to open the configuration settings.' },
      { type: 'image', src: '/odoo5.png', alt: 'SabPaisa configuration form screenshot' },
      { type: 'text', content: '3. Enter API Credentials:' },
      { type: 'text', content: 'a. Obtain your API credentials from SabPaisa.' },
      { type: 'text', content: 'b. Fill in the Client Code, Auth IV, Auth Key, Username, Password, PG URL details.' },
      { type: 'text', content: '4. Configure Payment Settings:' },
      { type: 'text', content: 'a. Enable the payment gateway by setting the State to “Enabled”.' },
      { type: 'text', content: '5. Save the Configuration and click “Test Connection” to verify the integration.' }
    ]
  },
  {
    title: 'Step 4: Test the Payment Gateway',
    content: [
      { type: 'text', content: 'Before going live, it’s essential to test the integration:' },
      { type: 'text', content: '1. Enable Test Mode:' },
      { type: 'text', content: 'a. In the Payment Acquirers section, switch the Mode to “Test Mode”.' },
      { type: 'text', content: '2. Perform a Test Transaction:' },
      { type: 'text', content: 'a. Create a test invoice and proceed with payment.' },
      { type: 'image', src: '/odoo6.png', alt: 'Test transaction screenshot' },
      { type: 'text', content: 'b. Use the test card details provided by SabPaisa.' },
      { type: 'text', content: 'c. Verify that the payment is recorded in Odoo.' }
    ]
  },
  {
    title: 'Step 5: Activate Live Mode',
    content: [
      { type: 'text', content: 'Once testing is successful:' },
      { type: 'text', content: '1. Go back to Invoicing → Configuration → Payment Provider.' },
      { type: 'text', content: '2. Switch “Test Mode” to “Live Mode”.' },
      { type: 'text', content: '3. Ensure the PG URL and credentials are set to the production environment.' }
    ]
  }
]

const wixIntroductionParagraphs = [
  'Integrating a payment gateway into your Wix website is crucial for enabling seamless and secure transactions. SabPaisa is a reliable and versatile payment gateway that supports multiple payment methods, including credit/debit cards, net banking, UPI, and wallets, making it an excellent choice for businesses and e-commerce platforms.',
  'In this guide, we will walk you through the step-by-step process of integrating the SabPaisa Payment Gateway with your Wix website.'
]

const wixReferenceEntries = [
  {
    label: 'SabPaisa-Config.js',
    href: 'https://bitbucket.org/sabpaisa-wp-29/wix-integration-kit/src/wix_kit/SabPaisa-config.js'
  },
  {
    label: 'http-function.js',
    href: 'https://bitbucket.org/sabpaisa-wp-29/wix-integration-kit/src/wix_kit/http-functions.js'
  },
  {
    label: 'SabPaisa.js',
    href: 'https://bitbucket.org/sabpaisa-wp-29/wix-integration-kit/src/wix_kit/SabPaisa.js'
  },
  {
    label: 'Staging URL',
    href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit'
  },
  {
    label: 'Production URL',
    href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit'
  }
]

const wixPrerequisites: FlowListItem[] = [
  {
    title: 'An active SabPaisa merchant account with valid credentials (Client code, user name, password, authKey, authIv).'
  },
  {
    title: 'SabPaisa sandbox/test credentials for checking transactions before going live.'
  },
  {
    title:
      'Purchase the Wix Business Elite package to access the Advanced Developer Platform required for integration and custom development.'
  }
]

const wixProcessFlow: FlowListItem[] = [
  {
    title: 'Step 1: Download the SabPaisa Payment Gateway Module',
    description: 'Begin by downloading the official SabPaisa Payment Gateway module required for integration with Wix.'
  },
  {
    title: 'Step 2: Install the Module in Wix',
    description: 'Add the SabPaisa plugin via Service Plugins so payment gateway functionality becomes available.'
  },
  {
    title: 'Step 3: Configure the Payment Gateway',
    description: 'Enter credentials, expose endpoints, and wire up SabPaisa-config.js, SabPaisa.js, and http-functions.js.'
  },
  {
    title: 'Step 4: Test the Payment Gateway',
    description: 'Create test transactions to ensure success and failure flows work as expected.'
  },
  {
    title: 'Step 5: Activate Live Mode',
    description: 'Publish the plugin, connect it in Accept Payments, and process live orders.'
  }
]

const openCartIntroductionParagraphs = [
  'This document is to provide an overview of the Payment Gateway integration provided by SabPaisa . The document contains the required information for E- commerce Kit to integrate the PG platform.',
  'OpenCart is an online store management system. It is PHP-based, using a MySQL database and HTML components. Support is provided for different languages and currencies. SabPaisa has a payment gateway plugin that allows businesses to accept online payments securely and efficiently. By integrating your Opencart website with SabPaisa, you can start accepting payments from customers in India and around the world.',
  'The process of integrating SabPaisa Payment Gateway plugin with your Opencart website is straightforward.'
]

const openCartReferenceEntries = [
  {
    label: 'Reference Code',
    href: 'https://bitbucket.org/sabpaisa-wp-29/opencart-plugin/src/master/'
  },
  {
    label: 'Staging URL',
    href: 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
  },
  {
    label: 'Live URL',
    href: 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
  }
]

const openCartCompatibilities: FlowListItem[] = [
  { title: 'OpenCart 3' },
  { title: 'OpenCart 2' },
  { title: 'OpenCart 1.5' },
  { title: 'Integrate your Opencart website with the SabPaisa Payment Gateway using our opencart plugin.' }
]

const openCartDownloadLink =
  'https://srslivetech-my.sharepoint.com/:u:/g/personal/vimal_vishwakarma_sabpaisa_in/EbsDa3XXpqNIqyl8ogmnPMIBiS6-jMRyRyP7Bjy0Dlgfmw?e=cqPgiV'

const openCartConfigurationSteps = [
  'Log in to OpenCart',
  'Navigate to the Admin Panel → Extensions → Payments to install the SabPaisa Payment Gateway extension.',
  'Click Edit. Complete the following steps:',
  'Add in your [CLIENT_CODE], [AUTHENTICATION_IV], [AUTH_KEY], [USER_NAME], and [PASSWORD] generated from the SabPaisa.',
  'Change extension status to Enabled.',
  'Click Save to save the extension settings.'
]

const reactNativeImportSnippet = `import { SabPaisaCheckout } from 'sabpaisa-react-lib-lite';`

const wooIntroduction =
  'This document explains how to install and configure the SabPaisa Payment Gateway plugin for WooCommerce so merchants can accept secure online payments.'

const wooProcessSteps = [
  'Download and install the SabPaisa plugin',
  'Configure WooCommerce payment settings',
  'Activate the SabPaisa payment method',
  'Enter API credentials (client code, username, password, spDomain, auth key/IV)'
]

const wooInstallationSteps = [
  {
    title: '1. Download the plugin',
    description: 'Use the Download Plugin button to get the SabPaisa WooCommerce package.'
  },
  {
    title: '2. Install the plugin',
    description:
      'WordPress Admin → Plugins → Add New → Upload Plugin. Choose the downloaded file, click Install Now, then Activate.'
  },
  {
    title: '3. Configure WooCommerce settings',
    description:
      'In WooCommerce → Settings → Payments, click SabPaisa to open its settings page and edit options.'
  },
  {
    title: '4. Enable the payment method',
    description: 'Toggle “Enable SabPaisa Payment Gateway” so it appears on checkout.'
  },
  {
    title: '5. Enter API credentials',
    description: 'Provide client code, username, password, spDomain, authentication key, and authentication IV from the SabPaisa portal.'
  },
  {
    title: '6. Test and go live',
    description: 'Use the staging URL for test orders. Once verified, switch to the live URL for production.'
  }
]

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
