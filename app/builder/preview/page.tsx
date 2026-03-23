'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { PreviewPanel } from '@/components/builder/PreviewPanel'

export default function PreviewPage() {
  const router = useRouter()
  const { design, copy, context, setGeneratedPage, generatedPage } = usePipelineStore()
  const hasGenerated = useRef(false)

  useEffect(() => {
    if (!design) { router.replace('/builder/design-review'); return }
    if (!copy || !context) { router.replace('/builder/running'); return }
    if (generatedPage || hasGenerated.current) return
    hasGenerated.current = true

    const session = usePipelineStore.getState()

    fetch('/api/export-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setGeneratedPage(data)
      })
      .catch(console.error)
  }, [design, copy, context, generatedPage, router, setGeneratedPage])

  if (!design || !copy) return null
  return <PreviewPanel />
}
