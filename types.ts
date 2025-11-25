
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
}

export type RiskType = 'Suporte' | 'Operacional';
export type RiskAssociation = 'Processo' | 'Projeto';
export type RiskDimension = 'Operacional' | 'Conformidade' | 'Imagem' | 'Estratégico' | 'Sancionatório' | 'Privacidade';
export type RiskResponse = 'Evitar' | 'Reduzir' | 'Eliminar' | 'Aceitar' | 'Compartilhar' | 'Potencializar';

export interface Risk {
    id: string;
    processId: string;
    name: string;
    identificationDate: string;
    type: RiskType;
    association: RiskAssociation;
    causes: string;
    consequences: string;
    dimensions: RiskDimension[];
    probability: number; // 1-5
    probabilityJustification: string;
    impact: number; // 1-5
    impactJustification: string;
    inherentRisk: number;
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
}

export type ControlStatus = 'on-time' | 'near-due' | 'overdue';
export type ControlType = 'Preventivo' | 'Corretivo';
export type ControlNature = 'Manual' | 'Automatizado' | 'Híbrido';
export type ControlRelation = 'Direto' | 'Indireto';
export type ControlNewOrModified = 'Novo' | 'Modificado';

export interface Control {
    id: string;
    riskId: string;
    name: string;
    implemented: boolean;
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
}
