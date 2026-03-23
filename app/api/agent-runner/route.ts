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
  context: BusinessContext
  messaging?: MessagingOutput
  copy?: CopyOutput
  design?: DesignOutput
  research?: ResearchOutput
  feedbackLog?: FeedbackEntry[]
}

export async function POST(req: NextRequest) {
  let body: AgentRunnerRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { target, context, messaging, copy, design, research, feedbackLog = [] } = body

  const encoder = new TextEncoder()
  function event(status: string, data?: unknown): Uint8Array {
    const payload = JSON.stringify({ agent: target, status, ...(data ? { data } : {}) })
    return encoder.encode(`data: ${payload}\n\n`)
  }

  // Enrich context with research brief if available
  const enrichedContext: BusinessContext = research
    ? {
        ...context,
        productDescription: `${context.productDescription}\n\n[RESEARCH BRIEF]\n${research.researchBrief}`,
        existingCopyExamples: [
          context.existingCopyExamples,
          research.competitorInsights?.length
            ? `COMPETITOR INSIGHTS:\n${research.competitorInsights.join('\n')}`
            : '',
          research.audienceInsights?.length
            ? `AUDIENCE INSIGHTS:\n${research.audienceInsights.join('\n')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      }
    : context

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
