import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Control } from '@/types'

// ============================================
// MOCKS (devem vir ANTES dos imports que usam)
// ============================================

// Mock do Prisma - usando vi.hoisted para garantir ordem correta
const { mockPrismaControl } = vi.hoisted(() => ({
  mockPrismaControl: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/src/app/prisma/prisma', () => ({
  prisma: {
    control: mockPrismaControl,
  },
}))

// Import DEPOIS do mock
import { saveControl, deleteControl } from '@/src/app/actions/control.actions'

// Mock do next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock do schema de validação
vi.mock('@/src/lib/validation/control.schema', () => ({
  controlSchema: {
    parse: vi.fn((data) => data),
  },
}))

// Mock da função de status
vi.mock('@/src/lib/domain/control-status', () => ({
  getControlStatus: vi.fn((plannedEndDate, implemented) => {
    if (implemented) return 'on-time'
    if (!plannedEndDate) return 'on-time'
    return 'near-due'
  }),
}))

// ============================================
// DADOS DE TESTE
// ============================================

const mockNewControl: Control = {
  id: 'c123', // ID temporário
  riskId: 'risk-456',
  name: 'Controle de Revisão',
  implemented: false,
  status: 'near-due',
  newOrModified: 'Novo',
  type: 'Preventivo',
  nature: 'Manual',
  relationToRisk: 'Direto',
  responsible: 'João Silva',
  implementationMethod: 'Revisão mensal',
  macroSteps: '1. Revisar 2. Aprovar',
  plannedStartDate: '2025-01-01',
  plannedEndDate: '2025-06-30',
  actualEndDate: '',
  involvedSectors: ['TI', 'Operações'],
  adequacyAnalysis: 'Adequado',
  history: [],
}

const mockExistingControl: Control = {
  ...mockNewControl,
  id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
}

const processId = 'proc-789'

// ============================================
// TESTES
// ============================================

describe('control.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // saveControl
  // ============================================

  describe('saveControl', () => {
    describe('Criação de novo controle', () => {
      it('deve criar um novo controle com sucesso', async () => {
        mockPrismaControl.create.mockResolvedValue({
          id: 'new-uuid-123',
          ...mockNewControl,
        })

        const result = await saveControl(mockNewControl, processId)

        expect(result.success).toBe(true)
        expect(result.id).toBeDefined()
        expect(mockPrismaControl.create).toHaveBeenCalledTimes(1)
      })

      it('deve identificar ID não-UUID como novo controle', async () => {
        mockPrismaControl.create.mockResolvedValue({
          id: 'created-id',
          ...mockNewControl,
        })

        await saveControl(mockNewControl, processId)

        expect(mockPrismaControl.create).toHaveBeenCalled()
        expect(mockPrismaControl.update).not.toHaveBeenCalled()
      })

      it('deve criar controle mesmo com ID vazio', async () => {
        const controlWithEmptyId = { ...mockNewControl, id: '' }
        mockPrismaControl.create.mockResolvedValue({
          id: 'created-id',
          ...controlWithEmptyId,
        })

        await saveControl(controlWithEmptyId, processId)

        expect(mockPrismaControl.create).toHaveBeenCalled()
      })
    })

    describe('Atualização de controle existente', () => {
      it('deve atualizar um controle existente com sucesso', async () => {
        mockPrismaControl.update.mockResolvedValue({
          ...mockExistingControl,
          name: 'Controle Atualizado',
        })

        const result = await saveControl(mockExistingControl, processId)

        expect(result.success).toBe(true)
        expect(mockPrismaControl.update).toHaveBeenCalledTimes(1)
        expect(mockPrismaControl.create).not.toHaveBeenCalled()
      })

      it('deve usar ID correto na cláusula where', async () => {
        mockPrismaControl.update.mockResolvedValue(mockExistingControl)

        await saveControl(mockExistingControl, processId)

        expect(mockPrismaControl.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockExistingControl.id },
          })
        )
      })

      it('deve reconhecer UUID válido como controle existente', async () => {
        const uuids = [
          '550e8400-e29b-41d4-a716-446655440000',
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          '123e4567-e89b-12d3-a456-426614174000',
        ]

        for (const uuid of uuids) {
          vi.clearAllMocks()
          const control = { ...mockNewControl, id: uuid }
          mockPrismaControl.update.mockResolvedValue(control)

          await saveControl(control, processId)

          expect(mockPrismaControl.update).toHaveBeenCalled()
          expect(mockPrismaControl.create).not.toHaveBeenCalled()
        }
      })
    })

    describe('Cálculo automático de status', () => {
      it('deve calcular status como "on-time" quando implementado', async () => {
        const implementedControl = {
          ...mockNewControl,
          implemented: true,
        }
        mockPrismaControl.create.mockResolvedValue({
          id: 'new-id',
          ...implementedControl,
          status: 'on-time',
        })

        await saveControl(implementedControl, processId)

        expect(mockPrismaControl.create).toHaveBeenCalled()
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando Prisma falha', async () => {
        mockPrismaControl.create.mockRejectedValue(new Error('Database error'))

        const result = await saveControl(mockNewControl, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao salvar controle. Tente novamente.')
      })

      it('deve retornar erro específico para Foreign Key constraint', async () => {
        mockPrismaControl.create.mockRejectedValue(
          new Error('Foreign key constraint failed')
        )

        const result = await saveControl(mockNewControl, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Risco associado não encontrado')
      })
    })
  })

  // ============================================
  // deleteControl
  // ============================================

  describe('deleteControl', () => {
    const validControlId = '550e8400-e29b-41d4-a716-446655440000'
    const riskId = 'risk-123'

    describe('Deleção bem sucedida', () => {
      it('deve deletar um controle com sucesso', async () => {
        mockPrismaControl.delete.mockResolvedValue({ id: validControlId })

        const result = await deleteControl(validControlId, riskId, processId)

        expect(result.success).toBe(true)
        expect(mockPrismaControl.delete).toHaveBeenCalledWith({
          where: { id: validControlId },
        })
      })
    })

    describe('Validação de UUID', () => {
      it('deve rejeitar ID vazio', async () => {
        const result = await deleteControl('', riskId, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de controle inválido')
        expect(mockPrismaControl.delete).not.toHaveBeenCalled()
      })

      it('deve rejeitar ID não-UUID', async () => {
        const invalidIds = ['c123', 'abc-def', 'not-a-uuid', '12345']

        for (const invalidId of invalidIds) {
          vi.clearAllMocks()
          const result = await deleteControl(invalidId, riskId, processId)

          expect(result.success).toBe(false)
          expect(result.error).toBe('ID de controle inválido')
        }
      })

      it('deve aceitar UUID válido', async () => {
        mockPrismaControl.delete.mockResolvedValue({ id: validControlId })

        const result = await deleteControl(validControlId, riskId, processId)

        expect(result.success).toBe(true)
        expect(mockPrismaControl.delete).toHaveBeenCalled()
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando controle não existe', async () => {
        mockPrismaControl.delete.mockRejectedValue(
          new Error('Record to delete does not exist')
        )

        const result = await deleteControl(validControlId, riskId, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Controle não encontrado')
      })

      it('deve retornar erro genérico para erros desconhecidos', async () => {
        mockPrismaControl.delete.mockRejectedValue(new Error('Unknown error'))

        const result = await deleteControl(validControlId, riskId, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao deletar controle. Tente novamente.')
      })
    })
  })
})
