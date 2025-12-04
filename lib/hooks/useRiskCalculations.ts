/**
 * Hook de Cálculos de Risco
 *
 * Centraliza toda a lógica de cálculo automático de riscos:
 * - Risco Inerente (Probabilidade × Impacto)
 * - FAC (Fator de Avaliação de Controles)
 * - Risco Residual (Risco Inerente × FAC)
 * - Data Máxima de Implementação (baseada no risco residual)
 * - Resposta Sugerida (baseada no risco residual)
 *
 * Extraído do RiskForm.tsx (linhas 99-173) para facilitar testes e reutilização
 */

import { useMemo } from 'react';
import { Risk, RiskResponse } from '@/types';
import { RISK_RESPONSES } from '@/constants';

/**
 * Valores possíveis para FAC (Fator de Avaliação de Controles)
 */
const FAC_VALUES = {
  STRONG: 0.2,        // Forte
  SATISFACTORY: 0.4,  // Satisfatório
  MEDIUM: 0.6,        // Mediano
  WEAK: 0.8,          // Fraco
  INEFFECTIVE: 1.0,   // Ineficaz
} as const;

/**
 * Thresholds para cálculo de data máxima de implementação
 * Baseado no risco residual
 */
const IMPLEMENTATION_DEADLINE_THRESHOLDS = {
  CRITICAL: { minScore: 15.1, months: 6 },   // >= 15.1: 6 meses
  HIGH: { minScore: 8, months: 12 },         // >= 8: 12 meses
  MEDIUM: { minScore: 4, months: 36 },       // >= 4: 36 meses
  LOW: { minScore: 0, months: 0 },           // < 4: monitorar (0 meses)
} as const;

/**
 * Calcula a data máxima adicionando meses a uma data base
 *
 * @param startDateString - Data inicial (formato YYYY-MM-DD)
 * @param months - Número de meses a adicionar
 * @returns Data calculada no formato YYYY-MM-DD ou string vazia se inválido
 */
function calculateMaxDate(startDateString: string | undefined | null, months: number): string {
  if (!startDateString || months === 0) return '';

  const date = new Date(startDateString + 'T00:00:00');
  date.setMonth(date.getMonth() + months);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Obtém o label descritivo para um valor de FAC
 *
 * @param fac - Valor do FAC (0.2 - 1.0)
 * @returns Label em português
 */
export function getFacLabel(fac: number): string {
  if (fac === FAC_VALUES.INEFFECTIVE) return 'Ineficaz';
  if (fac === FAC_VALUES.WEAK) return 'Fraco';
  if (fac === FAC_VALUES.MEDIUM) return 'Mediano';
  if (fac === FAC_VALUES.SATISFACTORY) return 'Satisfatório';
  if (fac <= FAC_VALUES.STRONG) return 'Forte';
  return '-';
}

/**
 * Resultado dos cálculos de risco
 */
export interface RiskCalculationsResult {
  inherentRisk: number;
  fac: number;
  facLabel: string;
  residualRisk: number;
  maxImplementationDate: string;
  suggestedResponse: RiskResponse;
  requiresAction: boolean; // Se requer ação ou apenas monitoramento
}

/**
 * Hook que calcula automaticamente todos os valores derivados de um risco
 *
 * @param formData - Dados parciais do formulário de risco
 * @returns Objeto com todos os cálculos (memoizado)
 *
 * @example
 * const calculations = useRiskCalculations(formData);
 * console.log(calculations.residualRisk); // 12.5
 * console.log(calculations.facLabel);     // 'Satisfatório'
 */
export function useRiskCalculations(formData: Partial<Risk>): RiskCalculationsResult {
  return useMemo(() => {
    // 1. Calcular Risco Inerente (Probabilidade × Impacto)
    const probability = Number(formData.probability) || 0;
    const impact = Number(formData.impact) || 0;
    const inherentRisk = probability * impact;

    // 2. Calcular FAC (Fator de Avaliação de Controles)
    let calculatedFac = FAC_VALUES.INEFFECTIVE; // Padrão: 1.0 (sem redução)

    if (formData.controlsExist) {
      if (formData.isControlEffective) {
        // Controles efetivos: redução baseada em critérios de adequação
        let reduction = 0.2; // Redução base por ser efetivo

        // Cada critério adicional reduz mais 0.2
        if (formData.isControlAdequate) reduction += 0.2;
        if (formData.isControlProportional) reduction += 0.2;
        if (formData.isControlReasonable) reduction += 0.2;

        calculatedFac = 1.0 - reduction;
      } else {
        // Controles existem mas não são efetivos: sem redução
        calculatedFac = FAC_VALUES.INEFFECTIVE;
      }
    } else {
      // Sem controles: sem redução
      calculatedFac = FAC_VALUES.INEFFECTIVE;
    }

    // Normalizar FAC para 1 casa decimal
    calculatedFac = Math.round(calculatedFac * 10) / 10;

    // Garantir limites: 0.2 (Forte) a 1.0 (Ineficaz)
    if (calculatedFac < FAC_VALUES.STRONG) calculatedFac = FAC_VALUES.STRONG;
    if (calculatedFac > FAC_VALUES.INEFFECTIVE) calculatedFac = FAC_VALUES.INEFFECTIVE;

    // 3. Calcular Risco Residual (Risco Inerente × FAC)
    const residualRisk = Number((inherentRisk * calculatedFac).toFixed(2));

    // 4. Calcular Data Máxima de Implementação baseada no Risco Residual
    let requiredMonths = 0;
    const requiresAction = residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.minScore;

    if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.CRITICAL.minScore) {
      requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.CRITICAL.months; // 6 meses
    } else if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.HIGH.minScore) {
      requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.HIGH.months; // 12 meses
    } else if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.minScore) {
      requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.months; // 36 meses
    } else {
      requiredMonths = 0; // Monitoramento apenas
    }

    const maxImplementationDate = requiredMonths > 0 && formData.identificationDate
      ? calculateMaxDate(formData.identificationDate, requiredMonths)
      : '';

    // 5. Determinar Resposta Sugerida
    // Se risco residual < 4, sugerir "Aceitar" (monitorar)
    // Caso contrário, manter a resposta escolhida pelo usuário
    let suggestedResponse = formData.suggestedResponse || (RISK_RESPONSES[0] as RiskResponse);

    if (!requiresAction) {
      // Bloqueio Lógico: Se for apenas monitorar, sugerimos 'Aceitar'
      const acceptResponse = RISK_RESPONSES.find(r => r === 'Aceitar');
      if (acceptResponse) {
        suggestedResponse = acceptResponse as RiskResponse;
      }
    }

    // 6. Retornar todos os cálculos
    return {
      inherentRisk,
      fac: calculatedFac,
      facLabel: getFacLabel(calculatedFac),
      residualRisk,
      maxImplementationDate,
      suggestedResponse,
      requiresAction,
    };
  }, [
    formData.probability,
    formData.impact,
    formData.controlsExist,
    formData.isControlEffective,
    formData.isControlAdequate,
    formData.isControlProportional,
    formData.isControlReasonable,
    formData.identificationDate,
    formData.suggestedResponse,
  ]);
}

