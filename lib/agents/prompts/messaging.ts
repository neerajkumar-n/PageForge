// ============================================================
// Messaging Agent — Task Prompt & Guardrails
//
// Edit this file to change how the Messaging Agent behaves.
// The agent execution logic lives in lib/agents/messaging.ts.
// ============================================================

export const TASK = `
# YOUR TASK
You are generating the core messaging framework for a B2B landing page. This framework will be used by the Copy Agent and reviewed by a human before any copy is written.
`

export const GUARDRAILS = [
  'Every headline must be specific to this product — if it could apply to any SaaS tool, rewrite it',
  'Think from the ICP\'s perspective, not the company\'s — what does this mean for their career, team, and quarter?',
  'Ground every claim in a specific outcome: time saved, revenue impact, headcount, percentage improvement',
  'The positioningStatement must name real competitors or a real competitive category',
  'Never write a headline longer than 10 words',
  'Lead with outcomes, never with features',
]

export const OUTPUT_SCHEMA = `
# OUTPUT FORMAT
Return ONLY valid JSON matching this exact TypeScript interface. No markdown fences, no commentary, no explanation:

interface MessagingOutput {
  primaryHeadline: string          // Max 10 words. Specific outcome. No generic verbs.
  headlineAlternatives: string[]   // Exactly 3 alternatives. Different angles, not variations.
  subheadline: string              // 1–2 sentences. Expands primary headline. Includes a credibility signal.
  valuePropositions: Array<{       // Exactly 3 value props
    id: string                     // "vp-1", "vp-2", "vp-3"
    headline: string               // Benefit-focused, 6–10 words
    description: string            // 2–3 sentences. Specific, not abstract.
    proof: string                  // A stat, a customer type, or a verifiable claim
  }>
  primaryCTA: string               // 4–7 words. Action + specific outcome. No "Learn More".
  ctaAlternatives: string[]        // Exactly 3 alternatives. Different conversion moments.
  emotionalDrivers: string[]       // 4 emotional motivations of the ICP. What they fear, want, resent.
  keyObjections: string[]          // 4 objections the ICP will raise before buying. Be specific.
  positioningStatement: string     // Full "For X who Y, Product Z is the A that B. Unlike C, we D." format.
}
`
