"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ControlManagement from '@/components/ControlManagement';
import { useData } from '@/contexts/DataContext';
import { Risk, Control } from '@/types';

interface ControlsClientPageProps {
  currentProcessId: string;
  currentRiskId: string;
}

export default function ControlsClientPage({ currentProcessId, currentRiskId }: ControlsClientPageProps) {
  const router = useRouter();
  const { risks, controls, setControls } = useData();

  // 1. Fallback seguro para evitar travamento no loading
  const safeRisks = risks || [];
  const safeControls = controls || [];

  // 2. Verificação crítica de IDs
  if (!currentProcessId || !currentRiskId) {
    router.replace('/processes');
    return null;
  }

  // 3. Encontrar o Risco Pai
  const selectedRisk: Risk | undefined = safeRisks.find(r => r.id === currentRiskId && r.processId === currentProcessId);

  // 4. Filtrar Controles
  const controlsForRisk = safeControls.filter(control => control.riskId === currentRiskId);

  const handleBackToRisks = () => {
    // Volta para a lista de riscos deste processo específico
    router.push(`/processes/${currentProcessId}/risks`);
  };

  // 5. Tratamento de Risco não encontrado
  if (!selectedRisk) {
    // Se o risco não for encontrado (mas os dados já carregaram), mostra erro
    if (safeRisks.length > 0) {
        return (
        <div className="p-8 text-center text-red-500">
            Risco com ID "{currentRiskId}" não encontrado no Processo "{currentProcessId}".
            <button onClick={handleBackToRisks} className="block mx-auto mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-gray-100">
            Voltar para Riscos
            </button>
        </div>
        );
    }
    // Se ainda não carregou os dados (array vazio), mostra loading ou null
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
        Controles para o Risco: **{selectedRisk.name}**
      </h1>

      <ControlManagement
        risk={selectedRisk}
        controls={controlsForRisk}
        setControls={setControls}
        onBack={handleBackToRisks}
      />
    </div>
  );
};
