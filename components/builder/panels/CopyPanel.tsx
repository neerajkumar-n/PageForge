'use client'

import { useState } from 'react'
import { Check, RefreshCw, Loader2, Sparkles, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
import { Button } from '@/components/ui/Button'
import type { SectionCopy } from '@/types'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  logos: 'Logo Bar',
  problem: 'Problem',
  solution: 'Solution',
  features: 'Features',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  faq: 'FAQ',
  cta: 'CTA',
}

const SECTION_ICONS: Record<string, string> = {
  hero: '🦸',
  logos: '🏢',
  problem: '😤',
  solution: '💡',
  features: '⚡',
  testimonials: '💬',
  pricing: '💰',
  faq: '❓',
  cta: '🎯',
}

function EditableField({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string
  value: string
  multiline?: boolean
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      )}
    </div>
  )
}

function ItemEditor({
  items,
  onChange,
}: {
  items: SectionCopy['items']
  onChange: (items: SectionCopy['items']) => void
}) {
  if (!items || items.length === 0) return null
  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items ({items.length})</p>
      {items.map((item, i) => (
        <div key={item.id} className="p-3 bg-gray-50 rounded-xl space-y-2">
          <span className="text-xs text-blue-600 font-semibold">Item {i + 1}</span>
          <input
            value={item.title}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], title: e.target.value }
              onChange(next)
            }}
            placeholder="Title"
            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <textarea
            value={item.description}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], description: e.target.value }
              onChange(next)
            }}
            placeholder="Description"
            className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-y min-h-[56px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      ))}
    </div>
  )
}

export function CopyPanel() {
  const { copy, messaging, approveSectionCopy, updateSectionCopy, logFeedback, agentStatus } = usePipelineStore()
  const { run, isRunning } = useRunAgent('copy')
  const [currentIdx, setCurrentIdx] = useState(0)

  const status = agentStatus.copy
  const hasMessaging = !!messaging

  async function handleRun() {
    if (!hasMessaging) {
      toast.error('Run Messaging Agent first — Copy Agent needs an approved messaging framework.')
      return
    }
    await run()
    toast.success('Copy generated!')
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
          ✍️
        </div>
        <div>
          <p className="font-semibold text-gray-900">Copy Agent</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Writes full landing page copy for all sections based on the messaging framework.
          </p>
          {!hasMessaging && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              💡 Run Messaging Agent first for best results
            </p>
          )}
        </div>
        {status === 'error' && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Something went wrong. Try running again.
          </p>
        )}
        <Button onClick={handleRun} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
          {isRunning ? (
            <><Loader2 size={14} className="animate-spin" /> Running...</>
          ) : (
            <><Sparkles size={14} /> Run Copy Agent</>
          )}
        </Button>
      </div>
    )
  }

  if (status === 'running' || isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="font-semibold text-gray-900">Copy Agent running...</p>
        <p className="text-sm text-gray-500">Writing copy for all 8 landing page sections</p>
      </div>
    )
  }

  if (!copy) return null

  const sections = copy.sections
  const current = sections[currentIdx]
  const approvedCount = sections.filter((s) => s.approved).length

  function handleFieldChange(field: string, value: unknown, original: string) {
    updateSectionCopy(current.id, field, value)
    logFeedback({
      gate: 'copy',
      field: `${current.sectionType}.${field}`,
      original,
      revised: String(value),
      revisionType: 'tone',
    })
  }

  function handleApprove() {
    approveSectionCopy(current.id)
    toast.success(`${SECTION_LABELS[current.sectionType] ?? current.sectionType} approved!`)
    if (currentIdx < sections.length - 1) setCurrentIdx(currentIdx + 1)
  }

  function approveAll() {
    sections.forEach((s) => {
      if (!s.approved) approveSectionCopy(s.id)
    })
    toast.success('All sections approved!')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(approvedCount / sections.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 shrink-0">
          {approvedCount}/{sections.length} approved
        </span>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <RefreshCw size={11} className={isRunning ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Section sidebar */}
        <div className="w-44 border-r border-gray-100 overflow-y-auto shrink-0 py-2">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={[
                'w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
                currentIdx === i
                  ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              <span>{SECTION_ICONS[s.sectionType] ?? '📄'}</span>
              <span className="flex-1 truncate">{SECTION_LABELS[s.sectionType] ?? s.sectionType}</span>
              {s.approved && <Check size={12} className="text-green-500 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Section editor */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{SECTION_ICONS[current.sectionType] ?? '📄'}</span>
              <h3 className="font-semibold text-gray-900">{SECTION_LABELS[current.sectionType]}</h3>
              {current.approved && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Approved
                </span>
              )}
            </div>
            {currentIdx < sections.length - 1 && (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                Next <ChevronRight size={12} />
              </button>
            )}
          </div>

          {current.headline !== undefined && (
            <EditableField
              label="Headline"
              value={current.headline}
              onChange={(v) => handleFieldChange('headline', v, current.headline ?? '')}
            />
          )}
          {current.subheadline !== undefined && (
            <EditableField
              label="Subheadline"
              value={current.subheadline}
              multiline
              onChange={(v) => handleFieldChange('subheadline', v, current.subheadline ?? '')}
            />
          )}
          {current.body !== undefined && (
            <EditableField
              label="Body"
              value={current.body}
              multiline
              onChange={(v) => handleFieldChange('body', v, current.body ?? '')}
            />
          )}
          {current.ctaText !== undefined && (
            <EditableField
              label="CTA"
              value={current.ctaText}
              onChange={(v) => handleFieldChange('ctaText', v, current.ctaText ?? '')}
            />
          )}
          {current.items && current.items.length > 0 && (
            <ItemEditor
              items={current.items}
              onChange={(items) => handleFieldChange('items', items, JSON.stringify(current.items))}
            />
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button
              onClick={handleApprove}
              disabled={current.approved}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              size="sm"
            >
              <Check size={13} />
              {current.approved ? 'Approved' : 'Approve section'}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-between items-center">
        <p className="text-xs text-gray-400">
          {approvedCount < sections.length
            ? `${sections.length - approvedCount} remaining`
            : '🎉 All sections approved'}
        </p>
        <button
          onClick={approveAll}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Approve all →
        </button>
      </div>
    </div>
  )
}
