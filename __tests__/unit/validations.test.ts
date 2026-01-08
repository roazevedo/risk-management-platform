import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// ============================================
// SCHEMAS DE VALIDAÇÃO (similares aos do projeto)
// ============================================

// Schema de Processo
const processSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  manager: z.string().min(1, 'Gestor é obrigatório'),
  legalBasis: z.string().optional(),
  responsibleServers: z.array(z.string()).optional(),
  systemsUsed: z.array(z.string()).optional(),
  stakeholders: z.array(z.string()).optional(),
});

// Schema de Risco
const riskSchema = z.object({
  name: z.string().min(1, 'Nome do risco é obrigatório'),
  type: z.enum(['Operacional', 'Estratégico', 'Financeiro', 'Conformidade', 'Imagem']),
  probability: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  impact: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  causes: z.string().min(1, 'Causas são obrigatórias'),
  consequences: z.string().min(1, 'Consequências são obrigatórias'),
});

// Schema de Controle
const controlSchema = z.object({
  name: z.string().min(1, 'Nome do controle é obrigatório'),
  type: z.enum(['Preventivo', 'Detectivo', 'Corretivo']),
  nature: z.enum(['Manual', 'Automatizado', 'Semiautomatizado']),
  relationToRisk: z.enum(['Direto', 'Indireto']).optional(),
  responsible: z.string().optional(),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
});

// Schema de Login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

// Schema de Cadastro
const signupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  sector: z.string().min(2, 'Setor deve ter pelo menos 2 caracteres'),
  registration: z.string().min(9, 'Matrícula deve ter pelo menos 9 dígitos'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// ============================================
// TESTES DE VALIDAÇÃO DE PROCESSO
// ============================================

describe('Validação de Processo', () => {
  it('deve validar um processo completo', () => {
    const validProcess = {
      name: 'Processo de Compras',
      sector: 'CG/ADS/GRH',
      manager: 'João Silva',
      legalBasis: 'Lei 8.666',
      responsibleServers: ['Maria', 'Pedro'],
      systemsUsed: ['SAP', 'SIGES'],
      stakeholders: ['Diretoria', 'TI'],
    };

    const result = processSchema.safeParse(validProcess);
    expect(result.success).toBe(true);
  });

  it('deve validar processo com campos mínimos', () => {
    const minimalProcess = {
      name: 'Processo Mínimo',
      sector: 'CG/ATG',
      manager: 'Maria Santos',
    };

    const result = processSchema.safeParse(minimalProcess);
    expect(result.success).toBe(true);
  });

  it('deve falhar sem nome', () => {
    const invalidProcess = {
      name: '',
      sector: 'CG/ADS/GRH',
      manager: 'João Silva',
    };

    const result = processSchema.safeParse(invalidProcess);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome é obrigatório');
    }
  });

  it('deve falhar sem setor', () => {
    const invalidProcess = {
      name: 'Processo',
      sector: '',
      manager: 'João Silva',
    };

    const result = processSchema.safeParse(invalidProcess);
    expect(result.success).toBe(false);
  });

  it('deve falhar sem gestor', () => {
    const invalidProcess = {
      name: 'Processo',
      sector: 'CG/ATG',
      manager: '',
    };

    const result = processSchema.safeParse(invalidProcess);
    expect(result.success).toBe(false);
  });
});

// ============================================
// TESTES DE VALIDAÇÃO DE RISCO
// ============================================

