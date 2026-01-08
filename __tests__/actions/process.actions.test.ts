import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Process } from '@/types'

// ============================================
// MOCKS (devem vir ANTES dos imports que usam)
// ============================================

// Mock do Prisma - usando vi.hoisted para garantir ordem correta
const { mockPrismaProcess } = vi.hoisted(() => ({
  mockPrismaProcess: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/src/app/prisma/prisma', () => ({
  prisma: {
    process: mockPrismaProcess,
  },
}))

// Import DEPOIS do mock
import { saveProcess, deleteProcess } from '@/src/app/actions/process.actions'

// Mock do next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock do schema de validação (aceita tudo por padrão)
vi.mock('@/src/lib/validation/process.schema', () => ({
  processSchema: {
    parse: vi.fn((data) => data),
  },
}))

// ============================================
// DADOS DE TESTE
// ============================================

const mockNewProcess: Process = {
  id: 'p123', // ID temporário (começa com 'p')
  name: 'Processo de Compras',
  sector: 'CG/ATG',
  manager: 'João Silva',
  legalBasis: 'Lei 8.666/1993',
  responsibleServers: ['Maria Santos', 'Pedro Costa'],
  systemsUsed: ['SAP', 'SIGES'],
  stakeholders: ['Diretoria', 'TI'],
  history: [],
}

const mockExistingProcess: Process = {
  ...mockNewProcess,
  id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
}

// ============================================
// TESTES
// ============================================

