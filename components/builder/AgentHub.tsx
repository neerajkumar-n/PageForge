'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle, XCircle, Circle, Play, RefreshCw,
  ChevronRight, Zap, Sparkles, ArrowRight,
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

// ── Agent config ─────────────────────────────────────────────

interface AgentConfig {
  key: AgentKey
  label: string
  tagline: string
  icon: string
  color: {
    gradient: string      // gradient for icon bg
    border: string        // card border when active/done
    glow: string          // box-shadow glow color
    text: string          // accent text color
    badge: string         // badge bg + text
    panelAccent: string   // slide-over header color
  }
  hint?: string
  outputPreview: (store: ReturnType<typeof usePipelineStore.getState>) => string | null
}

const AGENTS: AgentConfig[] = [
  {
    key: 'research',
    label: 'Research',
    tagline: 'Context gathering & competitive intel',
    icon: '🔬',
    color: {
      gradient:    'from-violet-600 to-purple-700',
      border:      'border-violet-500/40',
      glow:        'shadow-[0_0_20px_rgba(124,58,237,0.2)]',
      text:        'text-violet-400',
      badge:       'bg-violet-500/15 text-violet-400 border border-violet-500/20',
      panelAccent: 'bg-violet-600',
    },
    outputPreview: (s) => s.research?.brief?.company?.oneLiner?.slice(0, 90) ?? null,
  },
  {
    key: 'messaging',
    label: 'Messaging',
    tagline: 'Headlines, value props & positioning',
    icon: '💬',
    color: {
      gradient:    'from-purple-600 to-indigo-700',
      border:      'border-purple-500/40',
      glow:        'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
      text:        'text-purple-400',
      badge:       'bg-purple-500/15 text-purple-400 border border-purple-500/20',
      panelAccent: 'bg-purple-600',
    },
    outputPreview: (s) => s.messaging?.primaryHeadline ?? null,
  },
  {
    key: 'copy',
    label: 'Copy',
    tagline: 'Full landing page copy, all sections',
    icon: '✍️',
    color: {
      gradient:    'from-blue-600 to-cyan-700',
      border:      'border-blue-500/40',
      glow:        'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      text:        'text-blue-400',
      badge:       'bg-blue-500/15 text-blue-400 border border-blue-500/20',
      panelAccent: 'bg-blue-600',
    },
    hint: 'Works best after Messaging',
    outputPreview: (s) => {
      if (!s.copy) return null
      const approved = s.copy.sections.filter((x) => x.approved).length
      return `${approved} / ${s.copy.sections.length} sections approved`
    },
  },
  {
    key: 'design',
    label: 'Design',
    tagline: 'Palettes, typography & layout directions',
    icon: '🎨',
    color: {
      gradient:    'from-emerald-600 to-teal-700',
      border:      'border-emerald-500/40',
      glow:        'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      text:        'text-emerald-400',
      badge:       'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      panelAccent: 'bg-emerald-600',
    },
    outputPreview: (s) => {
      if (!s.design) return null
      const dir = s.design.directions.find((d) => d.id === s.design!.selectedDirectionId)
      return dir ? `Direction: ${dir.name}` : null
    },
  },
  {
    key: 'seo',
    label: 'SEO + AEO',
    tagline: 'Meta tags, schema & keyword strategy',
    icon: '🔍',
    color: {
      gradient:    'from-amber-500 to-orange-600',
      border:      'border-amber-500/40',
      glow:        'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      text:        'text-amber-400',
      badge:       'bg-amber-500/15 text-amber-400 border border-amber-500/20',
      panelAccent: 'bg-amber-500',
    },
    hint: 'Run after Messaging + Copy',
    outputPreview: (s) => s.seo?.pageTitle ?? null,
  },
  {
    key: 'qa',
    label: 'QA Audit',
    tagline: 'CRO scoring & AEO readiness check',
    icon: '✅',
    color: {
      gradient:    'from-rose-600 to-pink-700',
      border:      'border-rose-500/40',
      glow:        'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      text:        'text-rose-400',
      badge:       'bg-rose-500/15 text-rose-400 border border-rose-500/20',
      panelAccent: 'bg-rose-600',
    },
    hint: 'Run after Messaging, Copy & Design',
    outputPreview: (s) => (s.qa ? `Score: ${s.qa.score} / 100` : null),
  },
]

// ── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus[AgentKey] }) {
  if (status === 'running') return (
    <span className="flex items-center gap-1 text-[11px] font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
      <Loader2 size={9} className="animate-spin" /> Running
    </span>
  )
  if (status === 'done') return (
    <span className="flex items-center gap-1 text-[11px] font-medium bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
      <CheckCircle size={9} /> Done
    </span>
  )
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-[11px] font-medium bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
      <XCircle size={9} /> Error
    </span>
  )
  if (status === 'skipped') return (
    <span className="text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full">
      Skipped
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full">
      <Circle size={8} /> Idle
    </span>
  )
}

// ── Orchestration banner ─────────────────────────────────────

function OrchestratorBanner({ onOpenPanel }: { onOpenPanel: (key: AgentKey) => void }) {
  const { agentStatus } = usePipelineStore()
  const anyRunning    = Object.values(agentStatus).some((s) => s === 'running')
  const messagingDone = agentStatus.messaging === 'done'
  const copyDone      = agentStatus.copy === 'done'
  const designDone    = agentStatus.design === 'done'
  const researchDone  = agentStatus.research === 'done' || agentStatus.research === 'skipped'
  const allCoreDone   = messagingDone && copyDone && designDone
  const noneStarted   = Object.values(agentStatus).every((s) => s === 'idle')

  let title    = ''
  let subtitle = ''
  let cta: { label: string; action: () => void } | null = null

  if (anyRunning) {
    title    = 'Agents are working...'
    subtitle = 'Open any agent card to watch it in real time.'
  } else if (allCoreDone) {
    title    = 'Core agents complete'
    subtitle = 'Messaging, Copy, and Design are ready. Build your preview or keep refining.'
  } else if (noneStarted) {
    title    = 'Welcome to the Agent Hub'
    subtitle = 'Run agents independently in any order. Start with Research for richer insights, or jump straight to Messaging.'
    cta      = { label: 'Start with Research', action: () => onOpenPanel('research') }
  } else if (messagingDone && !copyDone) {
    title    = 'Messaging is ready'
    subtitle = 'Run Copy Agent next — it uses your approved messaging to write all sections.'
    cta      = { label: 'Open Copy Agent', action: () => onOpenPanel('copy') }
  } else if (researchDone && !messagingDone) {
    title    = 'Research complete'
    subtitle = "Now run Messaging and Design — they'll use your research brief automatically."
    cta      = { label: 'Run Messaging', action: () => onOpenPanel('messaging') }
  } else if (!messagingDone && !researchDone) {
    title    = 'Start with context'
    subtitle = 'Research Agent asks clarifying questions to unlock better copy and messaging.'
    cta      = { label: 'Start Research', action: () => onOpenPanel('research') }
  } else if (messagingDone && copyDone && !designDone) {
    title    = 'Copy approved'
    subtitle = 'Pick a design direction to bring your content to life.'
    cta      = { label: 'Open Design Agent', action: () => onOpenPanel('design') }
  } else {
    title    = 'Keep going'
    subtitle = 'Complete the remaining agents to build a production-ready page.'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-zinc-900/80 to-zinc-900/60 p-5 mb-6"
    >
      {/* Subtle glow blob */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
            {anyRunning
              ? <Loader2 size={16} className="text-violet-400 animate-spin" />
              : allCoreDone
              ? <Sparkles size={16} className="text-violet-400" />
              : <Zap size={16} className="text-violet-400" />
            }
          </div>
          <div>
            <p className="font-semibold text-sm text-zinc-100">{title}</p>
            <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed max-w-md">{subtitle}</p>
          </div>
        </div>
        {cta && (
          <button
            onClick={cta.action}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 px-4 py-2 rounded-xl transition-all"
          >
            {cta.label} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Agent card ───────────────────────────────────────────────

function AgentCard({
  config,
  status,
  onOpen,
}: {
  config: AgentConfig
  status: AgentStatus[AgentKey]
  onOpen: () => void
}) {
  const store   = usePipelineStore()
  const preview = config.outputPreview(store)
  const isDone    = status === 'done'
  const isRunning = status === 'running'
  const isError   = status === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onOpen}
      className={[
        'relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-200 group',
        'bg-zinc-900',
        isDone    ? `${config.color.border} ${config.color.glow}` : 'border-zinc-800 hover:border-zinc-700',
        isRunning ? 'border-violet-500/50 shadow-[0_0_24px_rgba(124,58,237,0.2)]' : '',
        isError   ? 'border-red-500/40' : '',
      ].join(' ')}
    >
      {/* Subtle top gradient strip */}
      <div className={`h-px bg-gradient-to-r ${config.color.gradient} opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color.gradient} flex items-center justify-center text-xl shadow-lg`}>
            {isRunning
              ? <Loader2 size={20} className="animate-spin text-white" />
              : config.icon
            }
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Label */}
        <p className="font-semibold text-zinc-100 text-sm mb-0.5">{config.label}</p>
        <p className="text-xs text-zinc-500 leading-relaxed mb-3">{config.tagline}</p>

        {/* Output preview */}
        {preview ? (
          <div className="text-xs rounded-lg px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 leading-relaxed line-clamp-2">
            <span className={config.color.text}>{preview}</span>
          </div>
        ) : config.hint ? (
          <div className="text-xs text-zinc-600 bg-zinc-800/40 border border-zinc-800 rounded-lg px-3 py-2 italic">
            {config.hint}
          </div>
        ) : (
          <div className="text-xs text-zinc-700 bg-zinc-800/40 border border-zinc-800 rounded-lg px-3 py-2">
            Not yet run
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
          <span className={[
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            isDone ? `text-zinc-400 group-hover:${config.color.text}` : config.color.text,
          ].join(' ')}>
            {isDone    ? <><RefreshCw size={10} /> Review & Edit</>
            : isRunning ? <><Loader2 size={10} className="animate-spin" /> Running...</>
            : <><Play size={10} /> Run Agent</>}
          </span>
          <ChevronRight size={13} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Build Panel ──────────────────────────────────────────────

function BuildPanel() {
  const router = useRouter()
  const { messaging, copy, design, setStep } = usePipelineStore()

  const hasCore = !!messaging && !!copy && !!design
  const readyItems = [
    { label: 'Messaging', done: !!messaging },
    { label: 'Copy',      done: !!copy      },
    { label: 'Design',    done: !!design    },
  ]

  function handleBuild() {
    setStep('preview')
    router.push('/builder/preview')
  }

  return (
    <div className={[
      'mt-5 rounded-2xl border-2 border-dashed p-5 flex items-center justify-between gap-4 transition-all',
      hasCore ? 'border-violet-500/30 bg-violet-950/20' : 'border-zinc-800 bg-zinc-900/40',
    ].join(' ')}>
      <div>
        <p className="font-semibold text-zinc-100 text-sm mb-1.5">Build & Preview</p>
        <div className="flex items-center gap-3 flex-wrap">
          {readyItems.map((item) => (
            <span
              key={item.label}
              className={[
                'flex items-center gap-1 text-xs font-medium',
                item.done ? 'text-green-400' : 'text-zinc-600',
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
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0',
          hasCore
            ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-500/20'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
        ].join(' ')}
      >
        Build page <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ── Panel resolver ───────────────────────────────────────────

function PanelContent({ agent, onClose }: { agent: AgentKey; onClose: () => void }) {
  if (agent === 'research')  return <ResearchPanel />
  if (agent === 'messaging') return <MessagingPanel onClose={onClose} />
  if (agent === 'copy')      return <CopyPanel />
  if (agent === 'design')    return <DesignPanel />
  if (agent === 'seo')       return <SEOPanel />
  if (agent === 'qa')        return <QAPanel />
  return null
}

const PANEL_WIDTHS: Partial<Record<AgentKey, 'md' | 'lg' | 'xl'>> = {
  research: 'lg',
  copy:     'xl',
  design:   'lg',
}

// ── Main AgentHub ────────────────────────────────────────────

export function AgentHub() {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null)
  const { agentStatus } = usePipelineStore()

  const openAgent = openPanel ? AGENTS.find((a) => a.key === openPanel) : null

  return (
    <div className="max-w-5xl mx-auto">
      <OrchestratorBanner onOpenPanel={setOpenPanel} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((config) => (
          <AgentCard
            key={config.key}
            config={config}
            status={agentStatus[config.key]}
            onOpen={() => setOpenPanel(config.key)}
          />
        ))}
      </div>

      <BuildPanel />

      {openAgent && (
        <SlideOver
          open={openPanel !== null}
          onClose={() => setOpenPanel(null)}
          title={openAgent.label}
          subtitle={openAgent.tagline}
          icon={<span>{openAgent.icon}</span>}
          accentColor={openAgent.color.panelAccent}
          width={PANEL_WIDTHS[openAgent.key] ?? 'lg'}
        >
          <PanelContent agent={openAgent.key} onClose={() => setOpenPanel(null)} />
        </SlideOver>
      )}
    </div>
  )
}
