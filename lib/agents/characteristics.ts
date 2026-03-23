// ============================================================
// PageForge — Agent Characteristics Builder
//
// This module converts AgentCharacteristics into a system prompt
// that is injected at the top of every agent call.
//
// To change how an agent behaves:
//   1. Edit the characteristics in config/ai.config.ts (permanent defaults)
//   2. Or update them via the UI Agent Settings panel (per-session override)
// ============================================================

import type { AgentCharacteristics } from '@/config/ai.config'

/**
 * Builds a structured system prompt from an agent's characteristics.
 * The result is prepended to every agent-specific prompt.
 */
export function buildCharacteristicsPrompt(
  characteristics: AgentCharacteristics
): string {
  const { persona, tone, expertise, constraints, customInstructions } =
    characteristics

  const lines: string[] = [
    '# WHO YOU ARE',
    persona,
    '',
    '# YOUR COMMUNICATION STYLE',
    tone,
    '',
    '# YOUR EXPERTISE',
    ...expertise.map((e) => `- ${e}`),
    '',
    '# HARD CONSTRAINTS — YOU MUST NEVER VIOLATE THESE',
    ...constraints.map((c) => `- ${c}`),
  ]

  if (customInstructions.trim()) {
    lines.push('', '# ADDITIONAL INSTRUCTIONS', customInstructions.trim())
  }

  return lines.join('\n')
}

/**
 * Merges default characteristics with any overrides, field by field.
 * Array fields (expertise, constraints) are replaced entirely by the override.
 */
export function mergeCharacteristics(
  defaults: AgentCharacteristics,
  overrides: Partial<AgentCharacteristics>
): AgentCharacteristics {
  return {
    ...defaults,
    ...overrides,
  }
}
