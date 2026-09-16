import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorState'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { useSearchUsers } from '@/features/explore/useSearchUsers'
import { extractMessagingApiErrors } from '@/lib/errors'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useCreateConversation } from './useConversationsQuery'

interface NewConversationModalProps {
  open: boolean
  onClose: () => void
}

export function NewConversationModal({ open, onClose }: NewConversationModalProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query, 300)
  const { data, isLoading } = useSearchUsers(debouncedQuery)
  const createConversation = useCreateConversation()
  const navigate = useNavigate()

  const users = data?.users ?? []

  const startConversation = (uuid: string) => {
    setError(null)
    createConversation.mutate(uuid, {
      onSuccess: (conversation) => {
        setQuery('')
        onClose()
        navigate(`/messages/${conversation.id}`)
      },
      onError: (mutationError) => setError(extractMessagingApiErrors(mutationError)[0]),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="New message">
      <div className="flex flex-col gap-4">
        {error && <ErrorBanner messages={[error]} />}
        <Input
          aria-label="Search people"
          placeholder="Search by name..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {!isLoading && users.length === 0 && (
          <EmptyState
            title={query ? 'No matches' : 'Search for someone'}
            description={query ? `No one found for "${query}".` : 'Type a name to start a conversation.'}
          />
        )}

        {users.length > 0 && (
          <div className="flex flex-col divide-y divide-gray-100">
            {users.map((user) => (
              <button
                key={user.uuid}
                type="button"
                disabled={createConversation.isPending}
                onClick={() => startConversation(user.uuid)}
                className="flex items-center gap-3 py-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Avatar name={user.name} lastname={user.lastname} avatarUrl={user.avatar_url} />
                <span className="text-sm font-semibold text-gray-900">
                  {user.name} {user.lastname}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
