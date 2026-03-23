'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { MessagingReviewPanel } from '@/components/builder/MessagingReviewPanel'

export default function MessagingReviewPage() {
  const router = useRouter()
  const { messaging, context } = usePipelineStore()

  useEffect(() => {
    if (!context) router.replace('/builder/intake')
    else if (!messaging) router.replace('/builder/running')
  }, [context, messaging, router])

  if (!messaging) return null
  return <MessagingReviewPanel />
}
