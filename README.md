# Diego Augusto — Interactive Portfolio & Multi-Agent Orchestration Testbed

Portfólio interativo em **Next.js (App Router) + TypeScript** construído como laboratório prático de **Orquestração de Agentes de IA** (Multi-Agent Workflow), combinando uma estética interativa em Pixel Art (Praia → Oceano Profundo) com o sistema de design editorial **Anti-AI UI** (inspirado em Linear e Vercel).

---

## 1. Experimento de Orquestração Multiagente

Este repositório foi estruturado para testar e validar a divisão de responsabilidades entre agentes especializados operando sob um contrato de tipos compartilhado (`src/types/portfolio.ts`), com regras, agentes e skills versionados diretamente no workspace:

* **[`AGENTS.md`](./AGENTS.md):** Protocolo central de orquestração e isolamento de diretórios por agente.
* **[`.github/agents/backend.agent.md`](./.github/agents/backend.agent.md) (`@agent-backend`):**
  * **Escopo exclusivo:** `src/data/**`, `src/app/api/**`, `src/lib/**`
  * **Responsabilidades:** Curadoria técnica dos estudos de caso em [`src/data/cases.ts`](./src/data/cases.ts), integração com a API pública do GitHub, integração OAuth2 com o Spotify ([`src/app/api/spotify/route.ts`](./src/app/api/spotify/route.ts)) e camada de autenticação administrativa com sessões assinadas via `HMAC-SHA256` ([`src/lib/admin-auth.ts`](./src/lib/admin-auth.ts)).
* **[`.github/agents/frontend.agent.md`](./.github/agents/frontend.agent.md) (`@agent-frontend`):**
  * **Escopo exclusivo:** `src/components/**`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`
  * **Dependência de Skill:** [`skills/anti-ai-ui.md`](./skills/anti-ai-ui.md) — proíbe clichês visuais de templates gerados por IA e impõe grades assimétricas de 12 colunas com divisórias de `1px` expostas (*exposed hairlines*), superfícies foscas em azul-abissal e tipografia técnica monospace.

```
[AGENTS.md Protocol]
       │
       ├──► @agent-backend  ──► src/data/cases.ts + src/app/api/* + src/lib/admin-auth.ts
       │                              │ (Shared Contract: src/types/portfolio.ts)
       └──► @agent-frontend ──► InteractiveBeach + PixelFishSpotify + CaseStudies (Anti-AI UI)
```

---

## 2. Principais Funcionalidades

* **Praia Interativa em Pixel Art ([`InteractiveBeach.tsx`](./src/components/InteractiveBeach.tsx)):**
  * Cenário diurno aberto (sem caixas delimitadoras) onde os elementos da praia abrem janelas modais técnicas:
    * **Cabana (`01 // SOBRE & EXPERIÊNCIA`):** Resumo operacional, atuação como **Google Student Ambassador (2026)**, graduação na **FATEC Mogi das Cruzes** e histórico profissional (**CIEE**, **Loja Vivi Plus**, **Plena Saúde**).
    * **Livro (`02 // STACK & CURRÍCULO PDF`):** Matriz de habilidades técnicas, certificações e download direto do currículo em PDF.
    * **Barco (`03 // CONTATO DIRETO`):** Canais diretos (E-mail, WhatsApp, LinkedIn e GitHub).
* **Player Spotify em Pixel Art ([`PixelFishSpotify.tsx`](./src/components/PixelFishSpotify.tsx)):**
  * Peixe em SVG pixelado com equalizador animado conectado à rota `/api/spotify` (suporte a *Now Playing* / *Recently Played* via OAuth2 `refresh_token` + fallback de demonstração).
* **Projetos Submarinos & Prévia de Arquitetura ([`CaseStudies.tsx`](./src/components/CaseStudies.tsx)):**
  * Cada estudo de caso apresenta **Gargalo**, **Solução**, **Stack** e um inspetor interativo de arquitetura em modo **Fluxo** e **CLI**.
* **Portfolio Studio (CMS Local Autenticado + GitHub Sync):**
  * Acessível via **`Ctrl + Shift + L`**, protegido por comparação em tempo constante (`crypto.timingSafeEqual`), verificação `Same-Origin` (CSRF) e cookie de sessão `HttpOnly` assinado com `HMAC-SHA256`.
  * Permite importar qualquer repositório de `@diego-dev-brazil` diretamente da API do GitHub em 1 clique e gravar a atualização em `src/data/cases.ts`.

---

## 3. Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente de exemplo
cp .env.example .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## 4. Autor

**Diego Augusto Oliveira**
* **Formação:** Análise e Desenvolvimento de Sistemas — FATEC Mogi das Cruzes (`2025 – 2028`)
* **Comunidade:** Google Student Ambassador (`2026 – Atual`)
* **GitHub:** [@diego-dev-brazil](https://github.com/diego-dev-brazil)
* **LinkedIn:** [in/diego-augusto-7aa1a2303](https://www.linkedin.com/in/diego-augusto-7aa1a2303)

