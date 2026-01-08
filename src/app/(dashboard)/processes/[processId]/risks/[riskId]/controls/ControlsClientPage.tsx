"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Control, Risk } from "@/types";
import Sidebar from "@/src/components/ui/Sidebar";
import ControlManagement from "@/src/components/features/control/ControlManagement";
import { saveControl, deleteControl } from "@/src/app/actions/control.actions";

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
  selectedRisk,
}: ControlsClientPageProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!currentProcessId || !currentRiskId) {
    return (
      <div className="p-8 text-center text-gray-600">
        Parâmetros da rota ausentes.
      </div>
    );
  }

  const handleSave = async (control: Control) => {
    const result = await saveControl(control, currentProcessId);
    if (result.success) {
      router.refresh();
    } else {
      alert("Erro ao salvar controle.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este controle?")) {
      const result = await deleteControl(id, currentRiskId, currentProcessId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao excluir controle.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <button
            onClick={() =>
              router.push(`/processes/${currentProcessId}/risks`)
            }
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1 transition-colors"
          >
            ← Voltar para Riscos
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Controles do Risco:{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {riskName}
            </span>
          </h1>
        </div>

        <ControlManagement
          risk={selectedRisk}
          controls={initialControls}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
