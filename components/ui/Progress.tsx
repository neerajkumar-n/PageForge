import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: 'violet' | 'green' | 'amber'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const colorClasses = {
  violet: 'bg-gradient-to-r from-violet-600 to-violet-500',
  green:  'bg-gradient-to-r from-green-600 to-green-400',
  amber:  'bg-gradient-to-r from-amber-600 to-amber-400',
}

const glowClasses = {
  violet: 'shadow-[0_0_8px_rgba(124,58,237,0.5)]',
  green:  'shadow-[0_0_8px_rgba(34,197,94,0.4)]',
  amber:  'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
}

const sizeClasses = { sm: 'h-1', md: 'h-1.5' }

export function Progress({ value, max = 100, color = 'violet', size = 'md', showLabel = false, className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-zinc-500">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-zinc-800 overflow-hidden', sizeClasses[size], className)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color], pct > 0 && glowClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
