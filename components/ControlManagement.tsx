"use client";

import React, { useState } from 'react';
import type { Risk, Control, ControlStatus } from '@/types';
import { EyeIcon } from './icons';
import { ControlDetails } from './ControlDetails';

interface ControlManagementProps {
    risk: Risk;
    controls: Control[];
    // setControls removido pois quem gerencia é o pai
    onBack?: () => void; // Opcional, pois o botão de voltar agora está no cabeçalho do pai
    onEditControl: (control: Control) => void;
}

// Mantendo a função getStatus aqui apenas para exibição visual na tabela
const getStatus = (plannedEndDate: string, implemented: boolean, actualEndDate: string): { status: ControlStatus, label: string, color: string } => {
    if (implemented) return { status: 'on-time', label: 'Implementado', color: 'bg-green-500' };
    if (!plannedEndDate) return { status: 'on-time', label: 'Pendente', color: 'bg-gray-500' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(plannedEndDate + 'T00:00:00');
    const timeDiff = endDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) return { status: 'overdue', label: 'Atrasado', color: 'bg-red-500' };
    if (dayDiff <= 30) return { status: 'near-due', label: 'Vencimento Próximo', color: 'bg-yellow-500' };
    return { status: 'on-time', label: 'Em Dia', color: 'bg-blue-500' };
};

export default function ControlManagement({
    risk,
    controls,
    onEditControl
}: ControlManagementProps) {

    const [viewingControl, setViewingControl] = useState<Control | null>(null);

    const handleViewDetails = (control: Control) => {
        setViewingControl(control);
    };

    return (
        <div className="space-y-4">

            {viewingControl && <ControlDetails control={viewingControl} onClose={() => setViewingControl(null)} />}

            {/* Tabela Limpa */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Controle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Natureza</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {controls.map(control => {
                            const statusInfo = getStatus(control.plannedEndDate, control.implemented, control.actualEndDate);
                            return (
                                <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {control.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {control.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {control.nature}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleViewDetails(control)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-full">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onEditControl(control)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
                Mostrando {controls.length} controles
            </div>
        </div>
    );
}
