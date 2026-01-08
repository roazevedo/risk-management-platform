import { describe, it, expect } from 'vitest';
import {
  getInherentRiskLevel,
  getResidualRiskLevel,
  getRiskLevel,
  getInherentRiskBucketValue,
  THRESHOLDS,
  COLORS
} from './risk-classification';

describe('risk-classification', () => {
  describe('getInherentRiskLevel', () => {
    it('deve retornar N/A para score 0', () => {
      const result = getInherentRiskLevel(0);
      expect(result.label).toBe('N/A');
      expect(result.color).toBe(COLORS.NA);
      expect(result.severity).toBe(0);
    });

    it('deve classificar como Crítico para score >= 16', () => {
      const result = getInherentRiskLevel(16);
      expect(result.label).toBe('Crítico');
      expect(result.color).toBe(COLORS.CRITICAL);
      expect(result.severity).toBe(5);

      const result25 = getInherentRiskLevel(25);
      expect(result25.label).toBe('Crítico');
    });

    it('deve classificar como Alto para score >= 11', () => {
      const result = getInherentRiskLevel(11);
      expect(result.label).toBe('Alto');
      expect(result.color).toBe(COLORS.HIGH);
      expect(result.severity).toBe(4);

      const result15 = getInherentRiskLevel(15);
      expect(result15.label).toBe('Alto');
    });

    it('deve classificar como Médio para score >= 8', () => {
      const result = getInherentRiskLevel(8);
      expect(result.label).toBe('Médio');
      expect(result.color).toBe(COLORS.MEDIUM);
      expect(result.severity).toBe(3);

      const result10 = getInherentRiskLevel(10);
      expect(result10.label).toBe('Médio');
    });

    it('deve classificar como Baixo para score >= 4', () => {
      const result = getInherentRiskLevel(4);
      expect(result.label).toBe('Baixo');
      expect(result.color).toBe(COLORS.LOW);
      expect(result.severity).toBe(2);

      const result7 = getInherentRiskLevel(7);
      expect(result7.label).toBe('Baixo');
    });

    it('deve classificar como Muito Baixo para score >= 1', () => {
      const result = getInherentRiskLevel(1);
      expect(result.label).toBe('Muito Baixo');
      expect(result.color).toBe(COLORS.VERY_LOW);
      expect(result.severity).toBe(1);

      const result3 = getInherentRiskLevel(3);
      expect(result3.label).toBe('Muito Baixo');
    });
  });

  describe('getResidualRiskLevel', () => {
    it('deve classificar como Crítico para score > 15.0', () => {
      const result = getResidualRiskLevel(15.1);
      expect(result.label).toBe('Crítico');
      expect(result.color).toBe(COLORS.CRITICAL);
      expect(result.severity).toBe(5);
    });

    it('deve classificar como Alto para score > 10.0', () => {
      const result = getResidualRiskLevel(10.1);
      expect(result.label).toBe('Alto');
      expect(result.severity).toBe(4);

      const result15 = getResidualRiskLevel(15.0);
      expect(result15.label).toBe('Alto');
    });

    it('deve classificar como Médio para score > 7.0', () => {
      const result = getResidualRiskLevel(7.1);
      expect(result.label).toBe('Médio');
      expect(result.severity).toBe(3);
    });

    it('deve classificar como Baixo para score > 3.0', () => {
      const result = getResidualRiskLevel(3.1);
      expect(result.label).toBe('Baixo');
      expect(result.severity).toBe(2);
    });

    it('deve classificar como Muito Baixo para score >= 0', () => {
      const result = getResidualRiskLevel(0);
      expect(result.label).toBe('Muito Baixo');
      expect(result.severity).toBe(1);

      const result3 = getResidualRiskLevel(3.0);
      expect(result3.label).toBe('Muito Baixo');
    });

    it('deve arredondar corretamente para 1 casa decimal', () => {
      const result = getResidualRiskLevel(7.14);
      expect(result.label).toBe('Médio'); // 7.14 arredonda para 7.1

      const result2 = getResidualRiskLevel(7.16);
      expect(result2.label).toBe('Médio'); // 7.16 arredonda para 7.2
    });
  });

  describe('getRiskLevel', () => {
    it('deve usar thresholds de risco inerente quando isResidual é false', () => {
      const result = getRiskLevel(16, false);
      expect(result.label).toBe('Crítico');
    });

    it('deve usar thresholds de risco residual quando isResidual é true', () => {
      const result = getRiskLevel(15.1, true);
      expect(result.label).toBe('Crítico');

      const result2 = getRiskLevel(15.0, true);
      expect(result2.label).toBe('Alto');
    });
  });

  describe('getInherentRiskBucketValue', () => {
    it('deve retornar 0 para score 0', () => {
      expect(getInherentRiskBucketValue(0)).toBe(0);
    });

    it('deve retornar 25 para Crítico (>= 16)', () => {
      expect(getInherentRiskBucketValue(16)).toBe(25);
      expect(getInherentRiskBucketValue(25)).toBe(25);
    });

    it('deve retornar 15 para Alto (>= 11)', () => {
      expect(getInherentRiskBucketValue(11)).toBe(15);
      expect(getInherentRiskBucketValue(15)).toBe(15);
    });

    it('deve retornar 10 para Médio (>= 8)', () => {
      expect(getInherentRiskBucketValue(8)).toBe(10);
      expect(getInherentRiskBucketValue(10)).toBe(10);
    });

    it('deve retornar 7 para Baixo (>= 4)', () => {
      expect(getInherentRiskBucketValue(4)).toBe(7);
      expect(getInherentRiskBucketValue(7)).toBe(7);
    });

    it('deve retornar 3 para Muito Baixo (>= 1)', () => {
      expect(getInherentRiskBucketValue(1)).toBe(3);
      expect(getInherentRiskBucketValue(3)).toBe(3);
    });
  });

  describe('THRESHOLDS', () => {
    it('deve exportar thresholds de risco inerente', () => {
      expect(THRESHOLDS.INHERENT.CRITICAL).toBe(16);
      expect(THRESHOLDS.INHERENT.HIGH).toBe(11);
      expect(THRESHOLDS.INHERENT.MEDIUM).toBe(8);
      expect(THRESHOLDS.INHERENT.LOW).toBe(4);
      expect(THRESHOLDS.INHERENT.VERY_LOW).toBe(1);
    });

    it('deve exportar thresholds de risco residual', () => {
      expect(THRESHOLDS.RESIDUAL.CRITICAL).toBe(15.0);
      expect(THRESHOLDS.RESIDUAL.HIGH).toBe(10.0);
      expect(THRESHOLDS.RESIDUAL.MEDIUM).toBe(7.0);
      expect(THRESHOLDS.RESIDUAL.LOW).toBe(3.0);
      expect(THRESHOLDS.RESIDUAL.VERY_LOW).toBe(0);
    });
  });

  describe('COLORS', () => {
    it('deve exportar cores para cada nível de risco', () => {
      expect(COLORS.CRITICAL).toBe('bg-red-600');
      expect(COLORS.HIGH).toBe('bg-orange-500');
      expect(COLORS.MEDIUM).toBe('bg-yellow-500');
      expect(COLORS.LOW).toBe('bg-green-500');
      expect(COLORS.VERY_LOW).toBe('bg-green-400');
      expect(COLORS.NA).toBe('bg-gray-400');
    });
  });
});
