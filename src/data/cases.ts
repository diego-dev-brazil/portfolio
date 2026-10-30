import type { CaseStudy } from '../types/portfolio';

export const cases: CaseStudy[] = [
  {
    "id": "shopee-rpa",
    "index": "01 // RPA & AUTOMATION",
    "pillar": "AUTOMATION",
    "title": "Shopee Order Collector — Automação de Pedidos e Estoque",
    "impactBadge": "-12h/sem operação manual · +200 SKUs",
    "bottleneck": "Conferência manual de pedidos lançados na Shopee exigia copiar ID, variação e quantidade item a item para atualizar o controle de estoque.",
    "solution": "Sistema de web scraping e automação com Playwright, TypeScript e Docker que coleta os pedidos lançados, normaliza os dados e gera um arquivo JSON estruturado para controle de estoque.",
    "architectureFlow": "[Shopee Pedidos] -> [Playwright + TypeScript] -> [Parser de Estoque] -> [JSON Estruturado]",
    "stack": [
      "TypeScript",
      "Playwright",
      "Node.js",
      "Docker",
      "JSON"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/automacao-shoppe-playwright",
    "liveMetrics": {
      "label": "IMPACTO",
      "value": "-12h/sem · +200 SKUs -> JSON"
    }
  },
  {
    "id": "clinic-financial-bi",
    "index": "02 // DATA PIPELINE & ORACLE SQL",
    "pillar": "INTERNAL_TOOL",
    "title": "Data-Driven Clínica de Psicologia — ETL, Modelagem Oracle & LGPD",
    "impactBadge": "+10 planilhas → Oracle Database · LGPD",
    "bottleneck": "Históricos de atendimentos e controles financeiros estavam espalhados em mais de 10 planilhas manuais sem modelagem relacional, dicionário de dados ou anonimização.",
    "solution": "Unificação e higienização dos dados com Python/Pandas e modelagem relacional completa em Oracle Database (Oracle Data Modeler, SQL Developer e SQL Plus), com cargas estruturadas e consultas analíticas SQL.",
    "architectureFlow": "[+10 Planilhas] -> [Python/Pandas & LGPD] -> [Oracle Data Modeler] -> [Oracle SQL Queries]",
    "stack": [
      "Oracle Database",
      "SQL",
      "Oracle Data Modeler",
      "Python",
      "Pandas"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/Data-Driven-Clinica-de-Psicologia",
    "liveMetrics": {
      "label": "BANCO DE DADOS",
      "value": "Oracle SQL + Modelo Relacional"
    }
  },
  {
    "id": "open-prompts-br",
    "index": "03 // PROMPT ENGINEERING & OPEN SOURCE",
    "pillar": "AI_AGENT",
    "title": "Open Prompts BR — Curadoria Open-Source de Prompts (Google Student Ambassador)",
    "impactBadge": "Open Source · Google Ambassador 2026",
    "bottleneck": "Falta de estruturas padronizadas e validadas em português para uso prático de IA Generativa em estudos, entrevistas técnicas, código e produtividade.",
    "solution": "Repositório open-source criado a partir da iniciativa como Google Student Ambassador 2026, organizando guias e templates parametrizados ([colchetes]) em Markdown e PDF para Carreira (STAR), Programação (Code Review), Idiomas e Negócios.",
    "architectureFlow": "[Diretórios Temáticos] -> [Templates Markdown & PDF] -> [Placeholders [Contexto]] -> [Gemini / Claude]",
    "stack": [
      "Prompt Engineering",
      "Gemini",
      "Claude",
      "Markdown",
      "Open Source"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/open-prompts-br",
    "liveMetrics": {
      "label": "COMUNIDADE",
      "value": "open-prompts-br (GitHub)"
    }
  },
  {
    "id": "ai-workflow-api",
    "index": "04 // PYTHON & FASTAPI WORKFLOW",
    "pillar": "AI_AGENT",
    "title": "AI Workflow API — Classificação e Roteamento Automático de Chamados",
    "impactBadge": "FastAPI · Webhook & Triagem JSON",
    "bottleneck": "Triagem manual de mensagens de clientes sobre erros técnicos, boletos/pagamentos e dúvidas comerciais atrasava o encaminhamento para a equipe correta.",
    "solution": "API em Python e FastAPI com validação Pydantic que recebe textos via POST /webhook, classifica automaticamente a demanda (suporte, financeiro, vendas ou geral), gera resumo e define a ação de roteamento persistindo em dados.json.",
    "architectureFlow": "[POST /webhook] -> [FastAPI + Pydantic] -> [Classificador & Resumo] -> [Roteamento + JSON]",
    "stack": [
      "Python",
      "FastAPI",
      "Pydantic",
      "REST Webhook",
      "JSON"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/ai-workflow-api",
    "liveMetrics": {
      "label": "WORKFLOW",
      "value": "POST /webhook -> Triagem Automática"
    }
  },
  {
    "id": "cnpj-viacep-api",
    "index": "05 // JAVA & SPRING BOOT API",
    "pillar": "INTERNAL_TOOL",
    "title": "Spring Design Patterns API — Java, Spring Boot & OpenFeign (ViaCEP)",
    "impactBadge": "Java & Spring Boot · Design Patterns",
    "bottleneck": "Cadastros de clientes exigiam preenchimento manual de endereço por CEP e acoplamento direto a chamadas HTTP repetitivas.",
    "solution": "API REST em Java e Spring Boot aplicando padrões de projeto (Singleton, Strategy e Facade) com cliente HTTP declarativo OpenFeign integrado ao ViaCEP e persistência relacional via Spring Data JPA.",
    "architectureFlow": "[Cliente REST] -> [Spring Boot Facade] -> [OpenFeign Client] -> [ViaCEP + Spring Data JPA]",
    "stack": [
      "Java",
      "Spring Boot",
      "Spring Data JPA",
      "OpenFeign",
      "REST API"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/spring-design-patterns-api",
    "liveMetrics": {
      "label": "ARQUITETURA",
      "value": "Strategy + Facade + OpenFeign"
    }
  },
  {
    "id": "spring-project-atelie-renata-d-amore",
    "index": "06 // RAPID MVP & PRODUCT",
    "pillar": "RAPID_MVP",
    "title": "Spring Project Atelie Renata D Amore",
    "impactBadge": "HTML · GitHub",
    "bottleneck": "Projeto para engenharia de software III",
    "solution": "Implementado no repositório spring-project-atelie-renata-d-amore utilizando HTML, Java, JavaScript, CSS com código versionado no GitHub.",
    "architectureFlow": "[Entrada] -> [HTML] -> [Java] -> [Output]",
    "stack": [
      "HTML",
      "Java",
      "JavaScript",
      "CSS"
    ],
    "repoUrl": "https://github.com/diego-dev-brazil/spring-project-atelie-renata-d-amore",
    "liveMetrics": {
      "label": "GITHUB",
      "value": "spring-project-atelie-renata-d-amore (0★)"
    }
  }
];
