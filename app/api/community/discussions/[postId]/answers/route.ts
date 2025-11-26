import { NextResponse } from 'next/server'
import { addCommunityAnswer, findCommunityPost, reactToAnswer } from '@/app/community/data'

interface RouteParams {
  params: Promise<{
    postId: string
  }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { postId } = await params
  const post = await findCommunityPost(postId)
  if (!post) {
    return NextResponse.json({ message: 'Discussion not found' }, { status: 404 })
  }

  try {
    const { body } = await request.json()
    if (typeof body !== 'string' || body.trim().length < 30) {
      return NextResponse.json({ message: 'Answer must be at least 30 characters long.' }, { status: 400 })
    }

    const answer = await addCommunityAnswer({
      postId,
      content: body.trim(),
      userId: null,
    })

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Failed to post answer.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params
    const { answerId, type } = await request.json()
    if (typeof answerId !== 'string' || (type !== 'like' && type !== 'unlike')) {
      return NextResponse.json({ message: 'Invalid reaction payload.' }, { status: 400 })
    }

    const updated = await reactToAnswer({
      postId,
      answerId,
      reaction: type,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Failed to update reaction.' }, { status: 500 })
  }
}
