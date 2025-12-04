// app/(dashboard)/processes/[processId]/risks/page.tsx

import React from 'react';
import RisksClientPage from './RisksClientPage';
import { getRisksByProcessId } from '@/app/actions/risk.actions';
import { prisma } from '@/app/prisma/prisma';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    processId: string;
  }>;
}

// SOLUÇÃO: Agora params é uma Promise que precisa ser aguardada (Next.js 15)
export default async function RisksPage({ params }: PageProps) {

  // CORREÇÃO: Aguarda a resolução da Promise de params
  const resolvedParams = await params;
  const rawProcessId = resolvedParams.processId;

  // 1. VALIDAÇÃO ROBUSTA: Limpa a string e verifica se o comprimento é zero
  const processId = String(rawProcessId || '').trim();

  if (processId.length === 0) {
    // Redireciona se o parâmetro não foi resolvido pelo roteador
    redirect('/processes');
  }

  // 2. BUSCA DE DADOS
  const [processData, risksData] = await Promise.all([
    prisma.process.findUnique({
        where: { id: processId },
        select: { name: true }
    }),
    getRisksByProcessId(processId)
  ]);

  // 3. VALIDAÇÃO DE EXISTÊNCIA
  if (!processData) {
    redirect('/processes');
  }

  // 4. CLIENT COMPONENT HYDRATION
  return (
    <RisksClientPage
      currentProcessId={processId}
      processName={processData.name}
      initialRisks={risksData as any}
    />
  );
}
