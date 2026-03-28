'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Circle, Sparkles } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import type { AgentStatus } from '@/types'

type AgentKey = keyof AgentStatus

const AGENTS: {
  key: AgentKey
  label: string
  description: string
  dependsOn?: AgentKey
  badge?: string
  icon: string
}[] = [
  {
    key: 'messaging',
    label: 'Messaging Agent',
    icon: '💬',
    description: 'Analyzing your ICP and competitive positioning to build a defensible messaging hierarchy...',
    badge: 'Parallel',
  },
  {
    key: 'copy',
    label: 'Copy Agent',
    icon: '✍️',
    description: 'Writing full landing page copy for all 8 sections from the approved messaging framework...',
    dependsOn: 'messaging',
  },
  {
    key: 'design',
    label: 'Design Agent',
    icon: '🎨',
    description: 'Generating 3 distinct visual design directions with palettes, typography, and layout recommendations...',
    badge: 'Parallel',
  },
  {
    key: 'qa',
    label: 'QA Agent',
    icon: '✅',
    description: 'Auditing the assembled page for CRO issues, brand consistency, and AEO readiness...',
    dependsOn: 'copy',
  },
]

function StatusIcon({ status }: { status: AgentStatus[AgentKey] }) {
  if (status === 'running') return <Loader2 className="animate-spin text-violet-400" size={22} />
  if (status === 'done')    return <CheckCircle className="text-green-400" size={22} />
  if (status === 'error')   return <XCircle className="text-red-400" size={22} />
  return <Circle className="text-zinc-700" size={22} />
}

function statusLabel(status: AgentStatus[AgentKey]): string {
  if (status === 'idle')    return 'Waiting'
  if (status === 'running') return 'Running'
  if (status === 'done')    return 'Complete'
  if (status === 'skipped') return 'Skipped'
  return 'Error'
}

function statusStyles(status: AgentStatus[AgentKey]): string {
  if (status === 'running') return 'bg-violet-950/200/15 text-violet-400 border border-violet-500/20'
  if (status === 'done')    return 'bg-green-950/200/15 text-green-400 border border-green-500/20'
  if (status === 'error')   return 'bg-red-950/200/15 text-red-400 border border-red-500/20'
  return 'bg-zinc-800 text-zinc-500 border border-zinc-700'
}

function cardStyles(status: AgentStatus[AgentKey]): string {
  if (status === 'running') return 'border-violet-500/40 bg-violet-950/20 shadow-[0_0_20px_rgba(124,58,237,0.12)]'
  if (status === 'done')    return 'border-green-500/30 bg-green-950/10'
  if (status === 'error')   return 'border-red-500/30 bg-red-950/10'
  return 'border-zinc-800 bg-zinc-900/40'
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
    <div className="max-w-xl mx-auto space-y-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Agents are building your page</h1>
        <p className="text-zinc-500 text-sm mt-1.5">Takes 20–40 seconds. You'll review everything before anything is final.</p>
      </div>

      {AGENTS.map((agent, i) => {
        const status = agentStatus[agent.key]
        return (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={['flex items-start gap-4 p-4 rounded-xl border transition-all duration-300', cardStyles(status)].join(' ')}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
              {status === 'running' ? <Loader2 size={18} className="animate-spin text-violet-400" /> : agent.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-zinc-100 text-sm">{agent.label}</p>
                  {agent.badge && (
                    <span className="text-[10px] bg-violet-950/200/15 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-medium">
                      {agent.badge}
                    </span>
                  )}
                  {agent.dependsOn && (
                    <span className="text-[10px] text-zinc-600">↳ after {agent.dependsOn}</span>
                  )}
                </div>
                <span className={['text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', statusStyles(status)].join(' ')}>
                  {statusLabel(status)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{agent.description}</p>
            </div>
          </motion.div>
        )
      })}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-4"
        >
          <Sparkles size={14} className="text-violet-400" />
          <p className="text-violet-400 font-medium text-sm">All agents complete — redirecting to review...</p>
        </motion.div>
      )}
    </div>
  )
}
