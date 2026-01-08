import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Risk } from '@/types'

// ============================================
// MOCKS (devem vir ANTES dos imports que usam)
// ============================================

// Mock do Prisma - usando vi.hoisted para garantir ordem correta
const { mockPrismaRisk } = vi.hoisted(() => ({
  mockPrismaRisk: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/src/app/prisma/prisma', () => ({
  prisma: {
    risk: mockPrismaRisk,
  },
}))

// Import DEPOIS do mock
import { saveRisk, deleteRisk } from '@/src/app/actions/risk.actions'

// Mock do next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock do schema de validação (aceita tudo por padrão)
vi.mock('@/src/lib/validation/risk.schema', () => ({
  riskSchema: {
    parse: vi.fn((data) => data),
  },
}))

// Mock dos cálculos de risco
vi.mock('@/src/lib/hooks/useRiskCalculations', () => ({
  calculateRiskValues: vi.fn((data) => ({
    inherentRisk: data.probability * data.impact,
    fac: 1.0,
    residualRisk: data.probability * data.impact,
    maxImplementationDate: '2025-12-31',
    suggestedResponse: 'Aceitar',
  })),
}))

// ============================================
// DADOS DE TESTE
// ============================================

const mockNewRisk: Risk = {
  id: 'r123', // ID temporário (começa com 'r')
  processId: 'proc-456',
  name: 'Risco de Fraude',
  type: 'Operacional',
  association: 'Processo',
  identificationDate: '2025-01-01',
  isLgpdRelated: false,
  causes: 'Falta de controle',
  consequences: 'Prejuízo financeiro',
  dimensions: ['Operacional'],
  probability: 4,
  probabilityJustification: '',
  impact: 5,
  impactJustification: '',
  inherentRisk: 20,
  controlsExist: false,
  isControlEffective: false,
  isControlProportional: false,
  isControlReasonable: false,
  isControlAdequate: false,
  fac: 1.0,
  residualRisk: 20,
  suggestedResponse: 'Reduzir',
  maxImplementationDate: '2025-07-01',
  history: [],
}

const mockExistingRisk: Risk = {
  ...mockNewRisk,
  id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
}

// ============================================
// TESTES
// ============================================

describe('risk.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // saveRisk
  // ============================================

  describe('saveRisk', () => {
    describe('Criação de novo risco', () => {
      it('deve criar um novo risco com sucesso', async () => {
        mockPrismaRisk.create.mockResolvedValue({
          id: 'new-uuid-123',
          ...mockNewRisk,
        })

        const result = await saveRisk(mockNewRisk)

        expect(result.success).toBe(true)
        expect(result.id).toBeDefined()
        expect(mockPrismaRisk.create).toHaveBeenCalledTimes(1)
      })

      it('deve identificar ID temporário (começa com "r") como novo', async () => {
        mockPrismaRisk.create.mockResolvedValue({
          id: 'created-id',
          ...mockNewRisk,
        })

        await saveRisk(mockNewRisk)

        expect(mockPrismaRisk.create).toHaveBeenCalled()
        expect(mockPrismaRisk.update).not.toHaveBeenCalled()
      })

      it('deve identificar ID vazio como novo', async () => {
        const riskWithEmptyId = { ...mockNewRisk, id: '' }
        mockPrismaRisk.create.mockResolvedValue({
          id: 'created-id',
          ...riskWithEmptyId,
        })

        await saveRisk(riskWithEmptyId)

        expect(mockPrismaRisk.create).toHaveBeenCalled()
        expect(mockPrismaRisk.update).not.toHaveBeenCalled()
      })
    })

    describe('Atualização de risco existente', () => {
      it('deve atualizar um risco existente com sucesso', async () => {
        mockPrismaRisk.update.mockResolvedValue({
          ...mockExistingRisk,
          name: 'Risco Atualizado',
        })

        const result = await saveRisk(mockExistingRisk)

        expect(result.success).toBe(true)
        expect(mockPrismaRisk.update).toHaveBeenCalledTimes(1)
        expect(mockPrismaRisk.create).not.toHaveBeenCalled()
      })

      it('deve usar o ID correto na cláusula where', async () => {
        mockPrismaRisk.update.mockResolvedValue(mockExistingRisk)

        await saveRisk(mockExistingRisk)

        expect(mockPrismaRisk.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockExistingRisk.id },
          })
        )
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando Prisma falha', async () => {
        mockPrismaRisk.create.mockRejectedValue(new Error('Database error'))

        const result = await saveRisk(mockNewRisk)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao salvar risco. Tente novamente.')
      })

      it('deve retornar erro específico para Foreign Key constraint', async () => {
        mockPrismaRisk.create.mockRejectedValue(
          new Error('Foreign key constraint failed')
        )

        const result = await saveRisk(mockNewRisk)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Processo associado não encontrado')
      })
    })
  })

  // ============================================
  // deleteRisk
  // ============================================

  describe('deleteRisk', () => {
    const validRiskId = '550e8400-e29b-41d4-a716-446655440000'
    const processId = 'proc-123'

    describe('Deleção bem sucedida', () => {
      it('deve deletar um risco com sucesso', async () => {
        mockPrismaRisk.delete.mockResolvedValue({ id: validRiskId })

        const result = await deleteRisk(validRiskId, processId)

        expect(result.success).toBe(true)
        expect(mockPrismaRisk.delete).toHaveBeenCalledWith({
          where: { id: validRiskId },
        })
      })
    })

    describe('Validação de entrada', () => {
      it('deve rejeitar ID vazio', async () => {
        const result = await deleteRisk('', processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de risco inválido')
        expect(mockPrismaRisk.delete).not.toHaveBeenCalled()
      })

      it('deve rejeitar ID muito curto', async () => {
        const result = await deleteRisk('abc123', processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de risco inválido')
        expect(mockPrismaRisk.delete).not.toHaveBeenCalled()
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando risco não existe', async () => {
        mockPrismaRisk.delete.mockRejectedValue(
          new Error('Record to delete does not exist')
        )

        const result = await deleteRisk(validRiskId, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Risco não encontrado')
      })

      it('deve retornar erro genérico para outros erros', async () => {
        mockPrismaRisk.delete.mockRejectedValue(new Error('Unknown error'))

        const result = await deleteRisk(validRiskId, processId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao deletar risco. Tente novamente.')
      })
    })
  })
})
