'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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

function EditableField({ label, value, multiline, onChange }: { label: string; value: string; multiline?: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      )}
    </div>
  )
}

function ItemEditor({ items, onChange }: { items: SectionCopy['items']; onChange: (items: SectionCopy['items']) => void }) {
  if (!items || items.length === 0) return null
  return (
    <div className="space-y-3 mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Items ({items.length})</p>
      {items.map((item, i) => (
        <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <p className="text-xs text-gray-400 font-medium">Item {i + 1}</p>
          <input
            value={item.title}
            onChange={e => { const next = [...items]; next[i] = { ...next[i], title: e.target.value }; onChange(next) }}
            placeholder="Title"
            className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <textarea
            value={item.description}
            onChange={e => { const next = [...items]; next[i] = { ...next[i], description: e.target.value }; onChange(next) }}
            placeholder="Description"
            className="w-full border border-gray-200 rounded p-2 text-sm resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      ))}
    </div>
  )
}

export function CopyReviewPanel() {
  const router = useRouter()
  const { copy, approveSectionCopy, updateSectionCopy, logFeedback, setStep } = usePipelineStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [regenerating, setRegenerating] = useState(false)

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
    toast.success(`${SECTION_LABELS[current.sectionType]} approved!`)
    if (currentIdx < sections.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  function handleFinish() {
    if (approvedCount < sections.length) {
      // approve remaining
      sections.forEach((s) => { if (!s.approved) approveSectionCopy(s.id) })
    }
    setStep('design-review')
    router.push('/builder/design-review')
  }

  async function handleRegenerate() {
    setRegenerating(true)
    toast('Regenerating section...', { icon: '🔄' })
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Section regenerated')
    setRegenerating(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review your copy</h1>
          <p className="text-gray-500 mt-1">{approvedCount} of {sections.length} sections approved</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-40 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(approvedCount / sections.length) * 100}%` }} />
          </div>
          <span className="text-sm text-gray-500">{approvedCount}/{sections.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">

        {/* Left sidebar: section list */}
        <div className="space-y-1">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              className={['w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all', currentIdx === i ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'].join(' ')}
            >
              <span className="shrink-0">
                {s.approved ? <Check size={14} className="text-green-500" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 inline-block" />}
              </span>
              {SECTION_LABELS[s.sectionType] ?? s.sectionType}
            </button>
          ))}
        </div>

        {/* Main area: current section editor */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 text-lg">{SECTION_LABELS[current.sectionType]}</h2>
              {current.approved && <Badge variant="success" size="sm">Approved</Badge>}
              {current.humanEdited && <Badge variant="info" size="sm">Edited</Badge>}
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
              Regenerate
            </button>
          </div>

          {current.headline !== undefined && (
            <EditableField label="Headline" value={current.headline} onChange={(v) => handleFieldChange('headline', v, current.headline ?? '')} />
          )}
          {current.subheadline !== undefined && (
            <EditableField label="Subheadline" value={current.subheadline} multiline onChange={(v) => handleFieldChange('subheadline', v, current.subheadline ?? '')} />
          )}
          {current.body !== undefined && (
            <EditableField label="Body" value={current.body} multiline onChange={(v) => handleFieldChange('body', v, current.body ?? '')} />
          )}
          {current.ctaText !== undefined && (
            <EditableField label="CTA text" value={current.ctaText} onChange={(v) => handleFieldChange('ctaText', v, current.ctaText ?? '')} />
          )}
          {current.items && current.items.length > 0 && (
            <ItemEditor items={current.items} onChange={(items) => handleFieldChange('items', items, JSON.stringify(current.items))} />
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button onClick={handleApprove} disabled={current.approved}>
              <Check size={14} />
              {current.approved ? 'Approved' : 'Approve section'}
            </Button>
            {currentIdx < sections.length - 1 && (
              <Button variant="ghost" onClick={() => setCurrentIdx(currentIdx + 1)}>
                Skip for now
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t flex justify-between items-center">
        <p className="text-sm text-gray-400">
          {sections.length - approvedCount > 0
            ? `${sections.length - approvedCount} sections remaining — or continue and we'll auto-approve them.`
            : 'All sections approved. Ready to design!'}
        </p>
        <Button onClick={handleFinish} size="lg" disabled={approvedCount === 0}>
          Apply design direction <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
