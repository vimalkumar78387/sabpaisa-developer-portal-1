import { NextResponse } from 'next/server'
import { addCommunityPost, getCommunityPosts } from '@/app/community/data'

export async function GET() {
  try {
    const posts = await getCommunityPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to load community discussions', error)
    return NextResponse.json({ message: 'Failed to load discussions.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, body, tags, categoryId, clientCode } = await request.json()

    if (typeof title !== 'string' || title.trim().length < 15) {
      return NextResponse.json({ message: 'Title must be at least 15 characters.' }, { status: 400 })
    }

    if (typeof body !== 'string' || body.trim().length < 30) {
      return NextResponse.json({ message: 'Body must be at least 30 characters.' }, { status: 400 })
    }

    if (!Array.isArray(tags)) {
      return NextResponse.json({ message: 'Provide between 1 and 5 tags.' }, { status: 400 })
    }

    const normalizedTags = tags
      .map((tag: string) => tag?.trim().toLowerCase())
      .filter(Boolean)

    if (normalizedTags.length === 0 || normalizedTags.length > 5) {
      return NextResponse.json({ message: 'Provide between 1 and 5 tags.' }, { status: 400 })
    }

    if (typeof clientCode !== 'string') {
      return NextResponse.json({ message: 'Client Code is required.' }, { status: 400 })
    }

    const normalizedClientCode = clientCode.trim().toUpperCase()
    if (!/^[A-Z0-9]{4,7}$/.test(normalizedClientCode)) {
      return NextResponse.json(
        { message: 'Invalid client code.' },
        { status: 400 }
      )
    }

    const createdPost = await addCommunityPost({
      title: title.trim(),
      body: body.trim(),
      tags: normalizedTags,
      categoryId: typeof categoryId === 'string' && categoryId ? categoryId : 'qa',
      userId: null,
      clientCode: normalizedClientCode,
    })

    return NextResponse.json(createdPost, { status: 201 })
  } catch (error) {
    console.error('Failed to create discussion', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Failed to create discussion.' }, { status: 500 })
  }
}
