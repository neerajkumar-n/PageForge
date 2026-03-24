import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockQA } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, EVALUATION_CRITERIA, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/qa'
import type { BusinessContext, CopyOutput, DesignOutput, MessagingOutput, QAOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
${EVALUATION_CRITERIA}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput,
  design: DesignOutput
): string {
  const selectedDirection = design.directions.find(
    (d) => d.id === design.selectedDirectionId
  )

  return `Audit this assembled landing page:

PRODUCT: ${context.productName}
BRAND TONE: ${context.tone}
ICP: ${context.icp.role} at ${context.icp.company}

APPROVED MESSAGING:
Primary headline: "${messaging.primaryHeadline}"
Primary CTA: "${messaging.primaryCTA}"
Key objections to address: ${messaging.keyObjections.join(', ')}

DESIGN DIRECTION: ${selectedDirection?.name ?? 'Unknown'}
SECTION ORDER: ${design.sectionOrder.join(' → ')}

FULL COPY:
${copy.sections.map((s) => `\n--- ${s.sectionType.toUpperCase()} ---\nHeadline: ${s.headline ?? 'n/a'}\nBody: ${s.body ?? 'n/a'}\nCTA: ${s.ctaText ?? 'n/a'}`).join('\n')}

Audit thoroughly and return the JSON now.`
}

export async function runQAAgent(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput,
  design: DesignOutput,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<QAOutput> {
  if (aiConfig.mockMode) return mockQA(context)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.qa,
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 3000,
    system: buildSystemPrompt(characteristics),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(context, messaging, copy, design),
      },
    ],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as QAOutput
  } catch {
    throw new Error(`QA agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}
