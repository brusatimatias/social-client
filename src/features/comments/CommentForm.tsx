import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'

interface CommentFormProps {
  initialValue?: string
  submitLabel?: string
  loading?: boolean
  onSubmit: (content: string) => void
  onCancel?: () => void
}

export function CommentForm({
  initialValue = '',
  submitLabel = 'Comment',
  loading,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    if (!initialValue) setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <TextArea
        aria-label="Comment"
        rows={2}
        placeholder="Write a comment..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={!content.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
