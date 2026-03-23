// ============================================================
// Design Agent — Task Prompt & Guardrails
//
// Edit this file to change how the Design Agent behaves.
// The agent execution logic lives in lib/agents/design.ts.
// ============================================================

export const TASK = `
# YOUR TASK
Generate exactly 3 distinct design directions for a B2B landing page.
Each direction represents a meaningfully different visual identity — not just color swaps.
`

export const DIRECTION_ARCHETYPES = `
# DIRECTION ARCHETYPES (use these as a starting point but adapt to the product)
1. Enterprise/Trust — clean, authoritative, data-forward (ideal for risk-averse buyers, CFOs, legal)
2. Bold/Startup — high contrast, energetic, modern (ideal for ambitious buyers, Series A-C companies)
3. Minimal/Technical — precise, information-dense, almost brutalist (ideal for developer-adjacent or RevOps buyers)
`

export const COLOR_REQUIREMENTS = `
# COLOR PALETTE REQUIREMENTS
For each direction, return a complete ColorPalette:
- primary: main brand color (must contrast with white at WCAG AA)
- primaryForeground: text on primary color (usually #FFFFFF or #000000)
- accent: highlight/CTA color (must differ meaningfully from primary)
- background: page background (near-white, never pure #FFFFFF unless intentional)
- foreground: primary text color (must contrast with background at WCAG AA — usually near-black)
- muted: subtle background for cards/sections (slightly off background)
- mutedForeground: secondary text (must contrast with muted at 4.5:1)
- border: subtle divider color
`

export const GUARDRAILS = [
  'ALWAYS provide exactly 3 meaningfully distinct design directions — never more, never fewer',
  'NEVER use generic blue/white corporate palettes as a "safe" default',
  'Each direction must have a clearly distinct personality, target buyer, and emotional feel',
  'Typography heading and body fonts must be from Google Fonts',
  'Primary color must pass WCAG AA contrast against primaryForeground',
  'All hex values must be valid 6-character hex codes (e.g. #1A2B3C)',
]

export const OUTPUT_SCHEMA = `
# OUTPUT FORMAT
Return ONLY valid JSON matching this TypeScript interface. No markdown, no commentary:

interface DesignOutput {
  directions: Array<{
    id: string               // "dir-enterprise" | "dir-startup" | "dir-technical"
    name: string             // 2-3 word evocative name
    description: string      // 2-3 sentences: who it resonates with + why
    palette: {
      primary: string        // hex color
      primaryForeground: string
      accent: string
      background: string
      foreground: string
      muted: string
      mutedForeground: string
      border: string
    }
    typography: {
      heading: string        // Google Font name for headings
      body: string           // Google Font name for body text
    }
    heroVariant: "centered" | "left-aligned" | "split"
    mood: string             // 1 sentence: the emotional feeling this creates
  }>
  selectedDirectionId: string   // recommend one direction based on the ICP
  sectionOrder: string[]        // recommended section order for this product type
  componentPicks: {             // recommended variants for sections with multiple layouts
    hero?: string
    features?: string
  }
}
`
