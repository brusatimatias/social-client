import { useState } from 'react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { ConversationListItem } from './ConversationListItem'
import { NewConversationModal } from './NewConversationModal'
import { useConversationsQuery } from './useConversationsQuery'
import { useMessagingSocket } from './useMessagingSocket'

export function ConversationsPage() {
  useMessagingSocket()
  const [modalOpen, setModalOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useConversationsQuery()

  const conversations = data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <Button onClick={() => setModalOpen(true)}>New message</Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {isError && <ErrorState message="Couldn't load your conversations." onRetry={refetch} />}

      {!isLoading && !isError && conversations.length === 0 && (
        <EmptyState title="No conversations yet" description="Start a new message to begin chatting." />
      )}

      {conversations.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-4">
          {conversations.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}

      <NewConversationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
