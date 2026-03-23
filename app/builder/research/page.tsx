'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { ResearchPanel } from '@/components/builder/ResearchPanel'

export default function ResearchPage() {
  const router = useRouter()
  const context = usePipelineStore((s) => s.context)

  useEffect(() => {
    if (!context) {
      router.replace('/builder/intake')
    }
  }, [context, router])

  if (!context) return null

  return (
    <div>
      <ResearchPanel />
    </div>
  )
}
