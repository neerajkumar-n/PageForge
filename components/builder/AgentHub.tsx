'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle, XCircle, Circle, Play, RefreshCw,
  ChevronRight, Zap, ExternalLink,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
import { SlideOver } from '@/components/builder/SlideOver'
import { ResearchPanel } from '@/components/builder/ResearchPanel'
import { MessagingPanel } from '@/components/builder/panels/MessagingPanel'
import { CopyPanel } from '@/components/builder/panels/CopyPanel'
import { DesignPanel } from '@/components/builder/panels/DesignPanel'
import { SEOPanel } from '@/components/builder/panels/SEOPanel'
import { QAPanel } from '@/components/builder/panels/QAPanel'
import type { AgentStatus } from '@/types'

type AgentKey = keyof AgentStatus
type PanelKey = AgentKey | null

// ── Agent config ────────────────────────────────────────────

interface AgentConfig {
  key: AgentKey
  label: string
  tagline: string
  icon: string
  color: {
    bg: string
    border: string
    badge: string
    text: string
    button: string
    glow: string
  }
  hint?: string
  outputPreview: (store: ReturnType<typeof usePipelineStore.getState>) => string | null
}

const AGENTS: AgentConfig[] = [
  {
    key: 'research',
    label: 'Research Agent',
    tagline: 'Context gathering & competitive intelligence',
    icon: '🔬',
    color: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      badge: 'bg-violet-100 text-violet-700',
      text: 'text-violet-600',
      button: 'bg-violet-600 hover:bg-violet-700',
      glow: 'shadow-violet-100',
    },
    outputPreview: (s) => s.research?.brief?.company?.oneLiner?.slice(0, 90) ?? null,
  },
  {
    key: 'messaging',
    label: 'Messaging Agent',
    tagline: 'Headlines, value props & positioning',
    icon: '💬',
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      text: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
      glow: 'shadow-purple-100',
    },
    outputPreview: (s) => s.messaging?.primaryHeadline ?? null,
  },
  {
    key: 'copy',
    label: 'Copy Agent',
    tagline: 'Full landing page copy for all sections',
    icon: '✍️',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      glow: 'shadow-blue-100',
    },
    hint: 'Works best after Messaging',
    outputPreview: (s) => {
      if (!s.copy) return null
      const approved = s.copy.sections.filter((x) => x.approved).length
      return `${approved}/${s.copy.sections.length} sections approved`
    },
  },
  {
    key: 'design',
    label: 'Design Agent',
    tagline: 'Palettes, typography & layout directions',
    icon: '🎨',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      glow: 'shadow-emerald-100',
    },
    outputPreview: (s) => {
      if (!s.design) return null
      const dir = s.design.directions.find((d) => d.id === s.design!.selectedDirectionId)
      return dir ? `Direction: ${dir.name}` : null
    },
  },
  {
    key: 'seo',
    label: 'SEO Agent',
    tagline: 'Meta tags, schema markup & keyword strategy',
    icon: '🔍',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      text: 'text-amber-600',
      button: 'bg-amber-500 hover:bg-amber-600',
      glow: 'shadow-amber-100',
    },
    hint: 'Works best after Messaging + Copy',
    outputPreview: (s) => s.seo?.pageTitle ?? null,
  },
  {
    key: 'qa',
    label: 'QA Agent',
    tagline: 'CRO audit, scoring & improvement suggestions',
    icon: '✅',
    color: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-700',
      text: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700',
      glow: 'shadow-rose-100',
    },
    hint: 'Run after Messaging, Copy & Design',
    outputPreview: (s) => (s.qa ? `Score: ${s.qa.score}/100` : null),
  },
]

// ── Helper: status display ──────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus[AgentKey] }) {
  if (status === 'running') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
        <Loader2 size={10} className="animate-spin" /> Running
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
        <CheckCircle size={10} /> Done
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
        <XCircle size={10} /> Error
      </span>
    )
  }
  if (status === 'skipped') {
    return (
      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
        Skipped
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
      <Circle size={9} /> Idle
    </span>
  )
}

// ── Orchestration banner ────────────────────────────────────

