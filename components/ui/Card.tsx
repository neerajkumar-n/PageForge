import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  selected = false,
  hoverable = false,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white',
        paddingClasses[padding],
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1'
          : 'border-gray-200',
        hoverable && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
