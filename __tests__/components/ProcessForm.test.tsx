import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProcessForm from '@/src/components/features/process/ProcessForm'
import { Process } from '@/types'

// Mock do SECTORS
vi.mock('@/src/constants/constants', () => ({
  SECTORS: ['CG/ATG', 'CG/ACS', 'CG/ADS/GRH', 'CG/SUBAC/ADG']
}))

const mockProcessExisting: Process = {
  id: 'proc-123',
  name: 'Processo de Compras',
  sector: 'CG/ADS/GRH',
  manager: 'João Silva',
  legalBasis: 'Lei 8.666/1993',
  responsibleServers: ['Maria Santos', 'Pedro Costa'],
  systemsUsed: ['SAP', 'SIGES'],
  stakeholders: ['Diretoria', 'TI'],
  history: []
}

const mockOnSave = vi.fn<(process: Process) => Promise<void>>().mockResolvedValue(undefined)
const mockOnCancel = vi.fn<() => void>()

// Helpers para buscar elementos
const getInputByName = (name: string) => document.querySelector(`input[name="${name}"]`) as HTMLInputElement
const getSelectByName = (name: string) => document.querySelector(`select[name="${name}"]`) as HTMLSelectElement
const getTextareaByName = (name: string) => document.querySelector(`textarea[name="${name}"]`) as HTMLTextAreaElement

describe('ProcessForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização - Novo Processo', () => {
    it('deve renderizar labels dos campos', () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText(/nome do processo/i)).toBeInTheDocument()
      expect(screen.getByText('Setor *')).toBeInTheDocument()
      expect(screen.getByText('Gestor *')).toBeInTheDocument()
    })

    it('deve renderizar campos vazios para novo processo', () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      const managerInput = getInputByName('manager')

      expect(nameInput).toHaveValue('')
      expect(managerInput).toHaveValue('')
    })

    it('deve renderizar botões de ação', () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salvar processo/i })).toBeInTheDocument()
    })

    it('deve renderizar placeholders dos campos opcionais', () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText(/joão silva, maria santos/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/sap, siges, oracle/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/diretoria, ti, financeiro/i)).toBeInTheDocument()
    })

    it('NÃO deve mostrar campo de justificativa para novo processo', () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.queryByText(/justificativa da alteração/i)).not.toBeInTheDocument()
    })
  })

  describe('Renderização - Edição', () => {
    it('deve preencher campos com dados do processo existente', () => {
      render(<ProcessForm process={mockProcessExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      const managerInput = getInputByName('manager')
      const sectorSelect = getSelectByName('sector')

      expect(nameInput).toHaveValue('Processo de Compras')
      expect(managerInput).toHaveValue('João Silva')
      expect(sectorSelect).toHaveValue('CG/ADS/GRH')
    })

    it('deve mostrar servidores separados por vírgula', () => {
      render(<ProcessForm process={mockProcessExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const serversInput = screen.getByPlaceholderText(/joão silva, maria santos/i)
      expect(serversInput).toHaveValue('Maria Santos, Pedro Costa')
    })

    it('DEVE mostrar campo de justificativa para edição', () => {
      render(<ProcessForm process={mockProcessExisting} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText(/justificativa da alteração/i)).toBeInTheDocument()
    })
  })

  describe('Interações', () => {
    it('deve atualizar o campo nome ao digitar', async () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      const nameInput = getInputByName('name')
      await userEvent.type(nameInput, 'Novo Processo de Teste')

      expect(nameInput).toHaveValue('Novo Processo de Teste')
    })

    it('deve atualizar o setor ao selecionar', async () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      const sectorSelect = getSelectByName('sector')
      await userEvent.selectOptions(sectorSelect, 'CG/ADS/GRH')

      expect(sectorSelect).toHaveValue('CG/ADS/GRH')
    })

    it('deve chamar onCancel ao clicar no botão Cancelar', async () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Submissão', () => {
    it('deve chamar onSave com dados corretos ao submeter', async () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.type(getInputByName('name'), 'Processo Teste')
      await userEvent.selectOptions(getSelectByName('sector'), 'CG/ATG')
      await userEvent.type(getInputByName('manager'), 'Gestor Teste')

      await userEvent.click(screen.getByRole('button', { name: /salvar processo/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Processo Teste',
            sector: 'CG/ATG',
            manager: 'Gestor Teste'
          })
        )
      })
    })

    it('deve mostrar "Salvando..." durante a submissão', async () => {
      const slowSave = vi.fn<(process: Process) => Promise<void>>().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      render(<ProcessForm onSave={slowSave} onCancel={mockOnCancel} />)

      await userEvent.type(getInputByName('name'), 'Processo')
      await userEvent.selectOptions(getSelectByName('sector'), 'CG/ATG')
      await userEvent.type(getInputByName('manager'), 'Gestor')

      await userEvent.click(screen.getByRole('button', { name: /salvar processo/i }))

      expect(screen.getByRole('button', { name: /salvando/i })).toBeInTheDocument()
    })
  })

  describe('Histórico', () => {
    it('não deve adicionar histórico para novo processo', async () => {
      render(<ProcessForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      await userEvent.type(getInputByName('name'), 'Novo Processo')
      await userEvent.selectOptions(getSelectByName('sector'), 'CG/ATG')
      await userEvent.type(getInputByName('manager'), 'Gestor')

      await userEvent.click(screen.getByRole('button', { name: /salvar processo/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            history: []
          })
        )
      })
    })
  })
})
