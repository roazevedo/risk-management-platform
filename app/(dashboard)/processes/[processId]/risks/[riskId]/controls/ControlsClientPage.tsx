"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Risk, Control, HistoryEntry } from '@/types';
import { Search, Filter, Plus, ChevronLeft } from 'lucide-react';
import { CONTROL_TYPES, CONTROL_NATURES } from '@/constants';
import { generateChangeLog } from '@/lib/utils';
import { controlLabels } from '@/constants';

// Importações dos Componentes
import ControlManagement from '@/components/ControlManagement';
import { FilterSheet } from '@/components/FilterSheet';
import { FilterAccordion } from '@/components/FilterAccordion';
import { Modal } from '@/components/Modal';
import ControlForm from '@/components/ControlForm'; // O novo arquivo que criamos
import { JustificationModal } from '@/components/JustificationModal';

interface ControlsClientPageProps {
  currentProcessId: string;
  currentRiskId: string;
}

export default function ControlsClientPage({ currentProcessId, currentRiskId }: ControlsClientPageProps) {
  const router = useRouter();
  const { risks, controls, setControls } = useData();
  const safeRisks = risks || [];
  const safeControls = controls || [];

  // --- ESTADOS DE UI E FILTRO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNatures, setSelectedNatures] = useState<string[]>([]);

  // --- ESTADOS DO MODAL (Lifted Up) ---
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>(undefined);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [pendingControlData, setPendingControlData] = useState<Control | null>(null);

  // --- VALIDAÇÃO ---
  if (!currentProcessId || !currentRiskId) { router.replace('/processes'); return null; }
  const selectedRisk = safeRisks.find(r => r.id === currentRiskId && r.processId === currentProcessId);

  // Se dados carregaram e risco não existe
  if (!selectedRisk && safeRisks.length > 0) {
     return <div className="p-8 text-center text-red-500">Risco não encontrado.</div>;
  }
  if (!selectedRisk) return null; // Loading

  // --- FILTRAGEM ---
  const allControls = safeControls.filter(c => c.riskId === currentRiskId);

  const filteredControls = allControls.filter(control => {
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(control.type);
    const matchesNature = selectedNatures.length === 0 || selectedNatures.includes(control.nature);
    return matchesSearch && matchesType && matchesNature;
  });

  const activeFiltersCount = selectedTypes.length + selectedNatures.length;

  // --- HANDLERS FILTRO ---
  const toggleType = (val: string) => setSelectedTypes(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  const toggleNature = (val: string) => setSelectedNatures(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  const clearFilters = () => { setSelectedTypes([]); setSelectedNatures([]); setSearchTerm(''); };

  // --- HANDLERS AÇÃO ---
  const handleBackToRisks = () => router.push(`/processes/${currentProcessId}/risks`);

  const handleAddNew = () => {
      setEditingControl(undefined);
      setIsFormVisible(true);
  };

  const handleEditControl = (control: Control) => {
      setEditingControl(control);
      setIsFormVisible(true);
  };

  // --- LÓGICA DE SALVAR (COM JUSTIFICATIVA) ---
  const handleSave = (control: Control) => {
      if (editingControl) {
          setPendingControlData(control);
          setIsJustificationModalOpen(true);
      } else {
          setControls(prev => [...prev, control]);
          setIsFormVisible(false);
      }
  };

  const handleConfirmSave = (justification: string) => {
      if (!pendingControlData || !editingControl) return;

      const changes = generateChangeLog(editingControl, pendingControlData, controlLabels);
      const historyEntry: HistoryEntry = {
          timestamp: new Date().toISOString(),
          user: 'Admin',
          justification,
          changes
      };

      const updatedControl = {
          ...pendingControlData,
          history: [...(pendingControlData.history || []), historyEntry]
      };

      setControls(prev => prev.map(c => c.id === updatedControl.id ? updatedControl : c));

      // Resetar estados
      setIsJustificationModalOpen(false);
      setPendingControlData(null);
      setIsFormVisible(false);
      setEditingControl(undefined);
  };

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
              <button onClick={handleBackToRisks} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 font-medium">
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Voltar para Riscos
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Controles</h2>
              <p className="text-gray-500 dark:text-gray-400">Risco: {selectedRisk.name}</p>
          </div>

          <div className="flex items-center gap-2">
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="w-5 h-5 text-gray-400" />
                  </span>
                  <input type="text" placeholder="Buscar controle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
              </div>

              <button onClick={() => setIsFilterOpen(true)} className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-all font-medium ${activeFiltersCount > 0 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFiltersCount > 0 && <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">{activeFiltersCount}</span>}
              </button>

              <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Controle
              </button>
          </div>
      </div>

      {/* FILTROS SIDEBAR */}
      <FilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} onApply={() => setIsFilterOpen(false)} onClear={clearFilters}>
          <FilterAccordion title="Tipo" isOpenDefault={true}>
              <div className="space-y-3 pt-2">
                  {CONTROL_TYPES.map(t => (
                      <label key={t} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">{t}</span>
                      </label>
                  ))}
              </div>
          </FilterAccordion>
          <FilterAccordion title="Natureza" isOpenDefault={false}>
              <div className="space-y-3 pt-2">
                  {CONTROL_NATURES.map(n => (
                      <label key={n} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={selectedNatures.includes(n)} onChange={() => toggleNature(n)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">{n}</span>
                      </label>
                  ))}
              </div>
          </FilterAccordion>
      </FilterSheet>

      {/* MODAL FORMULÁRIO */}
      <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)} title={editingControl ? 'Editar Controle' : 'Novo Controle'}>
          <ControlForm
              risk={selectedRisk}
              control={editingControl}
              onSave={handleSave}
              onCancel={() => setIsFormVisible(false)}
          />
      </Modal>

      {isJustificationModalOpen && <JustificationModal onClose={() => setIsJustificationModalOpen(false)} onConfirm={handleConfirmSave} />}

      {/* TABELA */}
      {filteredControls.length > 0 ? (
          <ControlManagement
            risk={selectedRisk}
            controls={filteredControls}
            onEditControl={handleEditControl}
          />
      ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
               <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-2">Nenhum controle encontrado</p>
               {(activeFiltersCount > 0 || searchTerm) && (
                   <button onClick={clearFilters} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">Limpar filtros</button>
               )}
          </div>
      )}
    </div>
  );
};
