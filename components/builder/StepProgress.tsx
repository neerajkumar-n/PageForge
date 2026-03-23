'use client'
import { Check } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import type { PipelineStep } from '@/types'

const STEPS: { id: PipelineStep; label: string }[] = [
  { id: 'intake', label: 'Intake' },
  { id: 'research', label: 'Research' },
  { id: 'running-agents', label: 'AI Agents' },
  { id: 'messaging-review', label: 'Messaging' },
  { id: 'copy-review', label: 'Copy' },
  { id: 'design-review', label: 'Design' },
  { id: 'seo-review', label: 'SEO' },
  { id: 'preview', label: 'Preview' },
]

const STEP_ORDER = STEPS.map((s) => s.id)

function getStepIndex(step: PipelineStep): number {
  const idx = STEP_ORDER.indexOf(step)
  return idx >= 0 ? idx : 0
}

export function StepProgress() {
  const currentStep = usePipelineStore((s) => s.currentStep)
  const currentIndex = getStepIndex(currentStep)

  return (
    <nav className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const status =
          i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'
        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                  status === 'done'
                    ? 'bg-indigo-600 text-white'
                    : status === 'active'
                    ? 'bg-white border-2 border-indigo-600 text-indigo-600'
                    : 'bg-gray-100 border border-gray-300 text-gray-400',
                ].join(' ')}
              >
                {status === 'done' ? <Check size={12} /> : <span>{i + 1}</span>}
              </div>
              <span
                className={[
                  'text-xs whitespace-nowrap hidden lg:block',
                  status === 'active'
                    ? 'text-indigo-600 font-semibold'
                    : status === 'done'
                    ? 'text-indigo-500'
                    : 'text-gray-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={[
                  'h-0.5 w-4 sm:w-8 mx-1 transition-all',
                  i < currentIndex ? 'bg-indigo-600' : 'bg-gray-200',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
