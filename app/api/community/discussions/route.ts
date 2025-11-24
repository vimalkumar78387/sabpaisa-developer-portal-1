import { NextResponse } from 'next/server'
import { addCommunityPost, type ForumPost } from '@/app/community/data'

export async function POST(request: Request) {
  try {
    const { title, body, tags, categoryId } = await request.json()

    if (typeof title !== 'string' || title.trim().length < 15) {
      return NextResponse.json({ message: 'Title must be at least 15 characters.' }, { status: 400 })
    }

    if (typeof body !== 'string' || body.trim().length < 30) {
      return NextResponse.json({ message: 'Body must be at least 30 characters.' }, { status: 400 })
    }

    if (!Array.isArray(tags) || tags.length === 0 || tags.length > 5) {
      return NextResponse.json({ message: 'Provide between 1 and 5 tags.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const newPost: ForumPost = {
      id: String(Date.now()),
      title: title.trim(),
      excerpt: body.trim().slice(0, 140) + (body.trim().length > 140 ? '…' : ''),
      content: body.trim(),
      author: {
        name: 'You',
        avatar: '/placeholder-avatar.jpg',
        role: 'developer',
        reputation: 1,
      },
      category: categoryId || 'qa',
      tags: tags.slice(0, 5).map((tag: string) => tag.toLowerCase()),
      createdAt: now,
      lastReply: now,
      replies: 0,
      views: 0,
      likes: 0,
      status: 'open',
    }

    addCommunityPost(newPost)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }
}
