import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { NewConversationModal } from './NewConversationModal'
import { useConversationsQuery } from './useConversationsQuery'
import { useMessagingSocket } from './useMessagingSocket'

export function ConversationsPage() {
  useMessagingSocket()
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()
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
          {conversations.map((conversation) => {
            const other = conversation.participants.find((participant) => participant.uuid !== user?.uuid)
            return (
              <Link
                key={conversation.id}
                to={`/messages/${conversation.id}`}
                className="flex items-center gap-3 py-3 hover:bg-gray-50"
              >
                <Avatar name={other?.name} lastname={other?.lastname} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{other?.fullName ?? 'Unknown user'}</p>
                  {conversation.lastMessage && (
                    <p className="truncate text-sm text-gray-500">{conversation.lastMessage.content}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <NewConversationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
