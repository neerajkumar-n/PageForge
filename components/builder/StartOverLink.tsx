'use client'

import Link from 'next/link'
import { usePipelineStore } from '@/lib/store/pipeline'

export function StartOverLink() {
  const resetSession = usePipelineStore((s) => s.resetSession)

  return (
    <Link
      href="/builder/hub"
      onClick={resetSession}
      className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
    >
      Start over
    </Link>
  )
}
