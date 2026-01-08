/**
 * Schema Zod para validação de Processos
 *
 * Este schema é usado tanto no client-side (React Hook Form) quanto no server-side (Server Actions)
 * para garantir que apenas dados válidos sejam salvos no banco de dados.
 *
 * SEGURANÇA: A validação server-side é CRÍTICA para prevenir:
 * - Injection attacks
 * - Dados malformados
 * - Campos obrigatórios faltando
 */

import { z } from 'zod';

/**
 * Schema para HistoryEntry
 */
export const historyEntrySchema = z.object({
  timestamp: z.string().datetime(),
  user: z.string().min(1, 'Usuário é obrigatório'),
  justification: z.string().min(1, 'Justificativa é obrigatória'),
  changes: z.string().min(1, 'Mudanças são obrigatórias'),
});

/**
 * Schema completo para Process
 *
 * Validações:
 * - nome: 3-200 caracteres (obrigatório)
 * - setor: 2-100 caracteres (obrigatório)
 * - gestor: 2-100 caracteres (obrigatório)
 * - base legal: opcional (0-500 caracteres)
 * - arrays: podem ser vazios
 */
export const processSchema = z.object({
  id: z.union([
    z.string().uuid(),
    z.literal(''),
    z.undefined()
  ]).optional().transform(val => val === '' ? undefined : val), // UUID, string vazia (→ undefined) ou undefined

  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome muito longo (máximo 200 caracteres)')
    .trim(),

  sector: z.string()
    .min(2, 'Setor é obrigatório')
    .max(100, 'Setor muito longo')
    .trim(),

  manager: z.string()
    .min(2, 'Gestor é obrigatório')
    .max(100, 'Nome do gestor muito longo')
    .trim(),

  responsibleServers: z.array(z.string().trim()).default([]),

  // 👇 CORRIGIDO: Base legal agora é OPCIONAL
  legalBasis: z.string()
    .max(500, 'Base legal muito longa')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val), // Transforma string vazia em undefined

  systemsUsed: z.array(z.string().trim()).default([]),

  stakeholders: z.array(z.string().trim()).default([]),

  history: z.array(historyEntrySchema).default([]),

  createdAt: z.union([z.date(), z.string().datetime()]).optional(),

  updatedAt: z.union([z.date(), z.string().datetime()]).optional(),
});

/**
 * Schema para criação de processo (sem ID)
 */
export const createProcessSchema = processSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Schema para atualização de processo (ID obrigatório)
 */
export const updateProcessSchema = processSchema.required({ id: true });

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type ProcessInput = z.infer<typeof processSchema>;
export type CreateProcessInput = z.infer<typeof createProcessSchema>;
export type UpdateProcessInput = z.infer<typeof updateProcessSchema>;
