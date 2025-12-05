"use client";

import React, { useState } from 'react';
import { Process, Risk } from '@/types';
import { getInherentRiskLevel, getResidualRiskLevel } from '@/lib/domain/risk-classification';
import { EyeIcon, ChevronLeftIcon, Plus } from './icons';
import { Modal } from '@/components/Modal';
import RiskDetails from './RiskDetails';
import RiskForm from './RiskForm';

interface RiskManagementProps {
    process: Process;
    risks: Risk[];
    onSelectRisk: (id: string) => void;
    onSave: (risk: Risk) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function RiskManagement({
    process,
    risks,
    onSelectRisk,
    onSave,
    onDelete
}: RiskManagementProps) {

    // Estado para modal de visualização de detalhes
    const [viewingRisk, setViewingRisk] = useState<Risk | null>(null);

    // Estado para modal de edição/criação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);

    const handleViewDetails = (risk: Risk) => {
        setViewingRisk(risk);
    };

    const handleAddNew = () => {
        setEditingRisk(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (risk: Risk) => {
        setEditingRisk(risk);
        setIsModalOpen(true);
    };

    const handleSaveInternal = async (riskData: Risk) => {
        await onSave(riskData);
        setIsModalOpen(false);
        setEditingRisk(undefined);
    };

    const handleDeleteInternal = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este risco?')) {
            await onDelete(id);
        }
    };

    return (
        <div className="space-y-4">

            {/* Cabeçalho com botão Novo Risco */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Risco
                </button>
            </div>

            {/* MODAL DE DETALHES (Visualização apenas) */}
            {viewingRisk && (
                <RiskDetails risk={viewingRisk} onClose={() => setViewingRisk(null)} />
            )}

            {/* MODAL DE EDIÇÃO/CRIAÇÃO */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRisk ? "Editar Risco" : "Novo Risco"}
            >
                <RiskForm
                    risk={editingRisk}
                    processId={process.id}
                    onSave={handleSaveInternal}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* TABELA DE DADOS */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Risco</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco Inerente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco Residual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {risks.map(risk => {
                            const inherentRiskDetails = getInherentRiskLevel(risk.inherentRisk);
                            const residualRiskDetails = getResidualRiskLevel(risk.residualRisk);

                            return (
                                <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {risk.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${inherentRiskDetails.color}`}>
                                            {inherentRiskDetails.label} ({risk.inherentRisk})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${residualRiskDetails.color}`}>
                                            {residualRiskDetails.label} ({risk.residualRisk.toFixed(2)})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleViewDetails(risk)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-full"
                                            title="Ver Detalhes"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => onSelectRisk(risk.id)}
                                            className="text-green-600 hover:text-green-900 font-medium"
                                        >
                                            Ver Controles
                                        </button>

                                        <button
                                            onClick={() => handleEdit(risk)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => handleDeleteInternal(risk.id)}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Rodapé da tabela */}
            <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
                Mostrando {risks.length} riscos
            </div>
        </div>
    );
}
