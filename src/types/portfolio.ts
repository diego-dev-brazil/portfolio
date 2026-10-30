// src/types/portfolio.ts
export type PillarType = 'AUTOMATION' | 'INTERNAL_TOOL' | 'AI_AGENT' | 'RAPID_MVP';

export interface CaseStudy {
  id: string;
  index: string;           // ex: "01 // RPA & AUTOMATION"
  pillar: PillarType;
  title: string;
  impactBadge: string;     // ex: "-12h/sem operação manual"
  bottleneck: string;      // O problema de negócio
  solution: string;        // A alavanca construída com IA/código
  architectureFlow: string;// ex: "[Shopee Seller] -> [Playwright] -> [JSON/DB]"
  stack: string[];
  repoUrl?: string;
  demoUrl?: string;
  liveMetrics?: { label: string; value: string }; // Preenchido via API do Agente Back
}