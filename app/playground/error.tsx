'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Code, Settings } from 'lucide-react'
import Link from 'next/link'

interface PlaygroundErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PlaygroundErrorPage({ error, reset }: PlaygroundErrorPageProps) {
  useEffect(() => {
    console.error('API Playground error:', error)
  }, [error])

  const isAPIError = error.message.includes('API') || error.message.includes('fetch')

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-lg">
            {isAPIError ? 'API Connection Error' : 'Playground Error'}
          </CardTitle>
          <CardDescription>
            {isAPIError 
              ? 'Unable to connect to the API testing service. Please check your connection and try again.'
              : 'The API playground encountered an unexpected error. Please refresh and try again.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm bg-muted p-3 rounded border">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                {error.toString()}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button asChild size="sm">
              <Link href="/sandbox">
                <Settings className="mr-2 h-4 w-4" />
                View Stage Overview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