describe('process.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // saveProcess
  // ============================================

  describe('saveProcess', () => {
    describe('Criação de novo processo', () => {
      it('deve criar um novo processo com sucesso', async () => {
        mockPrismaProcess.create.mockResolvedValue({
          id: 'new-uuid-123',
          ...mockNewProcess,
        })

        const result = await saveProcess(mockNewProcess)

        expect(result.success).toBe(true)
        expect(result.id).toBeDefined()
        expect(mockPrismaProcess.create).toHaveBeenCalledTimes(1)
      })

      it('deve identificar ID temporário (começa com "p") como novo', async () => {
        mockPrismaProcess.create.mockResolvedValue({
          id: 'created-id',
          ...mockNewProcess,
        })

        await saveProcess(mockNewProcess)

        expect(mockPrismaProcess.create).toHaveBeenCalled()
        expect(mockPrismaProcess.update).not.toHaveBeenCalled()
      })

      it('deve identificar ID vazio como novo', async () => {
        const processWithEmptyId = { ...mockNewProcess, id: '' }
        mockPrismaProcess.create.mockResolvedValue({
          id: 'created-id',
          ...processWithEmptyId,
        })

        await saveProcess(processWithEmptyId)

        expect(mockPrismaProcess.create).toHaveBeenCalled()
        expect(mockPrismaProcess.update).not.toHaveBeenCalled()
      })

      it('deve criar processo sem ID (undefined)', async () => {
        const processWithoutId = { ...mockNewProcess, id: undefined as any }
        mockPrismaProcess.create.mockResolvedValue({
          id: 'created-id',
          ...processWithoutId,
        })

        await saveProcess(processWithoutId)

        expect(mockPrismaProcess.create).toHaveBeenCalled()
      })

      it('deve incluir arrays vazios para campos opcionais', async () => {
        const minimalProcess: Process = {
          id: 'p123',
          name: 'Processo Mínimo',
          sector: 'CG/ATG',
          manager: 'Gestor',
          legalBasis: '',
          responsibleServers: [],
          systemsUsed: [],
          stakeholders: [],
          history: [],
        }
        mockPrismaProcess.create.mockResolvedValue({
          id: 'created-id',
          ...minimalProcess,
        })

        await saveProcess(minimalProcess)

        expect(mockPrismaProcess.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              responsibleServers: [],
              systemsUsed: [],
              stakeholders: [],
            }),
          })
        )
      })
    })

    describe('Atualização de processo existente', () => {
      it('deve atualizar um processo existente com sucesso', async () => {
        mockPrismaProcess.update.mockResolvedValue({
          ...mockExistingProcess,
          name: 'Processo Atualizado',
        })

        const result = await saveProcess(mockExistingProcess)

        expect(result.success).toBe(true)
        expect(mockPrismaProcess.update).toHaveBeenCalledTimes(1)
        expect(mockPrismaProcess.create).not.toHaveBeenCalled()
      })

      it('deve usar o ID correto na cláusula where', async () => {
        mockPrismaProcess.update.mockResolvedValue(mockExistingProcess)

        await saveProcess(mockExistingProcess)

        expect(mockPrismaProcess.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockExistingProcess.id },
          })
        )
      })

      it('deve preservar o histórico na atualização', async () => {
        const processWithHistory: Process = {
          ...mockExistingProcess,
          history: [
            {
              timestamp: '2025-01-01T10:00:00Z',
              user: 'Admin',
              justification: 'Criação inicial',
              changes: 'Processo criado',
            },
          ],
        }
        mockPrismaProcess.update.mockResolvedValue(processWithHistory)

        await saveProcess(processWithHistory)

        expect(mockPrismaProcess.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              history: expect.any(Array),
            }),
          })
        )
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando Prisma falha', async () => {
        mockPrismaProcess.create.mockRejectedValue(new Error('Database error'))

        const result = await saveProcess(mockNewProcess)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao salvar processo. Tente novamente.')
      })

      it('deve retornar erro específico para nome duplicado', async () => {
        mockPrismaProcess.create.mockRejectedValue(
          new Error('Unique constraint failed on the fields: (`name`)')
        )

        const result = await saveProcess(mockNewProcess)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Já existe um processo com este nome')
      })

      it('não deve vazar informações sensíveis do banco', async () => {
        mockPrismaProcess.create.mockRejectedValue(
          new Error('Connection to database failed at 192.168.1.100:5432')
        )

        const result = await saveProcess(mockNewProcess)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao salvar processo. Tente novamente.')
        expect(result.error).not.toContain('192.168')
        expect(result.error).not.toContain('5432')
      })
    })
  })

  // ============================================
  // deleteProcess
  // ============================================

  describe('deleteProcess', () => {
    const validProcessId = '550e8400-e29b-41d4-a716-446655440000'

    describe('Deleção bem sucedida', () => {
      it('deve deletar um processo com sucesso', async () => {
        mockPrismaProcess.delete.mockResolvedValue({ id: validProcessId })

        const result = await deleteProcess(validProcessId)

        expect(result.success).toBe(true)
        expect(mockPrismaProcess.delete).toHaveBeenCalledWith({
          where: { id: validProcessId },
        })
      })
    })

    describe('Validação de entrada', () => {
      it('deve rejeitar ID vazio', async () => {
        const result = await deleteProcess('')

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de processo inválido')
        expect(mockPrismaProcess.delete).not.toHaveBeenCalled()
      })

      it('deve rejeitar ID muito curto', async () => {
        const result = await deleteProcess('abc123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de processo inválido')
        expect(mockPrismaProcess.delete).not.toHaveBeenCalled()
      })

      it('deve rejeitar ID não-string', async () => {
        const result = await deleteProcess(123 as any)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de processo inválido')
      })

      it('deve rejeitar null', async () => {
        const result = await deleteProcess(null as any)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de processo inválido')
      })

      it('deve rejeitar undefined', async () => {
        const result = await deleteProcess(undefined as any)

        expect(result.success).toBe(false)
        expect(result.error).toBe('ID de processo inválido')
      })
    })

    describe('Tratamento de erros', () => {
      it('deve retornar erro quando processo não existe', async () => {
        mockPrismaProcess.delete.mockRejectedValue(
          new Error('Record to delete does not exist')
        )

        const result = await deleteProcess(validProcessId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Processo não encontrado')
      })

      it('deve retornar erro genérico para erros desconhecidos', async () => {
        mockPrismaProcess.delete.mockRejectedValue(new Error('Unknown error'))

        const result = await deleteProcess(validProcessId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Erro ao deletar processo. Tente novamente.')
      })

      it('não deve vazar informações sensíveis', async () => {
        mockPrismaProcess.delete.mockRejectedValue(
          new Error('FATAL: password authentication failed for user "admin"')
        )

        const result = await deleteProcess(validProcessId)

        expect(result.success).toBe(false)
        expect(result.error).not.toContain('password')
        expect(result.error).not.toContain('admin')
      })
    })
  })
})