describe('Validação de Risco', () => {
  it('deve validar um risco completo', () => {
    const validRisk = {
      name: 'Risco de Fraude em Licitação',
      type: 'Operacional',
      probability: 3,
      impact: 4,
      causes: 'Falta de controle interno\nProcessos manuais',
      consequences: 'Prejuízo financeiro\nDano à imagem',
    };

    const result = riskSchema.safeParse(validRisk);
    expect(result.success).toBe(true);
  });

  it('deve aceitar todos os tipos de risco válidos', () => {
    const tipos = ['Operacional', 'Estratégico', 'Financeiro', 'Conformidade', 'Imagem'];

    tipos.forEach(tipo => {
      const risk = {
        name: 'Risco Teste',
        type: tipo,
        probability: 3,
        impact: 3,
        causes: 'Causa',
        consequences: 'Consequência',
      };

      const result = riskSchema.safeParse(risk);
      expect(result.success).toBe(true);
    });
  });

  it('deve falhar com tipo de risco inválido', () => {
    const invalidRisk = {
      name: 'Risco',
      type: 'TipoInventado',
      probability: 3,
      impact: 4,
      causes: 'Causa',
      consequences: 'Consequência',
    };

    const result = riskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });

  it('deve falhar com probabilidade menor que 1', () => {
    const invalidRisk = {
      name: 'Risco',
      type: 'Operacional',
      probability: 0,
      impact: 4,
      causes: 'Causa',
      consequences: 'Consequência',
    };

    const result = riskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });

  it('deve falhar com probabilidade maior que 5', () => {
    const invalidRisk = {
      name: 'Risco',
      type: 'Operacional',
      probability: 6,
      impact: 4,
      causes: 'Causa',
      consequences: 'Consequência',
    };

    const result = riskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });

  it('deve falhar com impacto fora do range 1-5', () => {
    const riskImpactoZero = {
      name: 'Risco',
      type: 'Operacional',
      probability: 3,
      impact: 0,
      causes: 'Causa',
      consequences: 'Consequência',
    };

    const riskImpactoAlto = {
      name: 'Risco',
      type: 'Operacional',
      probability: 3,
      impact: 10,
      causes: 'Causa',
      consequences: 'Consequência',
    };

    expect(riskSchema.safeParse(riskImpactoZero).success).toBe(false);
    expect(riskSchema.safeParse(riskImpactoAlto).success).toBe(false);
  });

  it('deve falhar sem causas', () => {
    const invalidRisk = {
      name: 'Risco',
      type: 'Operacional',
      probability: 3,
      impact: 4,
      causes: '',
      consequences: 'Consequência',
    };

    const result = riskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });
});

// ============================================
// TESTES DE VALIDAÇÃO DE CONTROLE
// ============================================

describe('Validação de Controle', () => {
  it('deve validar um controle completo', () => {
    const validControl = {
      name: 'Revisão de Documentos',
      type: 'Preventivo',
      nature: 'Manual',
      relationToRisk: 'Direto',
      responsible: 'Equipe de Qualidade',
      plannedStartDate: '2025-01-01',
      plannedEndDate: '2025-06-30',
    };

    const result = controlSchema.safeParse(validControl);
    expect(result.success).toBe(true);
  });

  it('deve validar controle com campos mínimos', () => {
    const minimalControl = {
      name: 'Controle Básico',
      type: 'Detectivo',
      nature: 'Automatizado',
    };

    const result = controlSchema.safeParse(minimalControl);
    expect(result.success).toBe(true);
  });

  it('deve aceitar todos os tipos de controle', () => {
    const tipos = ['Preventivo', 'Detectivo', 'Corretivo'];

    tipos.forEach(tipo => {
      const control = {
        name: 'Controle',
        type: tipo,
        nature: 'Manual',
      };

      expect(controlSchema.safeParse(control).success).toBe(true);
    });
  });

  it('deve aceitar todas as naturezas de controle', () => {
    const naturezas = ['Manual', 'Automatizado', 'Semiautomatizado'];

    naturezas.forEach(natureza => {
      const control = {
        name: 'Controle',
        type: 'Preventivo',
        nature: natureza,
      };

      expect(controlSchema.safeParse(control).success).toBe(true);
    });
  });

  it('deve falhar com tipo inválido', () => {
    const invalidControl = {
      name: 'Controle',
      type: 'Proativo',
      nature: 'Manual',
    };

    const result = controlSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });

  it('deve falhar sem nome', () => {
    const invalidControl = {
      name: '',
      type: 'Preventivo',
      nature: 'Manual',
    };

    const result = controlSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });
});

