export type ParameterSpec = {
  name: string
  type: string
  required: boolean
  description: string
}

export type IntegrationKit = {
  id: string
  name: string
  logo: string
  introduction: string
  sampleCode: { label: string; url: string }
  videoUrl?: string
  environments: { staging: string; production: string }
  request: { summary: string; sample: string; language: string }
  requestParameters: ParameterSpec[]
  encryption: string
  response: { summary: string; sample: string; language: string }
  responseParameters: ParameterSpec[]
}

export type IntegrationCategory = {
  id: string
  title: string
  kits: IntegrationKit[]
}

export const integrationCategories: IntegrationCategory[] = [
  {
    id: 'gateway',
    title: 'Payment Gateway',
    kits: [
      {
        id: 'rest',
        name: 'REST Checkout',
        logo: '/logos/rest.svg',
        introduction:
          'Use our REST APIs to initiate payments, capture funds, and reconcile settlements with full idempotency support.',
        sampleCode: { label: 'View REST quickstart', url: 'https://github.com/sabpaisa/rest-starter' },
        environments: {
          staging: 'https://sandbox-api.sabpaisa.in/v1/payments',
          production: 'https://api.sabpaisa.in/v1/payments',
        },
        request: {
          summary: 'Create a payment intent that supports cards, UPI, netbanking, and wallets.',
          sample: `POST /v1/payments\n{\n  "orderId": "order_12345",\n  "amount": 125000,\n  "currency": "INR",\n  "customer": {\n    "name": "Aarav Malhotra",\n    "email": "aarav@example.com",\n    "phone": "9876543210"\n  },\n  "channel": "WEB",\n  "returnUrl": "https://merchant.example.com/success",\n  "webhookUrl": "https://merchant.example.com/webhook"\n}`,
          language: 'json',
        },
        requestParameters: [
          { name: 'orderId', type: 'string', required: true, description: 'Unique identifier for the merchant order.' },
          { name: 'amount', type: 'number', required: true, description: 'Amount in paise.' },
          { name: 'currency', type: 'string', required: true, description: 'ISO currency code. Currently supports INR.' },
          { name: 'returnUrl', type: 'string', required: true, description: 'Customer redirect URL after payment.' },
          { name: 'webhookUrl', type: 'string', required: true, description: 'Webhook URL to receive payment events.' },
        ],
        encryption: 'Payloads must be signed with your client secret using HMAC-SHA256 before transmission.',
        response: {
          summary: 'Successful responses include the payment intent identifier and hosted checkout URL.',
          sample: `HTTP/1.1 200 OK\n{\n  "paymentId": "pay_LG2b9Wxk",\n  "status": "PENDING",\n  "checkoutUrl": "https://checkout.sabpaisa.in/pay_LG2b9Wxk"\n}`,
          language: 'json',
        },
        responseParameters: [
          { name: 'paymentId', type: 'string', required: true, description: 'Identifier of the payment intent.' },
          { name: 'status', type: 'string', required: true, description: 'Current payment status.' },
          { name: 'checkoutUrl', type: 'string', required: true, description: 'Hosted checkout URL to redirect the customer.' },
        ],
      },
    ],
  },
  {
    id: 'enach',
    title: 'Recurring Payments',
    kits: [
      {
        id: 'mandate',
        name: 'E-NACH Mandate',
        logo: '/logos/enach.svg',
        introduction:
          'Automate recurring collections with paperless mandates, configurable frequencies, and auto-retry logic.',
        sampleCode: { label: 'Download E-NACH boilerplate', url: 'https://github.com/sabpaisa/enach-starter' },
        environments: {
          staging: 'https://sandbox-api.sabpaisa.in/v1/enach',
          production: 'https://api.sabpaisa.in/v1/enach',
        },
        request: {
          summary: 'Create a recurring debit mandate for subscription or EMI collection.',
          sample: `POST /v1/enach/mandates\n{\n  "mandateId": "mandate_001",\n  "amount": 99900,\n  "currency": "INR",\n  "frequency": "MONTHLY",\n  "startDate": "2025-01-01",\n  "endDate": "2026-01-01",\n  "customer": {\n    "name": "Neha Rao",\n    "accountNumber": "XXXXXXXX1234",\n    "ifsc": "SBIN0000123"\n  }\n}`,
          language: 'json',
        },
        requestParameters: [
          { name: 'mandateId', type: 'string', required: true, description: 'Unique identifier for the mandate.' },
          { name: 'frequency', type: 'string', required: true, description: 'Debit frequency (daily/weekly/monthly/yearly).' },
          { name: 'startDate', type: 'string', required: true, description: 'ISO date when the mandate becomes active.' },
        ],
        encryption: 'Mandate payloads are encrypted with the SabPaisa public key and signed with merchant private keys.',
        response: {
          summary: 'The mandate reference, status, and activation timelines are returned upon success.',
          sample: `HTTP/1.1 201 CREATED\n{\n  "mandateReference": "MNDT987654",\n  "status": "PENDING_APPROVAL",\n  "approvalUrl": "https://sandbox.sabpaisa.in/enach/consent/MNDT987654"\n}`,
          language: 'json',
        },
        responseParameters: [
          { name: 'mandateReference', type: 'string', required: true, description: 'Reference generated for the mandate.' },
          { name: 'approvalUrl', type: 'string', required: true, description: 'URL for customer consent journey.' },
        ],
      },
    ],
  },
]
