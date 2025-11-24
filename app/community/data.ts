import type { LucideIcon } from 'lucide-react'
import {
  HelpCircle,
  Lightbulb,
  Bug,
  Code,
  MessageSquare,
  Settings,
} from 'lucide-react'

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
  author: {
    name: string
    avatar: string
    role: 'developer' | 'moderator' | 'staff'
    reputation: number
  }
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
  author: ForumPost['author']
  content: string
  createdAt: string
  likes: number
  isAccepted?: boolean
}

export const forumCategories: ForumCategory[] = [
  {
    id: 'qa',
    name: 'Questions & Answers',
    description: 'Get help with integration issues and technical questions',
    icon: HelpCircle,
    color: 'text-blue-600 bg-blue-100',
    postCount: 1247,
    lastActivity: '2 minutes ago',
    moderators: ['SabPaisa Team', 'Community Moderators'],
  },
  {
    id: 'feature-requests',
    name: 'Feature Requests',
    description: 'Suggest new features and improvements',
    icon: Lightbulb,
    color: 'text-yellow-600 bg-yellow-100',
    postCount: 89,
    lastActivity: '1 hour ago',
    moderators: ['Product Team'],
  },
  {
    id: 'bug-reports',
    name: 'Bug Reports',
    description: 'Report issues and bugs you encounter',
    icon: Bug,
    color: 'text-red-600 bg-red-100',
    postCount: 156,
    lastActivity: '30 minutes ago',
    moderators: ['Engineering Team'],
  },
  {
    id: 'code-examples',
    name: 'Code Examples',
    description: 'Share and discuss integration code examples',
    icon: Code,
    color: 'text-green-600 bg-green-100',
    postCount: 234,
    lastActivity: '3 hours ago',
    moderators: ['Developer Advocates'],
  },
  {
    id: 'general',
    name: 'General Discussion',
    description: 'General discussions about SabPaisa and payments',
    icon: MessageSquare,
    color: 'text-purple-600 bg-purple-100',
    postCount: 567,
    lastActivity: '15 minutes ago',
    moderators: ['Community Team'],
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Official announcements and updates',
    icon: Settings,
    color: 'text-indigo-600 bg-indigo-100',
    postCount: 23,
    lastActivity: '2 days ago',
    moderators: ['SabPaisa Team'],
  },
]

const seedPosts: ForumPost[] = [
  {
    id: '1',
    title: 'How to implement UPI AutoPay with SabPaisa?',
    excerpt:
      "I'm trying to integrate UPI AutoPay for recurring payments but facing issues with mandate creation...",
    content:
      'We have enabled UPI AutoPay for monthly subscriptions. Mandate creation succeeds in stage, but the production flow fails after the user approves the UPI intent. What are the required parameters for `npciTxnId` and what should we watch for in the webhook payload?',
    author: {
      name: 'dev_raj',
      avatar: '/placeholder-avatar.jpg',
      role: 'developer',
      reputation: 245,
    },
    category: 'qa',
    tags: ['UPI', 'AutoPay', 'recurring-payments'],
    createdAt: '2024-01-15T10:30:00Z',
    lastReply: '2024-01-15T11:45:00Z',
    replies: 3,
    views: 127,
    likes: 5,
    status: 'open',
  },
  {
    id: '2',
    title: 'Webhook signature verification failing in production',
    excerpt:
      'The HMAC signature verification works in sandbox but fails in production environment...',
    content:
      'Sandbox signatures pass, but production webhooks give signature mismatch. Is there a different secret or header for live traffic? I am using `x-sabpaisa-signature` header with SHA256 HMAC.',
    author: {
      name: 'sarah_tech',
      avatar: '/placeholder-avatar.jpg',
      role: 'developer',
      reputation: 892,
    },
    category: 'qa',
    tags: ['webhooks', 'security', 'production'],
    createdAt: '2024-01-15T09:15:00Z',
    lastReply: '2024-01-15T10:20:00Z',
    replies: 7,
    views: 234,
    likes: 12,
    status: 'solved',
  },
  {
    id: '3',
    title: 'Feature Request: Support for SEPA payments',
    excerpt:
      'It would be great to have SEPA payment method support for European customers...',
    content:
      'Our EU merchants are asking for SEPA Direct Debit support. Are there plans to extend the payment stack beyond India-based methods?',
    author: {
      name: 'european_dev',
      avatar: '/placeholder-avatar.jpg',
      role: 'developer',
      reputation: 156,
    },
    category: 'feature-requests',
    tags: ['SEPA', 'international', 'payments'],
    createdAt: '2024-01-14T16:22:00Z',
    lastReply: '2024-01-15T08:30:00Z',
    replies: 15,
    views: 445,
    likes: 28,
    status: 'open',
    pinned: true,
  },
  {
    id: '4',
    title: 'React Native SDK memory leak issue',
    excerpt:
      'Experiencing memory leaks when using the React Native SDK for multiple payment flows...',
    content:
      'The React Native bridge seems to leak listeners after multiple payment attempts. Anyone patched this?',
    author: {
      name: 'mobile_expert',
      avatar: '/placeholder-avatar.jpg',
      role: 'developer',
      reputation: 678,
    },
    category: 'bug-reports',
    tags: ['react-native', 'mobile', 'memory-leak'],
    createdAt: '2024-01-14T14:10:00Z',
    lastReply: '2024-01-15T07:45:00Z',
    replies: 4,
    views: 199,
    likes: 9,
    status: 'open',
  },
]

