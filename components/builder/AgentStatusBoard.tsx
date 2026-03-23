'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Circle } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import type { AgentStatus } from '@/types'

type AgentKey = keyof AgentStatus

const AGENTS: {
  key: AgentKey
  label: string
  description: string
  dependsOn?: AgentKey
  badge?: string
}[] = [
  {
    key: 'messaging',
    label: 'Messaging Agent',
    description: 'Analyzing your ICP and competitive positioning to build a defensible messaging hierarchy...',
    badge: 'Parallel',
  },
  {
    key: 'copy',
    label: 'Copy Agent',
    description: 'Writing full landing page copy for all 8 sections from the approved messaging framework...',
    dependsOn: 'messaging',
  },
  {
    key: 'design',
    label: 'Design Agent',
    description: 'Generating 3 distinct visual design directions with palettes, typography, and layout recommendations...',
    badge: 'Parallel',
  },
  {
    key: 'qa',
    label: 'QA Agent',
    description: 'Auditing the assembled page for CRO issues, brand consistency, and conversion blockers...',
    dependsOn: 'copy',
  },
]

function StatusIcon({ status }: { status: AgentStatus[AgentKey] }) {
  if (status === 'running') return <Loader2 className="animate-spin text-indigo-500" size={24} />
  if (status === 'done') return <CheckCircle className="text-green-500" size={24} />
  if (status === 'error') return <XCircle className="text-red-500" size={24} />
  return <Circle className="text-gray-300" size={24} />
}

function statusLabel(status: AgentStatus[AgentKey]): string {
  if (status === 'idle') return 'Waiting...'
  if (status === 'running') return 'Running'
  if (status === 'done') return 'Complete'
  if (status === 'skipped') return 'Skipped'
  return 'Error'
}

function statusClass(status: AgentStatus[AgentKey]): string {
  if (status === 'running') return 'bg-indigo-100 text-indigo-700'
  if (status === 'done') return 'bg-green-100 text-green-700'
  if (status === 'error') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}

export function AgentStatusBoard() {
  const router = useRouter()
  const { agentStatus, setStep } = usePipelineStore()

  const allDone =
    agentStatus.messaging === 'done' &&
    agentStatus.copy === 'done' &&
    agentStatus.design === 'done' &&
    agentStatus.qa === 'done'

  useEffect(() => {
    if (allDone) {
      const t = setTimeout(() => {
        setStep('messaging-review')
        router.push('/builder/messaging-review')
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [allDone, router, setStep])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI agents are building your page</h1>
        <p className="text-gray-500">This takes 20–40 seconds. You'll review everything before anything goes live.</p>
      </div>

      {AGENTS.map((agent, i) => {
        const status = agentStatus[agent.key]
        return (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={[
              'flex items-start gap-4 p-5 rounded-xl border transition-all',
              status === 'running' ? 'border-indigo-300 bg-indigo-50' : '',
              status === 'done' ? 'border-green-200 bg-green-50' : '',
              status === 'error' ? 'border-red-200 bg-red-50' : '',
              status === 'idle' ? 'border-gray-200 bg-white' : '',
            ].join(' ')}
          >
            <div className="mt-0.5 shrink-0">
              <StatusIcon status={status} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{agent.label}</p>
                  {agent.badge && (
                    <span className="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-medium">
                      {agent.badge}
                    </span>
                  )}
                  {agent.dependsOn && (
                    <span className="text-xs text-gray-400">↳ after {agent.dependsOn}</span>
                  )}
                </div>
                <span className={['text-xs font-medium px-2 py-0.5 rounded-full', statusClass(status)].join(' ')}>
                  {statusLabel(status)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
            </div>
          </motion.div>
        )
      })}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <p className="text-indigo-600 font-semibold">All agents complete! Redirecting to review...</p>
        </motion.div>
      )}
    </div>
  )
}
