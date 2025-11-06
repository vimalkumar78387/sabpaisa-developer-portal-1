import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
  async rewrites() {
    return [
      {
        source: '/api/txnenquiry/sandbox',
        destination: 'https://stage-txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId'
      },
      {
        source: '/api/txnenquiry/staging',
        destination: 'https://stage-txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId'
      },
      {
        source: '/api/txnenquiry/production',
        destination: 'https://txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId'
      }
    ];
  },
  allowedDevOrigins: [
    '*.clackypaas.com',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ]
};

export default nextConfig;
