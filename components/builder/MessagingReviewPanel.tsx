'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Check, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

function classifyRevision(original: string, revised: string): 'factual' | 'tone' | 'structural' {
  if (Math.abs(revised.length - original.length) > original.length * 0.3) return 'structural'
  const origWords = new Set(original.toLowerCase().split(/\s+/))
  const revisedWords = revised.toLowerCase().split(/\s+/)
  const overlap = revisedWords.filter(w => origWords.has(w)).length / revisedWords.length
  if (overlap < 0.5) return 'factual'
  return 'tone'
}

function InlineEdit({ value, onSave, multiline = false }: { value: string; onSave: (v: string) => void; multiline?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <div className="group flex items-start gap-2">
        <p className="flex-1 text-zinc-200">{value}</p>
        <button onClick={() => { setDraft(value); setEditing(true) }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-800">
          <Edit2 size={14} className="text-zinc-500" />
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
          onChange={e => setDraft(e.target.value)}
          className="w-full border border-indigo-400 rounded-lg p-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full border border-indigo-400 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      )}
      <div className="flex gap-2">
        <button onClick={() => { onSave(draft); setEditing(false) }} className="flex items-center gap-1 text-xs text-violet-400 font-medium hover:underline">
          <Check size={12} /> Save
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:underline">Cancel</button>
      </div>
    </div>
  )
}

export function MessagingReviewPanel() {
  const router = useRouter()
  const { messaging, updateMessagingField, updateValueProp, logFeedback, setStep } = usePipelineStore()
  const [selectedHeadline, setSelectedHeadline] = useState(0)

  if (!messaging) return null

  const allHeadlines = [messaging.primaryHeadline, ...messaging.headlineAlternatives]

  function handleHeadlineEdit(idx: number, value: string) {
    const original = allHeadlines[idx]
    if (idx === 0) {
      updateMessagingField('primaryHeadline', value)
    } else {
      const alts = [...messaging!.headlineAlternatives]
      alts[idx - 1] = value
      updateMessagingField('headlineAlternatives', alts)
    }
    logFeedback({ gate: 'messaging', field: `headline[${idx}]`, original, revised: value, revisionType: classifyRevision(original, value) })
  }

  function handleValuePropEdit(id: string, field: string, value: string, original: string) {
    updateValueProp(id, field, value)
    logFeedback({ gate: 'messaging', field: `valueProp.${id}.${field}`, original, revised: value, revisionType: classifyRevision(original, value) })
  }

  function handleApprove() {
    if (selectedHeadline !== 0) {
      updateMessagingField('primaryHeadline', allHeadlines[selectedHeadline])
    }
    toast.success('Messaging approved!')
    setStep('copy-review')
    router.push('/builder/copy-review')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Review your messaging</h1>
        <p className="text-zinc-500 mt-1">Edit anything inline. Your changes train the copy agent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: ICP Summary */}
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">ICP Profile</h3>
            <div className="space-y-3">
              {[
                { label: 'Role', value: usePipelineStore.getState().context?.icp.role ?? '' },
                { label: 'Company', value: usePipelineStore.getState().context?.icp.company ?? '' },
                { label: 'Pain points', value: usePipelineStore.getState().context?.icp.painPoints ?? '' },
                { label: 'Goals', value: usePipelineStore.getState().context?.icp.goals ?? '' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm text-zinc-300">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">Positioning Statement</h3>
            <InlineEdit
              value={messaging.positioningStatement}
              multiline
              onSave={(v) => {
                logFeedback({ gate: 'messaging', field: 'positioningStatement', original: messaging.positioningStatement, revised: v, revisionType: classifyRevision(messaging.positioningStatement, v) })
                updateMessagingField('positioningStatement', v)
              }}
            />
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">Key Objections</h3>
            <div className="flex flex-wrap gap-2">
              {messaging.keyObjections.map((obj, i) => (
                <Badge key={i} variant="warning" className="text-xs">{obj}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* MIDDLE: Headlines */}
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">Select & edit your headline</h3>
            <div className="space-y-3">
              {allHeadlines.map((h, i) => (
                <div key={i} className={['p-3 rounded-lg border-2 cursor-pointer transition-all', selectedHeadline === i ? 'border-violet-500 bg-violet-950/20' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}
                  onClick={() => setSelectedHeadline(i)}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="radio" checked={selectedHeadline === i} onChange={() => setSelectedHeadline(i)} className="accent-indigo-600" />
                    {i === 0 && <Badge variant="purple" size="sm">Primary</Badge>}
                    {i > 0 && <Badge variant="default" size="sm">Alternative {i}</Badge>}
                  </div>
                  <InlineEdit value={h} onSave={(v) => handleHeadlineEdit(i, v)} />
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-2 text-sm uppercase tracking-wide">Subheadline</h3>
            <InlineEdit value={messaging.subheadline} multiline onSave={(v) => {
              logFeedback({ gate: 'messaging', field: 'subheadline', original: messaging.subheadline, revised: v, revisionType: classifyRevision(messaging.subheadline, v) })
              updateMessagingField('subheadline', v)
            }} />
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">CTAs</h3>
            <div className="space-y-2">
              {[messaging.primaryCTA, ...messaging.ctaAlternatives].map((cta, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i === 0 && <Badge variant="success" size="sm">Primary</Badge>}
                  {i > 0 && <span className="text-xs text-zinc-500">Alt {i}</span>}
                  <InlineEdit value={cta} onSave={(v) => {
                    if (i === 0) {
                      logFeedback({ gate: 'messaging', field: 'primaryCTA', original: cta, revised: v, revisionType: 'tone' })
                      updateMessagingField('primaryCTA', v)
                    } else {
                      const alts = [...messaging.ctaAlternatives]
                      alts[i - 1] = v
                      updateMessagingField('ctaAlternatives', alts)
                    }
                  }} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT: Value Props */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-zinc-100 mb-3 text-sm uppercase tracking-wide">Value Propositions</h3>
            {messaging.valuePropositions.map((vp) => (
              <Card key={vp.id} padding="md" className="mb-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1">Headline</p>
                    <InlineEdit value={vp.headline} onSave={(v) => handleValuePropEdit(vp.id, 'headline', v, vp.headline)} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1">Description</p>
                    <InlineEdit value={vp.description} multiline onSave={(v) => handleValuePropEdit(vp.id, 'description', v, vp.description)} />
                  </div>
                  {vp.proof && (
                    <div>
                      <p className="text-xs text-zinc-500 font-medium mb-1">Proof</p>
                      <InlineEdit value={vp.proof} onSave={(v) => handleValuePropEdit(vp.id, 'proof', v, vp.proof ?? '')} />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-8 pt-6 border-t flex justify-end">
        <Button onClick={handleApprove} size="lg">
          Approve messaging and continue <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
