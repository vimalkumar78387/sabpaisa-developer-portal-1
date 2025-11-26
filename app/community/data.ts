'use server'

import { db } from '@/lib/db/drizzle'
import { communityAnswers, communityPosts, users } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import type { ForumAnswer, ForumAuthor, ForumPost } from './types'

const FALLBACK_AVATAR = '/placeholder-avatar.jpg'

const fallbackAuthor: ForumAuthor = {
  name: 'Community Member',
  avatar: FALLBACK_AVATAR,
  role: 'developer',
  reputation: 1,
}

const getRawPost = async (postId: string) => {
  return await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
    with: {
      author: true,
      answers: {
        columns: {
          id: true,
          createdAt: true,
        },
        orderBy: (answers, { desc }) => [desc(answers.createdAt)],
      },
    },
  })
}

const getRawAnswer = async (answerId: string) => {
  return await db.query.communityAnswers.findFirst({
    where: eq(communityAnswers.id, answerId),
    with: {
      author: true,
    },
  })
}

type RawPost = NonNullable<Awaited<ReturnType<typeof getRawPost>>>
type RawAnswer = NonNullable<Awaited<ReturnType<typeof getRawAnswer>>>

const mapAuthor = (author?: typeof users.$inferSelect | null): ForumAuthor => ({
  id: author?.id,
  name: author?.name ?? fallbackAuthor.name,
  avatar: fallbackAuthor.avatar,
  role: 'developer',
  reputation: author ? 120 : fallbackAuthor.reputation,
})

const formatExcerpt = (body: string) => {
  if (body.length <= 140) return body
  return `${body.slice(0, 137)}…`
}

const isValidStatus = (status?: string): status is ForumPost['status'] => {
  return status === 'open' || status === 'closed' || status === 'solved'
}

const mapPostRecord = (post: RawPost): ForumPost => {
  const replies = post.answers?.length ?? 0
  const lastReply = post.lastReplyAt ?? post.answers?.[0]?.createdAt ?? post.createdAt ?? new Date()

  return {
    id: post.id,
    title: post.title,
    excerpt: formatExcerpt(post.body),
    content: post.body,
    author: mapAuthor(post.author),
    category: post.categoryId,
    tags: post.tags ?? [],
    createdAt: (post.createdAt ?? new Date()).toISOString(),
    lastReply: lastReply.toISOString(),
    replies,
    views: post.views ?? 0,
    likes: post.likes ?? 0,
    status: isValidStatus(post.status) ? post.status : 'open',
    pinned: post.pinned ?? undefined,
  }
}

const mapAnswerRecord = (answer: RawAnswer): ForumAnswer => ({
  id: answer.id,
  author: mapAuthor(answer.author),
  content: answer.content,
  createdAt: (answer.createdAt ?? new Date()).toISOString(),
  likes: answer.likes ?? 0,
  dislikes: answer.dislikes ?? 0,
  isAccepted: answer.isAccepted ?? undefined,
})

export async function getCommunityPosts(): Promise<ForumPost[]> {
  const posts = await db.query.communityPosts.findMany({
    orderBy: (post, { desc }) => [desc(post.createdAt)],
    with: {
      author: true,
      answers: {
        columns: {
          id: true,
          createdAt: true,
        },
        orderBy: (answers, { desc }) => [desc(answers.createdAt)],
      },
    },
  })

  return posts.map(
    (post) =>
      mapPostRecord({
        ...post,
        answers: post.answers ?? [],
      } as RawPost)
  )
}

export async function findCommunityPost(id: string): Promise<ForumPost | null> {
  const post = await getRawPost(id)
  if (!post) return null
  return mapPostRecord({
    ...post,
    answers: post.answers ?? [],
  })
}

export async function getAnswersForPost(postId: string): Promise<ForumAnswer[]> {
  const answers = await db.query.communityAnswers.findMany({
    where: eq(communityAnswers.postId, postId),
    orderBy: (answer, { asc }) => [asc(answer.createdAt)],
    with: {
      author: true,
    },
  })

  return answers.map((answer) =>
    mapAnswerRecord({
      ...answer,
    })
  )
}

export async function addCommunityPost({
  title,
  body,
  tags,
  categoryId,
  userId,
  clientCode,
}: {
  title: string
  body: string
  tags: string[]
  categoryId: string
  userId?: number | null
  clientCode: string
}): Promise<ForumPost> {
  const [created] = await db
    .insert(communityPosts)
    .values({
      title,
      body,
      tags,
      categoryId,
      userId: userId ?? null,
      clientCode,
      lastReplyAt: new Date(),
    })
    .returning({
      id: communityPosts.id,
    })

  const post = await findCommunityPost(created.id)
  if (!post) {
    throw new Error('Unable to load created discussion')
  }
  return post
}

export async function addCommunityAnswer({
  postId,
  content,
  userId,
}: {
  postId: string
  content: string
  userId?: number | null
}): Promise<ForumAnswer> {
  const [created] = await db
    .insert(communityAnswers)
    .values({
      postId,
      content,
      userId: userId ?? null,
    })
    .returning({
      id: communityAnswers.id,
      createdAt: communityAnswers.createdAt,
    })

  await db
    .update(communityPosts)
    .set({
      lastReplyAt: created.createdAt,
      updatedAt: new Date(),
    })
    .where(eq(communityPosts.id, postId))

  const newAnswer = await getRawAnswer(created.id)
  if (!newAnswer) {
    throw new Error('Unable to load created answer')
  }
  return mapAnswerRecord(newAnswer)
}

export async function reactToAnswer({
  postId,
  answerId,
  reaction,
}: {
  postId: string
  answerId: string
  reaction: 'like' | 'unlike'
}): Promise<ForumAnswer> {
  const columnToUpdate =
    reaction === 'like' ? { likes: sql`${communityAnswers.likes} + 1` } : { dislikes: sql`${communityAnswers.dislikes} + 1` }

  await db
    .update(communityAnswers)
    .set(columnToUpdate)
    .where(eq(communityAnswers.id, answerId))

  const updatedAnswer = await getRawAnswer(answerId)
  if (!updatedAnswer || updatedAnswer.postId !== postId) {
    throw new Error('Answer not found')
  }
  return mapAnswerRecord(updatedAnswer)
}
