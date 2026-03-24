import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/builder'
import type {
  BusinessContext,
  CopyOutput,
  DesignOutput,
  GeneratedPage,
  MessagingOutput,
  QAOutput,
  SEOOutput,
} from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

export interface BuilderInput {
  context: BusinessContext
  messaging: MessagingOutput
  copy: CopyOutput
  design: DesignOutput
  seo: SEOOutput
  qa: QAOutput
}

export interface BuilderOutput {
  html: string
  reactComponent: string
  webflowJson: GeneratedPage['webflowJson']
  qaReport: {
    score: number
    checklist: Array<{ item: string; pass: boolean; note: string }>
    warnings: string[]
    autoFixes: string[]
  }
}

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
# GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(input: BuilderInput): string {
  const selectedDirection = input.design.directions.find(
    (d) => d.id === input.design.selectedDirectionId
  )

  const approvedSections = input.copy.sections.filter((s) => s.approved)

  return `Build the landing page from these approved inputs:

# BUSINESS CONTEXT
Company: ${input.context.companyName}
Product: ${input.context.productName}
Primary CTA: ${input.context.primaryCTA} → ${input.context.ctaUrl}

# APPROVED COPY SECTIONS (${approvedSections.length}/${input.copy.sections.length} approved)
${JSON.stringify(input.copy.sections, null, 2)}

# SELECTED DESIGN DIRECTION: ${selectedDirection?.name ?? input.design.selectedDirectionId}
${JSON.stringify(selectedDirection, null, 2)}

# SECTION ORDER
${input.design.sectionOrder.join(' → ')}

# SEO HEAD HTML
${input.seo.headHtml}

# MESSAGING (for QA validation)
Primary Headline: ${input.messaging.primaryHeadline}
Primary CTA: ${input.messaging.primaryCTA}
Key Objections: ${input.messaging.keyObjections.join('; ')}

# QA CONTEXT
Meta title: "${input.seo.pageTitle}" (${input.seo.pageTitle.length} chars)
Meta description: "${input.seo.metaDescription}" (${input.seo.metaDescription.length} chars)

Build all three formats (HTML, React TSX, Webflow JSON) and run the QA checklist. Return the BuilderOutput JSON.`
}

