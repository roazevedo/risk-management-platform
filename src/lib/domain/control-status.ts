/**
 * FONTE ÚNICA DA VERDADE - Status de Controles
 *
 * Este arquivo centraliza TODA a lógica de cálculo e exibição de status de controles.
 * Qualquer alteração nos thresholds ou critérios deve ser feita APENAS aqui.
 *
 * IMPORTANTE: Esta implementação substitui as 3 implementações duplicadas anteriores:
 * - ControlForm.tsx (linha 15-28) ✓ Usado como base
 * - ControlManagement.tsx (linha 51-99) ✓ Usado para ícones e labels detalhados
 * - app/actions.ts (linha 182-199) ✓ Usado para lógica básica
 */

import { ControlStatus } from '@/types';

/**
 * Threshold de dias para considerar um controle como "vencimento próximo"
 */
const NEAR_DUE_THRESHOLD_DAYS = 30;

/**
 * Resultado completo do cálculo de status de controle
 */
export interface ControlStatusResult {
  status: ControlStatus;
  label: string;
  color: string;          // Cor Tailwind para badges simples (ex: 'bg-green-500')
  className: string;      // Classes completas para badges elaborados (ex: 'bg-green-100 text-green-700')
  iconName: string;       // Nome do ícone Lucide React (ex: 'CheckCircle', 'Clock', 'XCircle')
  daysRemaining?: number; // Dias restantes (positivo) ou em atraso (negativo)
}

/**
 * Calcula o status de um controle baseado em suas datas e estado de implementação
 *
 * @param plannedEndDate - Data de fim planejada (formato ISO: YYYY-MM-DD ou ISO string)
 * @param implemented - Se o controle foi implementado
 * @param actualEndDate - Data de fim real (não usado atualmente, mas reservado para futuro)
 * @returns Objeto completo com status, label, cores, ícone e dias restantes
 *
 * @example
 * // Controle implementado
 * calculateControlStatus('2024-12-31', true, '2024-12-20')
 * // { status: 'on-time', label: 'Implementado', color: 'bg-green-500', ... }
 *
 * // Controle atrasado
 * calculateControlStatus('2024-01-15', false, null)
 * // { status: 'overdue', label: 'Atrasado (324d)', color: 'bg-red-500', ... }
 *
 * // Vencimento próximo (20 dias)
 * calculateControlStatus('2025-01-01', false, null)
 * // { status: 'near-due', label: '28 dias restantes', color: 'bg-yellow-500', ... }
 */
export function calculateControlStatus(
  plannedEndDate: string | null | undefined,
  implemented: boolean,
  actualEndDate?: string | null
): ControlStatusResult {
  // Caso 1: Controle já implementado
  if (implemented) {
    return {
      status: 'on-time',
      label: 'Implementado',
      color: 'bg-green-500',
      className: 'bg-green-100 text-green-700 border-green-300',
      iconName: 'CheckCircle',
    };
  }

  // Caso 2: Sem data de fim planejada (pendente de planejamento)
  if (!plannedEndDate) {
    return {
      status: 'on-time',
      label: 'Pendente',
      color: 'bg-gray-500',
      className: 'bg-gray-100 text-gray-600 border-gray-300',
      iconName: 'Clock',
    };
  }

  // Caso 3: Calcular status baseado na data
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zerar horas para comparação de datas apenas

  // Normalizar data de fim para garantir formato consistente
  const endDate = new Date(plannedEndDate.includes('T') ? plannedEndDate : plannedEndDate + 'T00:00:00');
  endDate.setHours(0, 0, 0, 0);

  // Calcular diferença em dias
  const timeDiff = endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Caso 3a: Atrasado (data de fim já passou)
  if (daysDiff < 0) {
    const daysOverdue = Math.abs(daysDiff);
    return {
      status: 'overdue',
      label: `Atrasado (${daysOverdue}d)`,
      color: 'bg-red-500',
      className: 'bg-red-100 text-red-700 border-red-300',
      iconName: 'XCircle',
      daysRemaining: daysDiff, // Negativo
    };
  }

  // Caso 3b: Vencimento próximo (30 dias ou menos)
  if (daysDiff <= NEAR_DUE_THRESHOLD_DAYS) {
    return {
      status: 'near-due',
      label: daysDiff === 0 ? 'Vence hoje' : `${daysDiff} dias restantes`,
      color: 'bg-yellow-500',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      iconName: 'AlertCircle',
      daysRemaining: daysDiff,
    };
  }

  // Caso 3c: Em dia (mais de 30 dias restantes)
  return {
    status: 'on-time',
    label: `${daysDiff} dias restantes`,
    color: 'bg-blue-500',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
    iconName: 'Clock',
    daysRemaining: daysDiff,
  };
}

/**
 * Versão simplificada que retorna apenas o status (sem metadados)
 * Útil para Server Actions que precisam apenas salvar o status no banco
 *
 * @param plannedEndDate - Data de fim planejada
 * @param implemented - Se o controle foi implementado
 * @param actualEndDate - Data de fim real (opcional)
 * @returns Status do controle ('on-time', 'near-due', 'overdue')
 */
export function getControlStatus(
  plannedEndDate: string | null | undefined,
  implemented: boolean,
  actualEndDate?: string | null
): ControlStatus {
  return calculateControlStatus(plannedEndDate, implemented, actualEndDate).status;
}

/**
 * Obtém a configuração de exibição para um status específico
 * Útil quando você já tem o status e precisa apenas das informações de exibição
 *
 * @param status - Status do controle
 * @returns Objeto com label, cores e ícone
 */
export function getControlStatusDisplay(status: ControlStatus): Omit<ControlStatusResult, 'status' | 'daysRemaining'> {
  const displays: Record<ControlStatus, Omit<ControlStatusResult, 'status' | 'daysRemaining'>> = {
    'on-time': {
      label: 'Em Dia',
      color: 'bg-blue-500',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
      iconName: 'Clock',
    },
    'near-due': {
      label: 'Vencimento Próximo',
      color: 'bg-yellow-500',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      iconName: 'AlertCircle',
    },
    'overdue': {
      label: 'Atrasado',
      color: 'bg-red-500',
      className: 'bg-red-100 text-red-700 border-red-300',
      iconName: 'XCircle',
    },
  };

  return displays[status] || displays['on-time'];
}

/**
 * Exporta o threshold para uso em testes ou configurações
 */
export const CONTROL_STATUS_THRESHOLD = NEAR_DUE_THRESHOLD_DAYS;

/**
 * Lista de todos os possíveis status de controle
 */
export const ALL_CONTROL_STATUSES: ControlStatus[] = ['on-time', 'near-due', 'overdue'];

/**
 * Mapeamento de status para prioridade (útil para ordenação)
 * Valores maiores = maior prioridade/urgência
 */
export const CONTROL_STATUS_PRIORITY: Record<ControlStatus, number> = {
  'overdue': 3,    // Mais urgente
  'near-due': 2,
  'on-time': 1,    // Menos urgente
};
