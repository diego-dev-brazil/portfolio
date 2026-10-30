'use client';

import { useEffect, useState } from 'react';

type BeachHotspotId = 'cabana' | 'livro' | 'barco';

const CV_FILE_PATH = '/diego-augusto-oliveira-cv.pdf';
const CV_DOWNLOAD_NAME = 'Diego_Augusto_Oliveira_CV.pdf';

const WINDOW_META: Record<
  BeachHotspotId,
  { index: string; code: string; title: string; subtitle: string; sprite: string }
> = {
  cabana: {
    index: '01',
    code: 'SYS // PROFILE_SPEC',
    title: 'Diego Augusto Oliveira',
    subtitle: 'Dados, Sistemas e Automação com IA · Mogi das Cruzes, SP',
    sprite: '/assets/objects/Shop.png',
  },
  livro: {
    index: '02',
    code: 'SYS // STACK_AND_CV',
    title: 'Stack Técnica, Formação & Currículo',
    subtitle: 'FATEC Análise e Desenvolvimento de Sistemas (2025 – 2028)',
    sprite: '/assets/objects/FishBookOpen.png',
  },
  barco: {
    index: '03',
    code: 'SYS // DIRECT_CHANNELS',
    title: 'Canais Diretos & Documentação',
    subtitle: 'Disponível para Estágio / Júnior em Dados, Sistemas, Backend e Automação',
    sprite: '/assets/objects/Boat.png',
  },
};

