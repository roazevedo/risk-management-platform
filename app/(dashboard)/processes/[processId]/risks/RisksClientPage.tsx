"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Risk } from '@/types';
import { saveRisk, deleteRisk } from '@/app/actions/risk.actions';
import RiskManagement from '@/components/RiskManagement';

interface RisksClientPageProps {
  currentProcessId: string;
  initialRisks: Risk[];
  processName: string;
}

export default function RisksClientPage({ currentProcessId, initialRisks, processName }: RisksClientPageProps) {
  const router = useRouter();

  const handleSelectRisk = (riskId: string) => {
    router.push(`/processes/${currentProcessId}/risks/${riskId}/controls`);
  };

  // Salvar risco via Server Action
  const handleSave = async (risk: Risk) => {
    try {
      const riskToSave = { ...risk, processId: currentProcessId };
      const result = await saveRisk(riskToSave);

      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao salvar risco: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro crítico ao salvar risco.");
    }
  };

  // Deletar risco via Server Action
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteRisk(id, currentProcessId);

      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao excluir risco: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro crítico ao deletar risco.");
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/processes')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1 transition-colors"
          >
            ← Voltar para Processos
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciar Riscos: <span className="text-indigo-600 dark:text-indigo-400">{processName}</span>
          </h1>
        </div>
      </div>

      <RiskManagement
        process={mockProcess}
        risks={initialRisks}
        onSelectRisk={handleSelectRisk}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
