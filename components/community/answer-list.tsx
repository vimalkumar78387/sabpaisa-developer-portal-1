'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { ForumAnswer } from '@/app/community/types'

interface AnswerListProps {
  answers: ForumAnswer[]
  postId: string
}

const formatAnswerDate = (timestamp: string) =>
  new Date(timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export function AnswerList({ answers, postId }: AnswerListProps) {
  const [entries, setEntries] = useState(answers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    setEntries(answers)
  }, [answers])

  const handleReaction = async (answerId: string, type: 'like' | 'unlike') => {
    if (loadingId) return
    setLoadingId(answerId)
    const previousEntries = entries
    setEntries((prev) =>
      prev.map((answer) =>
        answer.id === answerId
          ? {
              ...answer,
              likes: answer.likes + (type === 'like' ? 1 : 0),
              dislikes: answer.dislikes + (type === 'unlike' ? 1 : 0),
            }
          : answer
      )
    )

    try {
      const response = await fetch(`/api/community/discussions/${postId}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type }),
      })
      if (!response.ok) {
        throw new Error('Failed to update reaction')
      }
      const payload: ForumAnswer = await response.json()
      setEntries((prev) => prev.map((answer) => (answer.id === payload.id ? payload : answer)))
    } catch (error) {
      setEntries(previousEntries)
    } finally {
      setLoadingId(null)
    }
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No answers yet. Be the first to respond!</p>
  }

  return (
    <>
      {entries.map((answer) => (
        <div key={answer.id} className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://placehold.co/40x40/6366f1/ffffff?text=${answer.author.name[0].toUpperCase()}`} />
                <AvatarFallback>{answer.author.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{answer.author.name}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="uppercase text-[10px] tracking-wide">{answer.author.role}</span>
                  <span>• {answer.author.reputation} rep</span>
                </div>
              </div>
            </div>
            <span>{formatAnswerDate(answer.createdAt)}</span>
          </div>

          <p className="text-sm text-foreground">{answer.content}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleReaction(answer.id, 'like')}
              disabled={loadingId === answer.id}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{answer.likes}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleReaction(answer.id, 'unlike')}
              disabled={loadingId === answer.id}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{answer.dislikes}</span>
            </Button>
            {answer.isAccepted && (
              <Badge variant="secondary" className="text-xs">
                Accepted
              </Badge>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
