
import type { RiskType, RiskAssociation, RiskDimension, RiskResponse, ControlType, ControlNature, ControlRelation } from './types';

export const RISK_TYPES: RiskType[] = ['Operacional', 'Suporte'];
export const RISK_ASSOCIATIONS: RiskAssociation[] = ['Processo', 'Projeto'];
export const RISK_DIMENSIONS: RiskDimension[] = ['Operacional', 'Conformidade', 'Imagem', 'Estratégico', 'Sancionatório', 'Privacidade'];
export const RISK_RESPONSES: RiskResponse[] = ['Aceitar', 'Compartilhar', 'Eliminar', 'Evitar', 'Potencializar', 'Reduzir'];

export const PROBABILITY_IMPACT_SCALE = [
    { value: 1, label: 'Muito Baixa' },
    { value: 2, label: 'Baixa' },
    { value: 3, label: 'Média' },
    { value: 4, label: 'Alta' },
    { value: 5, label: 'Muito Alta' },
];

export const CONTROL_TYPES: ControlType[] = ['Preventivo', 'Corretivo'];
export const CONTROL_NATURES: ControlNature[] = ['Manual', 'Automatizado', 'Híbrido'];
export const CONTROL_RELATIONS: ControlRelation[] = ['Direto', 'Indireto'];

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

// ... (outras constantes existentes: RISK_TYPES, riskLabels, etc.)

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
