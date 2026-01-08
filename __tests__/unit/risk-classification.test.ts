import { describe, it, expect } from 'vitest'

// ============================================
// FUNÇÕES DE CLASSIFICAÇÃO DE RISCO
// (Depois você pode mover para src/lib/risk-utils.ts)
// ============================================

function getResidualRiskLevel(value: number) {
  if (value > 15) return { label: 'Crítico', color: 'bg-red-500' };
  if (value > 10) return { label: 'Alto', color: 'bg-orange-500' };
  if (value > 7) return { label: 'Médio', color: 'bg-yellow-500' };
  if (value > 3) return { label: 'Baixo', color: 'bg-green-500' };
  return { label: 'Muito Baixo', color: 'bg-teal-500' };
}

function getInherentRiskLevel(value: number) {
  if (value > 15) return 'Crítico';
  if (value > 10) return 'Alto';
  if (value > 7) return 'Médio';
  if (value > 3) return 'Baixo';
  return 'Muito Baixo';
}

function getFacLabel(fac: number) {
  if (fac <= 0.2) return 'Forte';
  if (fac <= 0.4) return 'Satisfatório';
  if (fac <= 0.6) return 'Mediano';
  if (fac <= 0.8) return 'Fraco';
  return 'Ineficaz';
}

function calculateResidualRisk(inherentRisk: number, fac: number): number {
  return inherentRisk * fac;
}

// ============================================
// TESTES
// ============================================

describe('Classificação de Risco Residual', () => {
  it('deve retornar "Crítico" para valores acima de 15', () => {
    expect(getResidualRiskLevel(20).label).toBe('Crítico');
    expect(getResidualRiskLevel(16).label).toBe('Crítico');
    expect(getResidualRiskLevel(25).label).toBe('Crítico');
  });

  it('deve retornar "Alto" para valores entre 10 e 15', () => {
    expect(getResidualRiskLevel(15).label).toBe('Alto');
    expect(getResidualRiskLevel(12).label).toBe('Alto');
    expect(getResidualRiskLevel(11).label).toBe('Alto');
  });

  it('deve retornar "Médio" para valores entre 7 e 10', () => {
    expect(getResidualRiskLevel(10).label).toBe('Médio');
    expect(getResidualRiskLevel(8).label).toBe('Médio');
  });

  it('deve retornar "Baixo" para valores entre 3 e 7', () => {
    expect(getResidualRiskLevel(7).label).toBe('Baixo');
    expect(getResidualRiskLevel(5).label).toBe('Baixo');
    expect(getResidualRiskLevel(4).label).toBe('Baixo');
  });

  it('deve retornar "Muito Baixo" para valores até 3', () => {
    expect(getResidualRiskLevel(3).label).toBe('Muito Baixo');
    expect(getResidualRiskLevel(1).label).toBe('Muito Baixo');
    expect(getResidualRiskLevel(0).label).toBe('Muito Baixo');
  });

  it('deve retornar a cor correta para cada nível', () => {
    expect(getResidualRiskLevel(20).color).toBe('bg-red-500');
    expect(getResidualRiskLevel(12).color).toBe('bg-orange-500');
    expect(getResidualRiskLevel(8).color).toBe('bg-yellow-500');
    expect(getResidualRiskLevel(5).color).toBe('bg-green-500');
    expect(getResidualRiskLevel(2).color).toBe('bg-teal-500');
  });
});

describe('Classificação de Risco Inerente', () => {
  it('deve classificar corretamente os níveis de risco inerente', () => {
    expect(getInherentRiskLevel(25)).toBe('Crítico');
    expect(getInherentRiskLevel(15)).toBe('Alto');
    expect(getInherentRiskLevel(10)).toBe('Médio');
    expect(getInherentRiskLevel(7)).toBe('Baixo');
    expect(getInherentRiskLevel(3)).toBe('Muito Baixo');
  });

  it('deve tratar valores limite corretamente', () => {
    // Valor exatamente no limite vai para a categoria inferior
    expect(getInherentRiskLevel(15)).toBe('Alto'); // > 10, não > 15
    expect(getInherentRiskLevel(16)).toBe('Crítico'); // > 15
  });
});

describe('Fator de Avaliação de Controles (FAC)', () => {
  it('deve retornar "Forte" para FAC até 0.2', () => {
    expect(getFacLabel(0.1)).toBe('Forte');
    expect(getFacLabel(0.2)).toBe('Forte');
  });

  it('deve retornar "Satisfatório" para FAC entre 0.2 e 0.4', () => {
    expect(getFacLabel(0.3)).toBe('Satisfatório');
    expect(getFacLabel(0.4)).toBe('Satisfatório');
  });

  it('deve retornar "Mediano" para FAC entre 0.4 e 0.6', () => {
    expect(getFacLabel(0.5)).toBe('Mediano');
    expect(getFacLabel(0.6)).toBe('Mediano');
  });

  it('deve retornar "Fraco" para FAC entre 0.6 e 0.8', () => {
    expect(getFacLabel(0.7)).toBe('Fraco');
    expect(getFacLabel(0.8)).toBe('Fraco');
  });

  it('deve retornar "Ineficaz" para FAC acima de 0.8', () => {
    expect(getFacLabel(0.9)).toBe('Ineficaz');
    expect(getFacLabel(1.0)).toBe('Ineficaz');
  });
});

describe('Cálculo de Risco Residual', () => {
  it('deve calcular corretamente: Risco Inerente × FAC', () => {
    expect(calculateResidualRisk(25, 0.2)).toBe(5);
    expect(calculateResidualRisk(20, 0.5)).toBe(10);
    expect(calculateResidualRisk(15, 1.0)).toBe(15);
  });

  it('deve demonstrar que controles fortes reduzem o risco', () => {
    const inherentRisk = 25; // Crítico

    // Com controle Forte (0.2) → Risco Residual = 5 (Baixo)
    const residualStrong = calculateResidualRisk(inherentRisk, 0.2);
    expect(getResidualRiskLevel(residualStrong).label).toBe('Baixo');

    // Com controle Ineficaz (1.0) → Risco Residual = 25 (Crítico)
    const residualWeak = calculateResidualRisk(inherentRisk, 1.0);
    expect(getResidualRiskLevel(residualWeak).label).toBe('Crítico');
  });

  it('deve manter o risco crítico se controle for ineficaz', () => {
    const residual = calculateResidualRisk(20, 1.0);
    expect(residual).toBe(20);
    expect(getResidualRiskLevel(residual).label).toBe('Crítico');
  });
});

describe('Matriz de Risco - Cenários Reais', () => {
  it('Cenário 1: Risco Alto com Controle Forte = Risco Baixo', () => {
    const inherent = 15; // Alto
    const fac = 0.2; // Forte
    const residual = calculateResidualRisk(inherent, fac);

    expect(residual).toBe(3);
    expect(getResidualRiskLevel(residual).label).toBe('Muito Baixo');
  });

  it('Cenário 2: Risco Crítico com Controle Mediano = Risco Alto', () => {
    const inherent = 25; // Crítico
    const fac = 0.6; // Mediano
    const residual = calculateResidualRisk(inherent, fac);

    expect(residual).toBe(15);
    expect(getResidualRiskLevel(residual).label).toBe('Alto');
  });

  it('Cenário 3: Risco Médio com Controle Satisfatório = Risco Baixo', () => {
    const inherent = 10; // Médio
    const fac = 0.4; // Satisfatório
    const residual = calculateResidualRisk(inherent, fac);

    expect(residual).toBe(4);
    expect(getResidualRiskLevel(residual).label).toBe('Baixo');
  });
});
