import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors duration-150',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
