# PageForge — Agentic B2B Landing Page Builder

PageForge is a multi-step, AI-powered landing page builder for B2B SaaS companies. You provide your business context once. Seven specialized AI agents research, write strategy, produce copy, generate design direction, optimize for SEO/AEO/GEO, audit quality, and assemble the final page. You review and refine at structured feedback gates, then export a finished landing page in HTML, React, and Webflow JSON formats.

---

## What it builds

A fully-formed, conversion-optimized B2B landing page with:

- **8 sections**: Hero, Logo Bar, Problem, Solution, Features, Testimonials, FAQ, CTA
- **3 design directions** with complete color palettes and typography pairings
- **Structured messaging framework** (headlines, value props, positioning statement)
- **AEO/GEO-optimized copy** structured for AI answer engine citation (ChatGPT, Perplexity, Google AI Overviews)
- **CRO-audited output** with a scored quality report
- **3 export formats**: self-contained HTML, React component (.tsx), and Webflow CMS JSON

---

## Local Setup — Mac

> No technical background needed. Follow each step exactly.

### Step 1 — Install Homebrew (Mac's package manager)

Homebrew lets you install developer tools with one command.

1. Open **Terminal** — press `Cmd + Space`, type `Terminal`, press Enter
2. Paste this command and press Enter:
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. It will ask for your Mac password — type it (nothing will appear as you type, that's normal) and press Enter
4. Wait for it to finish. This can take 5–10 minutes.
5. If it says "Run these two commands in your terminal to add Homebrew to your PATH" at the end — run those two commands before continuing.

> **Already have Homebrew?** Skip to Step 2.

### Step 2 — Install Node.js

Node.js is the engine that runs the app.

1. In Terminal, paste and run:
   ```
   brew install node
   ```
2. Wait for it to finish (2–5 minutes)
3. Verify it worked by running:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. If you do, you're good.

### Step 3 — Install Git

Git lets you download the project code.

1. Run:
   ```
   brew install git
   ```
2. Verify:
   ```
   git --version
   ```
   You should see `git version 2.x.x`.

### Step 4 — Download the project

1. In Terminal, navigate to your Desktop (or wherever you want the project):
   ```
   cd ~/Desktop
   ```
2. Download (clone) the project:
   ```
   git clone https://github.com/neerajkumar-n/PageForge.git
   ```
3. Move into the project folder:
   ```
   cd PageForge
   ```

### Step 5 — Install project dependencies

This downloads all the libraries the app needs to run.

```
npm install
```

This can take 1–3 minutes. You'll see a lot of text scrolling by — that's normal.

### Step 6 — Create your environment file

The app needs a configuration file with your settings.

1. Run this command to create it from the template:
   ```
   cp .env.local.example .env.local
   ```
2. Open the file in a text editor:
   ```
   open -e .env.local
   ```
   (This opens it in TextEdit)
3. You'll see this line:
   ```
   AI_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your Anthropic API key.
4. Save the file (`Cmd + S`) and close TextEdit.

> **Don't have an API key?** You can still run PageForge in **Mock Mode** — see the section below.

### Step 7 — Start the app

```
npm run dev
```

You'll see output ending in something like:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 8 — Open in your browser

Open **Safari** or **Chrome** and go to:
```
http://localhost:3000
```

The app will load and redirect you to the builder. You're ready to go.

### Stopping the app

Go back to Terminal and press `Ctrl + C`. The app will stop.

### Starting it again next time

1. Open Terminal
2. Run:
   ```
   cd ~/Desktop/PageForge
   npm run dev
   ```
3. Go to `http://localhost:3000`

---

## Local Setup — Windows

> No technical background needed. Follow each step exactly.

### Step 1 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org) in your browser
2. Click the button labeled **"LTS"** (the recommended version — not "Current")
3. Run the downloaded `.msi` installer
4. Click through the installer, accepting all defaults. Make sure **"Add to PATH"** is checked.
5. When finished, restart your computer.
6. To verify, open **Command Prompt** (press `Win + R`, type `cmd`, press Enter) and run:
   ```
   node --version
   ```
   You should see something like `v20.x.x`.

### Step 2 — Install Git

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. Click through with all defaults. When asked about the default editor, you can choose **Notepad** if you prefer.
4. Finish the install.
5. Verify in Command Prompt:
   ```
   git --version
   ```

### Step 3 — Download the project

1. Open **Command Prompt** (Win + R → type `cmd` → Enter)
2. Navigate to your Desktop:
   ```
   cd %USERPROFILE%\Desktop
   ```
3. Download the project:
   ```
   git clone https://github.com/neerajkumar-n/PageForge.git
   ```
4. Move into the project folder:
   ```
   cd PageForge
   ```

### Step 4 — Install project dependencies

```
npm install
```

Wait 1–3 minutes while it downloads. Lots of scrolling text is normal.

### Step 5 — Create your environment file

1. In Command Prompt (still inside the PageForge folder), run:
   ```
   copy .env.local.example .env.local
   ```
2. Open the file in Notepad:
   ```
   notepad .env.local
   ```
3. Find this line:
   ```
   AI_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your Anthropic API key.
4. Save (`Ctrl + S`) and close Notepad.

> **Don't have an API key?** See Mock Mode below.

### Step 6 — Start the app

```
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 7 — Open in your browser

Open **Chrome** or **Edge** and go to:
```
http://localhost:3000
```

### Stopping the app

Go to Command Prompt and press `Ctrl + C`.

### Starting it again next time

1. Open Command Prompt
2. Run:
   ```
   cd %USERPROFILE%\Desktop\PageForge
   npm run dev
   ```
3. Go to `http://localhost:3000`

---

## Running without an API key (Mock Mode)

Mock Mode uses pre-built realistic data so you can explore the full UI without any API costs or a key.

**Mac:**
```bash
MOCK_AGENTS=true npm run dev
```

**Windows (Command Prompt):**
```cmd
set MOCK_AGENTS=true && npm run dev
```

**Or set it permanently** — open `.env.local`, find `MOCK_AGENTS=false`, change it to `MOCK_AGENTS=true`, save, and restart the app.

Mock mode uses a pre-built dataset for a fictional AI sales forecasting product (Clairo) so every screen is populated with realistic content.

---

## Getting an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Copy the key (it starts with `sk-ant-...`)
6. Paste it into your `.env.local` file as the value for `AI_API_KEY`

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

---

## The builder pipeline

### Step 1 — Intake form
Fill in your product details, ICP profile, competitors, primary CTA, and brand tone. This is the only form you fill out.

### Step 2 — AI agents running
Seven agents run automatically:
- **Research agent**: Conducts a structured conversation to gather and synthesize all business context
- **Messaging agent**: Builds headline hierarchy, value props, positioning statement, objections, and canonical entity names
- **Copy agent**: Writes full copy for all 8 sections using the approved messaging as a constraint, optimized for AEO/GEO
- **Design agent**: Generates 3 distinct visual directions with palettes, typography, and layout recommendations
- **SEO agent**: Adds metadata, schema markup, keyword strategy, and AEO/GEO readiness analysis
- **QA agent**: Audits the assembled page against a CRO checklist and AEO/GEO checklist, scores 0–100
- **Builder agent**: Assembles all approved outputs into HTML, React TSX, and Webflow JSON

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
A single self-contained `.html` file with inline CSS, semantic HTML, SEO meta tags, Open Graph, and Schema.org JSON-LD. No JavaScript dependencies. AEO-optimized structure with proper `<section>`, `<article>`, and `<h2>` hierarchy.

### React component
A single `.tsx` file — `export default function LandingPage()`. Drop it into any Next.js or React project. Uses inline styles with the palette object. Includes FAQ accordion state.

### Webflow JSON
A JSON array mapping each section to Webflow's CMS structure with `content` and `styles` objects. Import into your Webflow project's CMS.

---

## Troubleshooting

**"command not found: npm"**
Node.js isn't installed or wasn't added to your PATH. Re-run the Node.js install step and restart your terminal/command prompt.

**"command not found: git"**
Git isn't installed. Re-run the Git install step.

**App loads but agents fail with an error**
Your API key is likely missing or incorrect. Open `.env.local` and double-check the `AI_API_KEY` value. Or switch to Mock Mode to test without a key.

**Port 3000 is already in use**
Another app is running on port 3000. Either stop that app, or run PageForge on a different port:
```bash
# Mac
PORT=3001 npm run dev

# Windows
set PORT=3001 && npm run dev
```
Then open `http://localhost:3001` instead.

**Changes I made aren't showing up**
Stop the app (`Ctrl + C`) and restart it (`npm run dev`). Changes to `.env.local` always require a restart.

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
│   ├── agents/               ← research.ts, messaging.ts, copy.ts, design.ts, seo.ts, qa.ts, builder.ts
│   │   └── prompts/          ← task prompts, guardrails, output schemas per agent
│   ├── exporters/            ← html.ts, react.ts, webflow.ts
│   ├── mock/                 ← fixtures.ts (realistic Clairo mock data)
│   └── store/                ← pipeline.ts (Zustand store with all pipeline actions)
└── types/
    └── index.ts              ← Every TypeScript interface
```
