import { NextRequest, NextResponse } from 'next/server'
import { runMessagingAgent } from '@/lib/agents/messaging'
import { runCopyAgent } from '@/lib/agents/copy'
import { runDesignAgent } from '@/lib/agents/design'
import { runQAAgent } from '@/lib/agents/qa'
import type { BusinessContext, FeedbackEntry, MessagingOutput, CopyOutput, DesignOutput } from '@/types'

interface RunAgentsRequest {
  context: BusinessContext
  feedbackLog: FeedbackEntry[]
  characteristicOverrides?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  let context: BusinessContext
  let feedbackLog: FeedbackEntry[]

  try {
    const body: RunAgentsRequest = await req.json()
    context = body.context
    feedbackLog = body.feedbackLog ?? []
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  function event(agent: string, status: string, data?: unknown): Uint8Array {
    const payload = JSON.stringify({ agent, status, ...(data ? { data } : {}) })
    return encoder.encode(`data: ${payload}\n\n`)
  }

  const stream = new ReadableStream({
    async start(controller) {
      let messaging: MessagingOutput | null = null
      let copy: CopyOutput | null = null
      let design: DesignOutput | null = null

      try {
        // ── Messaging + Design run in parallel ──────────
        controller.enqueue(event('messaging', 'running'))
        controller.enqueue(event('design', 'running'))

        const [messagingResult, designResult] = await Promise.all([
          runMessagingAgent(context).then((result) => {
            controller.enqueue(event('messaging', 'done', result))
            return result
          }),
          runDesignAgent(context).then((result) => {
            controller.enqueue(event('design', 'done', result))
            return result
          }),
        ])

        messaging = messagingResult
        design = designResult

        // ── Copy runs after messaging ────────────────────
        controller.enqueue(event('copy', 'running'))
        copy = await runCopyAgent(context, messaging, feedbackLog)
        controller.enqueue(event('copy', 'done', copy))

        // ── QA runs last ─────────────────────────────────
        controller.enqueue(event('qa', 'running'))
        const qa = await runQAAgent(context, messaging, copy, design)
        controller.enqueue(event('qa', 'done', qa))

        controller.enqueue(event('complete', 'done'))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Agent error'
        controller.enqueue(event('error', 'error', { message }))
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
