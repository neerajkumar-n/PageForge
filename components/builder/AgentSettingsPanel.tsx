'use client'
import { useState } from 'react'
import { RotateCcw, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { defaultAgentCharacteristics } from '@/config/ai.config'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import type { AgentConfigs } from '@/config/ai.config'

const AGENT_LABELS: Record<keyof AgentConfigs, { label: string; desc: string; color: string }> = {
  messaging: { label: 'Messaging Agent', desc: 'Headlines, value props, positioning', color: 'purple' },
  copy: { label: 'Copy Agent', desc: 'Full section copy', color: 'blue' },
  design: { label: 'Design Agent', desc: 'Palettes, typography, layout', color: 'green' },
  qa: { label: 'QA Agent', desc: 'CRO audit & scoring', color: 'amber' },
}

const FIELDS: { key: keyof import('@/config/ai.config').AgentCharacteristics; label: string; hint: string; multiline: boolean }[] = [
  { key: 'persona', label: 'Persona', hint: 'Who this agent is — their background, experience, perspective', multiline: true },
  { key: 'tone', label: 'Tone', hint: 'How this agent communicates — style, register, energy', multiline: false },
  { key: 'customInstructions', label: 'Custom instructions', hint: 'Extra instructions added to this agent\'s prompt. Use this to add product-specific rules.', multiline: true },
]

export function AgentSettingsPanel() {
  const { agentCharacteristicOverrides, updateAgentCharacteristics, resetAgentCharacteristics, getEffectiveCharacteristics } = usePipelineStore()
  const [expanded, setExpanded] = useState<keyof AgentConfigs | null>(null)
  const effective = getEffectiveCharacteristics()

  function handleSave(agent: keyof AgentConfigs, field: string, value: string) {
    updateAgentCharacteristics(agent, field, value)
    toast.success(`${AGENT_LABELS[agent].label} updated`)
  }

  function handleReset(agent: keyof AgentConfigs) {
    resetAgentCharacteristics(agent)
    toast.success(`${AGENT_LABELS[agent].label} reset to defaults`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Info size={16} className="text-gray-400" />
        <p className="text-sm text-gray-500">Customize each agent's persona and behavior. Changes apply to the next run.</p>
      </div>

      {(Object.keys(AGENT_LABELS) as (keyof AgentConfigs)[]).map((agentKey) => {
        const meta = AGENT_LABELS[agentKey]
        const isExpanded = expanded === agentKey
        const hasOverride = !!agentCharacteristicOverrides[agentKey]
        const chars = effective[agentKey]

        return (
          <div key={agentKey} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              onClick={() => setExpanded(isExpanded ? null : agentKey)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full bg-${meta.color}-500`} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-400">{meta.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasOverride && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Modified</span>}
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {FIELDS.map(({ key, label, hint, multiline }) => (
                  <AgentField
                    key={key}
                    label={label}
                    hint={hint}
                    value={chars[key] as string}
                    defaultValue={defaultAgentCharacteristics[agentKey][key] as string}
                    multiline={multiline}
                    onSave={(v) => handleSave(agentKey, key, v)}
                  />
                ))}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Constraints ({chars.constraints.length})</p>
                  <div className="space-y-1">
                    {chars.constraints.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                        <span className="text-red-400 shrink-0">×</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {hasOverride && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleReset(agentKey)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <RotateCcw size={12} /> Reset to defaults
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AgentField({
  label, hint, value, defaultValue, multiline, onSave,
}: {
  label: string; hint: string; value: string; defaultValue: string; multiline: boolean; onSave: (v: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const isDirty = draft !== defaultValue

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        {isDirty && <span className="text-xs text-amber-600 font-medium">Modified</span>}
      </div>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { if (draft !== value) onSave(draft) }}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-xs resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { if (draft !== value) onSave(draft) }}
          className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  )
}
