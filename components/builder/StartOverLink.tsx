'use client'

import Link from 'next/link'
import { usePipelineStore } from '@/lib/store/pipeline'

export function StartOverLink() {
  const resetSession = usePipelineStore((s) => s.resetSession)

  return (
    <Link
      href="/builder/hub"
      onClick={resetSession}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      Start over
    </Link>
  )
}
