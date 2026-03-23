import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockCopy } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, SECTION_SPECS, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/copy'
import type {
  BusinessContext,
  MessagingOutput,
  CopyOutput,
  FeedbackEntry,
} from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
${SECTION_SPECS}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
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
