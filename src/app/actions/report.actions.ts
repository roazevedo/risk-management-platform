"use server";

import { prisma } from '@/src/app/prisma/prisma';
import { Process, Risk, Control } from '@/types';

interface ProcessWithRisks extends Process {
  risks: RiskWithControls[];
}

interface RiskWithControls extends Risk {
  controls: Control[];
}

interface ReportData {
  sector: string;
  processes: ProcessWithRisks[];
}

// Função auxiliar para converter data para string ISO
function toISOStringOrEmpty(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return '';
}

export async function getReportDataBySector(sector: string): Promise<ReportData> {
  try {
    // Buscar processos do setor com riscos e controles
    const processes = await prisma.process.findMany({
      where: {
        sector: sector,
      },
      include: {
        risks: {
          include: {
            controls: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transformar dados para o formato esperado
    const formattedProcesses: ProcessWithRisks[] = processes.map((process) => ({
      id: process.id,
      name: process.name,
      sector: process.sector,
      manager: process.manager,
      responsibleServers: process.responsibleServers || [],
      legalBasis: process.legalBasis || '',
      systemsUsed: process.systemsUsed || [],
      stakeholders: process.stakeholders || [],
      history: (process.history as any) || [],
      createdAt: process.createdAt,
      updatedAt: process.updatedAt,
      risks: process.risks.map((risk) => ({
        id: risk.id,
        processId: risk.processId,
        name: risk.name,
        identificationDate: toISOStringOrEmpty(risk.identificationDate),
        type: risk.type as any,
        association: risk.association as any,
        causes: risk.causes || '',
        consequences: risk.consequences || '',
        dimensions: (risk.dimensions as any) || [],
        probability: risk.probability,
        probabilityJustification: risk.probabilityJustification || '',
        impact: risk.impact,
        impactJustification: risk.impactJustification || '',
        inherentRisk: risk.inherentRisk,
        controlsExist: risk.controlsExist,
        isControlEffective: risk.isControlEffective,
        isControlProportional: risk.isControlProportional,
        isControlReasonable: risk.isControlReasonable,
        isControlAdequate: risk.isControlAdequate,
        fac: risk.fac,
        residualRisk: risk.residualRisk,
        suggestedResponse: risk.suggestedResponse as any,
        maxImplementationDate: toISOStringOrEmpty(risk.maxImplementationDate),
        isLgpdRelated: risk.isLgpdRelated,
        history: (risk.history as any) || [],
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
        controls: risk.controls.map((control) => ({
          id: control.id,
          riskId: control.riskId,
          name: control.name,
          implemented: control.implemented,
          status: control.status as any,
          newOrModified: control.newOrModified as any,
          type: control.type as any,
          nature: control.nature as any,
          relationToRisk: control.relationToRisk as any,
          responsible: control.responsible || '',
          implementationMethod: control.implementationMethod || '',
          macroSteps: control.macroSteps || '',
          plannedStartDate: toISOStringOrEmpty(control.plannedStartDate),
          plannedEndDate: toISOStringOrEmpty(control.plannedEndDate),
          actualEndDate: toISOStringOrEmpty(control.actualEndDate),
          involvedSectors: control.involvedSectors || [],
          adequacyAnalysis: control.adequacyAnalysis || '',
          history: (control.history as any) || [],
          createdAt: control.createdAt,
          updatedAt: control.updatedAt,
        })),
      })),
    }));

    return {
      sector,
      processes: formattedProcesses,
    };
  } catch (error) {
    console.error('[REPORT ACTION] Erro ao buscar dados:', error);
    throw new Error('Erro ao buscar dados do relatório');
  }
}