function OrchestratorBanner({ onOpenPanel }: { onOpenPanel: (key: AgentKey) => void }) {
  const store = usePipelineStore()
  const { agentStatus } = store

  const anyRunning = Object.values(agentStatus).some((s) => s === 'running')
  const messagingDone = agentStatus.messaging === 'done'
  const copyDone = agentStatus.copy === 'done'
  const designDone = agentStatus.design === 'done'
  const researchDone = agentStatus.research === 'done' || agentStatus.research === 'skipped'
  const allCoreDone = messagingDone && copyDone && designDone
  const noneStarted = Object.values(agentStatus).every((s) => s === 'idle')

  let title = ''
  let subtitle = ''
  let cta: { label: string; action: () => void } | null = null

  if (anyRunning) {
    title = 'Agents are working...'
    subtitle = 'You can open any agent card to watch it in real time.'
  } else if (allCoreDone) {
    title = '🎉 Core agents complete!'
    subtitle = 'Messaging, Copy, and Design are ready. Build your preview or keep refining.'
    cta = null
  } else if (noneStarted) {
    title = 'Welcome to the Agent Hub'
    subtitle = 'Run agents independently in any order. Start with Research for deeper insights, or jump straight to Messaging.'
    cta = { label: 'Start with Research →', action: () => onOpenPanel('research') }
  } else if (messagingDone && !copyDone) {
    title = '💬 Messaging is ready!'
    subtitle = 'Run Copy Agent next — it uses your approved messaging to write all sections.'
    cta = { label: 'Open Copy Agent →', action: () => onOpenPanel('copy') }
  } else if (!messagingDone && !researchDone) {
    title = 'Start with context'
    subtitle = 'Research Agent asks clarifying questions to unlock better copy and messaging.'
    cta = { label: 'Start Research →', action: () => onOpenPanel('research') }
  } else if (researchDone && !messagingDone) {
    title = '🔬 Research complete!'
    subtitle = "Now run Messaging and Design — they'll use your research brief automatically."
    cta = { label: 'Run Messaging →', action: () => onOpenPanel('messaging') }
  } else if (messagingDone && copyDone && !designDone) {
    title = '✍️ Copy approved!'
    subtitle = 'Pick a design direction to bring your content to life.'
    cta = { label: 'Open Design Agent →', action: () => onOpenPanel('design') }
  } else {
    title = 'Keep going'
    subtitle = 'Complete the remaining agents to build a full, production-ready page.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white mb-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">{title}</p>
            <p className="text-white/75 text-xs mt-0.5 leading-relaxed max-w-md">{subtitle}</p>
          </div>
        </div>
        {cta && (
          <button
            onClick={cta.action}
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-white/20"
          >
            {cta.label}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Individual agent card ───────────────────────────────────

function AgentCard({
  config,
  status,
  onOpen,
}: {
  config: AgentConfig
  status: AgentStatus[AgentKey]
  onOpen: () => void
}) {
  const store = usePipelineStore()
  const preview = config.outputPreview(store)
  const isDone = status === 'done'
  const isRunning = status === 'running'
  const isError = status === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onOpen}
      className={[
        'rounded-2xl border-2 p-5 cursor-pointer transition-all group',
        'bg-white hover:shadow-lg',
        isDone ? 'border-green-200 shadow-sm shadow-green-50' : 'border-gray-200 hover:border-gray-300',
        isRunning ? 'border-indigo-300 shadow-md shadow-indigo-50' : '',
        isError ? 'border-red-200' : '',
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={[
            'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all',
            isDone ? 'bg-green-50' : config.color.bg,
          ].join(' ')}
        >
          {isRunning ? <Loader2 size={22} className="animate-spin text-indigo-500" /> : config.icon}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Labels */}
      <p className="font-bold text-gray-900 text-sm mb-0.5">{config.label}</p>
      <p className="text-xs text-gray-400 leading-relaxed mb-3">{config.tagline}</p>

      {/* Output preview */}
      {preview ? (
        <div className={['text-xs rounded-xl px-3 py-2 leading-relaxed line-clamp-2', config.color.bg].join(' ')}>
          <span className={config.color.text}>{preview}</span>
        </div>
      ) : config.hint ? (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 italic">
          {config.hint}
        </div>
      ) : (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
          Not yet run
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span
          className={[
            'flex items-center gap-1.5 text-xs font-semibold transition-colors',
            isDone ? 'text-gray-600 group-hover:text-indigo-600' : `${config.color.text}`,
          ].join(' ')}
        >
          {isDone ? (
            <><RefreshCw size={11} /> Review & Edit</>
          ) : isRunning ? (
            <><Loader2 size={11} className="animate-spin" /> Running...</>
          ) : (
            <><Play size={11} /> Run Agent</>
          )}
        </span>
        <ChevronRight
          size={14}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </motion.div>
  )
}

// ── Build Panel ────────────────────────────────────────────

function BuildPanel() {
  const router = useRouter()
  const { messaging, copy, design, setStep } = usePipelineStore()

  const hasCore = !!messaging && !!copy && !!design
  const readyItems = [
    { label: 'Messaging', done: !!messaging },
    { label: 'Copy', done: !!copy },
    { label: 'Design', done: !!design },
  ]

  function handleBuild() {
    setStep('preview')
    router.push('/builder/preview')
  }

  return (
    <div className="mt-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-gray-900 text-sm mb-1">Build & Preview Page</p>
        <div className="flex items-center gap-3">
          {readyItems.map((item) => (
            <span
              key={item.label}
              className={[
                'flex items-center gap-1 text-xs font-medium',
                item.done ? 'text-green-600' : 'text-gray-400',
              ].join(' ')}
            >
              {item.done ? <CheckCircle size={11} /> : <Circle size={11} />}
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={handleBuild}
        disabled={!hasCore}
        className={[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
          hasCore
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
        ].join(' ')}
      >
        Build page <ExternalLink size={14} />
      </button>
    </div>
  )
}

// ── Panel content resolver ──────────────────────────────────

function PanelContent({ agent, onClose }: { agent: AgentKey; onClose: () => void }) {
  if (agent === 'research') return <ResearchPanel />
  if (agent === 'messaging') return <MessagingPanel onClose={onClose} />
  if (agent === 'copy') return <CopyPanel />
  if (agent === 'design') return <DesignPanel />
  if (agent === 'seo') return <SEOPanel />
  if (agent === 'qa') return <QAPanel />
  return null
}

const PANEL_WIDTHS: Partial<Record<AgentKey, 'md' | 'lg' | 'xl'>> = {
  research: 'lg',
  copy: 'xl',
  design: 'lg',
}

const PANEL_COLORS: Record<AgentKey, string> = {
  research: 'bg-violet-500',
  messaging: 'bg-purple-500',
  copy: 'bg-blue-500',
  design: 'bg-emerald-500',
  seo: 'bg-amber-500',
  qa: 'bg-rose-500',
}

// ── Main AgentHub ───────────────────────────────────────────

export function AgentHub() {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null)
  const store = usePipelineStore()
  const { agentStatus } = store

  function handleOpenPanel(key: AgentKey) {
    setOpenPanel(key)
  }

  const openAgent = openPanel ? AGENTS.find((a) => a.key === openPanel) : null

  return (
    <div className="max-w-5xl mx-auto">
      {/* Orchestration banner */}
      <OrchestratorBanner onOpenPanel={handleOpenPanel} />

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((config) => (
          <AgentCard
            key={config.key}
            config={config}
            status={agentStatus[config.key]}
            onOpen={() => handleOpenPanel(config.key)}
          />
        ))}
      </div>

      {/* Build panel */}
      <BuildPanel />

      {/* Slide-over */}
      {openAgent && (
        <SlideOver
          open={openPanel !== null}
          onClose={() => setOpenPanel(null)}
          title={openAgent.label}
          subtitle={openAgent.tagline}
          icon={<span>{openAgent.icon}</span>}
          accentColor={PANEL_COLORS[openAgent.key]}
          width={PANEL_WIDTHS[openAgent.key] ?? 'lg'}
        >
          <PanelContent agent={openAgent.key} onClose={() => setOpenPanel(null)} />
        </SlideOver>
      )}
    </div>
  )
}
