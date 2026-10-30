'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CaseStudy, PillarType } from '../types/portfolio';

type GitHubRepoOption = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  homepage: string;
  language: string;
  topics: string[];
  stars: number;
  updatedAt: string;
  suggestedPillar: PillarType;
};

const FALLBACK_CREATURES = [
  {
    sprite: '/assets/fish/StarFish.png',
    label: 'Estrela-do-mar',
    coralPalette: {
      primary: '#14b8a6',
      secondary: '#0284c7',
      glow: 'rgba(20, 184, 166, 0.16)',
    },
  },
  {
    sprite: '/assets/fish/BlueTang.png',
    label: 'Peixe-azul',
    coralPalette: {
      primary: '#38bdf8',
      secondary: '#0d9488',
      glow: 'rgba(56, 189, 248, 0.16)',
    },
  },
  {
    sprite: '/assets/objects/FishBookOpen.png',
    label: 'Livro',
    coralPalette: {
      primary: '#10b981',
      secondary: '#06b6d4',
      glow: 'rgba(16, 185, 129, 0.16)',
    },
  },
  {
    sprite: '/assets/fish/ClownFish.png',
    label: 'Peixe-palhaço',
    coralPalette: {
      primary: '#0ea5e9',
      secondary: '#10b981',
      glow: 'rgba(14, 165, 233, 0.16)',
    },
  },
  {
    sprite: '/assets/fish/StoneFish.png',
    label: 'Peixe-pedra',
    coralPalette: {
      primary: '#22d3ee',
      secondary: '#0f766e',
      glow: 'rgba(34, 211, 238, 0.16)',
    },
  },
  {
    sprite: '/assets/fish/SunFish.png',
    label: 'Peixe-lua',
    coralPalette: {
      primary: '#38bdf8',
      secondary: '#0284c7',
      glow: 'rgba(56, 189, 248, 0.18)',
    },
  },
  {
    sprite: '/assets/fish/BlueFish.png',
    label: 'Peixe',
    coralPalette: {
      primary: '#0ea5e9',
      secondary: '#0369a1',
      glow: 'rgba(14, 165, 233, 0.18)',
    },
  },
];

const REEF_CREATURES: Record<string, (typeof FALLBACK_CREATURES)[number]> = {
  'shopee-rpa': FALLBACK_CREATURES[0],
  'clinic-financial-bi': FALLBACK_CREATURES[1],
  'open-prompts-br': FALLBACK_CREATURES[2],
  'ai-workflow-api': FALLBACK_CREATURES[3],
  'cnpj-viacep-api': FALLBACK_CREATURES[4],
};

function getColumnSpanClass(idx: number, total: number): string {
  if (idx === total - 1 && total % 2 === 1) {
    return 'case-card--full';
  }
  const pairIndex = Math.floor(idx / 2);
  const isFirstInPair = idx % 2 === 0;
  if (pairIndex % 2 === 0) {
    return isFirstInPair ? 'case-card--wide' : 'case-card--narrow';
  }
  return isFirstInPair ? 'case-card--narrow' : 'case-card--wide';
}

