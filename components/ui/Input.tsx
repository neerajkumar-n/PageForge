import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-violet-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-900 text-zinc-100',
            'placeholder:text-zinc-600',
            'transition-all duration-150',
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-zinc-700/60 hover:border-zinc-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
