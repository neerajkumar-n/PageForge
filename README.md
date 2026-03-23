# PageForge — Agentic B2B Landing Page Builder

PageForge is a multi-step, AI-powered landing page builder for B2B SaaS companies. You provide your business context once. Four specialized AI agents research, write strategy, produce copy, and generate design direction. You review and refine at structured feedback gates, then export a finished landing page in HTML, React, and Webflow JSON formats.

---

## What it builds

A fully-formed, conversion-optimized B2B landing page with:

- **8 sections**: Hero, Logo Bar, Problem, Features, Testimonials, Pricing, FAQ, CTA
- **3 design directions** with complete color palettes and typography pairings
- **Structured messaging framework** (headlines, value props, positioning statement)
- **CRO-audited output** with a scored quality report
- **3 export formats**: self-contained HTML, React component (.tsx), and Webflow CMS JSON

---

## Setup

```bash
# 1. Clone and install
git clone https://github.com/neerajkumar-n/PageForge.git
cd PageForge
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your API key

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/builder/intake`.

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `AI_API_KEY` | Your Anthropic API key | *(required unless MOCK_AGENTS=true)* |
| `AI_BASE_URL` | API endpoint — accepts any OpenAI-compatible URL | `https://api.anthropic.com` |
| `AI_MODEL` | Model ID for all agents | `claude-sonnet-4-20250514` |
| `AI_MAX_TOKENS` | Max output tokens per agent call | `8000` |
| `MOCK_AGENTS` | Skip API calls, use realistic mock data | `false` |

**`AI_BASE_URL` and `AI_MODEL` accept any OpenAI-compatible endpoint**, so you can point PageForge at Azure OpenAI, AWS Bedrock, local Ollama, or any compatible proxy.

### Running in mock mode (no API key needed)

```bash
MOCK_AGENTS=true npm run dev
```

Mock mode uses a realistic pre-built dataset (Clairo, a fictional AI sales forecasting product) so you can explore and develop the full UI without any API costs or keys.

---

## The builder pipeline

### Step 1 — Intake form
Fill in your product details, ICP profile, competitors, primary CTA, and brand tone. This is the only form you fill out.

### Step 2 — AI agents running
Four agents run automatically:
- **Messaging agent**: Builds headline hierarchy, value props, positioning statement, objections
- **Copy agent**: Writes full copy for all 8 sections using the approved messaging as a constraint
- **Design agent**: Generates 3 distinct visual directions with palettes, typography, and layout recommendations
- **QA agent**: Audits the assembled page against a CRO checklist and scores it 0–100

### Step 3 — Messaging review gate
Review and edit headlines (primary + 3 alternatives), subheadline, value propositions, and CTAs inline. Every edit is logged and sent to downstream agents as style context.

### Step 4 — Copy review gate
Step through each section one at a time. Edit any field inline. Approve sections or regenerate them with updated context from your feedback.

### Step 5 — Design review gate
Choose from 3 AI-generated moodboards (rendered as mini landing page previews). Drag to reorder sections. Toggle sections on/off. Pick component variants (e.g. centered vs. split hero).

### Step 6 — Preview + export
See your finished page in a live iframe (desktop/mobile toggle). View the QA score and issues. Export in three formats.

---

## Customizing agent behavior

Each agent has a set of **characteristics** — persona, tone, expertise, constraints, and custom instructions — that shape its output. You can modify these in two ways:

### 1. Permanent defaults (code)
Edit `config/ai.config.ts`. The `defaultAgentCharacteristics` object has a full configuration block for each agent:

```ts
messaging: {
  persona: 'World-class B2B conversion strategist...',
  tone: 'Confident, specific, outcome-focused.',
  expertise: ['B2B positioning', 'ICP-driven narrative design', ...],
  constraints: ['NEVER use: transform, revolutionize, cutting-edge...'],
  customInstructions: '', // ← easiest place to add rules
  temperature: 0.7,
}
```

The `customInstructions` field is the easiest entry point — add product-specific rules, terminology requirements, or style preferences without touching the core prompt structure.

### 2. Per-session overrides (UI)
In the builder, expand the **Agent Settings** panel on any page. Each agent has expandable fields for persona, tone, and custom instructions. A "Modified" badge appears when an agent has been overridden from its defaults. Use the "Reset to defaults" link to revert.

Changes made in the UI are stored in the session (localStorage) and apply to the next agent run.

### What you can train

| Field | What it controls |
|---|---|
| `persona` | Who the agent is — background, perspective, authority |
| `tone` | How it communicates — register, energy, style |
| `expertise` | What domain knowledge it draws on |
| `constraints` | Hard rules it must never violate (brand safety, banned words, etc.) |
| `customInstructions` | Free-form additions: product terminology, specific rules, examples |
| `temperature` | Creativity level (0 = precise, 1 = exploratory) — code only |

---

## Export formats

### HTML
A single self-contained `.html` file with inline CSS, semantic HTML, SEO meta tags, Open Graph, and Schema.org JSON-LD. No JavaScript dependencies.

### React component
A single `.tsx` file — `export default function LandingPage()`. Drop it into any Next.js or React project. Uses inline styles with the palette object. Includes FAQ accordion state.

### Webflow JSON
A JSON array mapping each section to Webflow's CMS structure with `content` and `styles` objects. Import into your Webflow project's CMS.

---

## Tech stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** for styling
- **Zustand** (localStorage persistence) for pipeline state
- **@anthropic-ai/sdk** for AI agent calls
- **@dnd-kit/sortable** for drag-to-reorder in the design gate
- **framer-motion** for agent status animations
- **lucide-react** for icons
- **react-hot-toast** for notifications

---

## Project structure

```
pageforge/
├── config/
│   └── ai.config.ts          ← All AI settings + agent characteristics
├── app/
│   ├── page.tsx              ← Redirect to /builder/intake
│   ├── builder/
│   │   ├── layout.tsx        ← Step progress bar + persistent chrome
│   │   ├── intake/           ← Step 1: business context form
│   │   ├── running/          ← Step 2: live agent status board
│   │   ├── messaging-review/ ← Step 3: messaging feedback gate
│   │   ├── copy-review/      ← Step 4: copy feedback gate
│   │   ├── design-review/    ← Step 5: design feedback gate
│   │   └── preview/          ← Step 6: live preview + export
│   └── api/
│       ├── run-agents/       ← SSE streaming agent orchestrator
│       └── export-page/      ← HTML / React / Webflow generator
├── components/
│   ├── ui/                   ← Button, Input, Textarea, Card, Badge, Progress
│   ├── builder/              ← StepProgress, IntakeForm, review panels, AgentSettings
│   └── sections/             ← 8 landing page section templates with variants
├── lib/
│   ├── agents/               ← messaging.ts, copy.ts, design.ts, qa.ts + characteristics.ts
│   ├── exporters/            ← html.ts, react.ts, webflow.ts
│   ├── mock/                 ← fixtures.ts (realistic Clairo mock data)
│   └── store/                ← pipeline.ts (Zustand store with all pipeline actions)
└── types/
    └── index.ts              ← Every TypeScript interface
```
