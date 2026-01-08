import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ControlForm from '@/src/components/features/control/ControlForm'
import { Risk, Control } from '@/types'

// Mock das constantes
vi.mock('@/src/constants/constants', () => ({
  CONTROL_TYPES: ['Preventivo', 'Detectivo', 'Corretivo'],
  CONTROL_NATURES: ['Manual', 'Automatizado', 'Semiautomatizado'],
  CONTROL_RELATIONS: ['Direto', 'Indireto'],
  CONTROL_NEW_MODIFIED: ['Novo', 'Modificado']
}))

const mockRisk: Risk = {
  id: 'risk-123',
  processId: 'proc-456',
  name: 'Risco de Teste',
  type: 'Operacional',
  association: 'Processo',
  identificationDate: '2025-01-01',
  isLgpdRelated: false,
  causes: 'Causa teste',
  consequences: 'Consequência teste',
  dimensions: [],
  probability: 3,
  probabilityJustification: '',
  impact: 4,
  impactJustification: '',
  inherentRisk: 12,
  controlsExist: false,
  isControlEffective: false,
  isControlProportional: false,
  isControlReasonable: false,
  isControlAdequate: false,
  fac: 1.0,
  residualRisk: 12,
  suggestedResponse: 'Reduzir',
  maxImplementationDate: '2025-07-01',
  history: []
}

const mockControlExisting: Control = {
  id: 'ctrl-123',
  riskId: 'risk-123',
  name: 'Controle de Revisão',
  implemented: false,
  status: 'near-due',
  newOrModified: 'Novo',
  type: 'Preventivo',
  nature: 'Manual',
  relationToRisk: 'Direto',
  responsible: 'João Silva',
  implementationMethod: 'Revisão mensal de documentos',
  macroSteps: '1. Coletar documentos',
  plannedStartDate: '2025-01-01',
  plannedEndDate: '2025-06-30',
  actualEndDate: '',
  involvedSectors: ['TI', 'Operações'],
  adequacyAnalysis: 'Controle adequado',
  history: []
}

const mockOnSave = vi.fn<(control: Control) => void>()
const mockOnCancel = vi.fn<() => void>()

// Helpers
const getInputByName = (name: string) => document.querySelector(`input[name="${name}"]`) as HTMLInputElement
const getSelectByName = (name: string) => document.querySelector(`select[name="${name}"]`) as HTMLSelectElement
const getTextareaByName = (name: string) => document.querySelector(`textarea[name="${name}"]`) as HTMLTextAreaElement
const getInputById = (id: string) => document.querySelector(`#${id}`) as HTMLInputElement

describe('ControlForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização - Novo Controle', () => {
    it('deve renderizar todas as seções', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('1. Identificação do Controle')).toBeInTheDocument()
      expect(screen.getByText('2. Cronograma')).toBeInTheDocument()
      expect(screen.getByText('3. Detalhamento')).toBeInTheDocument()
    })

    it('deve renderizar labels dos campos', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText(/nome do controle/i)).toBeInTheDocument()
      expect(screen.getByText(/novo ou modificado/i)).toBeInTheDocument()
      expect(screen.getByText(/^tipo$/i)).toBeInTheDocument()
      expect(screen.getByText(/natureza/i)).toBeInTheDocument()
    })

    it('deve renderizar checkbox de implementado', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/controle já implementado/i)).toBeInTheDocument()
    })

    it('deve renderizar botões de ação', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salvar controle/i })).toBeInTheDocument()
    })

    it('NÃO deve mostrar campo de justificativa para novo controle', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.queryByText(/justificativa da alteração/i)).not.toBeInTheDocument()
    })
  })

  describe('Renderização - Edição', () => {
    it('deve preencher campos com dados do controle existente', () => {
      render(<ControlForm risk={mockRisk} control={mockControlExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputById('c-name')
      expect(nameInput).toHaveValue('Controle de Revisão')
    })

    it('deve mostrar tipo e natureza selecionados', () => {
      render(<ControlForm risk={mockRisk} control={mockControlExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const typeSelect = getSelectByName('type')
      const natureSelect = getSelectByName('nature')

      expect(typeSelect).toHaveValue('Preventivo')
      expect(natureSelect).toHaveValue('Manual')
    })

    it('DEVE mostrar campo de justificativa para edição', () => {
      render(<ControlForm risk={mockRisk} control={mockControlExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText(/justificativa da alteração/i)).toBeInTheDocument()
    })
  })

  describe('Interações', () => {
    it('deve atualizar campo nome ao digitar', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputById('c-name')
      await userEvent.type(nameInput, 'Novo Controle')

      expect(nameInput).toHaveValue('Novo Controle')
    })

    it('deve atualizar tipo ao selecionar', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const typeSelect = getSelectByName('type')
      await userEvent.selectOptions(typeSelect, 'Detectivo')

      expect(typeSelect).toHaveValue('Detectivo')
    })

    it('deve marcar/desmarcar checkbox de implementado', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const implementedCheckbox = screen.getByLabelText(/controle já implementado/i)

      expect(implementedCheckbox).not.toBeChecked()

      await userEvent.click(implementedCheckbox)
      expect(implementedCheckbox).toBeChecked()

      await userEvent.click(implementedCheckbox)
      expect(implementedCheckbox).not.toBeChecked()
    })

    it('deve chamar onCancel ao clicar em Cancelar', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Submissão', () => {
    it('deve chamar onSave com dados corretos ao submeter', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputById('c-name')
      await userEvent.type(nameInput, 'Controle de Teste')

      await userEvent.click(screen.getByRole('button', { name: /salvar controle/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Controle de Teste',
            riskId: 'risk-123'
          })
        )
      })
    })

    it('deve incluir status implementado ao salvar', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.type(getInputById('c-name'), 'Controle')
      await userEvent.click(screen.getByLabelText(/controle já implementado/i))

      await userEvent.click(screen.getByRole('button', { name: /salvar controle/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            implemented: true,
            status: 'on-time'
          })
        )
      })
    })
  })

  describe('Histórico', () => {
    it('não deve adicionar histórico para novo controle', async () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.type(getInputById('c-name'), 'Novo Controle')
      await userEvent.click(screen.getByRole('button', { name: /salvar controle/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            history: []
          })
        )
      })
    })
  })

  describe('Tipos de Controle', () => {
    it('deve ter todas as opções de tipo', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const typeSelect = getSelectByName('type')
      expect(typeSelect).toContainHTML('Preventivo')
      expect(typeSelect).toContainHTML('Detectivo')
      expect(typeSelect).toContainHTML('Corretivo')
    })
  })

  describe('Natureza do Controle', () => {
    it('deve ter todas as opções de natureza', () => {
      render(<ControlForm risk={mockRisk} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const natureSelect = getSelectByName('nature')
      expect(natureSelect).toContainHTML('Manual')
      expect(natureSelect).toContainHTML('Automatizado')
      expect(natureSelect).toContainHTML('Semiautomatizado')
    })
  })
})
