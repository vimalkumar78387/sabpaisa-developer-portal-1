import type { LucideIcon } from 'lucide-react'

export type ForumUserRole = 'developer' | 'moderator' | 'staff'

export interface ForumAuthor {
  id?: number | null
  name: string
  avatar: string
  role: ForumUserRole
  reputation: number
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  postCount: number
  lastActivity: string
  moderators: string[]
}

export interface ForumPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: ForumAuthor
  category: string
  tags: string[]
  createdAt: string
  lastReply: string
  replies: number
  views: number
  likes: number
  status: 'open' | 'closed' | 'solved'
  pinned?: boolean
}

export interface ForumAnswer {
  id: string
  author: ForumAuthor
  content: string
  createdAt: string
  likes: number
  dislikes: number
  isAccepted?: boolean
}
