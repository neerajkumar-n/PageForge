import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/research'
import type { BusinessContext, ResearchMessage, ResearchOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const characteristicsSection = buildCharacteristicsPrompt(characteristics)
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')

  return `${characteristicsSection}
${TASK}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(
  context: BusinessContext | null,
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[]
): string {
  const fileSection =
    fileContents.length > 0
      ? `\n\n# ATTACHED FILES\n${fileContents.map((f) => `## ${f.name}\n${f.content}`).join('\n\n')}`
      : ''

  const historySection =
    messages.length > 0
      ? `\n\n# CONVERSATION SO FAR\n${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
      : ''

  if (messages.length === 0) {
    return `Start the research conversation. Introduce yourself in one sentence, then ask your first 2–3 questions to understand the product and business.${fileSection}`
  }

  if (context) {
    // Legacy path: context was provided upfront (intake form flow)
    return `# BUSINESS CONTEXT (pre-filled)
COMPANY: ${context.companyName}
PRODUCT: ${context.productName}
DESCRIPTION: ${context.productDescription}
USE CASE: ${context.useCase}
TONE: ${context.tone}

ICP:
- Role: ${context.icp.role}
- Company: ${context.icp.company}
- Pain points: ${context.icp.painPoints}
- Goals: ${context.icp.goals}

COMPETITORS: ${context.competitors || 'Not specified'}
CTA: ${context.primaryCTA} → ${context.ctaUrl}
${context.existingCopyExamples ? `EXISTING COPY:\n${context.existingCopyExamples}` : ''}${fileSection}${historySection}

Continue the research conversation based on what has been shared.`
  }

  // New path: context is gathered through conversation
  return `Continue the research conversation based on what has been shared.${fileSection}${historySection}`
}

export interface ResearchAgentResponse {
  message: string
  isComplete: boolean
  output?: ResearchOutput
}

export async function runResearchAgent(
  context: BusinessContext | null,
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[] = [],
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<ResearchAgentResponse> {
  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.research,
    characteristicOverrides ?? {}
  )

  // Check if user wants to complete
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
  const userWantsToComplete =
    lastUserMessage?.content.toLowerCase().includes('complete') ||
    lastUserMessage?.content.toLowerCase().includes('done') ||
    lastUserMessage?.content.toLowerCase().includes("that's all") ||
    lastUserMessage?.content.toLowerCase().includes("that's all")

  if (aiConfig.mockMode) {
    if (userWantsToComplete) {
      return {
        message: '',
        isComplete: true,
        output: mockResearchOutput(context, messages, fileContents),
      }
    }
    if (messages.length === 0) {
      return {
        message: `Hi! I'm your Research Agent. I'll help you build a landing page that actually converts.\n\nTo get started, tell me:\n1. What does your product do, and who is it for?\n2. What's the main thing you want visitors to do when they land on the page?`,
        isComplete: false,
      }
    }
    return {
      message: `Thanks for sharing that. A couple more things that will help me write sharper copy:\n\n1. Do you have specific customer metrics or case study data I can use as proof points? (e.g., "Customer X reduced Y by Z%")\n\n2. What's the single biggest objection your sales team hears before deals close?\n\nOnce you share these, I'll have enough to write a strong research brief. Type "complete" when ready.`,
      isComplete: false,
    }
  }

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const userPrompt = buildUserPrompt(context, messages, fileContents)

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 2000,
    system: buildSystemPrompt(characteristics),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  // Detect if agent output JSON (research complete)
  const trimmed = text.replace(/```json|```/g, '').trim()
  if (trimmed.startsWith('{')) {
    try {
      const output = JSON.parse(trimmed) as ResearchOutput
      output.conversationHistory = messages
      output.filesProcessed = fileContents.map((f) => f.name)
      return { message: '', isComplete: true, output }
    } catch {
      // Not valid JSON — treat as conversation message
    }
  }

  return { message: text, isComplete: false }
}

function mockResearchOutput(
  context: BusinessContext | null,
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[]
): ResearchOutput {
  const companyName = context?.companyName ?? 'Acme Corp'
  const productName = context?.productName ?? 'Product'
  const icpRole = context?.icp.role ?? 'VP of Operations'
  const icpCompany = context?.icp.company ?? 'mid-market B2B companies'
  const productDescription = context?.productDescription ?? 'a B2B SaaS product'

  const effectiveContext: BusinessContext = context ?? {
    companyName,
    productName,
    productDescription,
    useCase: 'Helping teams work more efficiently',
    icp: {
      role: icpRole,
      company: icpCompany,
      painPoints: 'Manual processes, slow approvals, lack of visibility',
      goals: 'Reduce operational overhead and increase team output',
    },
    competitors: 'Unknown',
    primaryCTA: 'Start free trial',
    ctaUrl: 'https://app.example.com/signup',
    tone: 'startup',
  }

  return {
    context: effectiveContext,
    researchBrief: `${productName} by ${companyName} operates in a market where buyers are increasingly skeptical of generic SaaS promises. The ICP — ${icpRole} at ${icpCompany} — has been burned by tools that overpromised and underdelivered. They make purchase decisions based on peer referrals and verifiable proof, not vendor claims.\n\nThe core job-to-be-done is not just solving the stated pain point, but enabling the buyer to look competent to their leadership. This means the landing page must speak to both the rational (ROI, implementation speed) and the political (risk reduction, stakeholder buy-in).\n\nCompetitive differentiation should lean into specificity: concrete metrics, named customer archetypes, and a clearly defined ideal use case. The page should make it easy to self-qualify — helping the right prospects lean in and the wrong ones opt out.`,
    competitorInsights: [
      `Competitors lack depth in ${icpCompany} use cases — their messaging is too generic`,
      'Enterprise alternatives have long onboarding cycles that lose momentum',
      'Existing tools require heavy IT involvement that delays time-to-value',
      'Competitor pricing models create unpredictable costs that CFOs resist',
      'Category alternatives require manual work that this product automates',
    ],
    audienceInsights: [
      `${icpRole}s are evaluated quarterly — they need wins that show up in board decks`,
      'Primary fear: recommending a tool that their team refuses to adopt',
      'They research 3–5 alternatives before shortlisting — trust signals matter at every touchpoint',
      'Decision timeline is typically 30–90 days with 2–4 stakeholders involved',
      'They prefer to start with a proof-of-concept before committing to annual contracts',
    ],
    uniqueAngles: [
      `Speed-to-value: how fast can a ${icpRole} see results without IT or engineering?`,
      'The "anti-enterprise" angle: purpose-built for their company size, not retrofitted',
      'Risk reversal: what guarantee removes the fear of a bad recommendation?',
      'The workflow integration story: fits into existing tools rather than replacing them',
    ],
    marketContext: `The ${productDescription.split(' ').slice(0, 5).join(' ')} market is seeing increased scrutiny on ROI as companies tighten budgets. Buyers are more informed and more skeptical than ever, making specificity and proof the primary conversion drivers.`,
    filesProcessed: fileContents.map((f) => f.name),
    conversationHistory: messages,
  }
}
