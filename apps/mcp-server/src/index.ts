#!/usr/bin/env node

/**
 * DevReview MCP Server
 *
 * Módulo 1: server mínimo com tool mockada e transporte STDIO.
 * Módulo 4: tools reais conectadas ao Supabase.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ID fixo do time demo (correspondente a supabase/seed.sql)
export const DEMO_TEAM_ID = "11111111-1111-1111-1111-111111111111";

export interface MockReviewRule {
  id: string;
  team_id: string;
  category: "style" | "architecture" | "security" | "performance";
  severity: "error" | "warning" | "info";
  rule: string;
  active: boolean;
}

/**
 * Catálogo de regras de code review mockadas (alinhado com supabase/seed.sql).
 */
export const MOCK_REVIEW_RULES: MockReviewRule[] = [
  {
    id: "r-1",
    team_id: DEMO_TEAM_ID,
    category: "security",
    severity: "error",
    rule: "Nunca expor chaves de API ou tokens em código-fonte",
    active: true
  },
  {
    id: "r-2",
    team_id: DEMO_TEAM_ID,
    category: "architecture",
    severity: "error",
    rule: "Separar lógica de negócio da camada de apresentação",
    active: true
  },
  {
    id: "r-3",
    team_id: DEMO_TEAM_ID,
    category: "performance",
    severity: "warning",
    rule: "Evitar renderizações desnecessárias em componentes React",
    active: true
  },
  {
    id: "r-4",
    team_id: DEMO_TEAM_ID,
    category: "style",
    severity: "warning",
    rule: "Usar nomenclatura camelCase para variáveis e funções",
    active: true
  },
  {
    id: "r-5",
    team_id: DEMO_TEAM_ID,
    category: "architecture",
    severity: "warning",
    rule: "Evitar dependências circulares entre módulos",
    active: false
  },
  {
    id: "r-6",
    team_id: DEMO_TEAM_ID,
    category: "style",
    severity: "info",
    rule: "Documentar funções públicas com JSDoc",
    active: true
  },
  {
    id: "r-7",
    team_id: DEMO_TEAM_ID,
    category: "performance",
    severity: "info",
    rule: "Utilizar lazy loading para rotas secundárias",
    active: true
  },
  {
    id: "r-8",
    team_id: DEMO_TEAM_ID,
    category: "security",
    severity: "warning",
    rule: "Validar e sanitizar todos os inputs do usuário",
    active: true
  }
];

// Schema Zod para parâmetros da tool get_review_rules
const getReviewRulesSchema = {
  category: z
    .enum(["style", "architecture", "security", "performance"])
    .optional()
    .describe("Categoria das regras de revisão desejadas"),
  severity: z
    .enum(["error", "warning", "info"])
    .optional()
    .describe("Nível de severidade da regra (error, warning, info)"),
  activeOnly: z
    .boolean()
    .default(true)
    .optional()
    .describe("Se verdadeiro, retorna apenas regras ativas")
};

// Inicialização do servidor MCP com metadados do projeto
const server = new McpServer({
  name: "devreview-mcp",
  version: "1.0.0"
});

// Registro da tool inicial get_review_rules
server.tool(
  "get_review_rules",
  "Recupera a lista de diretrizes e regras de code review do DevReview com filtros opcionais.",
  getReviewRulesSchema,
  async ({ category, severity, activeOnly = true }) => {
    // ATENÇÃO: Logs devem ser direcionados sempre para stderr em servidores STDIO
    console.error("[devreview-mcp] get_review_rules chamado com filtros:", {
      category,
      severity,
      activeOnly
    });

    let rules = MOCK_REVIEW_RULES;

    if (activeOnly) {
      rules = rules.filter((r) => r.active);
    }

    if (category) {
      rules = rules.filter((r) => r.category === category);
    }

    if (severity) {
      rules = rules.filter((r) => r.severity === severity);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(rules, null, 2)
        }
      ]
    };
  }
);

// Inicialização do transporte STDIO
async function main() {
  const transport = new StdioServerTransport();
  console.error("[devreview-mcp] Iniciando transporte STDIO...");
  await server.connect(transport);
  console.error("[devreview-mcp] Servidor MCP pronto e ouvindo no STDIO.");
}

main().catch((error) => {
  console.error("[devreview-mcp] Erro fatal na inicialização:", error);
  process.exit(1);
});
