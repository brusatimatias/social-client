export type EntityId = number | string

export interface ApiEnvelope<T> {
  data: T
  errors: string[] | null
  meta: ApiMeta
}

export interface ApiMeta {
  current_page?: number
  per_page?: number
  total_count?: number
  total_pages?: number
  [key: string]: unknown
}
