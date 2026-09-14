import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchUsers } from '@/api/users'
import { rememberUsers } from '@/lib/userDirectory'

export function useSearchUsers(query: string) {
  const trimmed = query.trim()
  const result = useQuery({
    queryKey: ['users', 'search', trimmed],
    queryFn: () => searchUsers({ q: trimmed || undefined }),
  })

  useEffect(() => {
    if (result.data) rememberUsers(result.data.users)
  }, [result.data])

  return result
}