export function InteractiveBeach() {
  const [activeSpot, setActiveSpot] = useState<BeachHotspotId | null>(null);

  useEffect(() => {
    if (!activeSpot) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveSpot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSpot]);

  const currentMeta = activeSpot ? WINDOW_META[activeSpot] : null;

  return (
    <section className="beach-hero" id="inicio" aria-labelledby="intro-title">
      {/* Céu de Dia: Sol e Nuvens Livres */}
      <div className="sky-decor" aria-hidden="true">
        <div className="beach-sun" />
        <div className="sky-cloud sky-cloud--1" />
        <div className="sky-cloud sky-cloud--2" />
        <div className="sky-cloud sky-cloud--3" />
      </div>

      {/* Título Principal Livre no Céu */}
      <div className="site-shell beach-header">
        <h1 id="intro-title">Diego Augusto</h1>
        <p className="hero-role">Software Developer and AI Builder</p>
      </div>

      {/* ====================================================
          PRAIA ORGÂNICA E LIVRE (SEM DIV/QUADRADO SEPARANDO DO CÉU)
         ==================================================== */}
      <div
        className="open-beach-shoreline"
        role="region"
        aria-label="Praia interativa"
      >
        {/* Coqueiro na Areia */}
        <svg
          className="beach-palm-large"
          viewBox="0 0 140 160"
          aria-hidden="true"
        >
          <path
            d="M68,154 Q58,104 74,48"
            stroke="#78350f"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M74,48 Q32,32 10,56 Q40,50 74,48 Z" fill="#15803d" />
          <path d="M74,48 Q46,12 18,22 Q48,28 74,48 Z" fill="#16a34a" />
          <path d="M74,48 Q102,12 128,28 Q98,32 74,48 Z" fill="#22c55e" />
          <path d="M74,48 Q114,36 132,62 Q102,50 74,48 Z" fill="#15803d" />
        </svg>

        {/* ASSET 1: CABANA NA PRAIA (SOBRE MIM) */}
        <button
          type="button"
          className={`beach-hotspot beach-hotspot--cabana${
            activeSpot === 'cabana' ? ' is-active' : ''
          }`}
          onClick={() => setActiveSpot('cabana')}
          aria-haspopup="dialog"
          aria-expanded={activeSpot === 'cabana'}
        >
          <span className="hotspot-tag">
            <i className="hotspot-indicator" /> SOBRE MIM
          </span>
          <img
            src="/assets/objects/Shop.png"
            alt="Cabana — Sobre Mim"
            width={220}
            height={220}
            className="pixel-sprite hotspot-sprite"
          />
        </button>

        {/* Props decorativos na areia */}
        <img
          src="/assets/objects/FisiBasket2.png"
          alt=""
          width={68}
          height={68}
          aria-hidden="true"
          className="pixel-sprite beach-prop-basket"
        />
        <img
          src="/assets/fish/StarFish.png"
          alt=""
          width={52}
          height={52}
          aria-hidden="true"
          className="pixel-sprite beach-prop-starfish"
        />

        {/* ASSET 2: LIVRO NA BEIRA DA PRAIA (STACK & CV) */}
        <button
          type="button"
          className={`beach-hotspot beach-hotspot--livro${
            activeSpot === 'livro' ? ' is-active' : ''
          }`}
          onClick={() => setActiveSpot('livro')}
          aria-haspopup="dialog"
          aria-expanded={activeSpot === 'livro'}
        >
          <span className="hotspot-tag">
            <i className="hotspot-indicator" /> STACK & CV
          </span>
          <img
            src="/assets/objects/FishBookOpen.png"
            alt="Livro — Stack e Currículo"
            width={108}
            height={108}
            className="pixel-sprite hotspot-sprite"
          />
        </button>

        {/* ASSET 3: BARCO ENTRANDO NO MAR (CONTATO & REDES) */}
        <button
          type="button"
          className={`beach-hotspot beach-hotspot--barco${
            activeSpot === 'barco' ? ' is-active' : ''
          }`}
          onClick={() => setActiveSpot('barco')}
          aria-haspopup="dialog"
          aria-expanded={activeSpot === 'barco'}
        >
          <span className="hotspot-tag">
            <i className="hotspot-indicator" /> CONTATO
          </span>
          <img
            src="/assets/objects/Boat.png"
            alt="Barco — Contato e Redes"
            width={196}
            height={196}
            className="pixel-sprite hotspot-sprite boat-wave-anim"
          />
          <div className="fishing-line" aria-hidden="true">
            <img
              src="/assets/objects/FishingBait0.png"
              alt=""
              width={42}
              height={42}
              className="pixel-sprite fishing-bait"
            />
          </div>
        </button>

        {/* Curva Dinâmica da Praia Descendo para a Água Rasa */}
        <svg
          className="beach-slope-svg"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,155 Q520,140 880,148 T1440,136 L1440,240 L0,240 Z"
            fill="#22d3ee"
          />
          <path
            d="M0,168 Q460,152 820,164 T1440,156 L1440,240 L0,240 Z"
            fill="#e0f2fe"
            opacity="0.9"
          />
          <path
            d="M0,56 C320,52 560,88 830,156 C980,192 1180,214 1440,222 L1440,240 L0,240 Z"
            fill="#fde047"
          />
          <path
            d="M0,70 C310,66 550,100 820,166 C975,200 1180,220 1440,228 L1440,240 L0,240 Z"
            fill="#f59e0b"
          />
          <path
            d="M0,202 Q360,184 720,202 T1440,196 L1440,240 L0,240 Z"
            fill="#e0f2fe"
          />
          <path
            d="M0,212 Q360,194 720,212 T1440,206 L1440,240 L0,240 Z"
            fill="#06b6d4"
          />
        </svg>
      </div>

      {/* ====================================================
          MODAL AZUL PROFUNDO (ANTI-AI UI // LINEAR & VERCEL CRAFT)
          Hairlines 1px expostas, superfícies azul-abissal foscas,
          tipografia técnica monospace e download direto do CV
         ==================================================== */}
      {activeSpot && currentMeta && (
        <div
          className="beach-modal-backdrop"
          onClick={() => setActiveSpot(null)}
          role="presentation"
        >
          <div
            className="beach-modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="beach-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Top Command Bar (1px hairline, sem bolinhas Mac clichês) */}
            <div className="beach-modal-titlebar">
              <div className="beach-modal-breadcrumb">
                <span className="beach-modal-index">{currentMeta.index}</span>
                <span className="beach-modal-divider">//</span>
                <span className="beach-modal-code">{currentMeta.code}</span>
              </div>

              <div className="beach-modal-top-actions">
                <a
                  href={CV_FILE_PATH}
                  download={CV_DOWNLOAD_NAME}
                  className="beach-modal-cv-pill"
                >
                  CURRICULO.PDF ↓
                </a>
                <button
                  type="button"
                  className="beach-modal-close-btn"
                  onClick={() => setActiveSpot(null)}
                  aria-label="Fechar janela"
                >
                  ESC // FECHAR ×
                </button>
              </div>
            </div>

            {/* Navegação Estrutural em Grade 1px */}
            <div className="beach-inspector-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeSpot === 'cabana'}
                className={activeSpot === 'cabana' ? 'is-selected' : ''}
                onClick={() => setActiveSpot('cabana')}
              >
                <span className="tab-num">01</span>
                <span>SOBRE & EXPERIÊNCIA</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSpot === 'livro'}
                className={activeSpot === 'livro' ? 'is-selected' : ''}
                onClick={() => setActiveSpot('livro')}
              >
                <span className="tab-num">02</span>
                <span>STACK & CURRÍCULO PDF</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSpot === 'barco'}
                className={activeSpot === 'barco' ? 'is-selected' : ''}
                onClick={() => setActiveSpot('barco')}
              >
                <span className="tab-num">03</span>
                <span>CONTATO DIRETO</span>
              </button>
            </div>

            {/* Cabeçalho Técnico do Painel */}
            <div className="inspector-header-bar">
              <div className="inspector-header-main">
                <div className="inspector-sprite-box">
                  <img
                    src={currentMeta.sprite}
                    alt=""
                    width={44}
                    height={44}
                    className="pixel-sprite"
                  />
                </div>
                <div>
                  <h2 id="beach-modal-title">{currentMeta.title}</h2>
                  <p className="inspector-sub">{currentMeta.subtitle}</p>
                </div>
              </div>

              <div className="inspector-header-cta">
                <a
                  href={CV_FILE_PATH}
                  download={CV_DOWNLOAD_NAME}
                  className="cv-download-btn"
                >
                  <span>Baixar Currículo (PDF)</span>
                  <span className="cv-download-arrow">↓</span>
                </a>
                <a
                  href={CV_FILE_PATH}
                  target="_blank"
                  rel="noreferrer"
                  className="cv-preview-btn"
                >
                  Abrir PDF ↗
                </a>
              </div>
            </div>

            {/* ABA 01: SOBRE MIM & EXPERIÊNCIA PROFISSIONAL */}
            {activeSpot === 'cabana' && (
              <div className="inspector-hairline-grid">
                {/* Coluna Esquerda (7 cols): Resumo & Liderança */}
                <div className="inspector-cell inspector-cell--span-7">
                  <span className="cell-label">01.A // RESUMO OPERACIONAL</span>
                  <p className="cell-prose">
                    Estudante de Análise e Desenvolvimento de Sistemas na{' '}
                    <strong>FATEC Mogi das Cruzes</strong> (conclusão em 2028) e{' '}
                    <strong>Google Student Ambassador</strong>. Experiência prática em
                    suporte técnico e diagnóstico de causa-raiz em sistemas corporativos,
                    pipelines de dados com SQL e Python/Pandas, automação de processos com
                    Excel VBA, Playwright/TypeScript e dashboards em Power BI.
                  </p>

                  <div className="cell-divider" />

                  <span className="cell-label">01.B // LIDERANÇA & EDUCAÇÃO</span>
                  <div className="timeline-list">
                    <div className="timeline-item">
                      <div className="timeline-top">
                        <strong>Google Student Ambassador</strong>
                        <span>2026 – ATUAL · REMOTO</span>
                      </div>
                      <p>
                        Atuação em iniciativa estudantil do Google voltada à comunidade
                        acadêmica, engenharia com IA Generativa (Gemini) e aprendizagem
                        colaborativa.
                      </p>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-top">
                        <strong>FATEC Mogi das Cruzes</strong>
                        <span>2025 – 2028 · PRESENCIAL</span>
                      </div>
                      <p>Tecnólogo em Análise e Desenvolvimento de Sistemas.</p>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita (5 cols): Histórico Profissional */}
                <div className="inspector-cell inspector-cell--span-5">
                  <span className="cell-label">01.C // HISTÓRICO PROFISSIONAL</span>
                  <div className="timeline-list">
                    <div className="timeline-item">
                      <div className="timeline-top">
                        <strong>CIEE · Suporte Técnico</strong>
                        <span>2026 – ATUAL</span>
                      </div>
                      <p>
                        Investigação de chamados internos e diagnóstico de causa-raiz em
                        hardware, software e sistemas corporativos.
                      </p>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-top">
                        <strong>Loja Vivi Plus · Marketplace</strong>
                        <span>MAI/2025 – SET/2025</span>
                      </div>
                      <p>
                        Gestão de <strong>+200 anúncios</strong> no Mercado Livre e Shopee;
                        automação de conferências manuais de pedidos e controle de estoque.
                      </p>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-top">
                        <strong>Plena Saúde Life Mogi</strong>
                        <span className="metric-inline">-40% TEMPO OPS</span>
                      </div>
                      <p>
                        Desenvolveu planilhas em Excel VBA (Fev/2021 – Fev/2024) que
                        reduziram em até 40% o tempo de rotinas operacionais e padronizaram
                        cadastros administrativos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 02: STACK TÉCNICA, CERTIFICAÇÕES & CURRÍCULO */}
            {activeSpot === 'livro' && (
              <div className="inspector-hairline-grid">
                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">02.A // DADOS, BI & AUTOMAÇÃO IA</span>
                  <div className="spec-rows">
                    <div className="spec-row">
                      <span className="spec-key">DADOS & ETL</span>
                      <span className="spec-val">
                        SQL (Modelagem Relacional) · Python · Pandas
                      </span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">BI & ANALYTICS</span>
                      <span className="spec-val">
                        Power BI · Excel (Tabelas Dinâmicas & VBA) · QuickSight
                      </span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">RPA & IA</span>
                      <span className="spec-val">
                        Playwright · TypeScript · Gemini · Claude · GitHub Copilot
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">02.B // SISTEMAS, BACKEND & INFRA</span>
                  <div className="spec-rows">
                    <div className="spec-row">
                      <span className="spec-key">BACKEND</span>
                      <span className="spec-val">
                        Java · Spring Boot · APIs REST · Arquitetura em Camadas
                      </span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">BANCOS SQL</span>
                      <span className="spec-val">
                        MySQL · SQL Server · Oracle SQL Developer · SQLite
                      </span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-key">AMBIENTE</span>
                      <span className="spec-val">
                        Git · Linux · Windows · Redes (Cisco CCNA) · Inglês Avançado (Leitura/Listening)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inspector-cell inspector-cell--span-12">
                  <span className="cell-label">
                    02.C // CERTIFICAÇÕES & FORMAÇÃO COMPLEMENTAR
                  </span>
                  <div className="cert-grid">
                    <div className="cert-item">
                      <span>AWS</span>
                      <strong>AWS Certified AI Practitioner</strong>
                      <em>Exame agendado · Nov/2026</em>
                    </div>
                    <div className="cert-item">
                      <span>ITAÚ + DIO</span>
                      <strong>Bootcamp Itaú Java + IA & Azure AI-103</strong>
                      <em>Engenharia Backend e Agentes no Azure</em>
                    </div>
                    <div className="cert-item">
                      <span>GOOGLE & CISCO</span>
                      <strong>Generative AI com Gemini · CCNA Redes</strong>
                      <em>Google Cloud Skills Boost & Cisco Academy</em>
                    </div>
                    <div className="cert-item">
                      <span>DSA & UDEMY</span>
                      <strong>Power BI · Java Completo (POO + Projetos)</strong>
                      <em>Data Science Academy & Nélio Alves</em>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 03: CONTATO DIRETO & DOWNLOAD DO CURRÍCULO */}
            {activeSpot === 'barco' && (
              <div className="inspector-hairline-grid">
                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">03.A // E-MAIL DIRETO</span>
                  <a
                    href="mailto:diegoaugustooliveira3@gmail.com"
                    className="channel-row-link"
                  >
                    <strong>diegoaugustooliveira3@gmail.com</strong>
                    <span>ENVIAR E-MAIL ↗</span>
                  </a>
                </div>

                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">03.B // TELEFONE & WHATSAPP</span>
                  <a
                    href="https://wa.me/5511953692873"
                    target="_blank"
                    rel="noreferrer"
                    className="channel-row-link"
                  >
                    <strong>(11) 95369-2873</strong>
                    <span>MOGI DAS CRUZES, SP ↗</span>
                  </a>
                </div>

                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">03.C // LINKEDIN</span>
                  <a
                    href="https://www.linkedin.com/in/diego-augusto-7aa1a2303"
                    target="_blank"
                    rel="noreferrer"
                    className="channel-row-link"
                  >
                    <strong>linkedin.com/in/diego-augusto-7aa1a2303</strong>
                    <span>PERFIL OFICIAL ↗</span>
                  </a>
                </div>

                <div className="inspector-cell inspector-cell--span-6">
                  <span className="cell-label">03.D // GITHUB</span>
                  <a
                    href="https://github.com/diego-dev-brazil"
                    target="_blank"
                    rel="noreferrer"
                    className="channel-row-link"
                  >
                    <strong>github.com/diego-dev-brazil</strong>
                    <span>21 REPOSITÓRIOS ↗</span>
                  </a>
                </div>

                <div className="inspector-cell inspector-cell--span-12 inspector-cell--footer-bar">
                  <div>
                    <span className="cell-label">03.E // DOCUMENTO OFICIAL</span>
                    <p className="cell-prose-compact">
                      Currículo atualizado com experiências no CIEE, Loja Vivi Plus, Plena
                      Saúde, FATEC e Google Student Ambassador.
                    </p>
                  </div>
                  <div className="inspector-footer-actions">
                    <a
                      href={CV_FILE_PATH}
                      download={CV_DOWNLOAD_NAME}
                      className="cv-download-btn"
                    >
                      <span>Baixar Currículo PDF</span>
                      <span className="cv-download-arrow">↓</span>
                    </a>
                    <a
                      href="#projetos"
                      onClick={() => setActiveSpot(null)}
                      className="cv-preview-btn"
                    >
                      Ver Projetos no Mar ↓
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
