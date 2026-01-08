import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProcessDetails from '@/src/components/features/process/ProcessDetails'
import { Process } from '@/types'

// ============================================
// DADOS DE TESTE
// ============================================

const mockProcessComplete: Process = {
  id: 'proc-123',
  name: 'Processo de Compras Públicas',
  sector: 'CG/ADS/GRH',
  manager: 'João da Silva',
  responsibleServers: ['Maria Santos', 'Pedro Oliveira', 'Ana Costa'],
  systemsUsed: ['SAP', 'SIGES', 'SEI'],
  stakeholders: ['Diretoria', 'TI', 'Financeiro'],
  legalBasis: 'Lei 8.666/1993 - Licitações e Contratos',
  history: [
    {
      timestamp: '2025-01-05T10:30:00',
      user: 'admin',
      justification: 'Criação inicial do processo',
      changes: 'Processo criado'
    },
    {
      timestamp: '2025-01-06T14:20:00',
      user: 'joao.silva',
      justification: 'Atualização dos stakeholders',
      changes: 'Adicionado TI como stakeholder'
    }
  ]
}

const mockProcessMinimal: Process = {
  id: 'proc-456',
  name: 'Processo Mínimo',
  sector: 'CG/ATG',
  manager: 'Maria Santos',
  responsibleServers: [],
  systemsUsed: [],
  stakeholders: [],
  legalBasis: '',
  history: []
}

const mockProcessPartial: Process = {
  id: 'proc-789',
  name: 'Processo Parcial',
  sector: 'CG/ACS',
  manager: 'Pedro Costa',
  responsibleServers: ['Ana Lima'],
  systemsUsed: [],
  stakeholders: ['Diretoria'],
  legalBasis: 'Decreto Municipal 123/2024',
  history: []
}

// ============================================
// TESTES
// ============================================

describe('ProcessDetails', () => {

  // ============================================
  // TESTES DE INFORMAÇÕES BÁSICAS
  // ============================================

  describe('Informações Básicas', () => {
    it('deve renderizar o nome do processo', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Processo de Compras Públicas')).toBeInTheDocument()
    })

    it('deve renderizar o ID do processo', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('ID: proc-123')).toBeInTheDocument()
    })

    it('deve renderizar o setor', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('CG/ADS/GRH')).toBeInTheDocument()
    })

    it('deve renderizar o gestor responsável', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('João da Silva')).toBeInTheDocument()
    })

    it('deve renderizar a label "Setor"', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Setor')).toBeInTheDocument()
    })

    it('deve renderizar a label "Gestor Responsável"', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Gestor Responsável')).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE LISTAS
  // ============================================

  describe('Listas de Informações', () => {
    it('deve renderizar os servidores envolvidos', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Maria Santos, Pedro Oliveira, Ana Costa')).toBeInTheDocument()
    })

    it('deve renderizar os sistemas utilizados', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('SAP, SIGES, SEI')).toBeInTheDocument()
    })

    it('deve renderizar os stakeholders', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Diretoria, TI, Financeiro')).toBeInTheDocument()
    })

    it('deve mostrar "Nenhum registrado" quando lista está vazia', () => {
      render(<ProcessDetails process={mockProcessMinimal} />)

      // Deve aparecer 3 vezes (servidores, sistemas, stakeholders)
      const emptyMessages = screen.getAllByText('Nenhum registrado')
      expect(emptyMessages.length).toBe(3)
    })

    it('deve renderizar lista com apenas um item', () => {
      render(<ProcessDetails process={mockProcessPartial} />)

      expect(screen.getByText('Ana Lima')).toBeInTheDocument()
      expect(screen.getByText('Diretoria')).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE BASE LEGAL
  // ============================================

  describe('Base Legal', () => {
    it('deve renderizar a base legal quando informada', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Lei 8.666/1993 - Licitações e Contratos')).toBeInTheDocument()
    })

    it('deve mostrar "Não informada." quando base legal está vazia', () => {
      render(<ProcessDetails process={mockProcessMinimal} />)

      expect(screen.getByText('Não informada.')).toBeInTheDocument()
    })

    it('deve renderizar o título "Base Legal"', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Base Legal')).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE HISTÓRICO
  // ============================================

  describe('Histórico de Alterações', () => {
    it('deve renderizar o título do histórico', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Histórico de Alterações')).toBeInTheDocument()
    })

    it('deve renderizar a tabela de histórico quando há entradas', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      // Verifica cabeçalhos da tabela
      expect(screen.getByText('Data')).toBeInTheDocument()
      expect(screen.getByText('Usuário')).toBeInTheDocument()
      expect(screen.getByText('Justificativa')).toBeInTheDocument()
    })

    it('deve renderizar as entradas do histórico', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('Criação inicial do processo')).toBeInTheDocument()
      expect(screen.getByText('joao.silva')).toBeInTheDocument()
      expect(screen.getByText('Atualização dos stakeholders')).toBeInTheDocument()
    })

    it('deve mostrar mensagem quando não há histórico', () => {
      render(<ProcessDetails process={mockProcessMinimal} />)

      expect(screen.getByText('Nenhum histórico registrado.')).toBeInTheDocument()
    })

    it('deve formatar as datas do histórico corretamente', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      // As datas devem estar formatadas em pt-BR
      // 2025-01-05T10:30:00 → 05/01/2025 10:30:00
      expect(screen.getByText(/05\/01\/2025/)).toBeInTheDocument()
      expect(screen.getByText(/06\/01\/2025/)).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE SEÇÕES
  // ============================================

  describe('Seções e Estrutura', () => {
    it('deve renderizar todas as seções principais', () => {
      render(<ProcessDetails process={mockProcessComplete} />)

      expect(screen.getByText('Servidores Envolvidos')).toBeInTheDocument()
      expect(screen.getByText('Sistemas Utilizados')).toBeInTheDocument()
      expect(screen.getByText('Stakeholders')).toBeInTheDocument()
      expect(screen.getByText('Base Legal')).toBeInTheDocument()
      expect(screen.getByText('Histórico de Alterações')).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES COM DADOS ESPECIAIS
  // ============================================

  describe('Dados Especiais', () => {
    it('deve renderizar processo com nome longo', () => {
      const processLongName: Process = {
        ...mockProcessMinimal,
        name: 'Processo de Gestão de Riscos Operacionais e Controles Internos da Controladoria-Geral do Município'
      }

      render(<ProcessDetails process={processLongName} />)

      expect(screen.getByText(processLongName.name)).toBeInTheDocument()
    })

    it('deve renderizar processo com muitos servidores', () => {
      const processManyServers: Process = {
        ...mockProcessMinimal,
        responsibleServers: ['Servidor 1', 'Servidor 2', 'Servidor 3', 'Servidor 4', 'Servidor 5']
      }

      render(<ProcessDetails process={processManyServers} />)

      expect(screen.getByText('Servidor 1, Servidor 2, Servidor 3, Servidor 4, Servidor 5')).toBeInTheDocument()
    })

    it('deve renderizar base legal com múltiplas linhas', () => {
      const processMultiLineLegal: Process = {
        ...mockProcessMinimal,
        legalBasis: 'Lei 8.666/1993\nDecreto 9.412/2018\nIN 05/2017'
      }

      render(<ProcessDetails process={processMultiLineLegal} />)

      expect(screen.getByText(/Lei 8.666\/1993/)).toBeInTheDocument()
    })
  })
})
