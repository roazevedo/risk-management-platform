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

  // --- SALVAR RISCO ---
  const handleSaveRisk = async (risk: Risk) => {
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

  // --- DELETAR RISCO ---
  const handleDeleteRisk = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este risco?")) {
      const result = await deleteRisk(id, currentProcessId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/processes')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            ← Voltar para Processos
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciar Riscos: <span className="text-indigo-600">{processName}</span>
          </h1>
        </div>
      </div>

      <RiskManagement
        processId={currentProcessId}
        risks={localRisks}
        superSalvar={handleSaveRisk}
        onDelete={handleDeleteRisk}
        onSelectRisk={handleSelectRisk}
      />
    </div>
  );
}
