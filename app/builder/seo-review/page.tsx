'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { SEOReviewPanel } from '@/components/builder/SEOReviewPanel'

export default function SEOReviewPage() {
  const router = useRouter()
  const { context, messaging, copy } = usePipelineStore()

  useEffect(() => {
    if (!context || !messaging || !copy) {
      router.replace('/builder/intake')
    }
  }, [context, messaging, copy, router])

  if (!context || !messaging || !copy) return null

  return (
    <div>
      <SEOReviewPanel />
    </div>
  )
}
