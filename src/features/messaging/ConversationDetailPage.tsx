import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner, ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { TextArea } from '@/components/TextArea'
import { useAuth } from '@/context/AuthContext'
import { extractMessagingApiErrors } from '@/lib/errors'
import { useConversationQuery } from './useConversationsQuery'
import { useMessagesQuery } from './useMessagesQuery'
import { useMessagingSelf } from './useMessagingSelf'
import { useMessagingSocket } from './useMessagingSocket'
import { useSendMessage } from './useSendMessage'

export function ConversationDetailPage() {
  useMessagingSocket()
  const { conversationId } = useParams<{ conversationId: string }>()
  const id = Number(conversationId)

  const { user } = useAuth()
  const { data: conversation } = useConversationQuery(id)
  const { data: messages, isLoading, isError, refetch } = useMessagesQuery(id)
  const { data: self } = useMessagingSelf()
  const sendMessage = useSendMessage(id)

  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const other = conversation?.participants?.find((participant) => participant.User?.uuid !== user?.uuid)?.User

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const handleSend = () => {
    const value = content.trim()
    if (!value || !self) return
    setError(null)
    setContent('')
    sendMessage.mutate(value, {
      onError: (mutationError) => {
        setError(extractMessagingApiErrors(mutationError)[0])
        setContent(value)
      },
    })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <Avatar name={other?.name} lastname={other?.lastname} />
        <h1 className="text-lg font-semibold text-gray-900">{other?.fullName ?? 'Conversation'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        )}

        {isError && <ErrorState message="Couldn't load this conversation." onRetry={refetch} />}

        {!isLoading && !isError && (messages?.length ?? 0) === 0 && (
          <EmptyState title="No messages yet" description="Say hello!" />
        )}

        {messages && messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((message) => {
              const isMine = message.senderId === self?.id
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      isMine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <ErrorBanner messages={[error]} />}

      <div className="flex gap-2 border-t border-gray-200 pt-3">
        <TextArea
          aria-label="Message"
          rows={1}
          placeholder="Write a message..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={handleSend} disabled={!content.trim() || !self} loading={sendMessage.isPending}>
          Send
        </Button>
      </div>
    </div>
  )
}
