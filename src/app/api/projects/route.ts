import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { cases as initialCases } from '../../../data/cases';
import {
  isCmsEnvironmentEnabled,
  isRequestAdminAuthenticated,
  verifySameOriginRequest,
} from '../../../lib/admin-auth';
import type { CaseStudy, PillarType } from '../../../types/portfolio';

export const dynamic = 'force-dynamic';

const DATA_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'cases.json');
const DATA_TS_PATH = path.join(process.cwd(), 'src', 'data', 'cases.ts');
const DEFAULT_GITHUB_OWNER = 'diego-dev-brazil';

const ALLOWED_PILLARS: readonly PillarType[] = [
  'AUTOMATION',
  'INTERNAL_TOOL',
  'AI_AGENT',
  'RAPID_MVP',
];

const PILLAR_LABELS: Record<PillarType, string> = {
  AUTOMATION: 'RPA & AUTOMATION',
  INTERNAL_TOOL: 'INTERNAL TOOL & DATA',
  AI_AGENT: 'AI AGENTS & WORKFLOW',
  RAPID_MVP: 'RAPID MVP & PRODUCT',
};

interface GitHubRepoPayload {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

function sanitizeExternalUrl(raw?: string): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function clampString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

async function readCasesFromDisk(): Promise<CaseStudy[]> {
  try {
    const raw = await fs.readFile(DATA_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as CaseStudy[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to initialCases from src/data/cases.ts
  }
  return initialCases;
}

function reindexCases(list: CaseStudy[]): CaseStudy[] {
  return list.map((item, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const parts = item.index.split('//');
    const suffix = (parts[1] ?? PILLAR_LABELS[item.pillar] ?? 'ENGINEERING').trim();
    return {
      ...item,
      index: `${num} // ${suffix}`,
    };
  });
}

async function persistCasesToDisk(list: CaseStudy[]): Promise<boolean> {
  const normalized = reindexCases(list);
  try {
    await fs.writeFile(DATA_JSON_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    const tsContent = `import type { CaseStudy } from '../types/portfolio';\n\nexport const cases: CaseStudy[] = ${JSON.stringify(
      normalized,
      null,
      2
    )};\n`;
    await fs.writeFile(DATA_TS_PATH, tsContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function parseGitHubOwnerRepo(
  input: string,
  defaultOwner: string
): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const urlMatch = trimmed.match(/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }
  const slugMatch = trimmed.match(/^([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (slugMatch) {
    return { owner: slugMatch[1], repo: slugMatch[2] };
  }
  if (/^[a-zA-Z0-9_.-]{1,100}$/.test(trimmed)) {
    return { owner: defaultOwner, repo: trimmed };
  }
  return null;
}

function inferPillarFromRepo(repo: GitHubRepoPayload): PillarType {
  const text = `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  if (
    text.includes('playwright') ||
    text.includes('automacao') ||
    text.includes('rpa') ||
    text.includes('bot') ||
    text.includes('vba')
  ) {
    return 'AUTOMATION';
  }
  if (
    text.includes('prompt') ||
    text.includes('ai') ||
    text.includes('gemini') ||
    text.includes('agent')
  ) {
    return 'AI_AGENT';
  }
  if (
    text.includes('app') ||
    text.includes('game') ||
    text.includes('web') ||
    text.includes('mvp')
  ) {
    return 'RAPID_MVP';
  }
  return 'INTERNAL_TOOL';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const repoParam = searchParams.get('repo');
  const owner =
    process.env.GITHUB_USERNAME?.trim() || DEFAULT_GITHUB_OWNER;

  const isAuthenticated = await isRequestAdminAuthenticated(request);

  // Operações administrativas de inspeção exigem sessão autenticada
  if (mode === 'github-repos' || mode === 'inspect-repo') {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login administrativo primeiro.' },
        { status: 401 }
      );
    }
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'diego-portfolio-cms',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Modo 1: Listar repositórios públicos do GitHub do proprietário configurado
  if (mode === 'github-repos') {
    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(owner)}/repos?sort=updated&per_page=30`,
        { headers, cache: 'no-store' }
      );
      if (!response.ok) {
        return NextResponse.json(
          { error: `GitHub API respondeu ${response.status}` },
          { status: response.status }
        );
      }
      const repos = (await response.json()) as GitHubRepoPayload[];
      const simplified = repos
        .filter((r) => !r.name.toLowerCase().includes(owner.toLowerCase()))
        .map((r) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          url: r.html_url,
          description: r.description ?? '',
          homepage: r.homepage ?? '',
          language: r.language ?? 'Markdown',
          topics: r.topics ?? [],
          stars: r.stargazers_count,
          updatedAt: r.updated_at,
          suggestedPillar: inferPillarFromRepo(r),
        }));
      return NextResponse.json({ repos: simplified });
    } catch {
      return NextResponse.json(
        { error: 'Não foi possível conectar ao GitHub no momento.' },
        { status: 502 }
      );
    }
  }

  // Modo 2: Inspecionar um repositório específico do GitHub e gerar rascunho
  if (mode === 'inspect-repo' && repoParam) {
    const parsed = parseGitHubOwnerRepo(repoParam, owner);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Informe uma URL válida do GitHub ou owner/repositório.' },
        { status: 400 }
      );
    }

    try {
      const [repoRes, langRes] = await Promise.all([
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
          { headers, cache: 'no-store' }
        ),
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/languages`,
          { headers, cache: 'no-store' }
        ),
      ]);

      if (!repoRes.ok) {
        return NextResponse.json(
          { error: `Repositório ${parsed.owner}/${parsed.repo} não encontrado no GitHub.` },
          { status: 404 }
        );
      }

      const repoData = (await repoRes.json()) as GitHubRepoPayload;
      const langData = langRes.ok
        ? ((await langRes.json()) as Record<string, number>)
        : {};

      const languages = Object.keys(langData).slice(0, 4);
      const topics = (repoData.topics ?? []).slice(0, 3);
      const combinedStack = Array.from(
        new Set([
          ...languages,
          ...(repoData.language ? [repoData.language] : []),
          ...topics,
        ])
      ).slice(0, 5);

      const pillar = inferPillarFromRepo(repoData);
      const cleanTitle = repoData.name
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const draft: Partial<CaseStudy> = {
        id: repoData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        pillar,
        index: `00 // ${PILLAR_LABELS[pillar]}`,
        title: cleanTitle,
        impactBadge: `${repoData.language ?? 'Open Source'} · GitHub`,
        bottleneck:
          repoData.description ||
          'Processo manual ou necessidade de integração estruturada identificada na operação.',
        solution: `Implementado no repositório ${repoData.name} utilizando ${
          combinedStack.join(', ') || 'arquitetura modular'
        } com código versionado no GitHub.`,
        architectureFlow: `[Entrada] -> [${
          combinedStack[0] ?? 'Core'
        }] -> [${combinedStack[1] ?? 'Processamento'}] -> [Output]`,
        stack: combinedStack.length > 0 ? combinedStack : ['Git', 'Markdown'],
        repoUrl: sanitizeExternalUrl(repoData.html_url),
        demoUrl: sanitizeExternalUrl(repoData.homepage ?? undefined),
        liveMetrics: {
          label: 'GITHUB',
          value: `${repoData.name} (${repoData.stargazers_count}★)`,
        },
      };

      return NextResponse.json({ draft, repo: repoData });
    } catch {
      return NextResponse.json(
        { error: 'Erro ao consultar dados do repositório no GitHub.' },
        { status: 502 }
      );
    }
  }

  // Leitura pública padrão dos projetos
  const currentCases = await readCasesFromDisk();
  return NextResponse.json({
    cases: currentCases,
    cmsEnabled:
      isCmsEnvironmentEnabled() &&
      Boolean(process.env.PORTFOLIO_ADMIN_TOKEN?.trim()),
    authenticated: isAuthenticated,
  });
}

export async function POST(request: Request) {
  if (!isCmsEnvironmentEnabled()) {
    return NextResponse.json(
      { error: 'Operação de escrita desabilitada neste ambiente.' },
      { status: 403 }
    );
  }

  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { error: 'Origem da requisição inválida.' },
      { status: 403 }
    );
  }

