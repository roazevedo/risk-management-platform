
import React from 'react';
import ControlsClientPage from './ControlsClientPage';
import { getControlsByRiskId } from '@/src/app/actions/control.actions';
import { prisma } from '@/src/app/prisma/prisma';
import { redirect } from 'next/navigation';

interface ControlsPageProps {
  params: Promise<{
    processId: string;
    riskId: string;
  }>;
}

export default async function ControlsPage(props: ControlsPageProps) {
  try {
    // Aguarda a resolução da Promise de params
    const resolvedParams = await props.params;
    const { processId, riskId: rawRiskId } = resolvedParams;

    console.log('[CONTROLS PAGE] Params:', { processId, rawRiskId });

    // VALIDAÇÃO E LIMPEZA
    const riskId = String(rawRiskId || '').trim();
    const processIdClean = String(processId || '').trim();

    // VALIDAÇÃO DE PARÂMETROS
    if (riskId.length === 0 || processIdClean.length === 0) {
      console.log('[CONTROLS PAGE] Parâmetros inválidos, redirecionando...');
      redirect(`/processes/${processIdClean}/risks`);
    }

    console.log('[CONTROLS PAGE] Buscando dados...');

    // BUSCA DE DADOS
    const [riskData, controlsData] = await Promise.all([
      prisma.risk.findUnique({
        where: { id: riskId },
        select: {
          id: true,
          name: true,
          processId: true,
          type: true,
          association: true,
          probability: true,
          impact: true,
          inherentRisk: true,
          residualRisk: true,
        }
      }),
      getControlsByRiskId(riskId)
    ]);

    console.log('[CONTROLS PAGE] Dados encontrados:', {
      riskData: !!riskData,
      controlsCount: controlsData.length
    });

    // VALIDAÇÃO DE EXISTÊNCIA DO RISCO
    if (!riskData) {
      console.log('[CONTROLS PAGE] Risco não encontrado, redirecionando...');
      redirect(`/processes/${processIdClean}/risks`);
    }

    // VALIDAÇÃO: Risco pertence ao processo correto
    if (riskData.processId !== processIdClean) {
      console.log('[CONTROLS PAGE] Risco não pertence ao processo, redirecionando...');
      redirect(`/processes/${processIdClean}/risks`);
    }

    console.log('[CONTROLS PAGE] Renderizando página...');

    return (
      <ControlsClientPage
        currentProcessId={processIdClean}
        currentRiskId={riskId}
        riskName={riskData.name || 'Risco Sem Nome'}
        initialControls={controlsData as any}
        selectedRisk={riskData as any}
      />
    );
  } catch (error) {
    console.error('[CONTROLS PAGE] Erro crítico:', error);
    throw error;
  }
}
