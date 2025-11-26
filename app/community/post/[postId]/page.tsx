import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { findCommunityPost, getAnswersForPost } from '../../data'
import type { ForumAnswer } from '../../types'
import { Calendar, ArrowLeft } from 'lucide-react'
import { AddAnswerForm } from '@/components/community/add-answer-form'
import { AnswerList } from '@/components/community/answer-list'

interface CommunityPostPageProps {
  params: Promise<{
    postId: string
  }>
}

const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { postId } = await params
  const post = await findCommunityPost(postId)
  if (!post) {
    notFound()
  }

  const answers: ForumAnswer[] = await getAnswersForPost(post!.id)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/community">
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{post!.category.replace('-', ' ')}</span>
                <span>•</span>
                <span>{formatDate(post!.createdAt)}</span>
                <span>•</span>
                <span>{post!.views} views</span>
              </div>
              <CardTitle className="text-2xl">{post!.title}</CardTitle>
              <CardDescription>{post!.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{post!.content}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {post!.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Answers ({answers.length})</CardTitle>
              <CardDescription>Most helpful responses from the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnswerList answers={answers} postId={post!.id} />
              <AddAnswerForm questionTitle={post!.title} postId={post!.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Asked</span>
                <span>{formatDate(post!.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last active</span>
                <span>{formatDate(post!.lastReply)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Viewed</span>
                <span>{post!.views} times</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Replies</span>
                <span>{post!.replies}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Author</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://placehold.co/40x40/9333ea/ffffff?text=${post!.author.name[0].toUpperCase()}`} />
                <AvatarFallback>{post!.author.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post!.author.name}</p>
                <p className="text-muted-foreground capitalize text-xs">{post!.author.role}</p>
                <p className="text-xs text-muted-foreground">Reputation {post!.author.reputation}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