// ============================================
// TESTES DE VALIDAÇÃO DE LOGIN
// ============================================

describe('Validação de Login', () => {
  it('deve validar login válido', () => {
    const validLogin = {
      email: 'usuario@cgm.rio.gov.br',
      password: 'senha12345',
    };

    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  it('deve falhar com email inválido', () => {
    const emails_invalidos = [
      'email-sem-arroba',
      '@semdominio.com',
      'email@',
      'email espacos@teste.com',
      '',
    ];

    emails_invalidos.forEach(email => {
      const result = loginSchema.safeParse({ email, password: 'senha12345' });
      expect(result.success).toBe(false);
    });
  });

  it('deve falhar com senha curta (menos de 8 caracteres)', () => {
    const invalidLogin = {
      email: 'usuario@email.com',
      password: '1234567', // 7 caracteres
    };

    const result = loginSchema.safeParse(invalidLogin);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter pelo menos 8 caracteres');
    }
  });

  it('deve aceitar senha com exatamente 8 caracteres', () => {
    const validLogin = {
      email: 'usuario@email.com',
      password: '12345678',
    };

    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });
});

// ============================================
// TESTES DE VALIDAÇÃO DE CADASTRO
// ============================================

describe('Validação de Cadastro (Signup)', () => {
  it('deve validar cadastro completo', () => {
    const validSignup = {
      name: 'João da Silva Santos',
      email: 'joao.silva@cgm.rio.gov.br',
      sector: 'CG/ADS/GRH',
      registration: '123456789',
      password: 'senha12345',
      confirmPassword: 'senha12345',
    };

    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  it('deve falhar quando senhas não coincidem', () => {
    const invalidSignup = {
      name: 'João da Silva',
      email: 'joao@email.com',
      sector: 'CG/ADS/GRH',
      registration: '123456789',
      password: 'senha12345',
      confirmPassword: 'senha54321',
    };

    const result = signupSchema.safeParse(invalidSignup);
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(e => e.path.includes('confirmPassword'));
      expect(confirmError?.message).toBe('As senhas não coincidem');
    }
  });

  it('deve falhar com nome muito curto', () => {
    const invalidSignup = {
      name: 'Jo',
      email: 'joao@email.com',
      sector: 'CG/ADS/GRH',
      registration: '123456789',
      password: 'senha12345',
      confirmPassword: 'senha12345',
    };

    const result = signupSchema.safeParse(invalidSignup);
    expect(result.success).toBe(false);
  });

  it('deve falhar com matrícula curta (menos de 9 dígitos)', () => {
    const invalidSignup = {
      name: 'João da Silva',
      email: 'joao@email.com',
      sector: 'CG/ADS/GRH',
      registration: '12345678', // 8 dígitos
      password: 'senha12345',
      confirmPassword: 'senha12345',
    };

    const result = signupSchema.safeParse(invalidSignup);
    expect(result.success).toBe(false);
  });

  it('deve falhar com setor muito curto', () => {
    const invalidSignup = {
      name: 'João da Silva',
      email: 'joao@email.com',
      sector: 'A', // Apenas 1 caractere
      registration: '123456789',
      password: 'senha12345',
      confirmPassword: 'senha12345',
    };

    const result = signupSchema.safeParse(invalidSignup);
    expect(result.success).toBe(false);
  });

  it('deve aceitar matrícula com exatamente 9 dígitos', () => {
    const validSignup = {
      name: 'Maria Santos',
      email: 'maria@email.com',
      sector: 'CG/ATG',
      registration: '123456789',
      password: 'senha12345',
      confirmPassword: 'senha12345',
    };

    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });
});
