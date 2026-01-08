/**
 * Schema Zod para validação de Controles
 *
 * Validações específicas de negócio:
 * - Apenas o nome do controle é obrigatório
 * - Datas devem estar em formato ISO (YYYY-MM-DD)
 * - Data de início deve ser anterior à data de fim
 * - Se implementado, deve ter data de fim real
 *
 * SEGURANÇA: Previne dados inválidos e garante consistência de datas
 */

import { z } from 'zod';
import {
  CONTROL_TYPES,
  CONTROL_NATURES,
  CONTROL_RELATIONS,
  CONTROL_STATUS,
  CONTROL_NEW_MODIFIED,
} from '@/src/constants/constants';
import { historyEntrySchema } from './process.schema';

/**
 * Schema completo para Control
 */
export const controlSchema = z.object({
  // ID: Aceita UUID, string vazia ou IDs temporários (começam com 'c')
  id: z.union([
    z.string().uuid(),
    z.string().startsWith('c'),
    z.literal(''),
    z.undefined()
  ]).optional().transform(val => val === '' ? undefined : val),

  riskId: z.string().uuid('ID de risco inválido'),

  // Identificação - APENAS O NOME É OBRIGATÓRIO
  name: z.string()
    .min(5, 'Nome do controle muito curto (mínimo 5 caracteres)')
    .max(200, 'Nome do controle muito longo (máximo 200 caracteres)')
    .trim(),

  // Status
  implemented: z.boolean(),
  status: z.enum(CONTROL_STATUS as unknown as [string, ...string[]]),
  newOrModified: z.enum(CONTROL_NEW_MODIFIED as unknown as [string, ...string[]]),

  // Classificação
  type: z.enum(CONTROL_TYPES as unknown as [string, ...string[]]),
  nature: z.enum(CONTROL_NATURES as unknown as [string, ...string[]]),
  relationToRisk: z.enum(CONTROL_RELATIONS as unknown as [string, ...string[]]),

  // Responsável e Implementação - AGORA OPCIONAIS
  responsible: z.string()
    .max(100, 'Nome do responsável muito longo')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  implementationMethod: z.string()
    .max(1000, 'Método de implementação muito longo')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  macroSteps: z.string()
    .max(1000, 'Macro etapas muito longas')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  // Datas - Opcionais
  plannedStartDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? undefined : val),

  plannedEndDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? undefined : val),

  actualEndDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal(''))
    .optional()
    .transform(val => val === '' ? undefined : val),

  // Outros - Opcionais
  involvedSectors: z.array(z.string().trim()).default([]),
  adequacyAnalysis: z.string()
    .max(1000, 'Análise de adequação muito longa')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),

  // Auditoria
  history: z.array(historyEntrySchema).default([]),
  createdAt: z.union([z.date(), z.string().datetime()]).optional(),
  updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
}).refine(
  (data) => {
    // Validação: Se implementado, deve ter data de fim real
    if (data.implemented && !data.actualEndDate) {
      return false;
    }
    return true;
  },
  {
    message: 'Controle implementado deve ter data de fim real',
    path: ['actualEndDate'],
  }
).refine(
  (data) => {
    // Validação: Data de início deve ser anterior à data de fim planejada
    if (data.plannedStartDate && data.plannedEndDate) {
      const startDate = new Date(data.plannedStartDate);
      const endDate = new Date(data.plannedEndDate);
      return startDate <= endDate;
    }
    return true;
  },
  {
    message: 'Data de início deve ser anterior à data de fim',
    path: ['plannedEndDate'],
  }
).refine(
  (data) => {
    // Validação: Se tem data de fim real, deve ser posterior à data de início
    if (data.plannedStartDate && data.actualEndDate) {
      const startDate = new Date(data.plannedStartDate);
      const actualEndDate = new Date(data.actualEndDate);
      return startDate <= actualEndDate;
    }
    return true;
  },
  {
    message: 'Data de fim real deve ser posterior à data de início',
    path: ['actualEndDate'],
  }
);

/**
 * Schema para criação de controle (sem ID e sem status - será calculado)
 */
export const createControlSchema = controlSchema.omit({
  id: true,
  status: true, // Status é calculado automaticamente
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema para atualização de controle (ID obrigatório)
 */
export const updateControlSchema = controlSchema.required({ id: true });

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type ControlInput = z.infer<typeof controlSchema>;
export type CreateControlInput = z.infer<typeof createControlSchema>;
export type UpdateControlInput = z.infer<typeof updateControlSchema>;
