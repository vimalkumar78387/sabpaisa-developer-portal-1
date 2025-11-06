'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from './button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
  showLineNumbers?: boolean
  wrapLongLines?: boolean
}

export function CodeBlock({ 
  code, 
  language = 'javascript', 
  filename, 
  className,
  showLineNumbers = true,
  wrapLongLines = false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative group", className)}>
      {filename && (
        <div className="bg-muted px-4 py-2 text-sm font-medium border border-b-0 rounded-t-lg">
          {filename}
        </div>
      )}
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          wrapLongLines={wrapLongLines}
          className={cn(
            "!m-0 !bg-slate-950 !text-sm",
            filename ? "!rounded-t-none !rounded-b-lg" : "!rounded-lg"
          )}
          customStyle={{
            padding: '1rem',
            margin: 0,
            whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLongLines ? 'break-word' : 'normal',
            overflowX: wrapLongLines ? 'hidden' : 'auto'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
