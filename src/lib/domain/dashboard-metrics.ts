/**
 * FONTE ÚNICA DA VERDADE - Métricas do Dashboard
 *
 * Este arquivo centraliza TODA a lógica de agregação e cálculo de métricas do dashboard.
 * Qualquer alteração nas métricas deve ser feita APENAS aqui.
 *
 * IMPORTANTE: Esta implementação substitui a lógica duplicada em Dashboard.tsx
 */

import { Process, Risk, Control } from '@/types';
import { getInherentRiskLevel } from './risk-classification';

/**
 * Interface para dados de nível de risco agregados
 */
export interface RiskLevelMetric {
  name: string;
  riscos: number;
  [key: string]: string | number; // Index signature para compatibilidade com Recharts
}

/**
 * Interface para dados de status de controle agregados
 */
export interface ControlStatusMetric {
  name: string;
  value: number;
  [key: string]: string | number; // Index signature para compatibilidade com Recharts
}

/**
 * Interface para métricas gerais do dashboard
 */
export interface DashboardMetrics {
  totalProcesses: number;
  totalRisks: number;
  totalControls: number;
  riskLevelData: RiskLevelMetric[];
  controlStatusData: ControlStatusMetric[];
}

/**
 * Agrega riscos por nível (Crítico, Alto, Médio, Baixo, Muito Baixo)
 *
 * @param risks - Array de riscos
 * @returns Array de métricas agrupadas por nível de risco
 *
 * @example
 * const metrics = aggregateRisksByLevel(risks);
 * // [{ name: 'Crítico', riscos: 5 }, { name: 'Alto', riscos: 10 }, ...]
 */
export function aggregateRisksByLevel(risks: Risk[]): RiskLevelMetric[] {
  return risks.reduce((acc, risk) => {
    const { label } = getInherentRiskLevel(risk.inherentRisk);
    const existing = acc.find(item => item.name === label);

    if (existing) {
      existing.riscos++;
    } else {
      acc.push({ name: label, riscos: 1 });
    }

    return acc;
  }, [] as RiskLevelMetric[]);
}

/**
 * Agrega controles por status de implementação
 *
 * @param controls - Array de controles
 * @returns Array de métricas agrupadas por status
 *
 * @example
 * const metrics = aggregateControlsByStatus(controls);
 * // [{ name: 'Implementado', value: 25 }, { name: 'Não Implementado', value: 10 }]
 */
export function aggregateControlsByStatus(controls: Control[]): ControlStatusMetric[] {
  return controls.reduce((acc, control) => {
    const status = control.implemented ? 'Implementado' : 'Não Implementado';
    const existing = acc.find(item => item.name === status);

    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: status, value: 1 });
    }

    return acc;
  }, [] as ControlStatusMetric[]);
}

/**
 * Calcula todas as métricas do dashboard
 *
 * @param processes - Array de processos
 * @param risks - Array de riscos
 * @param controls - Array de controles
 * @returns Objeto completo com todas as métricas do dashboard
 *
 * @example
 * const metrics = calculateDashboardMetrics(processes, risks, controls);
 * console.log(metrics.totalRisks); // 42
 * console.log(metrics.riskLevelData); // [{ name: 'Crítico', riscos: 5 }, ...]
 */
export function calculateDashboardMetrics(
  processes: Process[],
  risks: Risk[],
  controls: Control[]
): DashboardMetrics {
  return {
    totalProcesses: processes.length,
    totalRisks: risks.length,
    totalControls: controls.length,
    riskLevelData: aggregateRisksByLevel(risks),
    controlStatusData: aggregateControlsByStatus(controls),
  };
}

/**
 * Cores padrão para gráficos do dashboard
 */
export const DASHBOARD_CHART_COLORS = {
  PRIMARY: ['#4ade80', '#facc15'], // Green, Yellow
  RISK_LEVELS: {
    'Crítico': '#dc2626',      // Red
    'Alto': '#f97316',         // Orange
    'Médio': '#eab308',        // Yellow
    'Baixo': '#22c55e',        // Green
    'Muito Baixo': '#86efac',  // Light Green
    'N/A': '#9ca3af',          // Gray
  },
} as const;