const globalStore = globalThis as typeof globalThis & {
  __COMMUNITY_POSTS__?: ForumPost[]
  __COMMUNITY_POST_SUBSCRIBERS__?: Set<() => void>
}

if (!globalStore.__COMMUNITY_POSTS__) {
  globalStore.__COMMUNITY_POSTS__ = [...seedPosts]
}

if (!globalStore.__COMMUNITY_POST_SUBSCRIBERS__) {
  globalStore.__COMMUNITY_POST_SUBSCRIBERS__ = new Set()
}

let forumPosts = globalStore.__COMMUNITY_POSTS__!
const postSubscribers = globalStore.__COMMUNITY_POST_SUBSCRIBERS__

const seedAnswers: Record<string, ForumAnswer[]> = {
  '1': [
    {
      id: 'a1',
      author: {
        name: 'SabPaisa Support',
        avatar: '/placeholder-avatar.jpg',
        role: 'staff',
        reputation: 3200,
      },
      content:
        'Please ensure you pass `npciTxnId` from the PSP callback to the `verifyMandate` API. Also confirm you are using the production encryption keys. The webhook payload includes `mandateStatus=C` when AutoPay is confirmed.',
      createdAt: '2024-01-15T11:00:00Z',
      likes: 6,
      isAccepted: true,
    },
    {
      id: 'a2',
      author: {
        name: 'integrator007',
        avatar: '/placeholder-avatar.jpg',
        role: 'developer',
        reputation: 540,
      },
      content:
        'Double-check that your VPA is whitelisted for AutoPay. We had the same issue until support enabled it for our merchant ID.',
      createdAt: '2024-01-15T11:40:00Z',
      likes: 2,
    },
  ],
}

if (!globalStore.__COMMUNITY_ANSWERS__) {
  globalStore.__COMMUNITY_ANSWERS__ = { ...seedAnswers }
}

const answerStore = globalStore.__COMMUNITY_ANSWERS__ as Record<string, ForumAnswer[]>

export function addCommunityPost(post: ForumPost) {
  forumPosts = [post, ...forumPosts]
  globalStore.__COMMUNITY_POSTS__ = forumPosts
  postSubscribers.forEach((listener) => listener())
}

export function findCommunityPost(id: string) {
  return forumPosts.find((post) => post.id === id)
}

export function getCommunityPosts(): ForumPost[] {
  return forumPosts
}

export function subscribeToCommunityPosts(listener: () => void) {
  postSubscribers.add(listener)
  return () => {
    postSubscribers.delete(listener)
  }
}

export function getAnswersForPost(postId: string): ForumAnswer[] {
  return answerStore[postId] ? [...answerStore[postId]] : []
}

export function addCommunityAnswer(postId: string, answer: ForumAnswer) {
  if (!answerStore[postId]) {
    answerStore[postId] = []
  }
  answerStore[postId].push(answer)
}
