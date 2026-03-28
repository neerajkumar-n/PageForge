'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Paperclip, X, CheckCircle, Loader2, ArrowRight, SkipForward, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import type { ResearchMessage, ResearchOutput } from '@/types'

export function ResearchPanel() {
  const router = useRouter()
  const { context, setContext, setResearch, setStep, setAgentStatus } = usePipelineStore()

  const [messages, setMessages] = useState<ResearchMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [researchOutput, setResearchOutput] = useState<ResearchOutput | null>(null)
  const [fileContents, setFileContents] = useState<{ name: string; content: string }[]>([])
  const [initializing, setInitializing] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-start the research conversation — no context required
  useEffect(() => {
    if (messages.length > 0) return
    startResearch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function startResearch() {
    setInitializing(true)
    try {
      const res = await fetch('/api/research-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: context ?? null, messages: [], fileContents: [] }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages([{ role: 'assistant', content: data.message }])
      }
      if (data.isComplete && data.output) {
        handleComplete(data.output)
      }
    } catch {
      toast.error('Failed to start research agent. You can skip research and proceed.')
    } finally {
      setInitializing(false)
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: ResearchMessage = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/research-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: null, messages: newMessages, fileContents }),
      })
      const data = await res.json()

      if (data.isComplete && data.output) {
        handleComplete(data.output)
      } else if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch {
      toast.error('Failed to get a response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleComplete(output: ResearchOutput) {
    // Persist both the derived context and the full research output to the pipeline store
    if (output.context) setContext(output.context)
    setResearch(output)
    setResearchOutput(output)
    setIsComplete(true)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        setFileContents((prev) => {
          if (prev.find((f) => f.name === file.name)) return prev
          return [...prev, { name: file.name, content }]
        })
        toast.success(`Attached: ${file.name}`)
      }
      reader.readAsText(file)
    })
    e.target.value = ''
  }

  function removeFile(name: string) {
    setFileContents((prev) => prev.filter((f) => f.name !== name))
  }

  function handleProceed() {
    if (!researchOutput) return
    setResearch(researchOutput)
    setAgentStatus('research', 'done')
    setStep('running-agents')
    router.push('/builder/running')
  }

  function handleSkip() {
    setAgentStatus('research', 'skipped')
    setStep('running-agents')
    router.push('/builder/running')
  }

  if (initializing) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-violet-400" size={20} />
        <span className="text-zinc-500">Loading research questions...</span>
      </div>
    )
  }

  if (isComplete && researchOutput) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-1 shrink-0" size={22} />
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Research brief ready</h2>
            <p className="text-zinc-500 text-sm mt-1">This brief will be used by the Messaging, Copy, and Design agents.</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Strategic Brief</p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{researchOutput.brief.company.oneLiner}</p>
          </div>

          {researchOutput.brief.competitive.marketGaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Positioning Angles</p>
              <ul className="space-y-1">
                {researchOutput.brief.competitive.marketGaps.map((angle: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-violet-400 shrink-0">→</span>
                    {angle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {researchOutput.brief.competitive.competitors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Competitor Gaps to Exploit</p>
              <ul className="space-y-1">
                {researchOutput.brief.competitive.competitors.map((insight: { name: string; positioning: string }, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-amber-400 shrink-0">▸</span>
                    {insight.positioning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {researchOutput.filesProcessed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Files Analyzed</p>
              <div className="flex gap-2 flex-wrap">
                {researchOutput.filesProcessed.map((f, i) => (
                  <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <FileText size={10} /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button onClick={handleSkip} className="text-sm text-zinc-500 hover:text-zinc-400">
            Discard research and proceed anyway
          </button>
          <Button onClick={handleProceed} size="lg">
            Use this research brief <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Research Agent</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Answer all 10 questions in one reply — the agent will build your research brief instantly.
          </p>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <SkipForward size={14} />
          Skip research
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={['flex', msg.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
                R
              </div>
            )}
            <div
              className={[
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm shadow-sm',
              ].join(' ')}
            >
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
              R
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attached files */}
      {fileContents.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {fileContents.map((f) => (
            <span key={f.name} className="text-xs bg-violet-500/10 border border-violet-500/30 text-violet-400 px-2 py-1 rounded-full flex items-center gap-1">
              <FileText size={10} />
              {f.name}
              <button onClick={() => removeFile(f.name)} className="ml-1 hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder="Answer all the questions above... (Shift+Enter for new lines, Enter to send)"
          className="w-full px-4 pt-3 pb-2 text-sm text-zinc-200 resize-none outline-none bg-transparent"
          rows={3}
          disabled={loading}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-500 hover:text-zinc-400 flex items-center gap-1.5 text-xs"
          >
            <Paperclip size={14} />
            Attach file (.md, .txt, .pdf)
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl p-2 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.pdf,.doc,.docx"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  )
}
