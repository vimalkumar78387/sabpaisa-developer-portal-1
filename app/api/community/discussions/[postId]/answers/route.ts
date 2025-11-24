import { NextResponse } from 'next/server'
import { addCommunityAnswer, findCommunityPost, type ForumAnswer } from '@/app/community/data'

interface RouteParams {
  params: {
    postId: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const post = findCommunityPost(params.postId)
  if (!post) {
    return NextResponse.json({ message: 'Discussion not found' }, { status: 404 })
  }

  try {
    const { body } = await request.json()
    if (typeof body !== 'string' || body.trim().length < 30) {
      return NextResponse.json({ message: 'Answer must be at least 30 characters long.' }, { status: 400 })
    }

    const answer: ForumAnswer = {
      id: String(Date.now()),
      author: {
        name: 'You',
        avatar: '/placeholder-avatar.jpg',
        role: 'developer',
        reputation: 1,
      },
      content: body.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    }

    addCommunityAnswer(params.postId, answer)
    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }
}
