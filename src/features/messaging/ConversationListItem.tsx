import { Link } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { useAuth } from '@/context/AuthContext'
import { useConversationQuery } from './useConversationsQuery'
import type { Conversation } from '@/types/conversation'

export function ConversationListItem({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth()
  const { data: detail } = useConversationQuery(conversation.id)

  const other = detail?.participants?.find((participant) => participant.User?.uuid !== user?.uuid)?.User

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className="flex items-center gap-3 py-3 hover:bg-gray-50"
    >
      <Avatar name={other?.name} lastname={other?.lastname} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{other?.fullName ?? 'Conversation'}</p>
        {conversation.lastMessage && (
          <p className="truncate text-sm text-gray-500">{conversation.lastMessage.content}</p>
        )}
      </div>
    </Link>
  )
}
