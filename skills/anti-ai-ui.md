# Skill: Anti-AI Craft UI & Editorial Design System

## 1. Objective
Eliminate all visual and textual tropes associated with LLM-generated templates ("AI Slop"). Enforce a high-craft, bespoke Product Engineering aesthetic inspired by Linear, Vercel, Raycast, and Stripe.

---

## 2. Hard Visual Bans (Strictly Forbidden)
When generating HTML/JSX/Tailwind CSS, NEVER use the following patterns:
- **NO Neon/Cyberpunk Gradients:** Never use `from-purple-500 to-blue-500`, `from-indigo-500 via-purple-500 to-pink-500`, or glowing gradient text (`bg-clip-text text-transparent bg-gradient-to-r`) on headlines.
- **NO Glowing Drop Shadows:** Never use colored drop shadows like `shadow-lg shadow-purple-500/20` or `shadow-red-500/30`.
- **NO Heavy Glassmorphism:** Avoid overusing `backdrop-blur-xl bg-white/10` on standard content cards. Reserve blur strictly for sticky top navigation (`backdrop-blur-md bg-zinc-950/80`).
- **NO Centered Generic Marketing Grids:** Never build a section with a centered title, centered subtitle, and 3 identical symmetrical cards with centered circular icon badges on top.
- **NO Bouncy/Scale Hover Effects:** Never use `hover:scale-105` or `hover:-translate-y-2` on cards. Real software interfaces feel grounded and stable, not bouncy.
- **NO Emoji Overload in UI:** Do not prefix every badge, title, or bullet point with 🚀, ✨, 🤖, or 💡. Use clean SVG icons (`lucide-react` at `14px` or `16px` with `strokeWidth={1.5}`) or typographic markers (`01`, `//`, `→`).

---

## 3. High-Craft Design Tokens & Tailwind Rules

### Color & Surface Architecture (True Dark Mode)
- **Canvas Background:** `#09090B` (`bg-zinc-950`) or `#0A0A0A` (`bg-neutral-950`). Never use bluish dark grays (`bg-slate-900` or `bg-gray-900`).
- **Elevated Surface (Cards):** `bg-zinc-900/40` or `#111113`. Keep surfaces matte and flat.
- **Hairline Borders:** Define geometry using crisp 1px borders (`border border-zinc-800/80`). On hover, transition ONLY the border color (`hover:border-zinc-700 transition-colors duration-150`).
- **Accent Color Discipline:** Use a single functional accent color at a time (e.g., iFood/Product crimson `#EA1D2C` or `text-red-500` / `bg-red-500/10 border-red-500/20` for high-priority metric pills, and `emerald-400` strictly for positive business metrics/status dots).

### Typography & Hierarchy (Swiss Grid Precision)
- **Font Pairing:** Combine a crisp geometric sans-serif (`Inter` or `Geist`) for UI/prose with a technical monospace (`JetBrains Mono` or `Geist Mono` via `font-mono`) for metrics, timestamps, stack tags, and impact numbers.
- **Headings:** Use tight tracking (`tracking-tight` or `tracking-tighter`), medium-to-semibold weights (`font-medium` or `font-semibold`), and high contrast (`text-zinc-100`). Avoid `font-extrabold` or `font-black`.
- **Body Copy:** Use `text-zinc-400` with relaxed line height (`leading-relaxed`) and constrained measure (`max-w-2xl`) so lines never stretch across the entire viewport.
- **Micro-Labels & Metadata:** Use `font-mono text-[11px] uppercase tracking-wider text-zinc-500` for categories, dates, and architectural pillars.

### Layout & Geometry
- **Asymmetrical Bento Grids:** Use 12-column CSS grids (`grid-cols-1 md:grid-cols-12 gap-4`) where primary case studies span `md:col-span-7` or `md:col-span-8` and secondary tools span `md:col-span-5` or `md:col-span-4`.
- **Exposed Grid Hairlines (Optional High-Craft Pattern):** Use `gap-px bg-zinc-800/70 border border-zinc-800/70` on parent containers with `bg-zinc-950 p-6` on children to create a razor-sharp architectural grid (Vercel/Linear style).
- **Border Radius:** Stick to tight, technical radii (`rounded-lg` or `rounded-xl`). Avoid bubbly `rounded-3xl` cards.

---

## 4. Component Blueprints (How to build Cards & UI Elements)

### Case Study Card Structure (Business Impact First)
Instead of a generic "Title + Paragraph + Tag list", structure every project card as an **Engineering & Business Case Study**:
1. **Top Bar (Flex Between):**
   - Left: Monospace category index (`01 // RPA & AUTOMATION`).
   - Right: High-contrast Impact Badge in monospace (`bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded text-xs font-mono` -> e.g., `-12h/sem manual ops`).
2. **Main Content:**
   - Project Title (`text-lg font-medium text-zinc-100 tracking-tight`).
   - Structured 2-row micro-breakdown instead of a wall of text:
     - **Gargalo:** 1-line summary of the real-world pain (`text-sm text-zinc-400`).
     - **Solução & Alavanca:** 1-2 lines explaining how AI/Code solved it end-to-end (`text-sm text-zinc-300`).
3. **Interactive Visual/Artifact Slot:**
   - A subtle inner frame (`bg-zinc-950 border border-zinc-800/80 rounded-md p-3 my-4`) showing either a terminal command output, an architecture micro-diagram (`[Shopee Seller] -> [Playwright RPA] -> [Normalized Order DB]`), or a clean 16:9 container for a real dashboard screenshot/GIF.
4. **Footer Bar:**
   - Left: Minimalist stack text separated by dots (`TypeScript · Playwright · Node.js` in `font-mono text-xs text-zinc-500`) — DO NOT create 8 bulky colored pills per card.
   - Right: Subtle action links (`Ver Demo ↗`, `Código ↗` in `text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1`).

---

## 5. Anti-AI Copywriting Rules (Portuguese-BR)
- **Banned Words:** Never write "revolucionando", "transformando o futuro", "soluções inovadoras de ponta", "apaixonado por tecnologia", "mergulhando no universo de IA", or "cutting-edge".
- **Required Tone:** Direct, pragmatic, metrics-driven, and grounded in operational reality. Write like a builder who ships production tools.
  - *Bad (AI Slop):* "Um sistema inovador potencializado por IA para revolucionar a gestão financeira de clínicas médicas com dashboards incríveis."
  - *Good (Product Builder):* "Substituiu planilhas manuais por um pipeline automatizado em Python/SQL conectado ao Power BI. Zerou divergências de caixa e reduziu o fechamento mensal de 2 dias para 15 minutos."