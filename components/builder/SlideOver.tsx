'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  accentColor?: string
  width?: 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

const widthMap = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = 'bg-indigo-500',
  width = 'lg',
  children,
}: SlideOverProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={[
              'fixed right-0 top-0 bottom-0 z-50 w-full bg-white shadow-2xl flex flex-col',
              widthMap[width],
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
              {icon && (
                <div className={['w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg shrink-0', accentColor].join(' ')}>
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-tight">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
