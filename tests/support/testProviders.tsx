import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function TestProviders({
  children,
  queryClient,
  initialEntries = ['/'],
}: {
  children: ReactNode
  queryClient?: QueryClient
  initialEntries?: string[]
}) {
  return (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

/** For renderHook's `wrapper` option when a component tree (Router) isn't needed. */
export function withQueryClient(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