function mockBuilderOutput(input: BuilderInput): BuilderOutput {
  const direction = input.design.directions.find(
    (d) => d.id === input.design.selectedDirectionId
  ) ?? input.design.directions[0]

  const palette = direction?.palette
  const typography = direction?.typography

  const html = `<!--
PAGEFORGE CHANGELOG
Generated: ${new Date().toISOString()}
Agents: Research → Messaging → Copy → Design → SEO → QA → Builder
Direction selected: ${direction?.name ?? 'Unknown'}
Human feedback applied: ${input.copy.sections.filter(s => s.humanEdited).length} sections edited
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${input.seo.headHtml}
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(typography?.heading?.split(',')[0] ?? 'Inter')}:wght@400;600;700&family=${encodeURIComponent(typography?.body?.split(',')[0] ?? 'Inter')}:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --color-primary: ${palette?.primary ?? '#4F46E5'};
      --color-primary-fg: ${palette?.primaryForeground ?? '#FFFFFF'};
      --color-accent: ${palette?.accent ?? '#7C3AED'};
      --color-bg: ${palette?.background ?? '#FAFAFA'};
      --color-fg: ${palette?.foreground ?? '#111827'};
      --color-muted: ${palette?.muted ?? '#F3F4F6'};
      --color-muted-fg: ${palette?.mutedForeground ?? '#6B7280'};
      --color-border: ${palette?.border ?? '#E5E7EB'};
    }
    body { background: var(--color-bg); color: var(--color-fg); font-family: '${typography?.body?.split(',')[0] ?? 'Inter'}', sans-serif; }
    h1, h2, h3 { font-family: '${typography?.heading?.split(',')[0] ?? 'Inter'}', sans-serif; }
  </style>
</head>
<body>
<!-- PAGEFORGE: hero -->
<section class="py-24 px-6 text-center max-w-4xl mx-auto">
  <h1 class="text-5xl font-bold leading-tight mb-6">${input.copy.sections.find(s => s.sectionType === 'hero')?.headline ?? input.messaging.primaryHeadline}</h1>
  <p class="text-xl mb-8" style="color: var(--color-muted-fg)">${input.copy.sections.find(s => s.sectionType === 'hero')?.subheadline ?? ''}</p>
  <a href="${input.context.ctaUrl}" class="inline-block px-8 py-4 rounded-xl font-semibold text-lg" style="background: var(--color-primary); color: var(--color-primary-fg)">${input.context.primaryCTA}</a>
</section>
<!-- PAGEFORGE: end -->
<footer class="border-t py-8 px-6 text-center text-sm" style="border-color: var(--color-border); color: var(--color-muted-fg)">
  <p>© ${new Date().getFullYear()} ${input.context.companyName}. All rights reserved.</p>
  <nav class="mt-2 flex justify-center gap-6">
    <a href="/privacy" class="hover:underline">Privacy</a>
    <a href="/terms" class="hover:underline">Terms</a>
  </nav>
</footer>
</body>
</html>`

  const reactComponent = `// Generated by PageForge Builder Agent — ${new Date().toISOString()}
import React from 'react'

const palette = {
  primary: '${palette?.primary ?? '#4F46E5'}',
  primaryForeground: '${palette?.primaryForeground ?? '#FFFFFF'}',
  accent: '${palette?.accent ?? '#7C3AED'}',
  background: '${palette?.background ?? '#FAFAFA'}',
  foreground: '${palette?.foreground ?? '#111827'}',
  muted: '${palette?.muted ?? '#F3F4F6'}',
  mutedForeground: '${palette?.mutedForeground ?? '#6B7280'}',
  border: '${palette?.border ?? '#E5E7EB'}',
}

interface LandingPageProps {
  config?: Partial<typeof palette>
}

export default function LandingPage({ config }: LandingPageProps) {
  const p = { ...palette, ...config }

  return (
    <main style={{ background: p.background, color: p.foreground }}>
      {/* Hero */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          ${input.copy.sections.find(s => s.sectionType === 'hero')?.headline ?? input.messaging.primaryHeadline}
        </h1>
        <p className="text-xl mb-8" style={{ color: p.mutedForeground }}>
          ${input.copy.sections.find(s => s.sectionType === 'hero')?.subheadline ?? ''}
        </p>
        <a
          href="${input.context.ctaUrl}"
          className="inline-block px-8 py-4 rounded-xl font-semibold text-lg"
          style={{ background: p.primary, color: p.primaryForeground }}
        >
          ${input.context.primaryCTA}
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm" style={{ borderColor: p.border, color: p.mutedForeground }}>
        <p>© ${new Date().getFullYear()} ${input.context.companyName}. All rights reserved.</p>
      </footer>
    </main>
  )
}`

  const webflowJson = input.copy.sections
    .filter(s => s.approved)
    .map(section => ({
      type: section.sectionType,
      slug: section.id,
      content: {
        headline: section.headline,
        subheadline: section.subheadline,
        body: section.body,
        ctaText: section.ctaText,
        items: section.items,
      },
      styles: {
        backgroundColor: palette?.background ?? '#FAFAFA',
        textColor: palette?.foreground ?? '#111827',
        accentColor: palette?.accent ?? '#7C3AED',
        paddingTop: '96px',
        paddingBottom: '96px',
      },
      variant: input.design.componentPicks[section.sectionType] ?? 'default',
    }))

  const checklist = [
    { item: 'Primary headline matches approved', pass: true, note: 'Hero headline matches messaging framework' },
    { item: 'All CTAs use approved text and URL', pass: true, note: `CTA: "${input.context.primaryCTA}" → ${input.context.ctaUrl}` },
    { item: 'Meta title under 60 characters', pass: input.seo.pageTitle.length <= 60, note: `${input.seo.pageTitle.length} characters` },
    { item: 'Meta description 150–160 characters', pass: input.seo.metaDescription.length >= 150 && input.seo.metaDescription.length <= 160, note: `${input.seo.metaDescription.length} characters` },
    { item: 'JSON-LD is valid', pass: true, note: 'Schema markup validated' },
    { item: 'HTML is valid', pass: true, note: 'No unclosed tags detected' },
  ]

  const passed = checklist.filter(c => c.pass).length
  const score = Math.round((passed / checklist.length) * 100)

  return { html, reactComponent, webflowJson, qaReport: { score, checklist, warnings: [], autoFixes: [] } }
}

export async function runBuilderAgent(
  input: BuilderInput,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<BuilderOutput> {
  // Validate all sections are approved
  const unapproved = input.copy.sections.filter(s => !s.approved)
  if (unapproved.length > 0) {
    throw new Error(`Cannot build: ${unapproved.length} section(s) not yet approved: ${unapproved.map(s => s.sectionType).join(', ')}`)
  }

  if (!input.design.selectedDirectionId) {
    throw new Error('Cannot build: no design direction selected')
  }

  if (aiConfig.mockMode) {
    return mockBuilderOutput(input)
  }

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.research, // fallback — builder uses its own config
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: aiConfig.maxTokens,
    system: buildSystemPrompt(characteristics),
    messages: [{ role: 'user', content: buildUserPrompt(input) }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as BuilderOutput
  } catch {
    throw new Error(`Builder agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}
