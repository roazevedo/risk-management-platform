/**
 * Schema Zod para validação de Riscos
 *
 * Validações específicas de negócio:
 * - Probabilidade e Impacto: 1-5
 * - FAC: 0.2-1.0
 * - Risco Inerente: 1-25 (calculado automaticamente)
 * - Risco Residual: 0-25 (calculado automaticamente)
 *
 * SEGURANÇA: Previne dados inválidos que poderiam corromper análises de risco
 */

import { z } from 'zod';
import {
  RISK_TYPES,
  RISK_ASSOCIATIONS,
  RISK_DIMENSIONS,
  RISK_RESPONSES,
} from '@/constants';
import { historyEntrySchema } from './process.schema';

/**
 * Schema completo para Risk
 */
export const riskSchema = z.object({
  id: z.string().uuid().optional(),
  processId: z.string().uuid('ID de processo inválido'),

  // Identificação
  name: z.string()
    .min(5, 'Nome do risco muito curto (mínimo 5 caracteres)')
    .max(200, 'Nome do risco muito longo (máximo 200 caracteres)')
    .trim(),
  identificationDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),

  // Tipos derivados das constantes
  type: z.enum(RISK_TYPES as unknown as [string, ...string[]]),
  association: z.enum(RISK_ASSOCIATIONS as unknown as [string, ...string[]]),

  // Detalhes
  causes: z.string()
    .min(5, 'Causas do risco são obrigatórias')
    .max(1000, 'Causas muito longas')
    .trim(),
  consequences: z.string()
    .min(5, 'Consequências do risco são obrigatórias')
    .max(1000, 'Consequências muito longas')
    .trim(),
  dimensions: z.array(z.enum(RISK_DIMENSIONS as unknown as [string, ...string[]]))
    .min(1, 'Selecione ao menos uma dimensão'),

  // Análise Quantitativa
  probability: z.number()
    .int('Probabilidade deve ser um número inteiro')
    .min(1, 'Probabilidade mínima é 1')
    .max(5, 'Probabilidade máxima é 5'),
  probabilityJustification: z.string()
    .min(5, 'Justificativa de probabilidade é obrigatória')
    .max(500, 'Justificativa de probabilidade muito longa')
    .trim(),
  impact: z.number()
    .int('Impacto deve ser um número inteiro')
    .min(1, 'Impacto mínimo é 1')
    .max(5, 'Impacto máximo é 5'),
  impactJustification: z.string()
    .min(5, 'Justificativa de impacto é obrigatória')
    .max(500, 'Justificativa de impacto muito longa')
    .trim(),
  inherentRisk: z.number()
    .min(0, 'Risco inerente não pode ser negativo')
    .max(25, 'Risco inerente máximo é 25'),

  // Controles existentes
  controlsExist: z.boolean(),
  isControlEffective: z.boolean(),
  isControlProportional: z.boolean(),
  isControlReasonable: z.boolean(),
  isControlAdequate: z.boolean(),
  fac: z.number()
    .min(0.2, 'FAC mínimo é 0.2 (Forte)')
    .max(1.0, 'FAC máximo é 1.0 (Ineficaz)'),

  // Risco Residual
  residualRisk: z.number()
    .min(0, 'Risco residual não pode ser negativo')
    .max(25, 'Risco residual máximo é 25'),

  // Resposta ao Risco
  suggestedResponse: z.enum(RISK_RESPONSES as unknown as [string, ...string[]]),
  maxImplementationDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal('')), // Pode ser vazio

  // LGPD
  isLgpdRelated: z.boolean(),

  // Auditoria
  history: z.array(historyEntrySchema).default([]),
  createdAt: z.union([z.date(), z.string().datetime()]).optional(),
  updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
}).refine(
  (data) => {
    // Validação customizada: Risco Inerente = Probabilidade × Impacto
    const calculatedInherent = data.probability * data.impact;
    return Math.abs(data.inherentRisk - calculatedInherent) < 0.01;
  },
  {
    message: 'Risco inerente deve ser igual a Probabilidade × Impacto',
    path: ['inherentRisk'],
  }
).refine(
  (data) => {
    // Validação customizada: Risco Residual = Risco Inerente × FAC
    const calculatedResidual = data.inherentRisk * data.fac;
    return Math.abs(data.residualRisk - calculatedResidual) < 0.1;
  },
  {
    message: 'Risco residual deve ser igual a Risco Inerente × FAC',
    path: ['residualRisk'],
  }
).refine(
  (data) => {
    // Validação lógica: Se controles não existem, FAC deve ser 1.0
    if (!data.controlsExist) {
      return data.fac === 1.0;
    }
    return true;
  },
  {
    message: 'Sem controles, FAC deve ser 1.0 (Ineficaz)',
    path: ['fac'],
  }
).refine(
  (data) => {
    // Validação lógica: Se controles existem mas não são efetivos, FAC deve ser 1.0
    if (data.controlsExist && !data.isControlEffective) {
      return data.fac === 1.0;
    }
    return true;
  },
  {
    message: 'Controles inefetivos devem ter FAC 1.0',
    path: ['fac'],
  }
);

/**
 * Schema para criação de risco (sem ID)
 */
export const createRiskSchema = riskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema para atualização de risco (ID obrigatório)
 */
export const updateRiskSchema = riskSchema.required({ id: true });

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type RiskInput = z.infer<typeof riskSchema>;
export type CreateRiskInput = z.infer<typeof createRiskSchema>;
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;