/**
 * Exporta os valores de FAC para uso em forms ou documentação
 */
export const FAC_OPTIONS = [
  { value: FAC_VALUES.STRONG, label: 'Forte' },
  { value: FAC_VALUES.SATISFACTORY, label: 'Satisfatório' },
  { value: FAC_VALUES.MEDIUM, label: 'Mediano' },
  { value: FAC_VALUES.WEAK, label: 'Fraco' },
  { value: FAC_VALUES.INEFFECTIVE, label: 'Ineficaz' },
] as const;

/**
 * Exporta os thresholds para uso em testes ou documentação
 */
export const THRESHOLDS = IMPLEMENTATION_DEADLINE_THRESHOLDS;

/**
 * Calcula manualmente os valores (útil para Server Actions ou cálculos fora de componentes)
 * Mesma lógica do hook, mas sem React hooks
 */
export function calculateRiskValues(risk: Partial<Risk>): RiskCalculationsResult {
  const probability = Number(risk.probability) || 0;
  const impact = Number(risk.impact) || 0;
  const inherentRisk = probability * impact;

  let calculatedFac = FAC_VALUES.INEFFECTIVE;

  if (risk.controlsExist) {
    if (risk.isControlEffective) {
      let reduction = 0.2;
      if (risk.isControlAdequate) reduction += 0.2;
      if (risk.isControlProportional) reduction += 0.2;
      if (risk.isControlReasonable) reduction += 0.2;
      calculatedFac = 1.0 - reduction;
    }
  }

  calculatedFac = Math.round(calculatedFac * 10) / 10;
  if (calculatedFac < FAC_VALUES.STRONG) calculatedFac = FAC_VALUES.STRONG;
  if (calculatedFac > FAC_VALUES.INEFFECTIVE) calculatedFac = FAC_VALUES.INEFFECTIVE;

  const residualRisk = Number((inherentRisk * calculatedFac).toFixed(2));

  let requiredMonths = 0;
  const requiresAction = residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.minScore;

  if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.CRITICAL.minScore) {
    requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.CRITICAL.months;
  } else if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.HIGH.minScore) {
    requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.HIGH.months;
  } else if (residualRisk >= IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.minScore) {
    requiredMonths = IMPLEMENTATION_DEADLINE_THRESHOLDS.MEDIUM.months;
  }

  const maxImplementationDate = requiredMonths > 0 && risk.identificationDate
    ? calculateMaxDate(risk.identificationDate, requiredMonths)
    : '';

  let suggestedResponse = risk.suggestedResponse || (RISK_RESPONSES[0] as RiskResponse);
  if (!requiresAction) {
    const acceptResponse = RISK_RESPONSES.find(r => r === 'Aceitar');
    if (acceptResponse) {
      suggestedResponse = acceptResponse as RiskResponse;
    }
  }

  return {
    inherentRisk,
    fac: calculatedFac,
    facLabel: getFacLabel(calculatedFac),
    residualRisk,
    maxImplementationDate,
    suggestedResponse,
    requiresAction,
  };
}
