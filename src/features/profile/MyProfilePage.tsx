import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { deleteMe, updateMe } from '@/api/auth'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ErrorBanner } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { extractApiErrors } from '@/lib/errors'

const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export function MyProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: user?.name ?? '', lastname: user?.lastname ?? '' })
  const [errors, setErrors] = useState<string[]>([])
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const saveMutation = useMutation({
    mutationFn: () => updateMe(form),
    onSuccess: (updated) => {
      updateUser(updated)
      showToast('Profile updated', 'success')
    },
    onError: (error) => setErrors(extractApiErrors(error)),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => updateMe({ avatar: file }),
    onSuccess: (updated) => {
      updateUser(updated)
      showToast('Profile photo updated', 'success')
    },
    onError: (error) => {
      showToast(extractApiErrors(error)[0], 'error')
      setAvatarPreview(null)
    },
  })

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type)) {
      showToast("That file type isn't supported for a profile photo.", 'error')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      showToast('Profile photo must be 5MB or smaller.', 'error')
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    avatarMutation.mutate(file)
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteMe(),
    onSuccess: async () => {
      await logout()
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      showToast(extractApiErrors(error)[0], 'error')
      setConfirmingDelete(false)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setErrors([])
    saveMutation.mutate()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarMutation.isPending}
            className="group relative rounded-full disabled:cursor-not-allowed"
            aria-label="Change profile photo"
          >
            <Avatar
              name={user?.name}
              lastname={user?.lastname}
              avatarUrl={avatarPreview ?? user?.avatar_url}
              size="lg"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {avatarMutation.isPending ? <Spinner size="sm" /> : 'Change'}
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept={AVATAR_TYPES.join(',')}
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div>
            <p className="text-base font-semibold text-gray-900">
              {user?.name} {user?.lastname}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {errors.length > 0 && <ErrorBanner messages={errors} />}
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="name"
              label="Name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              id="lastname"
              label="Last name"
              value={form.lastname}
              onChange={(event) => setForm((current) => ({ ...current, lastname: event.target.value }))}
            />
          </div>
          <Button type="submit" loading={saveMutation.isPending} className="self-start">
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deleting your account permanently removes your posts, comments and likes.
        </p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
          Delete account
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete account"
        description="This action can't be undone. Your account and all its content will be permanently deleted."
        confirmLabel="Delete account"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
