import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockCopy } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import type {
  BusinessContext,
  MessagingOutput,
  CopyOutput,
  FeedbackEntry,
} from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  return `${buildCharacteristicsPrompt(characteristics)}

# YOUR TASK
You are writing complete landing page copy for every section of a B2B landing page.
The messaging framework provided is an APPROVED, LOCKED constraint. Do not deviate from it.

# SECTION SPECIFICATIONS
Write copy for all 8 sections. Each section has specific requirements:

hero: headline (matches primaryHeadline exactly), subheadline, body (1 social proof line), ctaText
logos: headline only ("Trusted by teams at" style)
problem: headline, subheadline, items[3] — each with title + description. Name the pain, don't just describe it.
features: headline, subheadline, items[5] — each with title + description + icon name from lucide-react
testimonials: headline, items[3] — each with title (Name, Title at Company) + description (full quote in quotation marks, 2–4 sentences, specific outcomes)
pricing: headline, subheadline, ctaText, items[2] — each with title (plan name) + description (price + features as bullet-style string)
faq: headline, items[5] — each with title (question) + description (full answer, 3–5 sentences)
cta: headline (different angle from hero), subheadline, ctaText, body (3 trust signals)

# OUTPUT FORMAT
Return ONLY valid JSON matching this TypeScript interface. No markdown, no commentary:

interface CopyOutput {
  sections: Array<{
    id: string           // "hero" | "logos" | "problem" | "features" | "testimonials" | "pricing" | "faq" | "cta"
    sectionType: string  // same as id
    headline?: string
    subheadline?: string
    body?: string
    ctaText?: string
    items?: Array<{
      id: string         // "p-1", "f-1", "t-1", etc.
      title: string
      description: string
      icon?: string      // lucide-react icon name for features section
    }>
    approved: false
    humanEdited: false
  }>
}

# QUALITY REQUIREMENTS
- Testimonials must sound like real people — specific outcomes, named companies, professional but human
- FAQ answers must fully resolve the objection, not deflect it
- Problem descriptions must resonate emotionally — the reader should feel "that's exactly what happens to me"
- Feature descriptions must explain the mechanism, not just the benefit
- Never use placeholder text — every word must be production-ready
`
}

function buildUserPrompt(
  context: BusinessContext,
  messaging: MessagingOutput,
  feedbackLog: FeedbackEntry[]
): string {
  const feedbackContext =
    feedbackLog.length > 0
      ? `\n\nHUMAN FEEDBACK FROM MESSAGING REVIEW (match this tone and style):
${feedbackLog
  .map(
    (f) =>
      `- Field: ${f.field}
  Original: "${f.original}"
  Revised to: "${f.revised}"
  Reason type: ${f.revisionType}`
  )
  .join('\n')}`
      : ''

  return `Write full landing page copy for:

COMPANY: ${context.companyName}
PRODUCT: ${context.productName}
TONE: ${context.tone}

APPROVED MESSAGING FRAMEWORK (use this as gospel — do not change headlines or value props):
${JSON.stringify(messaging, null, 2)}
${feedbackContext}

Return the JSON now. All 8 sections. No preamble.`
}

export async function runCopyAgent(
  context: BusinessContext,
  messaging: MessagingOutput,
  feedbackLog: FeedbackEntry[],
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<CopyOutput> {
  if (aiConfig.mockMode) return mockCopy(context)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.copy,
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
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(context, messaging, feedbackLog),
      },
    ],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as CopyOutput
  } catch {
    throw new Error(`Copy agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}

export async function regenerateSectionCopy(
  context: BusinessContext,
  messaging: MessagingOutput,
  sectionId: string,
  feedbackLog: FeedbackEntry[],
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<CopyOutput['sections'][0]> {
  if (aiConfig.mockMode) {
    const fullCopy = mockCopy(context)
    const section = fullCopy.sections.find((s) => s.id === sectionId)
    if (!section) throw new Error(`Section ${sectionId} not found in mock`)
    return section
  }

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.copy,
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 2000,
    system: buildSystemPrompt(characteristics),
    messages: [
      {
        role: 'user',
        content: `Rewrite ONLY the "${sectionId}" section for ${context.productName}.

APPROVED MESSAGING: ${JSON.stringify(messaging, null, 2)}

FEEDBACK THAT PROMPTED REGENERATION:
${feedbackLog
  .filter((f) => f.gate === 'copy')
  .map((f) => `- ${f.field}: "${f.original}" → "${f.revised}"`)
  .join('\n')}

Return ONLY a single section object matching the SectionCopy interface. No array wrapper. No preamble.`,
      },
    ],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  return JSON.parse(
    text.replace(/```json|```/g, '').trim()
  ) as CopyOutput['sections'][0]
}
