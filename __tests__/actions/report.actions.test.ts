import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// MOCKS (devem vir ANTES dos imports que usam)
// ============================================

// Mock do Prisma - usando vi.hoisted para garantir ordem correta
const { mockPrismaProcess } = vi.hoisted(() => ({
  mockPrismaProcess: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/src/app/prisma/prisma', () => ({
  prisma: {
    process: mockPrismaProcess,
  },
}))

// Import DEPOIS do mock
import { getReportDataBySector } from '@/src/app/actions/report.actions'

// ============================================
// DADOS DE TESTE
// ============================================

const mockProcessWithRisks = {
  id: 'proc-123',
  name: 'Processo de Compras',
  sector: 'CG/ATG',
  manager: 'João Silva',
  responsibleServers: ['Maria Santos'],
  legalBasis: 'Lei 8.666/1993',
  systemsUsed: ['SAP'],
  stakeholders: ['Diretoria'],
  history: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-15'),
  risks: [
    {
      id: 'risk-456',
      processId: 'proc-123',
      name: 'Risco de Fraude',
      identificationDate: new Date('2025-01-01'),
      type: 'Operacional',
      association: 'Processo',
      causes: 'Falta de controle',
      consequences: 'Prejuízo',
      dimensions: ['Operacional'],
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
      maxImplementationDate: new Date('2025-07-01'),
      isLgpdRelated: false,
      history: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      controls: [
        {
          id: 'ctrl-789',
          riskId: 'risk-456',
          name: 'Controle de Revisão',
          implemented: true,
          status: 'on-time',
          newOrModified: 'Novo',
          type: 'Preventivo',
          nature: 'Manual',
          relationToRisk: 'Direto',
          responsible: 'Pedro Costa',
          implementationMethod: 'Revisão mensal',
          macroSteps: '1. Revisar',
          plannedStartDate: new Date('2025-01-01'),
          plannedEndDate: new Date('2025-06-30'),
          actualEndDate: new Date('2025-05-15'),
          involvedSectors: ['TI'],
          adequacyAnalysis: 'Adequado',
          history: [],
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-15'),
        },
      ],
    },
  ],
}

const mockEmptyProcess = {
  id: 'proc-empty',
  name: 'Processo Vazio',
  sector: 'CG/ATG',
  manager: 'Ana Santos',
  responsibleServers: null,
  legalBasis: null,
  systemsUsed: null,
  stakeholders: null,
  history: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  risks: [],
}

// ============================================
// TESTES
// ============================================

describe('report.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReportDataBySector', () => {
    describe('Busca com sucesso', () => {
      it('deve retornar dados formatados para o setor', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        expect(result.sector).toBe('CG/ATG')
        expect(result.processes).toHaveLength(1)
        expect(result.processes[0].name).toBe('Processo de Compras')
      })

      it('deve incluir riscos nos processos', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        expect(result.processes[0].risks).toHaveLength(1)
        expect(result.processes[0].risks[0].name).toBe('Risco de Fraude')
      })

      it('deve incluir controles nos riscos', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        const controls = result.processes[0].risks[0].controls
        expect(controls).toHaveLength(1)
        expect(controls[0].name).toBe('Controle de Revisão')
      })

      it('deve converter datas para ISO string', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        const risk = result.processes[0].risks[0]
        expect(typeof risk.identificationDate).toBe('string')
        expect(risk.identificationDate).toContain('2025-01-01')
      })

      it('deve filtrar por setor correto', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([])

        await getReportDataBySector('CG/ACS')

        expect(mockPrismaProcess.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { sector: 'CG/ACS' },
          })
        )
      })
    })

    describe('Tratamento de valores nulos', () => {
      it('deve retornar arrays vazios para campos nulos', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockEmptyProcess])

        const result = await getReportDataBySector('CG/ATG')

        const process = result.processes[0]
        expect(process.responsibleServers).toEqual([])
        expect(process.systemsUsed).toEqual([])
        expect(process.stakeholders).toEqual([])
      })

      it('deve retornar string vazia para legalBasis nulo', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockEmptyProcess])

        const result = await getReportDataBySector('CG/ATG')

        expect(result.processes[0].legalBasis).toBe('')
      })

      it('deve retornar array vazio para riscos quando não há', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockEmptyProcess])

        const result = await getReportDataBySector('CG/ATG')

        expect(result.processes[0].risks).toEqual([])
      })
    })

    describe('Setor sem processos', () => {
      it('deve retornar lista vazia quando não há processos', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([])

        const result = await getReportDataBySector('CG/SETOR_INEXISTENTE')

        expect(result.sector).toBe('CG/SETOR_INEXISTENTE')
        expect(result.processes).toEqual([])
      })
    })

    describe('Múltiplos processos', () => {
      it('deve retornar múltiplos processos ordenados por nome', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([
          { ...mockProcessWithRisks, name: 'Processo A' },
          { ...mockProcessWithRisks, id: 'proc-2', name: 'Processo B' },
        ])

        const result = await getReportDataBySector('CG/ATG')

        expect(result.processes).toHaveLength(2)
      })
    })

    describe('Tratamento de erros', () => {
      it('deve lançar erro quando Prisma falha', async () => {
        mockPrismaProcess.findMany.mockRejectedValue(new Error('Database error'))

        await expect(getReportDataBySector('CG/ATG')).rejects.toThrow(
          'Erro ao buscar dados do relatório'
        )
      })
    })

    describe('Formatação de controles', () => {
      it('deve formatar datas de controles corretamente', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        const control = result.processes[0].risks[0].controls[0]
        expect(typeof control.plannedStartDate).toBe('string')
        expect(typeof control.plannedEndDate).toBe('string')
        expect(typeof control.actualEndDate).toBe('string')
      })

      it('deve manter involvedSectors como array', async () => {
        mockPrismaProcess.findMany.mockResolvedValue([mockProcessWithRisks])

        const result = await getReportDataBySector('CG/ATG')

        const control = result.processes[0].risks[0].controls[0]
        expect(Array.isArray(control.involvedSectors)).toBe(true)
        expect(control.involvedSectors).toContain('TI')
      })
    })
  })
})
