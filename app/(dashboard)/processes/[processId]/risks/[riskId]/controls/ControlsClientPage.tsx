"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Control, Risk, HistoryEntry } from '@/types';
import ControlManagement from '@/components/ControlManagement';
import ControlForm from '@/components/ControlForm';
import { JustificationModal } from '@/components/JustificationModal';
import { saveControl, deleteControl } from '@/app/actions/control.actions'; // 👈 Importar as actions

type HistoryEntryType = HistoryEntry;

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

  const [controls, setControls] = useState<Control[]>(initialControls);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNatures, setSelectedNatures] = useState<string[]>([]);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>(undefined);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [pendingControlData, setPendingControlData] = useState<Control | null>(null);

  if (!currentProcessId || !currentRiskId) {
    return <div className="p-8 text-center text-gray-600">Parâmetros da rota ausentes.</div>;
  }

  // --- FUNÇÕES DE LÓGICA ---
  const generateChangeLog = (before: Control | undefined, after: Control): string[] => {
    if (!before) return Object.keys(after);
    const changes: string[] = [];
    Object.keys(after).forEach(key => {
      try {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changes.push(key);
      } catch {
        if (before[key] !== after[key]) changes.push(key);
      }
    });
    return changes;
  };

  const filteredControls = useMemo(() => {
    return controls.filter((control: Control) => {
      const matchesSearch = String(control.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(control.type);
      const matchesNature = selectedNatures.length === 0 || selectedNatures.includes(control.nature);
      return matchesSearch && matchesType && matchesNature;
    });
  }, [controls, searchTerm, selectedTypes, selectedNatures]);

  const handleBackToRisks = () => router.push(`/processes/${currentProcessId}/risks`);
  const handleAddNew = () => { setEditingControl(undefined); setIsFormVisible(true); };
  const handleEditControl = (control: Control) => { setEditingControl(control); setIsFormVisible(true); };

  // 🔥 FUNÇÃO ATUALIZADA: Agora chama a Server Action real
  const handleSuperSalvar = async (control: Control) => {
    try {
      console.log("Salvando controle:", control);
      const result = await saveControl(control, currentProcessId);

      if (result.success) {
        console.log("Controle salvo com sucesso!");
        router.refresh();
      } else {
        alert("Erro ao salvar controle: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro crítico ao salvar:", error);
      alert("Erro crítico ao salvar controle.");
    }
  };

  // 🔥 FUNÇÃO ATUALIZADA: Agora chama a Server Action real
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este controle?")) {
      return;
    }

    try {
      console.log("Deletando controle ID:", id);
      const result = await deleteControl(id, currentRiskId, currentProcessId);

      if (result.success) {
        console.log("Controle deletado com sucesso!");
        router.refresh();
      } else {
        alert("Erro ao excluir controle: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro crítico ao deletar:", error);
      alert("Erro crítico ao deletar controle.");
    }
  };

  const handleSave = (control: Control) => {
    if (!editingControl) {
      const newControl: Control = {
        ...control,
        id: control.id ?? `ctrl_${Date.now()}`,
        riskId: currentRiskId
      } as Control;

      setControls((prev: Control[]) => [...(prev || []), newControl]);
      handleSuperSalvar(newControl); // 👈 Chama a função real
      setIsFormVisible(false);
      setEditingControl(undefined);
      return;
    }

    // Para edições, abre modal de justificativa
    setPendingControlData({ ...editingControl, ...control, riskId: currentRiskId });
    setIsJustificationModalOpen(true);
  };

  const handleConfirmSave = (justification: string) => {
    if (!pendingControlData || !editingControl) return;

    const changes = generateChangeLog(editingControl, pendingControlData);

    const historyEntry: HistoryEntryType = {
      timestamp: new Date().toISOString(),
      user: 'Admin',
      justification,
      changes: changes.join(', ')
    } as unknown as HistoryEntryType;

    const updatedControl = {
      ...pendingControlData,
      history: [...(pendingControlData.history as HistoryEntryType[] || []), historyEntry]
    } as unknown as Control;

    setControls((prev: Control[]) =>
      (prev || []).map(c => c.id === updatedControl.id ? updatedControl : c)
    );

    handleSuperSalvar(updatedControl); // 👈 Chama a função real

    setIsJustificationModalOpen(false);
    setPendingControlData(null);
    setIsFormVisible(false);
    setEditingControl(undefined);
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Novo Controle
          </button>
        </div>
      </div>

      {/* Área principal: tabela de controles */}
      {controls.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Nenhum controle cadastrado para este risco.
        </div>
      ) : filteredControls.length > 0 ? (
        <ControlManagement
          risk={selectedRisk}
          controls={filteredControls}
          onEditControl={handleEditControl}
          riskId={currentRiskId}
          superSalvar={handleSuperSalvar}
          onDelete={handleDelete}
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          Nenhum controle corresponde aos filtros.
        </div>
      )}

      {/* Formulário (criar / editar) */}
      {isFormVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-gray-50 dark:bg-gray-800 rounded shadow p-6">
            <ControlForm
              control={editingControl}
              risk={selectedRisk}
              onSave={handleSave}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingControl(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Justification modal */}
      {isJustificationModalOpen && (
        <JustificationModal
          onClose={() => setIsJustificationModalOpen(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </div>
  );
}
