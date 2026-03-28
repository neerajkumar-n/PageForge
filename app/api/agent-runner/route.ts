import { NextRequest, NextResponse } from 'next/server'
import { runMessagingAgent } from '@/lib/agents/messaging'
import { runCopyAgent } from '@/lib/agents/copy'
import { runDesignAgent } from '@/lib/agents/design'
import { runQAAgent } from '@/lib/agents/qa'
import { runSEOAgent } from '@/lib/agents/seo'
import type {
  BusinessContext,
  FeedbackEntry,
  MessagingOutput,
  CopyOutput,
  DesignOutput,
  ResearchOutput,
} from '@/types'

export type AgentTarget = 'messaging' | 'copy' | 'design' | 'qa' | 'seo'

interface AgentRunnerRequest {
  target: AgentTarget
  context: BusinessContext | null
  messaging?: MessagingOutput
  copy?: CopyOutput
  design?: DesignOutput
  research?: ResearchOutput
  feedbackLog?: FeedbackEntry[]
}

/** Derive a minimal BusinessContext from research output when no explicit context exists */
function contextFromResearch(research: ResearchOutput): BusinessContext {
  const { brief } = research
  const tone = (() => {
    const level = brief.icp.sophisticationLevel
    const size = brief.icp.companySize?.toLowerCase() ?? ''
    if (size.includes('enterprise') || level === 'high') return 'enterprise' as const
    if (brief.icp.industry?.toLowerCase().includes('tech') || level === 'medium') return 'technical' as const
    return 'startup' as const
  })()

  return {
    companyName: brief.company.name,
    productName: brief.company.product,
    productDescription: brief.company.oneLiner,
    useCase: brief.product.keyDifferentiators.join('; ') || brief.company.category,
    icp: {
      role: brief.icp.primaryRole,
      company: `${brief.icp.companyType} (${brief.icp.companySize})`,
      painPoints: brief.icp.painPoints.join(', '),
      goals: brief.icp.goals.join(', '),
    },
    competitors: brief.competitive.competitors.map((c) => c.name).join(', ') || 'Unknown',
    primaryCTA: brief.pageGoal.primaryCTA,
    ctaUrl: brief.pageGoal.ctaUrl,
    tone,
    existingCopyExamples: brief.rawContext.keyPhrasesFromDocuments.join('\n') || undefined,
  }
}

export async function POST(req: NextRequest) {
  let body: AgentRunnerRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { target, context: rawContext, messaging, copy, design, research, feedbackLog = [] } = body

  const encoder = new TextEncoder()
  function event(status: string, data?: unknown): Uint8Array {
    const payload = JSON.stringify({ agent: target, status, ...(data ? { data } : {}) })
    return encoder.encode(`data: ${payload}\n\n`)
  }

  // Resolve context: prefer explicit context, fall back to deriving from research, then fail clearly
  const resolvedContext: BusinessContext | null =
    rawContext ?? (research ? contextFromResearch(research) : null)

  if (!resolvedContext) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ agent: target, status: 'error', data: { message: 'No business context available. Please complete the Research Agent or fill in your business details first.' } })}\n\n`
          )
        )
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  }

  // Enrich context with research brief if available
  const enrichedContext: BusinessContext = research
    ? {
        ...resolvedContext,
        productDescription: `${resolvedContext.productDescription}\n\n[RESEARCH BRIEF]\n${research.brief.company.oneLiner}`,
        existingCopyExamples: [
          resolvedContext.existingCopyExamples,
          research.brief.competitive.marketGaps?.length
            ? `COMPETITOR INSIGHTS:\n${research.brief.competitive.marketGaps.join('\n')}`
            : '',
          research.brief.icp.painPoints?.length
            ? `AUDIENCE INSIGHTS:\n${research.brief.icp.painPoints.join('\n')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      }
    : resolvedContext

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(event('running'))

        let result: unknown

        if (target === 'messaging') {
          result = await runMessagingAgent(enrichedContext)
        } else if (target === 'copy') {
          const msgCtx = messaging ?? null
          if (!msgCtx) throw new Error('Messaging output required to run Copy Agent')
          result = await runCopyAgent(enrichedContext, msgCtx, feedbackLog)
        } else if (target === 'design') {
          result = await runDesignAgent(enrichedContext)
        } else if (target === 'qa') {
          const msgCtx = messaging ?? null
          const copyCtx = copy ?? null
          const designCtx = design ?? null
          if (!msgCtx || !copyCtx || !designCtx) {
            throw new Error('Messaging, Copy, and Design outputs are required for QA Agent')
          }
          result = await runQAAgent(enrichedContext, msgCtx, copyCtx, designCtx)
        } else if (target === 'seo') {
          const msgCtx = messaging ?? null
          const copyCtx = copy ?? null
          if (!msgCtx || !copyCtx) {
            throw new Error('Messaging and Copy outputs are required for SEO Agent')
          }
          result = await runSEOAgent(enrichedContext, msgCtx, copyCtx)
        } else {
          throw new Error(`Unknown agent target: ${target}`)
        }

        controller.enqueue(event('done', result))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Agent error'
        controller.enqueue(event('error', { message }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
