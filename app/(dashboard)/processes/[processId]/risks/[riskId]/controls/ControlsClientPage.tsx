"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Control, Risk } from '@/types';
import ControlManagement from '@/components/ControlManagement';
import { saveControl, deleteControl } from '@/app/actions/control.actions';

interface ControlsClientPageProps {
  currentProcessId: string;
  currentRiskId: string;
  riskName: string;
  initialControls: Control[];
  selectedRisk: Risk;
}

export default function ControlsClientPage({
  currentProcessId,
  currentRiskId,
  riskName,
  initialControls,
  selectedRisk
}: ControlsClientPageProps) {
  const router = useRouter();

  if (!currentProcessId || !currentRiskId) {
    return <div className="p-8 text-center text-gray-600">Parâmetros da rota ausentes.</div>;
  }

  const handleBackToRisks = () => router.push(`/processes/${currentProcessId}/risks`);

  // Salvar controle via Server Action
  const handleSave = async (control: Control) => {
    try {
      const result = await saveControl(control, currentProcessId);

      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao salvar controle: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro crítico ao salvar:", error);
      alert("Erro crítico ao salvar controle.");
    }
  };

  // Deletar controle via Server Action
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteControl(id, currentRiskId, currentProcessId);

      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao excluir controle: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro crítico ao deletar:", error);
      alert("Erro crítico ao deletar controle.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={handleBackToRisks}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            ← Voltar para Riscos
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Controles do Risco: <span className="text-indigo-600">{riskName}</span>
          </h1>
        </div>
      </div>

      <ControlManagement
        risk={selectedRisk}
        controls={initialControls}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
