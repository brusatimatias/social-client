import { initials } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({
  name,
  lastname,
  size = 'md',
}: {
  name?: string
  lastname?: string
  size?: keyof typeof sizeClasses
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${sizeClasses[size]}`}
    >
      {initials(name, lastname)}
    </span>
  )
}
