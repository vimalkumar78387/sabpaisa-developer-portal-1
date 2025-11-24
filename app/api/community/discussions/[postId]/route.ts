import { NextResponse } from 'next/server'
import { findCommunityPost } from '@/app/community/data'

interface RouteParams {
  params: {
    postId: string
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const post = findCommunityPost(params.postId)
  if (!post) {
    return NextResponse.json({ message: 'Discussion not found' }, { status: 404 })
  }
  return NextResponse.json(post)
}
