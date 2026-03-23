'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/lib/store/pipeline'
import { AgentStatusBoard } from '@/components/builder/AgentStatusBoard'

export default function RunningPage() {
  const router = useRouter()
  const { context, setAgentStatus, setMessaging, setCopy, setDesign, setQA, setSEO } = usePipelineStore()
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!context) {
      router.replace('/builder/intake')
      return
    }
    if (hasStarted.current) return
    hasStarted.current = true

    async function runAgents() {
      const response = await fetch('/api/run-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          feedbackLog: usePipelineStore.getState().feedbackLog,
        }),
      })

      if (!response.body) return

      const reader = response.body.getReader()
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
            const parsed = JSON.parse(line.replace('data: ', ''))
            const { agent, status, data } = parsed

            if (agent === 'messaging') {
              setAgentStatus('messaging', status)
              if (status === 'done' && data) setMessaging(data)
            } else if (agent === 'copy') {
              setAgentStatus('copy', status)
              if (status === 'done' && data) setCopy(data)
            } else if (agent === 'design') {
              setAgentStatus('design', status)
              if (status === 'done' && data) setDesign(data)
            } else if (agent === 'qa') {
              setAgentStatus('qa', status)
              if (status === 'done' && data) setQA(data)
            }
          } catch {
            // skip malformed events
          }
        }
      }
    }

    runAgents().catch(console.error)
  }, [context, router, setAgentStatus, setMessaging, setCopy, setDesign, setQA, setSEO])

  return <AgentStatusBoard />
}
