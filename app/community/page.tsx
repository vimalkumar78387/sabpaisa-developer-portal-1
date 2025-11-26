'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Plus,
  Filter,
  Star,
  MessageCircle,
  ThumbsUp,
  Eye,
  Calendar,
  Tag,
  Crown,
  Clock,
  HelpCircle,
  FileText,
  AlignLeft,
  Folder,
  Hash,
} from 'lucide-react'
import Link from 'next/link'
import type { ForumPost } from './types'
import { forumCategories } from './constants'

const popularTags = [
  { name: 'payment-gateway', count: 324 },
  { name: 'webhooks', count: 189 },
  { name: 'react', count: 156 },
  { name: 'nodejs', count: 143 },
  { name: 'php', count: 128 },
  { name: 'mobile', count: 98 },
  { name: 'upi', count: 87 },
  { name: 'e-nach', count: 76 }
]

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState('')
  const [discussions, setDiscussions] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('discussions')
  const [titleValue, setTitleValue] = useState('')
  const [bodyValue, setBodyValue] = useState('')
  const [clientCodeValue, setClientCodeValue] = useState('')
  const [formCategory, setFormCategory] = useState(forumCategories[0]?.id ?? 'qa')
  const [tagInput, setTagInput] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        const response = await fetch('/api/community/discussions')
        if (!response.ok) {
          throw new Error('Failed to load discussions')
        }
        const payload: ForumPost[] = await response.json()
        setDiscussions((prev) => {
          if (prev.length === 0) return payload
          const merged = new Map<string, ForumPost>()
          for (const post of [...payload, ...prev]) {
            merged.set(post.id, post)
          }
          return Array.from(merged.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        })
      } catch (error) {
        toast.error('Unable to load discussions. Please refresh.')
      } finally {
        setIsLoading(false)
      }
    }
    loadDiscussions()
  }, [])

  const filteredPosts = discussions.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag)

    return matchesSearch && matchesCategory && matchesTag
  })

  const categoryCounts = discussions.reduce<Record<string, number>>((acc, post) => {
    acc[post.category] = (acc[post.category] ?? 0) + 1
    return acc
  }, {})

  const tagCounts = discussions.reduce<Record<string, number>>((acc, post) => {
    post.tags.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1
    })
    return acc
  }, {})

  const popularTagList = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  const activeDevelopersCount = new Set(discussions.map((post) => post.author.name)).size
  const totalDiscussions = discussions.length
  const solvedCount = discussions.filter((post) => post.status === 'solved').length
  const respondedCount = discussions.filter((post) => post.replies > 0).length
  const responseRate = totalDiscussions === 0 ? 0 : Math.round((respondedCount / totalDiscussions) * 100)
  const formatNumber = (value: number) => value.toLocaleString('en-IN')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'staff': return <Crown className="h-3 w-3 text-yellow-600" />
      case 'moderator': return <Star className="h-3 w-3 text-blue-600" />
      default: return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'staff': return <Badge variant="default" className="text-xs">Staff</Badge>
      case 'moderator': return <Badge variant="secondary" className="text-xs">Moderator</Badge>
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solved': return <Badge variant="secondary" className="text-green-700 bg-green-100">Solved</Badge>
      case 'closed': return <Badge variant="outline">Closed</Badge>
      default: return <Badge variant="outline">Open</Badge>
    }
  }

  const resetForm = () => {
    setTitleValue('')
    setBodyValue('')
    setClientCodeValue('')
    setFormCategory(forumCategories[0]?.id ?? 'qa')
    setFormTags([])
    setTagInput('')
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (titleValue.trim().length < 15) {
      errors.title = 'Title must be at least 15 characters long.'
    }
    if (bodyValue.trim().length < 30) {
      errors.body = 'Body must be at least 30 characters long.'
    }
    if (formTags.length === 0) {
      errors.tags = 'Add at least one tag.'
    } else if (formTags.length > 5) {
      errors.tags = 'You can specify up to 5 tags.'
    }
    const trimmedClientCode = clientCodeValue.trim().toUpperCase()
    if (!/^[A-Z0-9]{4,7}$/.test(trimmedClientCode)) {
      errors.clientCode = 'Invalid'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitDiscussion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleValue.trim(),
          body: bodyValue.trim(),
          tags: formTags,
          categoryId: formCategory,
          clientCode: clientCodeValue.trim().toUpperCase(),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload?.message || 'Failed to create discussion.'
        toast.error(message)
        return
      }

      const createdPost: ForumPost = await response.json()
      setDiscussions((prev) => {
        if (prev.some((post) => post.id === createdPost.id)) {
          return prev
        }
        return [createdPost, ...prev]
      })
      toast.success('Discussion published successfully')
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestions = popularTags
    .map((tag) => tag.name)
    .filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formTags.includes(tag))
    .slice(0, 5)

  const handleAddTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase()
    if (!normalized || formTags.includes(normalized) || formTags.length >= 5) return
    setFormTags((prev) => [...prev, normalized])
    setTagInput('')
  }

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      if (tagInput.trim()) {
        handleAddTag(tagInput)
      }
    }
  }

  return (
    <>
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Community Forums</h1>
            <Badge variant="secondary">Developer Support</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Connect with fellow developers, get help with integration issues, and share your knowledge with the community.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(activeDevelopersCount)}</div>
                    <div className="text-sm text-muted-foreground">Active Developers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(totalDiscussions)}</div>
                    <div className="text-sm text-muted-foreground">Total Discussions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(solvedCount)}</div>
                    <div className="text-sm text-muted-foreground">Questions Solved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{responseRate}%</div>
                    <div className="text-sm text-muted-foreground">Response Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="popular">Popular Tags</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <select 
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {forumCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select 
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                    >
                      <option value="">All Tags</option>
                      {popularTags.map((tag) => (
                        <option key={tag.name} value={tag.name}>
                          {tag.name} ({tag.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discussion List */}
            <div className="space-y-4">
              {isLoading && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Loading discussions…
                  </CardContent>
                </Card>
              )}
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://placehold.co/40x40/6366f1/ffffff?text=${post.author.name[0].toUpperCase()}`} />
                        <AvatarFallback>{post.author.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {post.pinned && <Star className="h-4 w-4 text-yellow-600 fill-current" />}
                              <Link href={`/community/post/${post.id}`} className="text-lg font-semibold hover:text-primary">
                                {post.title}
                              </Link>
                              {getStatusBadge(post.status)}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{post.excerpt}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getRoleIcon(post.author.role)}
                                <span>{post.author.name}</span>
                                {getRoleBadge(post.author.role)}
                                <span>• {post.author.reputation} rep</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="mr-1 h-2 w-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{post.replies}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Last reply {new Date(post.lastReply).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!isLoading && filteredPosts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              {forumCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setActiveTab('discussions')
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{categoryCounts[category.id] ?? 0}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last activity: {category.lastActivity}</span>
                      <span>Moderated by: {category.moderators.join(', ')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Popular Tags Tab */}
          <TabsContent value="popular" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
                <CardDescription>
                  Most frequently used tags in community discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {popularTagList.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {popularTagList.map(([tagName, count]) => (
                      <Button
                        key={tagName}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tagName)
                          setActiveTab('discussions')
                        }}
                        className="flex items-center gap-2"
                      >
                        <Tag className="h-3 w-3" />
                        {tagName}
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags have been used yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
                <CardDescription>
                  Help us maintain a positive and helpful community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Be respectful and constructive in your interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Search before posting to avoid duplicate questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide clear details and code examples when asking for help</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Mark solutions as solved to help other developers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Share your knowledge and help others when you can</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a new discussion</DialogTitle>
          <DialogDescription>
            Provide enough context and details so the community can help you faster.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmitDiscussion}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Quick Tips</h4>
              <p className="mt-2 text-xs text-muted-foreground">
                Keep your question focused, describe the context, and choose the category that best fits your challenge.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-muted-foreground">Submission Checklist</h4>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>⬩ Title ≥ 15 characters</li>
                <li>⬩ Body ≥ 30 characters</li>
                <li>⬩ Tags: up to 5, use keywords</li>
                <li>⬩ Client Code: SabPaisa reference</li>
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span>Title</span>
              </div>
              <Input
                className="mt-2"
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
                placeholder="Be specific and imagine you’re asking a question to another person."
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
            </div>

            <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlignLeft className="h-4 w-4 text-primary" />
                <span>Body</span>
              </div>
              <Textarea
                className="mt-2"
                rows={6}
                value={bodyValue}
                onChange={(event) => setBodyValue(event.target.value)}
                placeholder="Include all the information someone would need to answer your question."
              />
              {formErrors.body && <p className="mt-1 text-xs text-red-500">{formErrors.body}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Folder className="h-4 w-4 text-primary" />
                  <span>Category</span>
                </div>
                <select
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formCategory}
                  onChange={(event) => setFormCategory(event.target.value)}
                >
                  {forumCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4 text-primary" />
                  <span>Client Code (Provided by SabPaisa)</span>
                </div>
                <Input
                  className="mt-2"
                  value={clientCodeValue}
                  onChange={(event) => setClientCodeValue(event.target.value.toUpperCase())}
                  placeholder="Enter the 4-7 character client code"
                  inputMode="text"
                  maxLength={7}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the SabPaisa-issued client code.
                </p>
                {formErrors.clientCode && <p className="text-xs text-red-500">{formErrors.clientCode}</p>}
              </div>
            </div>

            <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-primary" />
                <span>Tags</span>
              </div>
              <Input
                className="mt-2"
                placeholder="Add up to 5 tags (e.g., windows, sql-server, swift)"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
              {suggestions.length > 0 && (
                <div className="mt-2 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Suggestions:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="rounded-full border px-2 py-0.5 hover:bg-muted"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {formTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-[10px]"
                      onClick={() => setFormTags((prev) => prev.filter((item) => item !== tag))}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Press Enter to add a tag. Maximum 5 tags.</p>
              {formErrors.tags && <p className="text-xs text-red-500">{formErrors.tags}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Posting…' : 'Post to Community'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
