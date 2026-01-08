"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Risk } from '@/types';
import { saveRisk, deleteRisk } from '@/src/app/actions/risk.actions';
import RiskManagement from '@/src/components/features/risk/RiskManagement';
import Sidebar from '@/src/components/ui/Sidebar';

interface RisksClientPageProps {
  currentProcessId: string;
  initialRisks: Risk[];
  processName: string;
  processSector?: string;
}

export default function RisksClientPage({
  currentProcessId,
  initialRisks,
  processName,
  processSector
}: RisksClientPageProps) {
  const router = useRouter();
  const [localRisks, setLocalRisks] = useState<Risk[]>(initialRisks);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setLocalRisks(initialRisks);
  }, [initialRisks]);

  const handleSaveRisk = async (risk: Risk) => {
    try {
      const result = await saveRisk({ ...risk, processId: currentProcessId });
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <button
            onClick={() => router.push('/processes')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1 transition-colors"
          >
            ← Voltar para Processos
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciar Riscos:{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {processName}
            </span>
          </h1>

          {processSector && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Setor: <span className="font-medium">{processSector}</span>
            </p>
          )}
        </div>

        <RiskManagement
          processId={currentProcessId}
          risks={localRisks}
          superSalvar={handleSaveRisk}
          onDelete={handleDeleteRisk}
        />
      </div>
    </div>
  );
}
