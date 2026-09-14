export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function initials(name?: string, lastname?: string): string {
  const first = name?.trim()?.[0] ?? ''
  const second = lastname?.trim()?.[0] ?? ''
  return (first + second).toUpperCase() || '?'
}

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm']

export function isVideoUrl(url: string): boolean {
  const withoutQuery = url.split(/[?#]/)[0]
  const extension = withoutQuery.split('.').pop()?.toLowerCase()
  return !!extension && VIDEO_EXTENSIONS.includes(extension)
}
