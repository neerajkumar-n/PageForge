import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: 'indigo' | 'green' | 'amber'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const colorClasses = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export function Progress({
  value,
  max = 100,
  color = 'indigo',
  size = 'md',
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
