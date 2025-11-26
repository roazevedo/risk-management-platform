"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Risk, HistoryEntry } from '@/types';
import { Search, Filter, Plus, ChevronLeft } from 'lucide-react';
import RiskManagement from '@/components/RiskManagement';
import { FilterSheet } from '@/components/FilterSheet';
import { FilterAccordion } from '@/components/FilterAccordion';

import { Modal } from '@/components/Modal';
import RiskForm from '@/components/RiskForm';
import { JustificationModal } from '@/components/JustificationModal';
import { generateChangeLog } from '@/lib/utils';
import { riskLabels } from '@/constants';

import { RISK_TYPES, RISK_DIMENSIONS } from '@/constants';

interface RisksClientPageProps {
    currentProcessId: string;
}

export default function RisksClientPage({ currentProcessId }: RisksClientPageProps) {
    const router = useRouter();
    const { processes, risks, setRisks } = useData();
    const safeProcesses = processes || [];
    const safeRisks = risks || [];

    // --- ESTADOS DE FILTRO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);

    // --- ESTADOS DO MODAL (Lifted Up) ---
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [pendingRiskData, setPendingRiskData] = useState<Risk | null>(null);

    // --- VALIDAÇÃO DE CONTEXTO ---
    if (!currentProcessId) { router.replace('/processes'); return null; }
    const selectedProcess = safeProcesses.find(p => p.id === currentProcessId);
    if (!selectedProcess) { router.replace('/processes'); return null; }

    // --- LÓGICA DE FILTRAGEM ---
    const allRisksForProcess = safeRisks.filter(risk => risk.processId === currentProcessId);

    const filteredRisks = allRisksForProcess.filter(risk => {
        const matchesSearch = risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              risk.causes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(risk.type);
        const matchesDimension = selectedDimensions.length === 0 ||
                                 risk.dimensions.some(dim => selectedDimensions.includes(dim));
        return matchesSearch && matchesType && matchesDimension;
    });

    const activeFiltersCount = selectedTypes.length + selectedDimensions.length;

    // --- HANDLERS DE FILTRO ---
    const toggleType = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    const toggleDimension = (dim: string) => setSelectedDimensions(prev => prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]);
    const clearFilters = () => { setSelectedTypes([]); setSelectedDimensions([]); setSearchTerm(''); };

    // --- HANDLERS DE AÇÃO (TABELA) ---
    const handleSelectRisk = (riskId: string) => router.push(`/processes/${currentProcessId}/risks/${riskId}/controls`);
    const handleBackToProcesses = () => router.push('/processes');

    // --- HANDLERS DO MODAL (Lógica movida para cá) ---
    const handleAddNew = () => {
        setEditingRisk(undefined); // Garante que é um novo cadastro
        setIsFormVisible(true);    // Abre o modal
    };

    const handleEditRisk = (risk: Risk) => {
        setEditingRisk(risk);      // Define quem estamos editando
        setIsFormVisible(true);    // Abre o modal
    };

    const handleSave = (risk: Risk) => {
        if (editingRisk) {
            // Se for edição, guardamos os dados e pedimos justificativa
            setPendingRiskData(risk);
            setIsJustificationModalOpen(true);
        } else {
            // Se for novo, salvamos direto
            setRisks(prev => [...prev, risk]);
            setIsFormVisible(false);
        }
    };

    const handleConfirmSave = (justification: string) => {
        if (!pendingRiskData || !editingRisk) return;

        const changes = generateChangeLog(editingRisk, pendingRiskData, riskLabels);
        const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin', // Usuário mockado
            justification,
            changes
        };

        const updatedRisk = {
            ...pendingRiskData,
            history: [...(pendingRiskData.history || []), historyEntry]
        };

        setRisks(prev => prev.map(r => r.id === updatedRisk.id ? updatedRisk : r));

        setIsJustificationModalOpen(false);
        setPendingRiskData(null);
        setIsFormVisible(false);
        setEditingRisk(undefined);
    };

    return (
        <div className="space-y-6">

            {/* CABEÇALHO COMPLETO */}
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                    <button onClick={handleBackToProcesses} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 font-medium">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Voltar para Processos
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestão de Riscos</h2>
                    <p className="text-gray-500 dark:text-gray-400">Processo: {selectedProcess.name}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Busca */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar risco..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Filtro */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-all font-medium ${
                            activeFiltersCount > 0
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Botão Adicionar */}
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Risco
                    </button>
                </div>
            </div>

            {/* MODAIS (Agora vivem aqui no pai) */}
            <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)} title={editingRisk ? 'Editar Risco' : 'Novo Risco'}>
                <RiskForm
                    process={selectedProcess}
                    risk={editingRisk}
                    onSave={handleSave}
                    onCancel={() => setIsFormVisible(false)}
                />
            </Modal>

            {isJustificationModalOpen && (
                <JustificationModal onClose={() => setIsJustificationModalOpen(false)} onConfirm={handleConfirmSave} />
            )}

            {/* PAINEL DE FILTROS */}
            <FilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} onApply={() => setIsFilterOpen(false)} onClear={clearFilters}>
                <FilterAccordion title="Tipo de Risco" isOpenDefault={true}>
                    <div className="space-y-3 pt-2">
                        {RISK_TYPES.map((type) => (
                            <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">{type}</span>
                            </label>
                        ))}
                    </div>
                </FilterAccordion>
                <FilterAccordion title="Dimensões" isOpenDefault={false}>
                    <div className="space-y-3 pt-2">
                        {RISK_DIMENSIONS.map((dim) => (
                            <label key={dim} className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" checked={selectedDimensions.includes(dim)} onChange={() => toggleDimension(dim)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">{dim}</span>
                            </label>
                        ))}
                    </div>
                </FilterAccordion>
            </FilterSheet>

            {/* TABELA DE RISCOS */}
            {filteredRisks.length > 0 ? (
                <RiskManagement
                    process={selectedProcess}
                    risks={filteredRisks}
                    onSelectRisk={handleSelectRisk}
                    onBack={handleBackToProcesses}
                    onEditRisk={handleEditRisk} // Passamos a função de editar para o filho
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-2">Nenhum risco encontrado</p>
                    {(activeFiltersCount > 0 || searchTerm) && (
                        <button onClick={clearFilters} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">Limpar filtros</button>
                    )}
                </div>
            )}
        </div>
    );
}
