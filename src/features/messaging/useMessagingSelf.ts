import { useQuery } from '@tanstack/react-query'
import { getMessagingUser } from '@/api/messaging/users'
import { useAuth } from '@/context/AuthContext'

// Resolves the current user's messaging-service-local numeric id (not the
// Social API's `user.id`) for use as a message's senderId.
export function useMessagingSelf() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['messagingUser', user?.uuid],
    queryFn: () => getMessagingUser(user!.uuid),
    enabled: !!user?.uuid,
    staleTime: Infinity,
  })
}
