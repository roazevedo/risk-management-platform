/**
 * Schema Zod para validação de Controles
 *
 * Validações específicas de negócio:
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
} from '@/constants';
import { historyEntrySchema } from './process.schema';

/**
 * Schema completo para Control
 */
export const controlSchema = z.object({
  id: z.string().uuid().optional(),
  riskId: z.string().uuid('ID de risco inválido'),

  // Identificação
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

  // Responsável e Implementação
  responsible: z.string()
    .min(2, 'Responsável é obrigatório')
    .max(100, 'Nome do responsável muito longo')
    .trim(),
  implementationMethod: z.string()
    .min(5, 'Método de implementação é obrigatório')
    .max(1000, 'Método de implementação muito longo')
    .trim(),
  macroSteps: z.string()
    .min(5, 'Macro etapas são obrigatórias')
    .max(1000, 'Macro etapas muito longas')
    .trim(),

  // Datas
  plannedStartDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal('')), // Pode ser vazio
  plannedEndDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal('')), // Pode ser vazio
  actualEndDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .or(z.literal('')), // Pode ser vazio

  // Outros
  involvedSectors: z.array(z.string().trim()).default([]),
  adequacyAnalysis: z.string()
    .max(1000, 'Análise de adequação muito longa')
    .or(z.literal(''))
    .default(''),

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
