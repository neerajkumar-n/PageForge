'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { DesignReviewPanel } from '@/components/builder/DesignReviewPanel'

export default function DesignReviewPage() {
  const router = useRouter()
  const { design, copy } = usePipelineStore()

  useEffect(() => {
    if (!copy) router.replace('/builder/copy-review')
    else if (!design) router.replace('/builder/running')
  }, [copy, design, router])

  if (!design) return null
  return <DesignReviewPanel />
}
