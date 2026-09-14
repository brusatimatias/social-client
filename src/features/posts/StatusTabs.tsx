import { cn } from '@/lib/utils'
import type { PostStatus } from '@/types/post'

const tabs: { value: PostStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

export function StatusTabs({
  value,
  onChange,
}: {
  value: PostStatus | undefined
  onChange: (value: PostStatus | undefined) => void
}) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-gray-500 hover:text-gray-800',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
