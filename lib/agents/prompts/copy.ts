// ============================================================
// Copy Agent — Task Prompt & Guardrails
//
// Edit this file to change how the Copy Agent behaves.
// The agent execution logic lives in lib/agents/copy.ts.
// ============================================================

export const TASK = `
# YOUR TASK
You are writing complete landing page copy for every section of a B2B landing page.
The messaging framework provided is an APPROVED, LOCKED constraint. Do not deviate from it.
`

export const SECTION_SPECS = `
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
`

export const GUARDRAILS = [
  'Never deviate from the approved messaging framework — it is a hard constraint',
  'Never write testimonials that sound generic, fake, or suspiciously perfect',
  'Never end CTAs with "Learn More", "Click Here", or "Get Started" alone — add specificity',
  'Never use placeholder text — every word must be final production quality',
  'Maintain consistent voice across all 8 sections',
  'Match the tone from the business context throughout',
]

export const OUTPUT_SCHEMA = `
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
