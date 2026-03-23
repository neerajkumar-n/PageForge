'use client'

import { Loader2, Sparkles, RefreshCw, CheckCircle, AlertTriangle, Info, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
import { Button } from '@/components/ui/Button'

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', label: 'Warning' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'Info' },
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
  const ring = score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-red-500'
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" strokeWidth="8" stroke="#E5E7EB" />
          <circle
            cx="44" cy="44" r={r} fill="none" strokeWidth="8"
            className={ring}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={['text-2xl font-bold', color].join(' ')}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <p className={['text-sm font-semibold', color].join(' ')}>
        {score >= 80 ? '🚀 Ready to ship' : score >= 60 ? '⚠️ Needs work' : '❌ Critical issues'}
      </p>
    </div>
  )
}

export function QAPanel() {
  const { qa, messaging, copy, design, agentStatus } = usePipelineStore()
  const { run, isRunning } = useRunAgent('qa')

  const status = agentStatus.qa
  const canRun = !!messaging && !!copy && !!design

  async function handleRun() {
    if (!canRun) {
      toast.error('Run Messaging, Copy, and Design agents first.')
      return
    }
    await run()
    toast.success('QA audit complete!')
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl">✅</div>
        <div>
          <p className="font-semibold text-gray-900">QA Agent</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Audits your page for CRO issues, brand consistency, and conversion blockers. Gives a 0–100 score.
          </p>
          {!canRun && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              💡 Run Messaging, Copy, and Design agents first
            </p>
          )}
        </div>
        {status === 'error' && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">Something went wrong.</p>}
        <Button onClick={handleRun} disabled={isRunning || !canRun} className="bg-rose-600 hover:bg-rose-700">
          {isRunning ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Sparkles size={14} /> Run QA Audit</>}
        </Button>
      </div>
    )
  }

  if (status === 'running' || isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <Loader2 className="animate-spin text-rose-500" size={32} />
        <p className="font-semibold text-gray-900">QA Agent running...</p>
        <p className="text-sm text-gray-500">Auditing page for CRO issues and conversion blockers</p>
      </div>
    )
  }

  if (!qa) return null

  const criticalCount = qa.issues.filter((i) => i.severity === 'critical').length
  const warningCount = qa.issues.filter((i) => i.severity === 'warning').length

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex justify-end">
        <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          <RefreshCw size={11} className={isRunning ? 'animate-spin' : ''} /> Re-run
        </button>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center py-4">
        <ScoreMeter score={qa.score} />
        {qa.approved && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
            <CheckCircle size={14} /> Page approved for launch
          </div>
        )}
      </div>

      {/* Issue summary */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex gap-3">
          {criticalCount > 0 && (
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-red-500">Critical</p>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-amber-600">{warningCount}</p>
              <p className="text-xs text-amber-500">Warnings</p>
            </div>
          )}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-700">{qa.issues.length - criticalCount - warningCount}</p>
            <p className="text-xs text-gray-400">Info</p>
          </div>
        </div>
      )}

      {/* Issues */}
      {qa.issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issues</p>
          {qa.issues.map((issue, i) => {
            const cfg = SEVERITY_CONFIG[issue.severity]
            const Icon = cfg.icon
            return (
              <div key={i} className={['flex gap-3 p-3 rounded-xl border', cfg.bg].join(' ')}>
                <Icon size={15} className={['mt-0.5 shrink-0', cfg.color].join(' ')} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{issue.section}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{issue.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Suggestions */}
      {qa.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suggestions</p>
          {qa.suggestions.map((s, i) => (
            <div key={i} className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <Star size={13} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
