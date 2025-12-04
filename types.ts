import {
    RISK_TYPES,
    RISK_ASSOCIATIONS,
    RISK_DIMENSIONS,
    RISK_RESPONSES,
    CONTROL_TYPES,
    CONTROL_NATURES,
    CONTROL_RELATIONS,
    CONTROL_STATUS,
    CONTROL_NEW_MODIFIED
} from '@/constants'; // Certifique-se que o caminho aponta para o constants.ts novo

// --- ENUMS GERAIS ---
export enum View {
  DASHBOARD = 'DASHBOARD',
  PROCESSES = 'PROCESSES',
  RISKS = 'RISKS',
  CONTROLS = 'CONTROLS',
}

export interface HistoryEntry {
  timestamp: string;
  user: string;
  justification: string;
  changes: string;
}

// --- PROCESSOS ---
export interface Process {
  id: string;
  name: string;
  sector: string;
  manager: string;
  responsibleServers: string[];
  legalBasis: string;
  systemsUsed: string[];
  stakeholders: string[];
  history: HistoryEntry[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// --- RISCOS (Tipos Derivados) ---

// Aqui acontece a mágica: O TypeScript pega os valores do array 'as const'
export type RiskType = typeof RISK_TYPES[number];
export type RiskAssociation = typeof RISK_ASSOCIATIONS[number];
export type RiskDimension = typeof RISK_DIMENSIONS[number];
export type RiskResponse = typeof RISK_RESPONSES[number];

export interface Risk {
  id: string;
  processId: string;
  name: string;
  identificationDate: string;

  // Usando os tipos derivados
  type: RiskType;
  association: RiskAssociation;

  causes: string;
  consequences: string;

  // Array de dimensões derivadas
  dimensions: RiskDimension[];

  // Dados Quantitativos
  probability: number; // 1-5
  probabilityJustification: string;
  impact: number; // 1-5
  impactJustification: string;
  inherentRisk: number;

  // Controles e FAC
  controlsExist: boolean;
  isControlEffective: boolean;
  isControlProportional: boolean;
  isControlReasonable: boolean;
  isControlAdequate: boolean;
  fac: number;

  residualRisk: number;

  suggestedResponse: RiskResponse;
  maxImplementationDate: string;
  isLgpdRelated: boolean;
  history: HistoryEntry[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// --- CONTROLES (Tipos Derivados) ---

export type ControlStatus = typeof CONTROL_STATUS[number];
export type ControlType = typeof CONTROL_TYPES[number];
export type ControlNature = typeof CONTROL_NATURES[number];
export type ControlRelation = typeof CONTROL_RELATIONS[number];
export type ControlNewOrModified = typeof CONTROL_NEW_MODIFIED[number];

export interface Control {
  id: string;
  riskId: string;
  name: string;
  implemented: boolean;

  // Usando os tipos derivados
  status: ControlStatus;
  newOrModified: ControlNewOrModified;
  type: ControlType;
  nature: ControlNature;
  relationToRisk: ControlRelation;

  responsible: string;
  implementationMethod: string;
  macroSteps: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate: string;
  involvedSectors: string[];
  adequacyAnalysis: string;
  history: HistoryEntry[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
