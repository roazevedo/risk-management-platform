/**
 * FONTE ÚNICA DA VERDADE - Classificação de Risco
 *
 * Este arquivo centraliza TODA a lógica de classificação de risco do sistema.
 * Qualquer alteração nos thresholds ou critérios de classificação deve ser feita APENAS aqui.
 *
 * IMPORTANTE: Esta implementação substitui as 3 implementações conflitantes anteriores:
 * - RiskForm.tsx (linhas 34-57) ✓ CORRETO - usado como base
 * - lib/risk-utils.ts (linhas 1-16) ✗ INCORRETO - lógica invertida
 * - Dashboard.tsx ✗ INCORRETO - importava de risk-utils.ts
 */

export interface RiskLevel {
  label: string;
  color: string;
  severity: number; // 1-5 para ordenação (1=Muito Baixo, 5=Crítico)
}

/**
 * Thresholds para Risco Inerente (valores inteiros de 1-25)
 *
 * Risco Inerente = Probabilidade × Impacto
 * - Probabilidade: 1-5
 * - Impacto: 1-5
 * - Resultado: 1-25
 */
const INHERENT_RISK_THRESHOLDS = {
  CRITICAL: 16,      // >= 16: Crítico
  HIGH: 11,          // >= 11: Alto
  MEDIUM: 8,         // >= 8: Médio
  LOW: 4,            // >= 4: Baixo
  VERY_LOW: 1,       // >= 1: Muito Baixo
} as const;

/**
 * Thresholds para Risco Residual (valores float de 0-25)
 *
 * Risco Residual = Risco Inerente × FAC
 * - FAC (Fator de Avaliação de Controles): 0.2 - 1.0
 * - Resultado: 0-25 (valores decimais)
 */
const RESIDUAL_RISK_THRESHOLDS = {
  CRITICAL: 15.0,    // > 15.0: Crítico
  HIGH: 10.0,        // > 10.0: Alto
  MEDIUM: 7.0,       // > 7.0: Médio
  LOW: 3.0,          // > 3.0: Baixo
  VERY_LOW: 0,       // >= 0: Muito Baixo
} as const;

/**
 * Cores Tailwind para cada nível de risco
 */
const RISK_COLORS = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
  VERY_LOW: 'bg-green-400',
  NA: 'bg-gray-400',
} as const;

/**
 * Classifica o Risco Inerente
 *
 * @param score - Score do risco inerente (Probabilidade × Impacto)
 * @returns Objeto com label, cor e severidade
 *
 * @example
 * getInherentRiskLevel(20) // { label: 'Crítico', color: 'bg-red-600', severity: 5 }
 * getInherentRiskLevel(9)  // { label: 'Médio', color: 'bg-yellow-500', severity: 3 }
 * getInherentRiskLevel(0)  // { label: 'N/A', color: 'bg-gray-400', severity: 0 }
 */
export function getInherentRiskLevel(score: number): RiskLevel {
  // Estado inicial ou inválido
  if (score === 0) {
    return { label: 'N/A', color: RISK_COLORS.NA, severity: 0 };
  }

  // Classificação por thresholds (valores inteiros)
  if (score >= INHERENT_RISK_THRESHOLDS.CRITICAL) {
    return { label: 'Crítico', color: RISK_COLORS.CRITICAL, severity: 5 };
  }
  if (score >= INHERENT_RISK_THRESHOLDS.HIGH) {
    return { label: 'Alto', color: RISK_COLORS.HIGH, severity: 4 };
  }
  if (score >= INHERENT_RISK_THRESHOLDS.MEDIUM) {
    return { label: 'Médio', color: RISK_COLORS.MEDIUM, severity: 3 };
  }
  if (score >= INHERENT_RISK_THRESHOLDS.LOW) {
    return { label: 'Baixo', color: RISK_COLORS.LOW, severity: 2 };
  }
  if (score >= INHERENT_RISK_THRESHOLDS.VERY_LOW) {
    return { label: 'Muito Baixo', color: RISK_COLORS.VERY_LOW, severity: 1 };
  }

  // Fallback
  return { label: 'N/A', color: RISK_COLORS.NA, severity: 0 };
}

