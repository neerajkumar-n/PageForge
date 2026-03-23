'use client'

import { useState } from 'react'
import { Edit2, Check, RefreshCw, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
import { Button } from '@/components/ui/Button'

function classifyRevision(original: string, revised: string): 'factual' | 'tone' | 'structural' {
  if (Math.abs(revised.length - original.length) > original.length * 0.3) return 'structural'
  const origWords = new Set(original.toLowerCase().split(/\s+/))
  const revisedWords = revised.toLowerCase().split(/\s+/)
  const overlap = revisedWords.filter((w) => origWords.has(w)).length / revisedWords.length
  if (overlap < 0.5) return 'factual'
  return 'tone'
}

function InlineEdit({
  value,
  onSave,
  multiline = false,
  className = '',
}: {
  value: string
  onSave: (v: string) => void
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <div className={['group flex items-start gap-2', className].join(' ')}>
        <p className="flex-1 text-sm text-gray-800 leading-relaxed">{value}</p>
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
        >
          <Edit2 size={12} className="text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {multiline ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full border border-purple-400 rounded-lg p-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full border border-purple-400 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      )}
      <div className="flex gap-3">
        <button
          onClick={() => { onSave(draft); setEditing(false) }}
          className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:underline"
        >
          <Check size={11} /> Save
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

export function MessagingPanel({ onClose }: { onClose?: () => void }) {
  const { messaging, updateMessagingField, updateValueProp, logFeedback, agentStatus } = usePipelineStore()
  const { run, isRunning } = useRunAgent('messaging')
  const [selectedHeadlineIdx, setSelectedHeadlineIdx] = useState(0)

  const status = agentStatus.messaging

  async function handleRun() {
    await run()
    toast.success('Messaging generated!')
    setSelectedHeadlineIdx(0)
  }

  function save(field: string, value: unknown, original: string) {
    if (field === 'primaryHeadline') updateMessagingField('primaryHeadline', value)
    else if (field === 'subheadline') updateMessagingField('subheadline', value)
    else if (field === 'positioningStatement') updateMessagingField('positioningStatement', value)
    logFeedback({
      gate: 'messaging',
      field,
      original,
      revised: String(value),
      revisionType: classifyRevision(original, String(value)),
    })
  }

  function handleHeadlineSelect(idx: number) {
    setSelectedHeadlineIdx(idx)
    const all = messaging ? [messaging.primaryHeadline, ...messaging.headlineAlternatives] : []
    if (idx !== 0 && all[idx]) {
      updateMessagingField('primaryHeadline', all[idx])
    }
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
          💬
        </div>
        <div>
          <p className="font-semibold text-gray-900">Messaging Agent</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Analyzes your ICP to create headlines, value props, CTAs, and a positioning statement.
          </p>
        </div>
        {status === 'error' && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            Something went wrong. Try running again.
          </p>
        )}
        <Button onClick={handleRun} disabled={isRunning} className="bg-purple-600 hover:bg-purple-700">
          {isRunning ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Sparkles size={14} /> Run Messaging Agent</>}
        </Button>
      </div>
    )
  }

  if (status === 'running' || isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <p className="font-semibold text-gray-900">Messaging Agent running...</p>
        <p className="text-sm text-gray-500">Analyzing your ICP and building a messaging hierarchy</p>
      </div>
    )
  }

  if (!messaging) return null

  const allHeadlines = [messaging.primaryHeadline, ...messaging.headlineAlternatives]

  return (
    <div className="p-6 space-y-7 pb-24">
      {/* Re-run button */}
      <div className="flex justify-end">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          <RefreshCw size={12} className={isRunning ? 'animate-spin' : ''} />
          Re-run agent
        </button>
      </div>

      {/* Headlines */}
      <Section title="Headline">
        <div className="space-y-2">
          {allHeadlines.map((h, i) => (
            <div
              key={i}
              onClick={() => handleHeadlineSelect(i)}
              className={[
                'p-3 rounded-xl border-2 cursor-pointer transition-all',
                selectedHeadlineIdx === i
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={[
                    'w-3.5 h-3.5 rounded-full border-2 shrink-0',
                    selectedHeadlineIdx === i
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300',
                  ].join(' ')}
                />
                <span className="text-xs font-medium text-gray-400">
                  {i === 0 ? 'Primary' : `Alternative ${i}`}
                </span>
              </div>
              <InlineEdit
                value={h}
                onSave={(v) => {
                  if (i === 0) {
                    save('primaryHeadline', v, h)
                  } else {
                    const alts = [...messaging.headlineAlternatives]
                    alts[i - 1] = v
                    updateMessagingField('headlineAlternatives', alts)
                    logFeedback({ gate: 'messaging', field: `headline[${i}]`, original: h, revised: v, revisionType: classifyRevision(h, v) })
                  }
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Subheadline */}
      <Section title="Subheadline">
        <div className="p-3 bg-gray-50 rounded-xl">
          <InlineEdit
            value={messaging.subheadline}
            multiline
            onSave={(v) => save('subheadline', v, messaging.subheadline)}
          />
        </div>
      </Section>

      {/* Value Props */}
      <Section title="Value Propositions">
        <div className="space-y-3">
          {messaging.valuePropositions.map((vp, i) => (
            <div key={vp.id} className="p-4 border border-gray-200 rounded-xl space-y-2">
              <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">#{i + 1}</span>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Headline</p>
                <InlineEdit
                  value={vp.headline}
                  onSave={(v) => {
                    updateValueProp(vp.id, 'headline', v)
                    logFeedback({ gate: 'messaging', field: `vp.${vp.id}.headline`, original: vp.headline, revised: v, revisionType: classifyRevision(vp.headline, v) })
                  }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                <InlineEdit
                  value={vp.description}
                  multiline
                  onSave={(v) => {
                    updateValueProp(vp.id, 'description', v)
                    logFeedback({ gate: 'messaging', field: `vp.${vp.id}.description`, original: vp.description, revised: v, revisionType: classifyRevision(vp.description, v) })
                  }}
                />
              </div>
              {vp.proof && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Proof</p>
                  <InlineEdit
                    value={vp.proof}
                    onSave={(v) => {
                      updateValueProp(vp.id, 'proof', v)
                      logFeedback({ gate: 'messaging', field: `vp.${vp.id}.proof`, original: vp.proof ?? '', revised: v, revisionType: 'factual' })
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* CTAs */}
      <Section title="CTAs">
        <div className="space-y-2">
          {[messaging.primaryCTA, ...messaging.ctaAlternatives].map((cta, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className={['text-xs font-medium px-1.5 py-0.5 rounded', i === 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'].join(' ')}>
                {i === 0 ? 'Primary' : `Alt ${i}`}
              </span>
              <InlineEdit
                value={cta}
                className="flex-1"
                onSave={(v) => {
                  if (i === 0) updateMessagingField('primaryCTA', v)
                  else {
                    const alts = [...messaging.ctaAlternatives]
                    alts[i - 1] = v
                    updateMessagingField('ctaAlternatives', alts)
                  }
                  logFeedback({ gate: 'messaging', field: `cta[${i}]`, original: cta, revised: v, revisionType: 'tone' })
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Objections */}
      <Section title="Key Objections">
        <div className="flex flex-wrap gap-2">
          {messaging.keyObjections.map((obj, i) => (
            <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-full">
              {obj}
            </span>
          ))}
        </div>
      </Section>

      {/* Positioning */}
      <Section title="Positioning Statement">
        <div className="p-3 bg-gray-50 rounded-xl">
          <InlineEdit
            value={messaging.positioningStatement}
            multiline
            onSave={(v) => save('positioningStatement', v, messaging.positioningStatement)}
          />
        </div>
      </Section>

      {/* Emotional Drivers */}
      <Section title="Emotional Drivers">
        <div className="flex flex-wrap gap-2">
          {messaging.emotionalDrivers.map((d, i) => (
            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-full">
              {d}
            </span>
          ))}
        </div>
      </Section>
    </div>
  )
}
