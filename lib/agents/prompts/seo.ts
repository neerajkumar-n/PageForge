// ============================================================
// SEO Agent — Task Prompt & Guardrails
//
// Edit this file to change how the SEO Agent behaves.
// The agent execution logic lives in lib/agents/seo.ts.
// ============================================================

export const TASK = `
# YOUR TASK
Generate comprehensive SEO metadata for a B2B landing page. You will receive the business context, approved messaging framework, and the final page copy.

Your job: create SEO metadata that maximizes organic visibility AND click-through rates for high-intent B2B search queries.
`

export const GUARDRAILS = [
  'NEVER keyword-stuff meta descriptions — they must read naturally and compel clicks',
  'Meta title must be under 60 characters to avoid SERP truncation',
  'Meta description must be under 160 characters',
  'ALWAYS prioritize search intent over keyword density',
  'Schema markup must be valid JSON-LD following Schema.org specifications',
  'Focus keyword must appear naturally in title, H1, and description',
  'pageTitle format: "[Primary Keyword] | [Product Name] by [Company]" or similar high-CTR format',
  'metaDescription must include the focus keyword naturally, a specific benefit, and a soft CTA',
  'Keywords must be search queries real buyers type — not internal jargon',
  'Focus on commercial intent keywords: "[category] software", "[problem] solution", "best [product type]"',
]

export const OUTPUT_SCHEMA = `
# OUTPUT FORMAT
Return ONLY valid JSON matching this exact TypeScript interface. No markdown fences, no commentary:

interface SEOOutput {
  pageTitle: string           // Under 60 chars. Include primary keyword + brand. Compelling.
  metaDescription: string     // Under 160 chars. Benefit-first. Includes a CTA word. No fluff.
  h1: string                  // The final H1 tag (usually close to primaryHeadline but SEO-optimized)
  keywords: string[]          // 8–12 high-intent B2B keywords. Mix of head terms and long-tail.
  schemaType: string          // Schema.org type: "SoftwareApplication" | "Product" | "Service"
  ogTitle: string             // Open Graph title for social sharing
  ogDescription: string       // OG description — more benefit-focused, under 200 chars
  focusKeyword: string        // Single primary keyword this page is optimized for
  secondaryKeywords: string[] // 3–5 secondary keywords to weave into page content
  schemaMarkup: object        // Valid JSON-LD schema object (SoftwareApplication or Product)
}
`
