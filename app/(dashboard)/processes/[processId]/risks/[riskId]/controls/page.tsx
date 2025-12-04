// app/(dashboard)/processes/[processId]/risks/[riskId]/controls/page.tsx

import React from 'react';
import ControlsClientPage from './ControlsClientPage';
import { getControlsByRiskId } from '@/app/actions/control.actions';
import { prisma } from '@/app/prisma/prisma';
import { redirect } from 'next/navigation';

interface ControlsPageProps {
  params: Promise<{
    processId: string;
    riskId: string;
  }>;
}

export default async function ControlsPage(props: ControlsPageProps) {
  // Aguarda a resolução da Promise de params
  const resolvedParams = await props.params;
  const { processId, riskId: rawRiskId } = resolvedParams;

  // VALIDAÇÃO E LIMPEZA
  const riskId = String(rawRiskId || '').trim();
  const processIdClean = String(processId || '').trim();

  // VALIDAÇÃO DE PARÂMETROS
  if (riskId.length === 0 || processIdClean.length === 0) {
    redirect(`/processes/${processIdClean}/risks`);
  }

  // BUSCA DE DADOS
  const [riskData, controlsData] = await Promise.all([
    prisma.risk.findUnique({
      where: { id: riskId },
      select: { id: true, name: true, processId: true }
    }),
    getControlsByRiskId(riskId)
  ]);

  // VALIDAÇÃO DE EXISTÊNCIA DO RISCO
  if (!riskData) {
    redirect(`/processes/${processIdClean}/risks`);
  }

  // VALIDAÇÃO: Risco pertence ao processo correto
  if (riskData.processId !== processIdClean) {
    redirect(`/processes/${processIdClean}/risks`);
  }

  return (
    <ControlsClientPage
      currentProcessId={processIdClean}
      currentRiskId={riskId}
      riskName={riskData.name || 'Risco Sem Nome'}
      initialControls={controlsData as any}
      selectedRisk={riskData as any}
    />
  );
}
