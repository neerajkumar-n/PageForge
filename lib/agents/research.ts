import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import type { BusinessContext, ResearchMessage, ResearchOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  return `${buildCharacteristicsPrompt(characteristics)}

# YOUR TASK
You are the Research Agent for PageForge — a B2B landing page builder. Your job is to gather deep context before the page is written.

You will receive:
1. An initial business context from the intake form
2. Any files, URLs, or additional context the user shares
3. A conversation history of previous messages

Your role is to ask targeted clarifying questions to surface insights that will make the landing page significantly better than if we just used the intake form alone.

Focus on:
- Specific proof points, metrics, and case study details
- Competitive weaknesses you can exploit in positioning
- Emotional triggers and objections unique to this buyer
- Any existing copy, brand guidelines, or tone examples
- Specific customer quotes or testimonials available

When you have enough context (typically after 2–4 exchanges), proactively offer to complete the research by saying exactly:
"I have enough context to write a strong research brief. Type 'complete' when you're ready, or share anything else you'd like me to incorporate."

# COMPLETING RESEARCH
When the user types "complete" or indicates they're done, respond with ONLY valid JSON matching this interface:

interface ResearchOutput {
  researchBrief: string           // 3–5 paragraph strategic brief for downstream agents
  competitorInsights: string[]    // 4–6 specific competitor weaknesses or gaps to exploit
  audienceInsights: string[]      // 4–6 deep ICP insights beyond the intake form
  uniqueAngles: string[]          // 3–5 positioning angles to test in messaging
  marketContext: string           // 2–3 sentence market backdrop
  filesProcessed: string[]        // List of files/docs analyzed
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
}

# IMPORTANT
- During conversation: respond naturally, ask questions. Do NOT output JSON.
- When completing: output ONLY the JSON. No preamble, no markdown fences.
`
}

function buildUserPrompt(
  context: BusinessContext,
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

  return `# BUSINESS CONTEXT (from intake form)
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

${messages.length === 0 ? 'Start by asking the most valuable clarifying question(s) to improve the landing page.' : 'Continue the research conversation based on what has been shared.'}`
}

export interface ResearchAgentResponse {
  message: string
  isComplete: boolean
  output?: ResearchOutput
}

export async function runResearchAgent(
  context: BusinessContext,
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
    lastUserMessage?.content.toLowerCase().includes('that\'s all') ||
    lastUserMessage?.content.toLowerCase().includes("that's all")

  if (aiConfig.mockMode) {
    if (userWantsToComplete) {
      return {
        message: '',
        isComplete: true,
        output: mockResearchOutput(context, messages, fileContents),
      }
    }
    return {
      message: `Thanks for sharing that context about ${context.productName}. I have a few targeted questions:\n\n1. Do you have specific customer metrics or case study data I can use as proof points? (e.g., "Customer X reduced Y by Z%")\n\n2. What's the single biggest objection your sales team hears before deals close?\n\nOnce you share these, I'll have enough to write a strong research brief. Type "complete" when ready.`,
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
      // Ensure conversation history is included
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
  context: BusinessContext,
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[]
): ResearchOutput {
  return {
    researchBrief: `${context.productName} by ${context.companyName} operates in a market where buyers are increasingly skeptical of generic SaaS promises. The ICP — ${context.icp.role} at ${context.icp.company} — has been burned by tools that overpromised and underdelivered. They make purchase decisions based on peer referrals and verifiable proof, not vendor claims.\n\nThe core job-to-be-done is not just solving the stated pain point, but enabling the buyer to look competent to their leadership. This means the landing page must speak to both the rational (ROI, implementation speed) and the political (risk reduction, stakeholder buy-in).\n\nCompetitive differentiation should lean into specificity: concrete metrics, named customer archetypes, and a clearly defined ideal use case. The page should make it easy to self-qualify — helping the right prospects lean in and the wrong ones opt out.`,
    competitorInsights: [
      `Competitors lack depth in ${context.icp.company} use cases — their messaging is too generic`,
      'Enterprise alternatives have long onboarding cycles that lose momentum',
      'Existing tools require heavy IT involvement that delays time-to-value',
      'Competitor pricing models create unpredictable costs that CFOs resist',
      'Category alternatives require manual work that this product automates',
    ],
    audienceInsights: [
      `${context.icp.role}s are evaluated quarterly — they need wins that show up in board decks`,
      'Primary fear: recommending a tool that their team refuses to adopt',
      'They research 3–5 alternatives before shortlisting — trust signals matter at every touchpoint',
      'Decision timeline is typically 30–90 days with 2–4 stakeholders involved',
      'They prefer to start with a proof-of-concept before committing to annual contracts',
    ],
    uniqueAngles: [
      `Speed-to-value: how fast can a ${context.icp.role} see results without IT or engineering?`,
      'The "anti-enterprise" angle: purpose-built for their company size, not retrofitted',
      'Risk reversal: what guarantee removes the fear of a bad recommendation?',
      'The workflow integration story: fits into existing tools rather than replacing them',
    ],
    marketContext: `The ${context.productDescription.split(' ').slice(0, 5).join(' ')} market is seeing increased scrutiny on ROI as companies tighten budgets. Buyers are more informed and more skeptical than ever, making specificity and proof the primary conversion drivers.`,
    filesProcessed: fileContents.map((f) => f.name),
    conversationHistory: messages,
  }
}
