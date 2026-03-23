'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { AgentHub } from '@/components/builder/AgentHub'

export default function HubPage() {
  const router = useRouter()
  const context = usePipelineStore((s) => s.context)

  useEffect(() => {
    if (!context) router.replace('/builder/intake')
  }, [context, router])

  if (!context) return null

  return <AgentHub />
}
