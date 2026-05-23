# DSTA ProductOps Co-pilot

Wayfinder, tool catalogue, and AI-ready guidance for DSTA's ProductOps pipeline. Serves both digital and engineering programme teams on a common platform.

## What's in here

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **PRIZM 4.0 Enterprise Light** for visual identity (copy-paste components)
- **Keystatic** CMS for content authoring (`/keystatic`)
- **AI helper** via provider-agnostic OpenAI-compatible client (Groq default, swappable for on-prem)
- **`/llms.txt`** + **`/llms-full.txt`** as first-class LLM-consumable surfaces

## Local development

```bash
pnpm install
cp .env.local.example .env.local   # then add LLM_API_KEY
pnpm dev
```

Open http://localhost:3000.

The Keystatic admin lives at http://localhost:3000/keystatic — that's where content is authored. In local mode, Keystatic writes content as MDX/JSON files to `content/` in the repo.

## Environment variables

See `.env.local.example` for the full list. The only thing you need to set for the AI helper to work is `LLM_API_KEY`.

| Variable | Default | What it does |
|---|---|---|
| `LLM_BASE_URL` | `https://api.groq.com/openai/v1` | OpenAI-compatible endpoint |
| `LLM_API_KEY` | (none) | API key — required |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | Model ID |

### Swapping LLM providers

The AI helper speaks OpenAI-compatible, so swapping providers is config-only.

**Internet phase (Groq, default):**
```
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_...
LLM_MODEL=llama-3.3-70b-versatile
```

**Airgap phase (on-prem LLM):**
```
LLM_BASE_URL=http://your-llm-host/v1
LLM_API_KEY=                      # often empty for internal endpoints
LLM_MODEL=                        # whatever model is loaded
```

Most on-prem inference stacks (vLLM, Ollama, TGI, LiteLLM gateway) expose OpenAI-compatible endpoints natively, so the same client code works in both environments.

## Content authoring

Content is managed via Keystatic at `/keystatic`. Collections:

- **Pages** — long-form narrative (pipeline explainer, design principles, etc.)
- **Phase narratives** — per-phase content with artefact checklists
- **Tools** — entries in the tool catalogue, with linked prompts
- **Prompts** — the prompt library, browsable and filterable
- **Templates** — artefact templates with generation + review prompts
- **Journeys** — scenario walkthroughs that compose tools and prompts
- **Case studies** — deferred for now; route scaffolded

Every content record has a `visibility` field (`public` / `internal`). The internet-facing prototype renders only `public` records; the airgap build will eventually render both.

## Project structure

```
portal/
├── app/
│   ├── (portal)/                    # Routes under the EnterpriseAppShell chrome
│   │   ├── layout.tsx               # Mounts the AppShell + AskCopilot
│   │   ├── page.tsx                 # Landing
│   │   ├── pipeline/                # Foundation
│   │   ├── flywheel/                # Wayfinder + phase pages
│   │   ├── tools/                   # Operations
│   │   ├── templates/               # Knowledge
│   │   ├── journeys/                # Guided journeys
│   │   ├── prompts/                 # Central prompt library
│   │   └── case-studies/            # Deferred
│   ├── keystatic/                   # CMS admin UI
│   ├── api/
│   │   ├── ai/                      # AI helper streaming endpoint
│   │   └── keystatic/               # Keystatic backend
│   ├── llms.txt/                    # LLM-consumable index
│   ├── llms-full.txt/               # LLM-consumable full corpus
│   ├── layout.tsx                   # Root layout (sets data-zone/data-mode)
│   └── globals.css                  # Tailwind v4 + PRIZM token wiring
├── components/
│   ├── ui/                          # PRIZM primitives (copy-pasted from prizm-design/prizm)
│   ├── templates/enterprise/        # Candidate PRIZM Enterprise templates (upstreamable)
│   └── portal/                      # Portal-specific composition (brand, nav, AskCopilot…)
├── lib/
│   ├── ai/                          # Provider abstraction + system prompt
│   ├── corpus.ts                    # Source of truth for /llms.txt
│   └── utils.ts                     # cn() helper from PRIZM
├── styles/
│   ├── fonts.css                    # Self-hosted Inter + JetBrains Mono
│   └── tokens/                      # PRIZM token CSS (baseline + enterprise-light)
├── content/                         # Keystatic content lives here (created on first save)
├── public/fonts/                    # Self-hosted font files (airgap-safe)
└── keystatic.config.ts              # Content schemas
```

## PRIZM working conventions

This portal is a **PRIZM consumer**. The rules are non-negotiable:

1. **Semantic tokens only** — use `bg-bg`, `text-fg`, `border-border`, `bg-accent`, etc. Never `bg-slate-500` or `text-blue-600`.
2. **Component variants over `className` overrides** — reach for `className=` only when no variant fits.
3. **No external URL references** — no Google Fonts, no CDN scripts, no remote assets. Air-gap clean from day 1.
4. **Liquid Glass is C3-only** — Enterprise stays solid.
5. **Copy-paste, not npm** — PRIZM components live in `components/ui/`. Updates from PRIZM are pulled by re-copying source files.

The full brief is in PRIZM.md in the prizm-design/prizm repo. Components have per-component context at `llms/<slug>.md`.

## Visibility model (content discipline)

The internet-facing prototype is **publicly accessible**. Content discipline:

- No internal URLs (no `confluence.dsta.gov.sg` etc.)
- No programme-specific detail
- No staff names, internal emails, internal-tool URLs
- Generic descriptions of tools, not DSTA-specific specifics

When real content arrives, the `visibility` field on each CMS record gates what renders publicly. Internal-only content waits for the airgap build.

## Deployment

- **Internet phase:** Vercel. Content lives in the repo (Keystatic local mode); deploys are tied to git commits.
- **Airgap phase:** TBD. Same repo, on-prem hosting. LLM provider env vars swap; everything else identical.

## License

Internal DSTA project. License TBD.
