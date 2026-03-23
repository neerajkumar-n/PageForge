'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, GripVertical } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import type { DesignDirection, SectionType } from '@/types'

const SECTION_LABELS: Record<SectionType, string> = {
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

const VARIANTS: Partial<Record<SectionType, { value: string; label: string }[]>> = {
  hero: [
    { value: 'centered', label: 'Centered' },
    { value: 'left-aligned', label: 'Left-aligned' },
    { value: 'split', label: 'Split with form' },
  ],
  features: [
    { value: 'grid', label: 'Icon grid' },
    { value: 'list', label: 'Feature list' },
  ],
  testimonials: [
    { value: 'cards', label: 'Cards' },
    { value: 'single', label: 'Pull quote' },
  ],
  pricing: [
    { value: 'two-tier', label: '2 tiers' },
    { value: 'three-tier', label: '3 tiers' },
  ],
}

function MoodboardCard({ direction, selected, onSelect }: { direction: DesignDirection; selected: boolean; onSelect: () => void }) {
  const p = direction.palette
  return (
    <div
      onClick={onSelect}
      className={['rounded-xl border-2 overflow-hidden cursor-pointer transition-all', selected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200 hover:border-gray-300'].join(' ')}
    >
      {/* Mini hero preview */}
      <div style={{ background: p.primary, padding: '1.5rem 1.25rem' }}>
        <div style={{ background: `${p.accent}30`, borderRadius: 4, height: 8, width: '60%', marginBottom: '0.75rem' }} />
        <div style={{ background: p.primaryForeground, borderRadius: 4, height: 14, width: '85%', marginBottom: '0.5rem', opacity: 0.9 }} />
        <div style={{ background: p.primaryForeground, borderRadius: 4, height: 10, width: '70%', opacity: 0.6, marginBottom: '1rem' }} />
        <div style={{ background: p.accent, borderRadius: 6, height: 28, width: 100, display: 'inline-block' }} />
      </div>
      {/* Mini card section */}
      <div style={{ background: p.muted, padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: p.background, borderRadius: 6, padding: 8, border: `1px solid ${p.border}` }}>
            <div style={{ background: p.primary, borderRadius: 3, height: 8, width: '40%', marginBottom: 6 }} />
            <div style={{ background: p.mutedForeground, borderRadius: 3, height: 5, width: '80%', opacity: 0.4, marginBottom: 3 }} />
            <div style={{ background: p.mutedForeground, borderRadius: 3, height: 5, width: '60%', opacity: 0.3 }} />
          </div>
        ))}
      </div>
      {/* Info */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-gray-900">{direction.name}</p>
          {selected && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Selected</span>}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{direction.mood}</p>
        <div className="flex gap-1.5 mt-2">
          {[p.primary, p.accent, p.muted, p.foreground].map((c, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
          ))}
          <span className="text-xs text-gray-400 ml-1">{direction.typography.heading}</span>
        </div>
      </div>
    </div>
  )
}

function SortableSection({ id, label, enabled, onToggle }: { id: string; label: string; enabled: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={['flex items-center gap-3 p-3 rounded-lg border transition-all', enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'].join(' ')}
    >
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="w-4 h-4 rounded accent-indigo-600"
        />
        <span className="text-xs text-gray-400">{enabled ? 'On' : 'Off'}</span>
      </label>
    </div>
  )
}

export function DesignReviewPanel() {
  const router = useRouter()
  const { design, selectDesignDirection, reorderSections, toggleSection, setComponentVariant, setStep } = usePipelineStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!design) return null

  const ALL_SECTIONS: SectionType[] = ['hero', 'logos', 'problem', 'features', 'testimonials', 'pricing', 'faq', 'cta']
  const activeOrder = design.sectionOrder

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = activeOrder.indexOf(active.id as SectionType)
      const newIdx = activeOrder.indexOf(over.id as SectionType)
      reorderSections(arrayMove(activeOrder, oldIdx, newIdx))
    }
  }

  function handleApply() {
    toast.success('Design direction applied!')
    setStep('preview')
    router.push('/builder/preview')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Choose your design direction</h1>
        <p className="text-gray-500 mt-1">Pick a visual direction, reorder sections, and configure component variants.</p>
      </div>

      {/* 1. Direction picker */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">1. Visual direction</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {design.directions.map((dir) => (
            <MoodboardCard
              key={dir.id}
              direction={dir}
              selected={design.selectedDirectionId === dir.id}
              onSelect={() => selectDesignDirection(dir.id)}
            />
          ))}
        </div>
        {design.directions.find(d => d.id === design.selectedDirectionId) && (
          <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-sm text-indigo-800">{design.directions.find(d => d.id === design.selectedDirectionId)?.description}</p>
          </div>
        )}
      </section>

      {/* 2. Section order */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-1 text-sm uppercase tracking-wide">2. Section order</h2>
        <p className="text-xs text-gray-400 mb-4">Drag to reorder. Toggle sections on/off.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ALL_SECTIONS} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-w-md">
              {ALL_SECTIONS.map((sectionType) => (
                <SortableSection
                  key={sectionType}
                  id={sectionType}
                  label={SECTION_LABELS[sectionType]}
                  enabled={activeOrder.includes(sectionType)}
                  onToggle={() => toggleSection(sectionType)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* 3. Component variants */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-1 text-sm uppercase tracking-wide">3. Component variants</h2>
        <p className="text-xs text-gray-400 mb-4">Choose layout style for sections that have multiple options.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(VARIANTS) as [SectionType, { value: string; label: string }[]][]).map(([sectionType, options]) => (
            <div key={sectionType} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">{SECTION_LABELS[sectionType]}</p>
              <div className="flex gap-2 flex-wrap">
                {options.map((opt) => {
                  const current = design.componentPicks[sectionType] ?? options[0].value
                  const selected = current === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setComponentVariant(sectionType, opt.value)}
                      className={['px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'].join(' ')}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-6 border-t flex justify-end">
        <Button onClick={handleApply} size="lg">
          Apply design and build page <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
