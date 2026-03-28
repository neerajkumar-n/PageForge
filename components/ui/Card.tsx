import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = { sm: 'p-3', md: 'p-5', lg: 'p-6' }

export function Card({ selected = false, hoverable = false, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-zinc-900',
        paddingClasses[padding],
        selected
          ? 'border-violet-500/60 shadow-glow-violet'
          : 'border-zinc-800',
        hoverable && 'cursor-pointer transition-all duration-200 hover:border-zinc-700 hover:shadow-card-hover hover:-translate-y-px',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
