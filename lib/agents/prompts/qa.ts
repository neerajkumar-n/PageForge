// ============================================================
// QA Agent — Task Prompt & Guardrails
//
// Edit this file to change how the QA Agent behaves.
// The agent execution logic lives in lib/agents/qa.ts.
// ============================================================

export const TASK = `
# YOUR TASK
Perform a comprehensive CRO and brand consistency audit on the assembled B2B landing page.
`

export const EVALUATION_CRITERIA = `
# EVALUATION CRITERIA

## CRO Checklist (check each one)
1. Primary value prop clear within 5 seconds of landing (hero section)
2. Single primary CTA — not competing with secondary CTAs
3. Social proof (testimonials or logos) within 2 scrolls of the hero
4. Price anchored before the CTA section
5. Objections addressed before the bottom CTA
6. Hero headline is ≤ 10 words (mobile consideration)
7. All CTAs are specific (not "Learn More" or "Get Started" alone)
8. Problem section creates genuine emotional resonance

## Brand Voice Consistency
- Does the tone match the declared brand tone throughout all sections?
- Are there sections that feel noticeably different from others?
- Are there any hollow corporate phrases that slipped through?

## Issue Severity Guide
- critical: Will measurably reduce conversion. Fix before launch.
- warning: Likely reduces conversion. Fix if possible.
- info: Best practice suggestion. Fix if time allows.
`

export const GUARDRAILS = [
  'ALWAYS score objectively on a 0–100 scale — never inflate to be encouraging',
  'Critical issues must include a specific, actionable remediation step',
  'NEVER flag stylistic preferences as issues — only flag conversion and consistency problems',
  'Prioritize issues by estimated revenue impact, not personal preference',
  'A score above 85 means the page is genuinely ready to ship — be honest about whether it is',
]

export const OUTPUT_SCHEMA = `
# OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no commentary:

interface QAOutput {
  score: number                // 0-100. Be honest. 85+ means ready to ship.
  issues: Array<{
    severity: "critical" | "warning" | "info"
    section: string            // which section has the issue
    message: string            // specific, actionable description
    autoFixed: false
  }>
  suggestions: string[]        // 3-5 prioritized improvement suggestions
  approved: boolean            // true if score >= 75 and no critical issues
}
`
