'use client'
import { Check } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import type { PipelineStep } from '@/types'

const STEPS: { id: PipelineStep; label: string }[] = [
  { id: 'intake',          label: 'Intake'    },
  { id: 'research',        label: 'Research'  },
  { id: 'running-agents',  label: 'Agents'    },
  { id: 'messaging-review',label: 'Messaging' },
  { id: 'copy-review',     label: 'Copy'      },
  { id: 'design-review',   label: 'Design'    },
  { id: 'seo-review',      label: 'SEO'       },
  { id: 'preview',         label: 'Preview'   },
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
    <nav className="flex items-center gap-0" aria-label="Progress">
      {STEPS.map((step, i) => {
        const status = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'
        return (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300',
                  status === 'done'
                    ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(124,58,237,0.4)]'
                    : status === 'active'
                    ? 'bg-zinc-900 border-2 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-600',
                ].join(' ')}
              >
                {status === 'done' ? <Check size={10} strokeWidth={3} /> : <span>{i + 1}</span>}
              </div>
              <span
                className={[
                  'text-[10px] whitespace-nowrap hidden lg:block font-medium transition-colors',
                  status === 'active'  ? 'text-violet-400'
                  : status === 'done' ? 'text-zinc-500'
                  : 'text-zinc-700',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={[
                  'h-px w-3 sm:w-5 mx-0.5 transition-all duration-500',
                  i < currentIndex ? 'bg-violet-600/60' : 'bg-zinc-800',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
