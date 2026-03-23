'use client'

import { useState } from 'react'
import { Loader2, Sparkles, RefreshCw, Search, Globe, Tag, Code, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { useRunAgent } from '@/lib/hooks/useRunAgent'
import { Button } from '@/components/ui/Button'

function Field({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  maxLength?: number
}) {
  const over = maxLength ? value.length > maxLength : false
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        {maxLength && (
          <span className={['text-xs font-mono', over ? 'text-red-500' : 'text-gray-400'].join(' ')}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={['w-full text-sm border rounded-xl px-3 py-2 resize-none outline-none transition-colors', over ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'].join(' ')}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={['w-full text-sm border rounded-xl px-3 py-2 outline-none transition-colors', over ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'].join(' ')}
        />
      )}
    </div>
  )
}

function SERPPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">SERP Preview</p>
      <p className="text-xs text-gray-400 truncate">{url || 'https://yoursite.com'}</p>
      <p className="text-[#1a0dab] text-base font-medium leading-tight hover:underline cursor-pointer line-clamp-1 mt-0.5">
        {title || 'Page title appears here'}
      </p>
      <p className="text-sm text-gray-500 line-clamp-2 leading-snug mt-0.5">
        {description || 'Meta description appears here.'}
      </p>
    </div>
  )
}

export function SEOPanel() {
  const { seo, messaging, copy, context, updateSEOField, agentStatus } = usePipelineStore()
  const { run, isRunning } = useRunAgent('seo')
  const [schemaOpen, setSchemaOpen] = useState(false)

  const status = agentStatus.seo
  const canRun = !!messaging && !!copy

  async function handleRun() {
    if (!canRun) {
      toast.error('Run Messaging and Copy agents first.')
      return
    }
    await run()
    toast.success('SEO metadata generated!')
  }

  if (status === 'idle' || status === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🔍</div>
        <div>
          <p className="font-semibold text-gray-900">SEO Agent</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Generates meta tags, Open Graph, Schema.org JSON-LD, and a keyword strategy.
          </p>
          {!canRun && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              💡 Run Messaging and Copy agents first
            </p>
          )}
        </div>
        {status === 'error' && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">Something went wrong.</p>}
        <Button onClick={handleRun} disabled={isRunning || !canRun} className="bg-amber-500 hover:bg-amber-600">
          {isRunning ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Sparkles size={14} /> Run SEO Agent</>}
        </Button>
      </div>
    )
  }

  if (status === 'running' || isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="font-semibold text-gray-900">SEO Agent running...</p>
        <p className="text-sm text-gray-500">Generating meta tags, schema, and keyword strategy</p>
      </div>
    )
  }

  if (!seo) return null

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex justify-end">
        <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          <RefreshCw size={11} className={isRunning ? 'animate-spin' : ''} /> Re-run
        </button>
      </div>

      {/* SERP Preview */}
      <SERPPreview title={seo.pageTitle} description={seo.metaDescription} url={context?.ctaUrl ?? ''} />

      {/* Search meta */}
      <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-900">Search Tags</p>
        </div>
        <Field label="Page Title" value={seo.pageTitle} onChange={(v) => updateSEOField('pageTitle', v)} maxLength={60} />
        <Field label="Meta Description" value={seo.metaDescription} onChange={(v) => updateSEOField('metaDescription', v)} multiline maxLength={160} />
        <Field label="H1" value={seo.h1} onChange={(v) => updateSEOField('h1', v)} />
      </div>

      {/* Open Graph */}
      <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-900">Social Sharing</p>
        </div>
        <Field label="OG Title" value={seo.ogTitle} onChange={(v) => updateSEOField('ogTitle', v)} maxLength={70} />
        <Field label="OG Description" value={seo.ogDescription} onChange={(v) => updateSEOField('ogDescription', v)} multiline maxLength={200} />
      </div>

      {/* Keywords */}
      <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-900">Keywords</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Focus Keyword</p>
          <span className="inline-block bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
            {seo.focusKeyword}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">All Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {seo.keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Schema */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <button
          onClick={() => setSchemaOpen(!schemaOpen)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Code size={14} className="text-amber-500" />
            <p className="text-sm font-semibold text-gray-900">Schema Markup</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={10} /> {seo.schemaType}
            </span>
            <span className="text-xs text-gray-400">{schemaOpen ? '▲' : '▼'}</span>
          </div>
        </button>
        {schemaOpen && (
          <pre className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto text-gray-700 leading-relaxed">
            {JSON.stringify(seo.schemaMarkup, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
