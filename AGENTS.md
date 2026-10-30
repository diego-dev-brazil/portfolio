# Multi-Agent Orchestration Protocol

## Versionamento das Customizações
- Mantenha os arquivos de agentes, instruções e skills específicos deste workspace versionados no repositório, junto com este `AGENTS.md`.
- Os agentes do workspace ficam em `.github/agents/*.agent.md`; as skills ficam em `skills/`.
- Ao criar ou atualizar essas customizações, preserve os arquivos na pasta do workspace para que possam ser revisados e compartilhados como evidência do fluxo multiagente do portfólio.
- Não mova customizações do workspace para o perfil pessoal do VS Code.

## Shared Contract
Both agents MUST strictly obey the TypeScript interfaces defined in `src/types/portfolio.ts`. Do not modify this file without explicit user approval.

## Agent 1: `@agent-backend` (Data, Business Copy & Live APIs)
- **Allowed Directories:** `src/data/**`, `src/app/api/**`, `src/lib/**`
- **Forbidden Directories:** `src/components/**`, `src/app/page.tsx`
- **Responsibilities:**
  1. Populate `src/data/cases.ts` with high-impact business copywriting (no AI clichés, focus on hours saved, ROI, and production architecture).
  2. Build lightweight Next.js Route Handlers (`src/app/api/github/route.ts` or `/api/telemetry/route.ts`) that fetch real-time stats from GitHub (`open-prompts-br` commits/stars) or simulate live telemetry/logs for the interactive project demos.

## Agent 2: `@agent-frontend` (High-Craft UI & Interactive Demos)
- **Allowed Directories:** `src/components/**`, `src/app/page.tsx`, `src/app/layout.tsx`
- **Forbidden Directories:** `src/data/**`, `src/app/api/**`
- **Skill Dependency:** Must strictly follow `skills/anti-ai-ui.md` (Linear/Vercel dark aesthetic, exposed 1px hairlines, monospace metadata, zero neon gradients).
- **Responsibilities:**
  1. Consume `src/data/cases.ts` and `/api/*` endpoints.
  2. Build the asymmetrical Bento Grid, terminal-style interactive architecture previews, and responsive layout.

## Agent 3: `@pentest` (Defensive Security & Static Code Audit)
- **Definition:** `.github/agents/pentest.agent.md`
- **Scope:** Local static security review, threat modeling, attack-surface analysis, authentication/authorization verification, and secrets handling (no live-target scanning or active exploitation).
- **Responsibilities:**
  1. Audit API Route Handlers (`src/app/api/**`), client-server trust boundaries, and environment configurations.
  2. Report findings by severity (Critical, High, Medium, Low) and guide defensive remediation (`src/lib/admin-auth.ts`).
