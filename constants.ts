// app/lib/constants.ts

// --- RISCOS ---

// Usamos 'as const' para que o TypeScript entenda que esses valores são fixos e não apenas strings genéricas.
export const RISK_TYPES = [
    'Operacional',
    'Suporte'
] as const;

export const RISK_ASSOCIATIONS = [
    'Processo',
    'Projeto'
] as const;

export const RISK_DIMENSIONS = [
    'Operacional',
    'Conformidade',
    'Imagem',
    'Estratégico',
    'Sancionatório',
    'Privacidade'
] as const;

export const RISK_RESPONSES = [
    'Aceitar',
    'Compartilhar',
    'Eliminar',
    'Evitar',
    'Potencializar',
    'Reduzir'
] as const;

// Escala não usa 'as const' porque é um array de objetos complexos
export const PROBABILITY_IMPACT_SCALE = [
    { value: 1, label: 'Muito Baixa' },
    { value: 2, label: 'Baixa' },
    { value: 3, label: 'Média' },
    { value: 4, label: 'Alta' },
    { value: 5, label: 'Muito Alta' },
];

// --- CONTROLES ---

export const CONTROL_TYPES = [
    'Preventivo',
    'Corretivo'
] as const;

export const CONTROL_NATURES = [
    'Manual',
    'Automatizado',
    'Híbrido'
] as const;

export const CONTROL_RELATIONS = [
    'Direto',
    'Indireto'
] as const;

export const CONTROL_STATUS = [
    'on-time',
    'near-due',
    'overdue'
] as const;

export const CONTROL_NEW_MODIFIED = [
    'Novo',
    'Modificado'
] as const;

// --- LABELS (Rótulos para exibição em tabelas/detalhes) ---

export const riskLabels: Record<string, string> = {
    id: "ID",
    processId: "ID do Processo",
    name: "Nome",
    identificationDate: "Data de Identificação",
    type: "Tipo",
    association: "Associação",
    causes: "Causas",
    consequences: "Consequências",
    dimensions: "Dimensões",
    probability: "Probabilidade",
    probabilityJustification: "Justificativa da Probabilidade",
    impact: "Impacto",
    impactJustification: "Justificativa do Impacto",
    inherentRisk: "Risco Inerente",
    controlsExist: "Controles Existem",
    isControlEffective: "Controle Eficaz",
    isControlProportional: "Controle Proporcional",
    isControlReasonable: "Controle Razoável",
    isControlAdequate: "Controle Adequado",
    fac: "FAC",
    residualRisk: "Risco Residual",
    suggestedResponse: "Resposta Sugerida",
    maxImplementationDate: "Data Máxima de Implantação",
    isLgpdRelated: "Relação com LGPD",
    history: "Histórico"
};

export const controlLabels: Record<string, string> = {
    id: "ID",
    riskId: "ID do Risco",
    name: "Nome",
    implemented: "Implementado",
    status: "Status",
    newOrModified: "Novo ou Modificado",
    type: "Tipo",
    nature: "Natureza",
    relationToRisk: "Relação com Risco",
    responsible: "Responsável",
    implementationMethod: "Método de Implantação",
    macroSteps: "Macroetapas",
    plannedStartDate: "Data de Início Prevista",
    plannedEndDate: "Data de Fim Prevista",
    actualEndDate: "Data de Fim Real",
    involvedSectors: "Setores Envolvidos",
    adequacyAnalysis: "Análise de Adequação",
    history: "Histórico"
};
