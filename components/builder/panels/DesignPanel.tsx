'use client'

import { useState, useRef } from 'react'
import { Loader2, Sparkles, RefreshCw, LayoutGrid, Image as ImageIcon, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
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

function MiniPreview({ direction, selected, onSelect }: { direction: DesignDirection; selected: boolean; onSelect: () => void }) {
  const p = direction.palette
  return (
    <div
      onClick={onSelect}
      className={['rounded-xl border-2 overflow-hidden cursor-pointer transition-all', selected ? 'border-emerald-500 shadow-md shadow-emerald-100' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}
    >
      <div style={{ background: p.primary, padding: '1rem' }}>
        <div style={{ background: p.primaryForeground, opacity: 0.85, borderRadius: 4, height: 10, width: '75%', marginBottom: 6 }} />
        <div style={{ background: p.primaryForeground, opacity: 0.55, borderRadius: 4, height: 7, width: '55%', marginBottom: 10 }} />
        <div style={{ background: p.accent, borderRadius: 6, height: 22, width: 80, display: 'inline-block' }} />
      </div>
      <div className="p-2.5 bg-zinc-900">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-zinc-100 truncate">{direction.name}</p>
          {selected && <span className="text-emerald-600 text-xs font-bold">✓</span>}
        </div>
        <div className="flex gap-1 mt-1.5">
          {[p.primary, p.accent, p.muted].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
          ))}
          <span className="text-zinc-500 text-xs ml-1 truncate">{direction.typography.heading}</span>
        </div>
      </div>
    </div>
  )
}

function SortableRow({ id, label, enabled, onToggle }: { id: string; label: string; enabled: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={['flex items-center gap-2 p-2.5 rounded-lg border text-sm', enabled ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-dashed border-zinc-800 opacity-50'].join(' ')}
    >
      <button {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-500 cursor-grab">
        <GripVertical size={14} />
      </button>
      <span className="flex-1 text-sm font-medium text-zinc-300">{label}</span>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={onToggle} className="w-3.5 h-3.5 accent-emerald-600" />
        <span className="text-xs text-zinc-500">{enabled ? 'On' : 'Off'}</span>
      </label>
    </div>
  )
}

type Tab = 'ai' | 'presets'

export function DesignPanel() {
  const { design, selectDesignDirection, reorderSections, toggleSection, setDesign, agentStatus } = usePipelineStore()
  const { run, isRunning } = useRunAgent('design')
  const [tab, setTab] = useState<Tab>('ai')
  const [referenceImages, setReferenceImages] = useState<{ name: string; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const status = agentStatus.design
  const ALL_SECTIONS: SectionType[] = ['hero', 'logos', 'problem', 'features', 'testimonials', 'pricing', 'faq', 'cta']

  async function handleRun() {
    await run()
    toast.success('Design directions generated!')
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!design) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = design.sectionOrder.indexOf(active.id as SectionType)
      const newIdx = design.sectionOrder.indexOf(over.id as SectionType)
      reorderSections(arrayMove(design.sectionOrder, oldIdx, newIdx))
    }
  }

  function handlePreset(presetId: string) {
    if (!design) return
    const preset = B2B_DESIGN_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setDesign({
      directions: [preset.direction, ...design.directions.filter((d) => d.id !== preset.direction.id)],
      selectedDirectionId: preset.direction.id,
      sectionOrder: design.sectionOrder,
      componentPicks: design.componentPicks,
    })
    toast.success(`Applied "${preset.label}"`)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach((file) => {
      setReferenceImages((prev) => [...prev, { name: file.name, url: URL.createObjectURL(file) }])
    })
    e.target.value = ''
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/20 flex items-center justify-center text-2xl">🎨</div>
        <div>
          <p className="font-semibold text-zinc-100">Design Agent</p>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">Generates 3 distinct visual directions with palettes, typography, and layout suggestions.</p>
        </div>
        {status === 'error' && <p className="text-sm text-red-500 bg-red-950/20 px-3 py-2 rounded-lg">Something went wrong.</p>}
        <div className="flex flex-col gap-2">
          <Button onClick={handleRun} disabled={isRunning} className="bg-emerald-600 hover:bg-emerald-700">
            {isRunning ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Sparkles size={14} /> Generate AI Directions</>}
          </Button>
          <p className="text-xs text-zinc-500">— or choose from —</p>
          <button onClick={() => { /* show presets even without run */ setTab('presets') }} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 justify-center">
            <LayoutGrid size={12} /> Pick a B2B Preset
          </button>
        </div>
      </div>
    )
  }

  if (status === 'running' || isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="font-semibold text-zinc-100">Design Agent running...</p>
        <p className="text-sm text-zinc-500">Generating 3 distinct visual directions</p>
      </div>
    )
  }

  if (!design) return null

  return (
    <div className="p-5 space-y-6 pb-24">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {([['ai', '✨ AI Directions'], ['presets', '🎯 B2B Presets']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={['flex-1 py-2 text-sm font-medium rounded-lg border transition-all', tab === t ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Re-run */}
      <div className="flex justify-end">
        <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400">
          <RefreshCw size={11} className={isRunning ? 'animate-spin' : ''} /> Re-run AI
        </button>
      </div>

      {/* AI directions */}
      {tab === 'ai' && (
        <div className="grid grid-cols-1 gap-3">
          {design.directions.map((dir) => (
            <MiniPreview
              key={dir.id}
              direction={dir}
              selected={design.selectedDirectionId === dir.id}
              onSelect={() => selectDesignDirection(dir.id)}
            />
          ))}
        </div>
      )}

      {/* Presets */}
      {tab === 'presets' && (
        <div className="grid grid-cols-2 gap-3">
          {B2B_DESIGN_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handlePreset(preset.id)}
              className={['rounded-xl border-2 overflow-hidden cursor-pointer transition-all', design.selectedDirectionId === preset.direction.id ? 'border-emerald-500 shadow-md' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}
            >
              <div className="h-10 flex">
                <div style={{ background: preset.direction.palette.primary, flex: 2 }} />
                <div style={{ background: preset.direction.palette.accent, flex: 1 }} />
                <div style={{ background: preset.direction.palette.muted, flex: 1 }} />
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-zinc-100">{preset.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{preset.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reference images */}
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Reference Images</p>
        <div className="flex gap-2 flex-wrap">
          {referenceImages.map((img) => (
            <div key={img.name} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="w-20 h-14 object-cover rounded-lg border border-zinc-800" />
              <button
                onClick={() => setReferenceImages((prev) => prev.filter((i) => i.name !== img.name))}
                className="absolute top-0.5 right-0.5 bg-zinc-900 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100"
              >
                <X size={10} className="text-zinc-500" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-14 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-400 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-emerald-500 transition-colors"
          >
            <ImageIcon size={14} />
            <span className="text-xs">Add</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      {/* Section order */}
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Section Order</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ALL_SECTIONS} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {ALL_SECTIONS.map((s) => (
                <SortableRow
                  key={s}
                  id={s}
                  label={SECTION_LABELS[s]}
                  enabled={design.sectionOrder.includes(s)}
                  onToggle={() => toggleSection(s)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
