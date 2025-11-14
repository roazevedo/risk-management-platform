
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

export const getInherentRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 3) return { level: 'Muito Baixo', color: 'bg-green-500' };
    if (score <= 7) return { level: 'Baixo', color: 'bg-lime-500' };
    if (score <= 10) return { level: 'Médio', color: 'bg-yellow-500' };
    if (score <= 15) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Crítico', color: 'bg-red-500' };
};

export const getResidualRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 3) return { level: 'Muito Baixo', color: 'bg-green-500' };
    if (score <= 7) return { level: 'Baixo', color: 'bg-lime-500' };
    if (score <= 10) return { level: 'Médio', color: 'bg-yellow-500' };
    if (score <= 15) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Crítico', color: 'bg-red-500' };
};
