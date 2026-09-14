import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextArea } from '@/components/TextArea'
import { ErrorBanner } from '@/components/ErrorState'
import { extractApiErrors } from '@/lib/errors'
import type { Post, PostStatus, PostVisibility } from '@/types/post'
import { MediaUploadField } from './MediaUploadField'
import { useCreatePost, useUpdatePost } from './usePostsQueries'

interface PostComposerModalProps {
  open: boolean
  onClose: () => void
  post?: Post
}

const emptyForm = { content: '', visibility: 'public' as PostVisibility, status: 'published' as PostStatus }

export function PostComposerModal({ open, onClose, post }: PostComposerModalProps) {
  const [form, setForm] = useState(emptyForm)
  const [media, setMedia] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const createPost = useCreatePost()
  const updatePost = useUpdatePost(post?.id ?? '')
  const isEditing = !!post
  const pending = createPost.isPending || updatePost.isPending

  useEffect(() => {
    if (open) {
      setForm(
        post
          ? { content: post.content, visibility: post.visibility, status: post.status }
          : emptyForm,
      )
      setMedia([])
      setErrors([])
    }
  }, [open, post])

  const handleSubmit = () => {
    if (!form.content.trim()) return
    setErrors([])
    const input = { ...form, media }
    const mutation = isEditing ? updatePost : createPost
    mutation.mutate(input, {
      onSuccess: () => onClose(),
      onError: (error) => setErrors(extractApiErrors(error)),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit post' : 'Create post'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={pending} disabled={!form.content.trim()}>
            {isEditing ? 'Save changes' : 'Post'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {errors.length > 0 && <ErrorBanner messages={errors} />}
        <TextArea
          aria-label="Content"
          rows={4}
          placeholder="What's on your mind?"
          value={form.content}
          onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Visibility</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              value={form.visibility}
              onChange={(event) =>
                setForm((current) => ({ ...current, visibility: event.target.value as PostVisibility }))
              }
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as PostStatus }))}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <MediaUploadField files={media} onChange={setMedia} />
      </div>
    </Modal>
  )
}
