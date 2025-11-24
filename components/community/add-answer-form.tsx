'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle } from 'lucide-react'

interface AddAnswerFormProps {
  questionTitle: string
  postId: string
}

export function AddAnswerForm({ questionTitle, postId }: AddAnswerFormProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState('')
  const [errors, setErrors] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!expanded) {
    return (
      <Button className="w-full" variant="secondary" onClick={() => setExpanded(true)}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Add your answer
      </Button>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value.trim().length < 30) {
      setErrors('Answer must be at least 30 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/community/discussions/${postId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: value.trim() }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload?.message || 'Failed to post answer.'
        setErrors(message)
        toast.error(message)
        return
      }

      setValue('')
      setErrors(null)
      setExpanded(false)
      toast.success('Answer posted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong while posting your answer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder={`Share how you would solve "${questionTitle}"`}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setErrors(null)
        }}
        rows={5}
        className="resize-none"
      />
      {errors && <p className="text-xs text-red-500">{errors}</p>}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!value.trim() || isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post answer'}
          </Button>
        </div>
      </div>
    </form>
  )
}
