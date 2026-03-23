import { NextRequest, NextResponse } from 'next/server'
import { exportToHTML } from '@/lib/exporters/html'
import { exportToReact } from '@/lib/exporters/react'
import { exportToWebflow } from '@/lib/exporters/webflow'
import type { PipelineSession } from '@/types'
import { mockSEO } from '@/lib/mock/fixtures'

export async function POST(req: NextRequest) {
  let session: PipelineSession

  try {
    session = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { copy, design, seo: sessionSeo, context } = session

  if (!copy || !design || !context) {
    return NextResponse.json(
      { error: 'Missing required session data: copy, design, and context are required' },
      { status: 422 }
    )
  }

  const seo = sessionSeo ?? mockSEO(context)

  try {
    const [html, reactComponent, webflowJson] = await Promise.all([
      Promise.resolve(exportToHTML(copy, design, seo)),
      Promise.resolve(exportToReact(copy, design, seo)),
      Promise.resolve(exportToWebflow(copy, design)),
    ])

    return NextResponse.json({ html, reactComponent, webflowJson })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