  if (!(await isRequestAdminAuthenticated(request))) {
    return NextResponse.json(
      {
        error:
          'Não autorizado. Faça login administrativo antes de alterar projetos.',
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: 'upsert' | 'delete';
      project?: Partial<CaseStudy>;
      id?: string;
    };

    const current = await readCasesFromDisk();

    if (body.action === 'delete' && typeof body.id === 'string') {
      const targetId = clampString(body.id, 80);
      const filtered = reindexCases(current.filter((item) => item.id !== targetId));
      const persisted = await persistCasesToDisk(filtered);
      return NextResponse.json({ cases: filtered, persisted });
    }

    if (body.action === 'upsert' && body.project) {
      const incoming = body.project;
      const title = clampString(incoming.title, 140);
      const bottleneck = clampString(incoming.bottleneck, 600);
      const solution = clampString(incoming.solution, 600);

      if (!title || !bottleneck || !solution) {
        return NextResponse.json(
          { error: 'Título, gargalo e solução são obrigatórios.' },
          { status: 400 }
        );
      }

      const rawId = clampString(incoming.id || title, 80)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');
      const cleanId = rawId || `proj-${Date.now()}`;

      const pillar: PillarType = ALLOWED_PILLARS.includes(
        incoming.pillar as PillarType
      )
        ? (incoming.pillar as PillarType)
        : 'INTERNAL_TOOL';

      const sanitizedStack = Array.isArray(incoming.stack)
        ? incoming.stack
            .map((s) => clampString(s, 40))
            .filter(Boolean)
            .slice(0, 10)
        : [];

      const sanitized: CaseStudy = {
        id: cleanId,
        index:
          clampString(incoming.index, 60) || `00 // ${PILLAR_LABELS[pillar]}`,
        pillar,
        title,
        impactBadge:
          clampString(incoming.impactBadge, 80) || 'Produção · GitHub',
        bottleneck,
        solution,
        architectureFlow:
          clampString(incoming.architectureFlow, 300) ||
          '[Input] -> [Processamento] -> [Output]',
        stack: sanitizedStack.length > 0 ? sanitizedStack : ['TypeScript'],
        repoUrl: sanitizeExternalUrl(incoming.repoUrl),
        demoUrl: sanitizeExternalUrl(incoming.demoUrl),
        liveMetrics: incoming.liveMetrics
          ? {
              label: clampString(incoming.liveMetrics.label, 30) || 'STATUS',
              value:
                clampString(incoming.liveMetrics.value, 60) ||
                'Sincronizado via GitHub',
            }
          : {
              label: 'STATUS',
              value: 'Sincronizado via GitHub',
            },
      };

      const existingIdx = current.findIndex((item) => item.id === cleanId);
      let updated: CaseStudy[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = sanitized;
      } else {
        updated = [...current, sanitized];
      }

      const reindexed = reindexCases(updated);
      const persisted = await persistCasesToDisk(reindexed);
      return NextResponse.json({ cases: reindexed, persisted });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao processar alteração nos projetos.' },
      { status: 500 }
    );
  }
}
