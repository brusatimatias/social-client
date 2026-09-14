import { useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getFeed } from '@/api/posts'
import { rememberPostParticipants } from '@/lib/userDirectory'

export function useFeedQuery(page: number, perPage = 20) {
  const query = useQuery({
    queryKey: ['feed', page, perPage],
    queryFn: () => getFeed({ page, per_page: perPage }),
    placeholderData: keepPreviousData,
  })
  useEffect(() => {
    if (query.data) rememberPostParticipants(query.data.posts)
  }, [query.data])
  return query
}
