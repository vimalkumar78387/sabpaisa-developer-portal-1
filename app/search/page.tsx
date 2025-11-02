'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search,
  Filter,
  FileText,
  ExternalLink,
  Clock,
  Tag,
  Loader2,
  X,
  BookOpen,
  Shield,
  Code,
  Wrench,
  Bell,
  Users,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { debounce } from 'lodash'

interface SearchResult {
  id: string
  title: string
  content: string
  url: string
  category: string
  tags: string[]
  score?: number
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
  categories: string[]
  error?: string
}

const categoryIcons: Record<string, any> = {
  'Documentation': BookOpen,
  'Products': Code,
  'Security': Shield,
  'Integration': Code,
  'Tools': Wrench,
  'Updates': Bell,
  'Support': Users
}

const categoryColors: Record<string, string> = {
  'Documentation': 'bg-blue-100 text-blue-800 border-blue-200',
  'Products': 'bg-green-100 text-green-800 border-green-200',
  'Security': 'bg-red-100 text-red-800 border-red-200',
  'Integration': 'bg-purple-100 text-purple-800 border-purple-200',
  'Tools': 'bg-orange-100 text-orange-800 border-orange-200',
  'Updates': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Support': 'bg-pink-100 text-pink-800 border-pink-200'
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const Icon = categoryIcons[result.category] || FileText
  const categoryColor = categoryColors[result.category] || 'bg-gray-100 text-gray-800 border-gray-200'

  // Highlight search terms in content
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query.split(' ').filter(Boolean).join('|')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => {
      const isHighlight = regex.test(part)
      return isHighlight ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">
                <Link 
                  href={result.url} 
                  className="hover:text-primary transition-colors duration-200"
                >
                  {result.title}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${categoryColor}`}
                >
                  {result.category}
                </Badge>
                {result.score && result.score > 20 && (
                  <Badge variant="outline" className="text-xs">
                    High relevance
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Link 
            href={result.url}
            className="flex-shrink-0 p-1 hover:bg-accent rounded-md transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed mb-3">
          {highlightText(result.content, '')}
        </CardDescription>
        {result.tags && result.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {result.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {result.tags.length > 4 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{result.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SearchResultSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string, searchCategory: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category: searchCategory,
          limit: '20'
        })
        
        const response = await fetch(`/api/search?${params}`)
        
        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`)
        }
        
        const data: SearchResponse = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setResults(data.results || [])
        setCategories(data.categories || [])
        setHasSearched(true)
        setRetryCount(0) // Reset retry count on successful search
      } catch (error) {
        console.error('Search error:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        setResults([])
        setHasSearched(true)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Search when query or category changes
  useEffect(() => {
    debouncedSearch(query, category)
    
    // Update URL params
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category !== 'all') params.set('category', category)
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl)
  }, [query, category, debouncedSearch, router])

  // Load initial data
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-categories' })
        })
        
        if (!response.ok) {
          throw new Error('Failed to load categories')
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Set default categories as fallback
        setCategories(['All', 'Documentation', 'Products', 'Security', 'Integration', 'Tools', 'Updates', 'Support'])
      }
    }
    
    loadCategories()
  }, [])

  const clearSearch = () => {
    setQuery('')
    setCategory('all')
    setResults([])
    setHasSearched(false)
    setError(null)
    setRetryCount(0)
    router.replace('/search')
  }

  const retrySearch = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    if (query.trim()) {
      debouncedSearch(query, category)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Search Documentation</h1>
        </div>
        <p className="text-muted-foreground">
          Find answers, guides, and resources across all SabPaisa documentation and tools.
        </p>
      </div>

      {/* Search Controls */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation, guides, APIs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.toLowerCase()} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(query || category !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {query && (
                <Badge variant="secondary" className="gap-1">
                  Query: "{query}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery('')}
                    className="h-3 w-3 p-0 ml-1"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categories.find(c => c.toLowerCase() === category) || category}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategory('all')}
                    className="h-3 w-3 p-0 ml-1"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearSearch} className="text-xs">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <SearchResultSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search Error</h3>
              <p className="text-muted-foreground mb-4">
                {error.includes('status 429') 
                  ? 'Too many requests. Please wait a moment before searching again.'
                  : error.includes('status 500')
                  ? 'Our search service is temporarily unavailable. Please try again later.'
                  : `Search failed: ${error}`
                }
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={retrySearch} disabled={retryCount >= 3}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Retry attempt: {retryCount}/3
                </p>
              )}
            </CardContent>
          </Card>
        ) : hasSearched ? (
          results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                  {query && ` for "${query}"`}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className="grid gap-4">
                {results.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any results for "{query}". Try different keywords or browse our documentation.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                  <Button asChild>
                    <Link href="/docs">Browse docs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search SabPaisa Documentation</h3>
              <p className="text-muted-foreground mb-6">
                Enter a keyword, phrase, or question to find relevant documentation, guides, and resources.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <Card className="p-3 sm:p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => setQuery('payment gateway')}>
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2" />
                  <p className="text-xs sm:text-sm font-medium">APIs</p>
                </Card>
                <Card className="p-3 sm:p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => setQuery('integration')}>
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Integration</p>
                </Card>
                <Card className="p-3 sm:p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => setQuery('security')}>
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Security</p>
                </Card>
                <Card className="p-3 sm:p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => setQuery('webhook')}>
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Webhooks</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}