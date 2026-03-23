'use client'

import { useState, useCallback } from 'react'
import { usePipelineStore } from '@/lib/store/pipeline'
import type { AgentTarget } from '@/app/api/agent-runner/route'

export function useRunAgent(target: AgentTarget) {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const store = usePipelineStore()

  const run = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setError(null)
    store.setAgentStatus(target, 'running')

    try {
      const res = await fetch('/api/agent-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          context: store.context,
          messaging: store.messaging ?? undefined,
          copy: store.copy ?? undefined,
          design: store.design ?? undefined,
          research: store.research ?? undefined,
          feedbackLog: store.feedbackLog,
        }),
      })

      if (!res.body) throw new Error('No response stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const { status, data } = JSON.parse(line.slice(6))
            if (status === 'done' && data) {
              if (target === 'messaging') store.setMessaging(data)
              else if (target === 'copy') store.setCopy(data)
              else if (target === 'design') store.setDesign(data)
              else if (target === 'qa') store.setQA(data)
              else if (target === 'seo') store.setSEO(data)
              store.setAgentStatus(target, 'done')
            } else if (status === 'error') {
              const msg = data?.message ?? 'Agent failed'
              setError(msg)
              store.setAgentStatus(target, 'error')
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      setError(msg)
      store.setAgentStatus(target, 'error')
    } finally {
      setIsRunning(false)
    }
  }, [target, store, isRunning])

  return { run, isRunning, error }
}
