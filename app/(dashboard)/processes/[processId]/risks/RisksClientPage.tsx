"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Risk } from '@/types';
import { saveRisk, deleteRisk } from '@/app/actions/risk.actions'; // Importe as actions
import RiskManagement from '@/components/RiskManagement'; // Importe seu componente

interface RisksClientPageProps {
  currentProcessId: string;
  initialRisks: Risk[];
  processName: string;
}

export default function RisksClientPage({ currentProcessId, initialRisks, processName }: RisksClientPageProps) {
  const router = useRouter();
  const [localRisks, setLocalRisks] = useState<Risk[]>(initialRisks);

  useEffect(() => {
    setLocalRisks(initialRisks);
  }, [initialRisks]);

  const handleSelectRisk = (riskId: string) => {
    router.push(`/processes/${currentProcessId}/risks/${riskId}/controls`);
  };

  const handleBack = () => {
    router.push('/processes');
  };

  // --- EDITAR RISCO ---
  const handleEditRisk = async (risk: Risk) => {
    try {
      // Garante que o ID do processo está vinculado
      const riskToSave = { ...risk, processId: currentProcessId };

      const result = await saveRisk(riskToSave);
      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao salvar risco.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro crítico.");
    }
  };

  // Criar objeto Process mockado para RiskManagement
  const mockProcess = {
    id: currentProcessId,
    name: processName,
    sector: '',
    manager: '',
    responsibleServers: [],
    legalBasis: '',
    systemsUsed: [],
    stakeholders: [],
    history: [],
  };

  return (
    <RiskManagement
      process={mockProcess}
      risks={localRisks}
      onSelectRisk={handleSelectRisk}
      onBack={handleBack}
      onEditRisk={handleEditRisk}
    />
  );
}
