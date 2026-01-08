import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================
// FUNÇÕES UTILITÁRIAS DE CONTROLES
// ============================================

interface ControlForStatus {
  implemented: boolean;
  plannedEndDate?: string | null;
}

function getControlStatus(control: ControlForStatus) {
  if (control.implemented) {
    return { label: 'Implementado', status: 'implemented', color: 'bg-blue-500' };
  }

  if (!control.plannedEndDate) {
    return { label: 'Sem prazo definido', status: 'no-deadline', color: 'bg-gray-500' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse da data sem problemas de timezone
  const [year, month, day] = control.plannedEndDate.split('-').map(Number);
  const endDate = new Date(year, month - 1, day);
  endDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Atrasado (${Math.abs(diffDays)} dias)`,
      status: 'overdue',
      color: 'bg-red-500'
    };
  }
  if (diffDays <= 30) {
    return {
      label: `${diffDays} dias restantes`,
      status: 'near-due',
      color: 'bg-yellow-500'
    };
  }
  return {
    label: `${diffDays} dias restantes`,
    status: 'on-time',
    color: 'bg-green-500'
  };
}

function formatDate(date?: string | null): string {
  if (!date) return '-';
  try {
    // Adiciona timezone para evitar problemas de fuso
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

function calculateDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse da data sem problemas de timezone
  const [year, month, day] = deadline.split('-').map(Number);
  const endDate = new Date(year, month - 1, day);
  endDate.setHours(0, 0, 0, 0);

  return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isControlOverdue(control: ControlForStatus): boolean {
  if (control.implemented || !control.plannedEndDate) return false;
  return calculateDaysUntilDeadline(control.plannedEndDate) < 0;
}

function countControlsByStatus(controls: ControlForStatus[]) {
  return controls.reduce(
    (acc, control) => {
      const { status } = getControlStatus(control);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// ============================================
// TESTES
// ============================================

describe('Status do Controle', () => {
  beforeEach(() => {
    // Fixa a data para 07/01/2025 em todos os testes
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve retornar "Implementado" quando o controle está implementado', () => {
    const control = { implemented: true, plannedEndDate: '2025-01-01' };
    const status = getControlStatus(control);

    expect(status.label).toBe('Implementado');
    expect(status.status).toBe('implemented');
    expect(status.color).toBe('bg-blue-500');
  });

  it('deve retornar "Implementado" mesmo com data passada se estiver implementado', () => {
    const control = { implemented: true, plannedEndDate: '2024-01-01' };
    const status = getControlStatus(control);

    expect(status.status).toBe('implemented');
  });

  it('deve retornar "Sem prazo definido" quando não há data', () => {
    const control = { implemented: false, plannedEndDate: null };
    const status = getControlStatus(control);

    expect(status.label).toBe('Sem prazo definido');
    expect(status.status).toBe('no-deadline');
  });

  it('deve retornar "Atrasado" quando a data já passou', () => {
    const control = { implemented: false, plannedEndDate: '2025-01-01' }; // 6 dias atrás
    const status = getControlStatus(control);

    expect(status.status).toBe('overdue');
    expect(status.label).toBe('Atrasado (6 dias)');
    expect(status.color).toBe('bg-red-500');
  });

  it('deve retornar "near-due" quando faltam menos de 30 dias', () => {
    const control = { implemented: false, plannedEndDate: '2025-01-20' }; // 13 dias
    const status = getControlStatus(control);

    expect(status.status).toBe('near-due');
    expect(status.label).toBe('13 dias restantes');
    expect(status.color).toBe('bg-yellow-500');
  });

  it('deve retornar "on-time" quando faltam mais de 30 dias', () => {
    const control = { implemented: false, plannedEndDate: '2025-03-01' }; // 53 dias
    const status = getControlStatus(control);

    expect(status.status).toBe('on-time');
    expect(status.color).toBe('bg-green-500');
  });

  it('deve retornar 0 dias restantes para hoje', () => {
    const control = { implemented: false, plannedEndDate: '2025-01-07' };
    const status = getControlStatus(control);

    expect(status.label).toBe('0 dias restantes');
    expect(status.status).toBe('near-due');
  });
});

describe('Formatação de Data', () => {
  it('deve formatar data corretamente para pt-BR', () => {
    expect(formatDate('2025-01-07')).toBe('07/01/2025');
    expect(formatDate('2025-12-25')).toBe('25/12/2025');
    expect(formatDate('2024-06-15')).toBe('15/06/2024');
  });

  it('deve retornar "-" para data nula ou undefined', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  it('deve retornar "-" para data inválida', () => {
    expect(formatDate('data-invalida')).toBe('-');
    expect(formatDate('abc123')).toBe('-');
  });
});

describe('Cálculo de Dias até o Prazo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve calcular dias positivos para datas futuras', () => {
    expect(calculateDaysUntilDeadline('2025-01-17')).toBe(10);
    expect(calculateDaysUntilDeadline('2025-02-07')).toBe(31);
    expect(calculateDaysUntilDeadline('2025-01-08')).toBe(1);
  });

  it('deve calcular dias negativos para datas passadas', () => {
    expect(calculateDaysUntilDeadline('2025-01-01')).toBe(-6);
    expect(calculateDaysUntilDeadline('2025-01-06')).toBe(-1);
    expect(calculateDaysUntilDeadline('2024-12-07')).toBe(-31);
  });

  it('deve retornar 0 para a data de hoje', () => {
    expect(calculateDaysUntilDeadline('2025-01-07')).toBe(0);
  });
});

describe('Verificação de Controle Atrasado', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve retornar true para controle não implementado com data passada', () => {
    const control = { implemented: false, plannedEndDate: '2025-01-01' };
    expect(isControlOverdue(control)).toBe(true);
  });

  it('deve retornar false para controle implementado', () => {
    const control = { implemented: true, plannedEndDate: '2025-01-01' };
    expect(isControlOverdue(control)).toBe(false);
  });

  it('deve retornar false para controle sem prazo', () => {
    const control = { implemented: false, plannedEndDate: null };
    expect(isControlOverdue(control)).toBe(false);
  });

  it('deve retornar false para controle com data futura', () => {
    const control = { implemented: false, plannedEndDate: '2025-02-01' };
    expect(isControlOverdue(control)).toBe(false);
  });
});

describe('Contagem de Controles por Status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve contar controles por status corretamente', () => {
    const controls = [
      { implemented: true, plannedEndDate: '2025-01-01' },
      { implemented: true, plannedEndDate: '2025-02-01' },
      { implemented: false, plannedEndDate: '2025-01-01' }, // Atrasado
      { implemented: false, plannedEndDate: '2025-01-20' }, // Near-due
      { implemented: false, plannedEndDate: '2025-03-01' }, // On-time
      { implemented: false, plannedEndDate: null }, // Sem prazo
    ];

    const counts = countControlsByStatus(controls);

    expect(counts['implemented']).toBe(2);
    expect(counts['overdue']).toBe(1);
    expect(counts['near-due']).toBe(1);
    expect(counts['on-time']).toBe(1);
    expect(counts['no-deadline']).toBe(1);
  });

  it('deve retornar objeto vazio para lista vazia', () => {
    const counts = countControlsByStatus([]);
    expect(Object.keys(counts).length).toBe(0);
  });
});