/**
 * Classifica o Risco Residual
 *
 * @param score - Score do risco residual (Risco Inerente × FAC)
 * @returns Objeto com label, cor e severidade
 *
 * @example
 * getResidualRiskLevel(16.5) // { label: 'Crítico', color: 'bg-red-600', severity: 5 }
 * getResidualRiskLevel(8.2)  // { label: 'Médio', color: 'bg-yellow-500', severity: 3 }
 * getResidualRiskLevel(2.5)  // { label: 'Muito Baixo', color: 'bg-green-400', severity: 1 }
 */
export function getResidualRiskLevel(score: number): RiskLevel {
  // Arredondar para 1 casa decimal para evitar problemas de precisão float
  const floatScore = Math.round(score * 10) / 10;

  // Classificação por thresholds (valores float)
  if (floatScore > RESIDUAL_RISK_THRESHOLDS.CRITICAL) {
    return { label: 'Crítico', color: RISK_COLORS.CRITICAL, severity: 5 };
  }
  if (floatScore > RESIDUAL_RISK_THRESHOLDS.HIGH) {
    return { label: 'Alto', color: RISK_COLORS.HIGH, severity: 4 };
  }
  if (floatScore > RESIDUAL_RISK_THRESHOLDS.MEDIUM) {
    return { label: 'Médio', color: RISK_COLORS.MEDIUM, severity: 3 };
  }
  if (floatScore > RESIDUAL_RISK_THRESHOLDS.LOW) {
    return { label: 'Baixo', color: RISK_COLORS.LOW, severity: 2 };
  }
  if (floatScore >= RESIDUAL_RISK_THRESHOLDS.VERY_LOW) {
    return { label: 'Muito Baixo', color: RISK_COLORS.VERY_LOW, severity: 1 };
  }

  // Fallback (não deveria acontecer)
  return { label: 'N/A', color: RISK_COLORS.NA, severity: 0 };
}

/**
 * Classifica qualquer risco (auto-detecta se é inerente ou residual)
 *
 * @param score - Score do risco
 * @param isResidual - Se true, usa thresholds de risco residual; se false, usa inerente
 * @returns Objeto com label, cor e severidade
 */
export function getRiskLevel(score: number, isResidual: boolean = false): RiskLevel {
  return isResidual ? getResidualRiskLevel(score) : getInherentRiskLevel(score);
}

/**
 * Obtém valor numérico para usar em gráficos baseado no nível de risco
 * Útil para Dashboard e visualizações
 *
 * @param score - Score do risco inerente
 * @returns Valor numérico representando o "bucket" do risco (3, 7, 10, 15, 25)
 */
export function getInherentRiskBucketValue(score: number): number {
  if (score === 0) return 0;
  if (score >= INHERENT_RISK_THRESHOLDS.CRITICAL) return 25; // Crítico
  if (score >= INHERENT_RISK_THRESHOLDS.HIGH) return 15;     // Alto
  if (score >= INHERENT_RISK_THRESHOLDS.MEDIUM) return 10;   // Médio
  if (score >= INHERENT_RISK_THRESHOLDS.LOW) return 7;       // Baixo
  if (score >= INHERENT_RISK_THRESHOLDS.VERY_LOW) return 3;  // Muito Baixo
  return 0;
}

/**
 * Exporta os thresholds para uso em configurações ou testes
 */
export const THRESHOLDS = {
  INHERENT: INHERENT_RISK_THRESHOLDS,
  RESIDUAL: RESIDUAL_RISK_THRESHOLDS,
} as const;

/**
 * Exporta as cores para uso em componentes
 */
export const COLORS = RISK_COLORS;