function RockMossAndCoral({
  primaryColor,
  secondaryColor,
  sprite,
  spriteLabel,
}: {
  primaryColor: string;
  secondaryColor: string;
  sprite: string;
  spriteLabel: string;
}) {
  return (
    <div className="rock-ornaments" aria-hidden="true">
      <svg
        className="rock-moss-svg"
        viewBox="0 0 600 24"
        preserveAspectRatio="none"
      >
        <path
          d="M0,12 Q35,4 70,11 T150,9 T240,12 T330,8 T420,12 T510,9 T600,12 L600,18 L0,18 Z"
          fill="#064e3b"
          opacity="0.85"
        />
        <path
          d="M12,11 Q45,5 85,11 T175,9 T265,11 T355,8 T445,11 T535,8 L592,11 L592,15 L12,15 Z"
          fill="#059669"
          opacity="0.65"
        />
      </svg>

      <svg className="coral-cluster coral-cluster--left" viewBox="0 0 110 70">
        <path
          className="swaying-kelp"
          d="M18,68 Q10,46 20,28 Q28,14 18,4 Q28,16 26,34 Q22,52 26,68 Z"
          fill="#047857"
          opacity="0.85"
        />
        <path
          className="swaying-kelp swaying-kelp--delayed"
          d="M32,68 Q26,50 34,36 Q40,22 32,10 Q42,22 38,40 Q34,54 38,68 Z"
          fill="#0d9488"
          opacity="0.8"
        />
        <path
          d="M48,68 L48,46 Q48,36 38,28 M48,50 Q58,42 60,32"
          stroke={primaryColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <circle cx="38" cy="28" r="2.5" fill="#7dd3fc" />
        <circle cx="60" cy="32" r="2.5" fill="#7dd3fc" />
      </svg>

      <div className="coral-cluster coral-cluster--right">
        <svg className="coral-right-svg" viewBox="0 0 100 66">
          <path
            d="M72,64 L72,42 Q72,32 82,24 M72,48 Q60,38 58,26"
            stroke={secondaryColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            className="swaying-kelp"
            d="M86,64 Q94,44 84,26 Q78,14 88,6 Q76,18 80,36 Q84,50 80,64 Z"
            fill="#065f46"
            opacity="0.85"
          />
        </svg>
        <img
          src={sprite}
          alt={spriteLabel}
          width={34}
          height={34}
          className="pixel-sprite rock-creature-sprite"
        />
      </div>

      <div className="rock-bubbles">
        <span className="rock-bubble rock-bubble--1" />
        <span className="rock-bubble rock-bubble--2" />
      </div>
    </div>
  );
}

function ArchitecturePreview({ flow, title }: { flow: string; title: string }) {
  const stages = flow.split(/\s*->\s*/).filter(Boolean);
  const [selectedStage, setSelectedStage] = useState(0);
  const [view, setView] = useState<'flow' | 'terminal'>('flow');

  return (
    <div className="architecture" aria-label={`Arquitetura: ${title}`}>
      <div className="architecture-toolbar">
        <span className="architecture-title">ARQUITETURA</span>
        <div className="view-switch" role="group" aria-label="Modo de visualização">
          <button
            type="button"
            className={view === 'flow' ? 'is-selected' : ''}
            onClick={() => setView('flow')}
            aria-pressed={view === 'flow'}
          >
            FLUXO
          </button>
          <button
            type="button"
            className={view === 'terminal' ? 'is-selected' : ''}
            onClick={() => setView('terminal')}
            aria-pressed={view === 'terminal'}
          >
            CLI
          </button>
        </div>
      </div>

      {view === 'flow' ? (
        <div className="flow-track" aria-label="Etapas da arquitetura">
          {stages.map((stage, index) => (
            <div className="flow-part" key={`${stage}-${index}`}>
              <button
                type="button"
                className={`flow-node${selectedStage === index ? ' flow-node--active' : ''}`}
                onClick={() => setSelectedStage(index)}
                aria-pressed={selectedStage === index}
                aria-label={`Etapa ${index + 1}: ${stage}`}
              >
                <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
                <span>{stage.replace(/^\[|\]$/g, '')}</span>
              </button>
              {index < stages.length - 1 && (
                <span className="flow-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="terminal-view" aria-live="polite">
          {stages.map((stage, index) => (
            <button
              type="button"
              key={`${stage}-${index}`}
              className={`terminal-line${selectedStage === index ? ' terminal-line--active' : ''}`}
              onClick={() => setSelectedStage(index)}
              aria-pressed={selectedStage === index}
            >
              <span>[{String(index + 1).padStart(2, '0')}]</span>
              <span>{stage.replace(/^\[|\]$/g, '')}</span>
              <span>{selectedStage === index ? '← ativo' : 'ok'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseCard({
  item,
  cardIndex,
  totalCards,
  isAuthenticated,
  onEdit,
}: {
  item: CaseStudy;
  cardIndex: number;
  totalCards: number;
  isAuthenticated: boolean;
  onEdit: (project: CaseStudy) => void;
}) {
  const reefMeta =
    REEF_CREATURES[item.id] ??
    FALLBACK_CREATURES[cardIndex % FALLBACK_CREATURES.length];
  const spanClass = getColumnSpanClass(cardIndex, totalCards);

  return (
    <article
      className={`case-card case-card--rock ${spanClass}`}
      style={
        {
          '--coral-glow': reefMeta.coralPalette.glow,
        } as React.CSSProperties
      }
    >
      <RockMossAndCoral
        primaryColor={reefMeta.coralPalette.primary}
        secondaryColor={reefMeta.coralPalette.secondary}
        sprite={reefMeta.sprite}
        spriteLabel={reefMeta.label}
      />

      <div className="rock-bottom-moss" aria-hidden="true" />

      <div className="rock-inner-tablet">
        <div className="case-topline">
          <span className="case-index">{item.index}</span>
          <div className="case-topline-right">
            <span className="impact-badge">{item.impactBadge}</span>
            {isAuthenticated && (
              <button
                type="button"
                className="rock-edit-trigger"
                onClick={() => onEdit(item)}
                title="Editar este projeto no Studio"
              >
                EDITAR
              </button>
            )}
          </div>
        </div>

        <h3>{item.title}</h3>

        <div className="case-details">
          <p>
            <span>GARGALO</span>
            {item.bottleneck}
          </p>
          <p>
            <span>SOLUÇÃO</span>
            {item.solution}
          </p>
        </div>

        <ArchitecturePreview flow={item.architectureFlow} title={item.title} />

        <div className="case-footer">
          <div className="stack-list" aria-label="Tecnologias">
            {item.stack.map((technology, index) => (
              <span key={`${technology}-${index}`}>
                {index > 0 && <b aria-hidden="true">·</b>}
                {technology}
              </span>
            ))}
          </div>
          <div className="case-actions">
            {item.demoUrl && (
              <a
                className="action-link"
                href={item.demoUrl}
                target="_blank"
                rel="noreferrer"
              >
                Demo ↗
              </a>
            )}
            {item.repoUrl && (
              <a
                className="action-link"
                href={item.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const EMPTY_FORM: CaseStudy = {
  id: '',
  index: '06 // RPA & AUTOMATION',
  pillar: 'AUTOMATION',
  title: '',
  impactBadge: 'Produção · GitHub',
  bottleneck: '',
  solution: '',
  architectureFlow: '[Entrada] -> [Processamento] -> [Banco / Output]',
  stack: ['TypeScript', 'Node.js'],
  repoUrl: '',
  demoUrl: '',
};

export function CaseStudies({ cases: initialCases }: { cases: CaseStudy[] }) {
  const [projectList, setProjectList] = useState<CaseStudy[]>(initialCases);
  const [cmsEnabled, setCmsEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login Modal State (bloqueia acesso antes de autenticar)
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portfolio Studio State (só abre se isAuthenticated === true)
  const [studioOpen, setStudioOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CaseStudy>(EMPTY_FORM);
  const [stackInput, setStackInput] = useState('TypeScript, Node.js');
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [githubRepos, setGithubRepos] = useState<GitHubRepoOption[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [inspectingRepo, setInspectingRepo] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [studioFeedback, setStudioFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function syncProjectsAndSession() {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as {
            cases?: CaseStudy[];
            cmsEnabled?: boolean;
            authenticated?: boolean;
          };
          if (!active) return;
          if (typeof data.cmsEnabled === 'boolean') {
            setCmsEnabled(data.cmsEnabled);
          }
          if (typeof data.authenticated === 'boolean') {
            setIsAuthenticated(data.authenticated);
          }
          if (Array.isArray(data.cases) && data.cases.length > 0) {
            setProjectList(data.cases);
          }
        }
      } catch {
        // Keep initial SSR cases if offline
      }
    }
    void syncProjectsAndSession();
    return () => {
      active = false;
    };
  }, []);

  // Atalho de teclado Ctrl + Shift + L para abrir o Login Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (isAuthenticated) {
          setStudioOpen(true);
        } else if (cmsEnabled) {
          setLoginError(null);
          setLoginModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, cmsEnabled]);

  const fetchUserGitHubRepos = useCallback(async () => {
    setLoadingRepos(true);
    setStudioFeedback(null);
    try {
      const res = await fetch('/api/projects?mode=github-repos', {
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        repos?: GitHubRepoOption[];
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setStudioOpen(false);
        }
        setStudioFeedback({
          type: 'err',
          text: data.error || 'Sessão expirada. Faça login novamente.',
        });
        return;
      }
      if (Array.isArray(data.repos)) {
        setGithubRepos(data.repos);
      }
    } catch {
      setStudioFeedback({
        type: 'err',
        text: 'Falha ao consultar repositórios do GitHub.',
      });
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordInput.trim()) return;
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = (await res.json()) as {
        authenticated?: boolean;
        error?: string;
      };

      if (!res.ok || !data.authenticated) {
        setLoginError(data.error || 'Senha administrativa incorreta.');
        return;
      }

      setPasswordInput('');
      setIsAuthenticated(true);
      setLoginModalOpen(false);
      openStudioNewInternal();
      void fetchUserGitHubRepos();
    } catch {
      setLoginError('Erro ao comunicar com o servidor de autenticação.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {
      // Ignore error
    }
    setIsAuthenticated(false);
    setStudioOpen(false);
    setGithubRepos([]);
  };

  const openStudioNewInternal = () => {
    const nextNum = String(projectList.length + 1).padStart(2, '0');
    setEditingForm({
      ...EMPTY_FORM,
      index: `${nextNum} // RPA & AUTOMATION`,
    });
    setStackInput('TypeScript, Node.js');
    setGithubUrlInput('');
    setStudioFeedback(null);
    setStudioOpen(true);
  };

  const openStudioNew = () => {
    if (!isAuthenticated) {
      setLoginError(null);
      setLoginModalOpen(true);
      return;
    }
    openStudioNewInternal();
    if (githubRepos.length === 0) {
      void fetchUserGitHubRepos();
    }
  };

  const openStudioEdit = (project: CaseStudy) => {
    if (!isAuthenticated) {
      setLoginError(null);
      setLoginModalOpen(true);
      return;
    }
    setEditingForm({ ...project });
    setStackInput(project.stack.join(', '));
    setGithubUrlInput(project.repoUrl ?? '');
    setStudioFeedback(null);
    setStudioOpen(true);
    if (githubRepos.length === 0) {
      void fetchUserGitHubRepos();
    }
  };

  const handleInspectGitHubRepo = async (repoIdentifier: string) => {
    if (!repoIdentifier.trim()) return;
    setInspectingRepo(true);
    setStudioFeedback(null);
    try {
      const res = await fetch(
        `/api/projects?mode=inspect-repo&repo=${encodeURIComponent(repoIdentifier.trim())}`,
        { cache: 'no-store' }
      );
      const data = (await res.json()) as {
        draft?: Partial<CaseStudy>;
        error?: string;
      };
      if (!res.ok || !data.draft) {
        setStudioFeedback({
          type: 'err',
          text: data.error || 'Não foi possível importar este repositório do GitHub.',
        });
        return;
      }
      const nextNum = String(projectList.length + 1).padStart(2, '0');
      const draft = data.draft;
      const merged: CaseStudy = {
        id: draft.id || `proj-${Date.now()}`,
        index: draft.index
          ? draft.index.replace(/^00/, nextNum)
          : `${nextNum} // ENGINEERING`,
        pillar: draft.pillar || 'INTERNAL_TOOL',
        title: draft.title || '',
        impactBadge: draft.impactBadge || 'Produção · GitHub',
        bottleneck: draft.bottleneck || '',
        solution: draft.solution || '',
        architectureFlow:
          draft.architectureFlow || '[Entrada] -> [Core] -> [Output]',
        stack: draft.stack && draft.stack.length > 0 ? draft.stack : ['TypeScript'],
        repoUrl: draft.repoUrl || repoIdentifier.trim(),
        demoUrl: draft.demoUrl || '',
        liveMetrics: draft.liveMetrics,
      };
      setEditingForm(merged);
      setStackInput(merged.stack.join(', '));
      setGithubUrlInput(merged.repoUrl ?? '');
      setStudioFeedback({
        type: 'ok',
        text: `Dados importados do GitHub (${merged.repoUrl}). Revise os campos e clique em Salvar.`,
      });
    } catch {
      setStudioFeedback({
        type: 'err',
        text: 'Erro de conexão ao consultar a API do GitHub.',
      });
    } finally {
      setInspectingRepo(false);
    }
  };

  const handleSaveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingForm.title.trim()) {
      setStudioFeedback({
        type: 'err',
        text: 'Informe pelo menos o título do projeto.',
      });
      return;
    }

    setSavingProject(true);
    setStudioFeedback(null);

    const parsedStack = stackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CaseStudy = {
      ...editingForm,
      id:
        editingForm.id.trim() ||
        editingForm.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      stack: parsedStack.length > 0 ? parsedStack : ['TypeScript'],
      repoUrl: editingForm.repoUrl?.trim() || undefined,
      demoUrl: editingForm.demoUrl?.trim() || undefined,
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', project: payload }),
      });

      const result = (await res.json()) as {
        cases?: CaseStudy[];
        persisted?: boolean;
        error?: string;
      };

      if (!res.ok || !result.cases) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setStudioOpen(false);
        }
        setStudioFeedback({
          type: 'err',
          text:
            result.error ||
            'Não autorizado ou falha ao gravar projeto no servidor.',
        });
        return;
      }

      setProjectList(result.cases);
      setStudioFeedback({
        type: 'ok',
        text: result.persisted
          ? 'Projeto salvo em src/data/cases.ts!'
          : 'Projeto atualizado!',
      });
    } catch {
      setStudioFeedback({
        type: 'err',
        text: 'Falha de comunicação com /api/projects.',
      });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const result = (await res.json()) as {
        cases?: CaseStudy[];
        error?: string;
      };
      if (!res.ok || !result.cases) {
        setStudioFeedback({
          type: 'err',
          text: result.error || 'Não autorizado para excluir projetos.',
        });
        return;
      }
      setProjectList(result.cases);
      setStudioFeedback({
        type: 'ok',
        text: 'Projeto removido com sucesso.',
      });
    } catch {
      setStudioFeedback({
        type: 'err',
        text: 'Falha ao comunicar com /api/projects.',
      });
    }
  };

  return (
    <>
      {/* Barra de Administração visível APENAS quando autenticado */}
      {isAuthenticated && (
        <div className="cms-ActionBar">
          <span className="admin-active-pill">MODO ADMIN AUTENTICADO</span>
          <button
            type="button"
            className="studio-open-btn"
            onClick={openStudioNew}
          >
            + ADICIONAR / GERENCIAR PROJETOS (GITHUB)
          </button>
          <button
            type="button"
            className="beach-modal-close-btn"
            onClick={() => void handleAdminLogout()}
          >
            SAIR (BLOQUEAR)
          </button>
        </div>
      )}

      <div className="case-grid">
        {projectList.map((item, idx) => (
          <CaseCard
            key={item.id}
            item={item}
            cardIndex={idx}
            totalCards={projectList.length}
            isAuthenticated={isAuthenticated}
            onEdit={openStudioEdit}
          />
        ))}
      </div>

      {/* Gatilho discreto de Login Admin para o proprietário (ou Ctrl+Shift+L) */}
      {cmsEnabled && !isAuthenticated && (
        <div className="admin-lock-row">
          <button
            type="button"
            className="admin-lock-btn"
            onClick={() => {
              setLoginError(null);
              setLoginModalOpen(true);
            }}
            title="Acesso exclusivo do proprietário (Ctrl + Shift + L)"
          >
            ADMIN // GERENCIAR PORTFÓLIO
          </button>
        </div>
      )}

      {/* ====================================================
          MODAL DE LOGIN ADMINISTRATIVO (SESSÃO HTTPONLY ASSINADA)
         ==================================================== */}
      {loginModalOpen && !isAuthenticated && (
        <div
          className="beach-modal-backdrop"
          onClick={() => setLoginModalOpen(false)}
          role="presentation"
        >
          <div
            className="beach-modal-window admin-login-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="beach-modal-titlebar">
              <div className="beach-modal-breadcrumb">
                <span className="beach-modal-index">AUTH</span>
                <span className="beach-modal-divider">//</span>
                <span className="beach-modal-code">ACESSO RESTRITO AO PROPRIETÁRIO</span>
              </div>
              <button
                type="button"
                className="beach-modal-close-btn"
                onClick={() => setLoginModalOpen(false)}
              >
                ESC // FECHAR ×
              </button>
            </div>

            <form
              className="admin-login-form"
              onSubmit={(e) => void handleAdminLogin(e)}
            >
              <h2 id="admin-login-title">Autenticação Administrativa</h2>
              <p className="inspector-sub">
                Digite sua chave configurada em <code>PORTFOLIO_ADMIN_TOKEN</code> (
                <code>.env.local</code>) para liberar a edição e importação de
                projetos.
              </p>

              {loginError && (
                <div className="studio-feedback-bar studio-feedback-bar--err">
                  <span>ERRO // {loginError}</span>
                </div>
              )}

              <label className="studio-label">
                <span>SENHA / CHAVE ADMINISTRATIVA *</span>
                <input
                  type="password"
                  required
                  autoFocus
                  className="studio-input"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </label>

              <div className="studio-submit-row">
                <button
                  type="submit"
                  className="cv-download-btn"
                  disabled={loggingIn}
                >
                  <span>{loggingIn ? 'VERIFICANDO…' : 'DESBLOQUEAR STUDIO'}</span>
                  <span className="cv-download-arrow">→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          PORTFOLIO STUDIO MODAL (SÓ ABRE QUANDO isAuthenticated === true)
         ==================================================== */}
      {studioOpen && isAuthenticated && (
        <div
          className="beach-modal-backdrop"
          onClick={() => setStudioOpen(false)}
          role="presentation"
        >
          <div
            className="beach-modal-window studio-modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Command Bar */}
            <div className="beach-modal-titlebar">
              <div className="beach-modal-breadcrumb">
                <span className="beach-modal-index">CMS</span>
                <span className="beach-modal-divider">//</span>
                <span className="beach-modal-code">
                  PORTFOLIO_STUDIO · SESSÃO AUTENTICADA
                </span>
              </div>
              <div className="beach-modal-top-actions">
                <button
                  type="button"
                  className="beach-modal-cv-pill"
                  onClick={openStudioNew}
                >
                  + NOVO PROJETO
                </button>
                <button
                  type="button"
                  className="beach-modal-close-btn"
                  onClick={() => void handleAdminLogout()}
                >
                  ENCERRAR SESSÃO
                </button>
                <button
                  type="button"
                  className="beach-modal-close-btn"
                  onClick={() => setStudioOpen(false)}
                >
                  ESC // FECHAR ×
                </button>
              </div>
            </div>

            {/* Header */}
            <div className="inspector-header-bar">
              <div>
                <h2 id="studio-modal-title">
                  Gerenciador de Projetos & Importador GitHub
                </h2>
                <p className="inspector-sub">
                  Sessão autenticada via cookie HttpOnly assinado (HMAC-SHA256). As
                  alterações são gravadas diretamente em src/data/cases.ts.
                </p>
              </div>
            </div>

            {studioFeedback && (
              <div
                className={`studio-feedback-bar ${
                  studioFeedback.type === 'err'
                    ? 'studio-feedback-bar--err'
                    : 'studio-feedback-bar--ok'
                }`}
              >
                <span>
                  {studioFeedback.type === 'err' ? 'ERRO // ' : 'SYNC OK // '}
                  {studioFeedback.text}
                </span>
              </div>
            )}

            <div className="inspector-hairline-grid">
              {/* Coluna Esquerda (5 cols): Importar do GitHub & Lista de Projetos */}
              <div className="inspector-cell inspector-cell--span-5">
                <span className="cell-label">
                  01 // APONTAR PARA REPOSITÓRIO DO GITHUB
                </span>
                <div className="studio-github-import-box">
                  <input
                    type="text"
                    className="studio-input"
                    placeholder="https://github.com/diego-dev-brazil/meu-repo"
                    value={githubUrlInput}
                    onChange={(e) => setGithubUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cv-download-btn studio-import-btn"
                    disabled={inspectingRepo}
                    onClick={() => void handleInspectGitHubRepo(githubUrlInput)}
                  >
                    {inspectingRepo ? 'PUXANDO…' : 'PUXAR DO GITHUB ↗'}
                  </button>
                </div>

                <div className="cell-divider" />

                <div className="studio-sub-header">
                  <span className="cell-label" style={{ marginBottom: 0 }}>
                    02 // SEUS REPOSITÓRIOS (@DIEGO-DEV-BRAZIL)
                  </span>
                  <button
                    type="button"
                    className="studio-mini-btn"
                    onClick={() => void fetchUserGitHubRepos()}
                    disabled={loadingRepos}
                  >
                    {loadingRepos ? '...' : 'ATUALIZAR ↻'}
                  </button>
                </div>

                <div className="studio-repo-picker-list">
                  {loadingRepos ? (
                    <p className="cell-prose-compact">
                      Carregando repositórios públicos do GitHub…
                    </p>
                  ) : githubRepos.length === 0 ? (
                    <p className="cell-prose-compact">
                      Clique em Atualizar para listar seus repositórios do GitHub.
                    </p>
                  ) : (
                    githubRepos.map((r) => (
                      <div key={r.id} className="studio-repo-item">
                        <div className="studio-repo-info">
                          <strong>{r.name}</strong>
                          <span>
                            {r.language} {r.stars > 0 ? `· ${r.stars}★` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="studio-mini-btn studio-mini-btn--accent"
                          onClick={() => void handleInspectGitHubRepo(r.url)}
                        >
                          IMPORTAR →
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="cell-divider" />

                <span className="cell-label">
                  03 // PROJETOS ATUAIS ({projectList.length})
                </span>
                <div className="studio-current-list">
                  {projectList.map((proj) => (
                    <div key={proj.id} className="studio-current-item">
                      <div className="studio-repo-info">
                        <strong>{proj.title}</strong>
                        <span>{proj.index}</span>
                      </div>
                      <div className="studio-item-actions">
                        <button
                          type="button"
                          className="studio-mini-btn"
                          onClick={() => openStudioEdit(proj)}
                        >
                          EDITAR
                        </button>
                        <button
                          type="button"
                          className="studio-mini-btn studio-mini-btn--danger"
                          onClick={() => void handleDeleteProject(proj.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Direita (7 cols): Editor do Projeto */}
              <form
                className="inspector-cell inspector-cell--span-7 studio-form"
                onSubmit={(e) => void handleSaveProject(e)}
              >
                <span className="cell-label">
                  04 // DADOS DO PROJETO (SALVA EM SRC/DATA/CASES.TS)
                </span>

                <div className="studio-field-row studio-field-row--2col">
                  <label className="studio-label">
                    <span>TÍTULO DO PROJETO *</span>
                    <input
                      type="text"
                      required
                      className="studio-input"
                      placeholder="Ex: Automação Shopee — Playwright & TypeScript"
                      value={editingForm.title}
                      onChange={(e) =>
                        setEditingForm({ ...editingForm, title: e.target.value })
                      }
                    />
                  </label>

                  <label className="studio-label">
                    <span>BADGE DE IMPACTO / MÉTRICA</span>
                    <input
                      type="text"
                      className="studio-input"
                      placeholder="Ex: -12h/sem operação manual"
                      value={editingForm.impactBadge}
                      onChange={(e) =>
                        setEditingForm({
                          ...editingForm,
                          impactBadge: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="studio-field-row studio-field-row--2col">
                  <label className="studio-label">
                    <span>PILAR DE ENGENHARIA</span>
                    <select
                      className="studio-input"
                      value={editingForm.pillar}
                      onChange={(e) =>
                        setEditingForm({
                          ...editingForm,
                          pillar: e.target.value as PillarType,
                        })
                      }
                    >
                      <option value="AUTOMATION">AUTOMATION (RPA & Scripts)</option>
                      <option value="INTERNAL_TOOL">
                        INTERNAL_TOOL (Dados, ETL, APIs)
                      </option>
                      <option value="AI_AGENT">AI_AGENT (IA & Prompts)</option>
                      <option value="RAPID_MVP">RAPID_MVP (Web & Sistemas)</option>
                    </select>
                  </label>

                  <label className="studio-label">
                    <span>ÍNDICE / CATEGORIA</span>
                    <input
                      type="text"
                      className="studio-input"
                      placeholder="Ex: 06 // RPA & AUTOMATION"
                      value={editingForm.index}
                      onChange={(e) =>
                        setEditingForm({ ...editingForm, index: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="studio-field-row studio-field-row--2col">
                  <label className="studio-label">
                    <span>URL DO REPOSITÓRIO (GITHUB)</span>
                    <input
                      type="url"
                      className="studio-input"
                      placeholder="https://github.com/diego-dev-brazil/..."
                      value={editingForm.repoUrl ?? ''}
                      onChange={(e) =>
                        setEditingForm({ ...editingForm, repoUrl: e.target.value })
                      }
                    />
                  </label>

                  <label className="studio-label">
                    <span>URL DE DEMO (OPCIONAL)</span>
                    <input
                      type="url"
                      className="studio-input"
                      placeholder="https://..."
                      value={editingForm.demoUrl ?? ''}
                      onChange={(e) =>
                        setEditingForm({ ...editingForm, demoUrl: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="studio-label">
                  <span>GARGALO OPERACIONAL (O PROBLEMA REAL) *</span>
                  <textarea
                    required
                    rows={2}
                    className="studio-textarea"
                    placeholder="Qual era a dor ou processo manual que existia antes?"
                    value={editingForm.bottleneck}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, bottleneck: e.target.value })
                    }
                  />
                </label>

                <label className="studio-label">
                  <span>SOLUÇÃO & ALAVANCA TÉCNICA (COMO VOCÊ RESOLVEU) *</span>
                  <textarea
                    required
                    rows={2}
                    className="studio-textarea"
                    placeholder="O que você construiu em código/IA e qual foi o resultado prático?"
                    value={editingForm.solution}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, solution: e.target.value })
                    }
                  />
                </label>

                <div className="studio-field-row studio-field-row--2col">
                  <label className="studio-label">
                    <span>FLUXO DE ARQUITETURA (SEPARADO POR -&gt;)</span>
                    <input
                      type="text"
                      className="studio-input"
                      placeholder="[Entrada] -> [API / Script] -> [Banco SQL]"
                      value={editingForm.architectureFlow}
                      onChange={(e) =>
                        setEditingForm({
                          ...editingForm,
                          architectureFlow: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="studio-label">
                    <span>STACK TÉCNICA (SEPARADA POR VÍRGULA)</span>
                    <input
                      type="text"
                      className="studio-input"
                      placeholder="Python, Pandas, SQL, Power BI"
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                    />
                  </label>
                </div>

                <div className="studio-submit-row">
                  <button
                    type="submit"
                    className="cv-download-btn"
                    disabled={savingProject}
                  >
                    <span>
                      {savingProject
                        ? 'SALVANDO NO PORTFÓLIO…'
                        : 'SALVAR PROJETO NO PORTFÓLIO'}
                    </span>
                    <span className="cv-download-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    className="cv-preview-btn"
                    onClick={openStudioNew}
                  >
                    Limpar / Novo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
