'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, GripVertical, Image as ImageIcon, X, Sparkles, LayoutGrid } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { B2B_DESIGN_PRESETS } from '@/lib/design-presets'
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
      className={['rounded-xl border-2 overflow-hidden cursor-pointer transition-all', selected ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}
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
      <div className="p-3 bg-zinc-900 border-t border-zinc-800/60">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-zinc-100">{direction.name}</p>
          {selected && <span className="text-xs bg-violet-950/200/15 text-violet-400 px-2 py-0.5 rounded-full font-medium">Selected</span>}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{direction.mood}</p>
        <div className="flex gap-1.5 mt-2">
          {[p.primary, p.accent, p.muted, p.foreground].map((c, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
          ))}
          <span className="text-xs text-zinc-500 ml-1">{direction.typography.heading}</span>
        </div>
      </div>
    </div>
  )
}

function PresetCard({ preset, selected, onSelect }: { preset: typeof B2B_DESIGN_PRESETS[0]; selected: boolean; onSelect: () => void }) {
  const p = preset.direction.palette
  return (
    <div
      onClick={onSelect}
      className={['rounded-xl border-2 overflow-hidden cursor-pointer transition-all', selected ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}
    >
      {/* Color strip */}
      <div className="h-12 flex">
        <div style={{ background: p.primary, flex: 2 }} />
        <div style={{ background: p.accent, flex: 1 }} />
        <div style={{ background: p.muted, flex: 1 }} />
      </div>
      <div className="p-3 bg-zinc-900">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-zinc-100">{preset.label}</p>
          {selected && <span className="text-xs bg-violet-950/200/15 text-violet-400 px-1.5 py-0.5 rounded-full font-medium">✓</span>}
        </div>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{preset.category}</span>
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">{preset.description}</p>
        <div className="flex gap-1 flex-wrap mt-2">
          {preset.bestFor.slice(0, 2).map((t, i) => (
            <span key={i} className="text-xs bg-zinc-950 border border-zinc-800/60 text-zinc-500 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
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
      className={['flex items-center gap-3 p-3 rounded-lg border transition-all', enabled ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-dashed border-zinc-800 opacity-60'].join(' ')}
    >
      <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-sm font-medium text-zinc-300">{label}</span>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="w-4 h-4 rounded accent-indigo-600"
        />
        <span className="text-xs text-zinc-500">{enabled ? 'On' : 'Off'}</span>
      </label>
    </div>
  )
}

type DesignSource = 'ai' | 'preset'

export function DesignReviewPanel() {
  const router = useRouter()
  const { design, selectDesignDirection, reorderSections, toggleSection, setComponentVariant, setStep, setDesign } = usePipelineStore()
  const [designSource, setDesignSource] = useState<DesignSource>('ai')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [referenceImages, setReferenceImages] = useState<{ name: string; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleSelectPreset(presetId: string) {
    if (!design) return
    setSelectedPresetId(presetId)
    const preset = B2B_DESIGN_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    // Merge preset direction with existing design (keep section order and component picks)
    setDesign({
      directions: [preset.direction, ...design.directions.filter((d) => d.id !== preset.direction.id)],
      selectedDirectionId: preset.direction.id,
      sectionOrder: design.sectionOrder,
      componentPicks: design.componentPicks,
    })
    toast.success(`Applied "${preset.label}" preset`)
  }

  function handleReferenceImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      setReferenceImages((prev) => [...prev, { name: file.name, url }])
      toast.success(`Reference image added: ${file.name}`)
    })
    e.target.value = ''
  }

  function removeReferenceImage(name: string) {
    setReferenceImages((prev) => prev.filter((img) => img.name !== name))
  }

  function handleApply() {
    toast.success('Design direction applied!')
    setStep('seo-review')
    router.push('/builder/seo-review')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Choose your design direction</h1>
        <p className="text-zinc-500 mt-1">Pick a visual direction, reorder sections, and configure component variants.</p>
      </div>

      {/* Design source tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDesignSource('ai')}
          className={['flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all', designSource === 'ai' ? 'border-violet-500 bg-violet-950/20 text-violet-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'].join(' ')}
        >
          <Sparkles size={14} />
          AI-Generated Directions
        </button>
        <button
          onClick={() => setDesignSource('preset')}
          className={['flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all', designSource === 'preset' ? 'border-violet-500 bg-violet-950/20 text-violet-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'].join(' ')}
        >
          <LayoutGrid size={14} />
          B2B Design Presets
        </button>
      </div>

      {/* 1a. AI-generated directions */}
      {designSource === 'ai' && (
        <section className="mb-8">
          <h2 className="font-semibold text-zinc-300 mb-4 text-sm uppercase tracking-wide">
            1. AI-Generated Visual Directions
          </h2>
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
            <div className="mt-3 p-4 bg-violet-950/20 border border-indigo-100 rounded-xl">
              <p className="text-sm text-indigo-800">{design.directions.find(d => d.id === design.selectedDirectionId)?.description}</p>
            </div>
          )}
        </section>
      )}

      {/* 1b. B2B Design Presets */}
      {designSource === 'preset' && (
        <section className="mb-8">
          <h2 className="font-semibold text-zinc-300 mb-2 text-sm uppercase tracking-wide">
            1. B2B Design Presets
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Battle-tested archetypes for common B2B categories. Click to apply — you can still customize from there.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {B2B_DESIGN_PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                selected={selectedPresetId === preset.id || design.selectedDirectionId === preset.id}
                onSelect={() => handleSelectPreset(preset.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reference images */}
      <section className="mb-8">
        <h2 className="font-semibold text-zinc-300 mb-1 text-sm uppercase tracking-wide">
          {designSource === 'ai' ? '2.' : '2.'} Reference Images (Optional)
        </h2>
        <p className="text-xs text-zinc-500 mb-3">Upload screenshots of designs you like. The Design Agent will incorporate these when you re-run it.</p>
        <div className="flex gap-3 flex-wrap">
          {referenceImages.map((img) => (
            <div key={img.name} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="w-32 h-20 object-cover rounded-lg border border-zinc-800"
              />
              <button
                onClick={() => removeReferenceImage(img.name)}
                className="absolute top-1 right-1 bg-zinc-900 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-zinc-500" />
              </button>
              <p className="text-xs text-zinc-500 mt-1 truncate w-32">{img.name}</p>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-20 rounded-lg border-2 border-dashed border-zinc-700 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-violet-400 transition-colors"
          >
            <ImageIcon size={18} />
            <span className="text-xs">Add image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleReferenceImageUpload}
          />
        </div>
      </section>

      {/* 3. Section order */}
      <section className="mb-8">
        <h2 className="font-semibold text-zinc-300 mb-1 text-sm uppercase tracking-wide">3. Section order</h2>
        <p className="text-xs text-zinc-500 mb-4">Drag to reorder. Toggle sections on/off.</p>
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

      {/* 4. Component variants */}
      <section className="mb-8">
        <h2 className="font-semibold text-zinc-300 mb-1 text-sm uppercase tracking-wide">4. Component variants</h2>
        <p className="text-xs text-zinc-500 mb-4">Choose layout style for sections that have multiple options.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(VARIANTS) as [SectionType, { value: string; label: string }[]][]).map(([sectionType, options]) => (
            <div key={sectionType} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm font-medium text-zinc-300 mb-3">{SECTION_LABELS[sectionType]}</p>
              <div className="flex gap-2 flex-wrap">
                {options.map((opt) => {
                  const current = design.componentPicks[sectionType] ?? options[0].value
                  const selected = current === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setComponentVariant(sectionType, opt.value)}
                      className={['px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', selected ? 'border-violet-500 bg-violet-950/20 text-violet-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'].join(' ')}
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
          Apply design & continue to SEO <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
