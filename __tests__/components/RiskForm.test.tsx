import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RiskForm from '@/src/components/features/risk/RiskForm'
import { Risk } from '@/types'

// Mock das constantes
vi.mock('@/src/constants/constants', () => ({
  RISK_TYPES: ['Operacional', 'Estratégico', 'Financeiro', 'Conformidade', 'Imagem'],
  RISK_ASSOCIATIONS: ['Processo', 'Projeto'],
  RISK_DIMENSIONS: ['Operacional', 'Estratégico', 'Conformidade', 'Imagem', 'Sancionatório', 'Privacidade'],
  RISK_RESPONSES: ['Aceitar', 'Evitar', 'Compartilhar', 'Eliminar', 'Potencializar', 'Reduzir'],
  PROBABILITY_IMPACT_SCALE: [
    { value: 1, label: 'Muito Baixo' },
    { value: 2, label: 'Baixo' },
    { value: 3, label: 'Médio' },
    { value: 4, label: 'Alto' },
    { value: 5, label: 'Muito Alto' }
  ]
}))

// Mock das funções de classificação
vi.mock('@/src/lib/domain/risk-classification', () => ({
  getInherentRiskLevel: (value: number) => {
    if (value > 15) return { label: 'Crítico', color: 'bg-red-500' }
    if (value > 10) return { label: 'Alto', color: 'bg-orange-500' }
    if (value > 7) return { label: 'Médio', color: 'bg-yellow-500' }
    if (value > 3) return { label: 'Baixo', color: 'bg-green-500' }
    return { label: 'Muito Baixo', color: 'bg-teal-500' }
  },
  getResidualRiskLevel: (value: number) => {
    if (value > 15) return { label: 'Crítico', color: 'bg-red-500' }
    if (value > 10) return { label: 'Alto', color: 'bg-orange-500' }
    if (value > 7) return { label: 'Médio', color: 'bg-yellow-500' }
    if (value > 3) return { label: 'Baixo', color: 'bg-green-500' }
    return { label: 'Muito Baixo', color: 'bg-teal-500' }
  }
}))

const mockRiskExisting: Risk = {
  id: 'risk-123',
  processId: 'proc-456',
  name: 'Risco de Fraude',
  type: 'Operacional',
  association: 'Processo',
  identificationDate: '2025-01-01',
  isLgpdRelated: false,
  causes: 'Falta de controle interno',
  consequences: 'Prejuízo financeiro',
  dimensions: ['Operacional', 'Estratégico'],
  probability: 4,
  probabilityJustification: '',
  impact: 5,
  impactJustification: '',
  inherentRisk: 20,
  controlsExist: true,
  isControlEffective: true,
  isControlProportional: true,
  isControlReasonable: true,
  isControlAdequate: true,
  fac: 0.2,
  residualRisk: 4,
  suggestedResponse: 'Reduzir',
  maxImplementationDate: '2025-07-01',
  history: []
}

const mockOnSave = vi.fn<(risk: Risk) => Promise<void>>().mockResolvedValue(undefined)
const mockOnCancel = vi.fn<() => void>()

// Helpers para buscar elementos por name
const getInputByName = (name: string) => document.querySelector(`input[name="${name}"]`) as HTMLInputElement
const getSelectByName = (name: string) => document.querySelector(`select[name="${name}"]`) as HTMLSelectElement

describe('RiskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar todas as seções do formulário', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('1. Identificação')).toBeInTheDocument()
      expect(screen.getByText('2. Detalhamento')).toBeInTheDocument()
      expect(screen.getByText('3. Análise Quantitativa')).toBeInTheDocument()
      expect(screen.getByText('4. Avaliação de Controles (FAC)')).toBeInTheDocument()
      expect(screen.getByText('5. Avaliação Residual')).toBeInTheDocument()
    })

    it('deve renderizar labels dos campos principais', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('Nome do Risco *')).toBeInTheDocument()
      expect(screen.getByText('Tipo')).toBeInTheDocument()
      expect(screen.getByText('Associação')).toBeInTheDocument()
      expect(screen.getByText('Data de Identificação')).toBeInTheDocument()
    })

    it('deve renderizar checkbox de LGPD', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/relação com lgpd/i)).toBeInTheDocument()
    })

    it('deve renderizar botões de ação', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salvar risco/i })).toBeInTheDocument()
    })

    it('deve renderizar Risco Inerente e Risco Residual', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('Risco Inerente')).toBeInTheDocument()
      expect(screen.getByText('Risco Residual')).toBeInTheDocument()
    })

    it('deve mostrar FAC como Ineficaz por padrão', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('Ineficaz')).toBeInTheDocument()
    })
  })

  describe('Edição de Risco', () => {
    it('deve preencher o nome do risco existente', () => {
      render(<RiskForm risk={mockRiskExisting} processId="proc-456" onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      expect(nameInput).toHaveValue('Risco de Fraude')
    })

    it('deve mostrar campo de justificativa para edição', () => {
      render(<RiskForm risk={mockRiskExisting} processId="proc-456" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText(/justificativa da edição/i)).toBeInTheDocument()
    })

    it('NÃO deve mostrar justificativa para novo risco', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.queryByText(/justificativa da edição/i)).not.toBeInTheDocument()
    })
  })

  describe('Dimensões do Risco', () => {
    it('deve renderizar checkboxes de dimensões', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('Dimensões')).toBeInTheDocument()
      expect(screen.getByLabelText('Operacional')).toBeInTheDocument()
      expect(screen.getByLabelText('Estratégico')).toBeInTheDocument()
    })

    it('deve permitir selecionar dimensões', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      const checkbox = screen.getByLabelText('Conformidade')
      await userEvent.click(checkbox)

      expect(checkbox).toBeChecked()
    })
  })

  describe('Checkbox LGPD', () => {
    it('deve iniciar desmarcado', () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/relação com lgpd/i)).not.toBeChecked()
    })

    it('deve permitir marcar/desmarcar', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      const lgpdCheckbox = screen.getByLabelText(/relação com lgpd/i)

      await userEvent.click(lgpdCheckbox)
      expect(lgpdCheckbox).toBeChecked()

      await userEvent.click(lgpdCheckbox)
      expect(lgpdCheckbox).not.toBeChecked()
    })
  })

  describe('Interações', () => {
    it('deve chamar onCancel ao clicar em Cancelar', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('deve atualizar o nome ao digitar', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      await userEvent.type(nameInput, 'Novo Risco')

      expect(nameInput).toHaveValue('Novo Risco')
    })
  })

  describe('FAC', () => {
    it('deve mostrar perguntas ao marcar controles existentes', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.queryByText(/o controle é eficaz/i)).not.toBeInTheDocument()

      const controlsCheckbox = getInputByName('controlsExist')
      await userEvent.click(controlsCheckbox)

      expect(screen.getByText(/o controle é eficaz/i)).toBeInTheDocument()
    })
  })

  describe('Submissão', () => {
    it('deve chamar onSave ao submeter', async () => {
      render(<RiskForm processId="proc-123" onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      await userEvent.type(nameInput, 'Risco de Teste')

      await userEvent.click(screen.getByRole('button', { name: /salvar risco/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
      })
    })
  })
})
