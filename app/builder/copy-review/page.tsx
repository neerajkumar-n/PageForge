'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { CopyReviewPanel } from '@/components/builder/CopyReviewPanel'

export default function CopyReviewPage() {
  const router = useRouter()
  const { copy, messaging } = usePipelineStore()

  useEffect(() => {
    if (!messaging) router.replace('/builder/messaging-review')
    else if (!copy) router.replace('/builder/running')
  }, [copy, messaging, router])

  if (!copy) return null
  return <CopyReviewPanel />
}
