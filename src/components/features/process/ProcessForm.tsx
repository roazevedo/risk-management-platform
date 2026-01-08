"use client";

import React, { useState } from 'react';
import { Process, HistoryEntry } from '@/types';
import { SECTORS } from '@/src/constants/constants';

interface ProcessFormProps {
    process?: Process;
    onSave: (process: Process) => Promise<void>;
    onCancel: () => void;
}

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

export default function ProcessForm({ process, onSave, onCancel }: ProcessFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para a justificativa (só usado na edição)
    const [justification, setJustification] = useState('');

    // Estado local do formulário
    const [formData, setFormData] = useState<Partial<Process>>({
        name: process?.name || '',
        sector: process?.sector || '',
        manager: process?.manager || '',
        legalBasis: process?.legalBasis || '',
        responsibleServers: process?.responsibleServers || [],
        systemsUsed: process?.systemsUsed || [],
        stakeholders: process?.stakeholders || [],
        history: process?.history || []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Process) => {
        const { value } = e.target;
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        setFormData(prev => ({ ...prev, [field]: arrayValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação: Se for edição, EXIGIR justificativa
        if (process?.id && !justification.trim()) {
            alert("Por favor, forneça uma justificativa para a alteração.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Lógica do Histórico
            let updatedHistory = [...(formData.history || [])];

            // Se for edição (tem ID), adiciona entrada no histórico
            if (process?.id) {
                const newHistoryEntry: HistoryEntry = {
                    timestamp: new Date().toISOString(),
                    user: "Usuário Atual", // Futuramente pegaremos da sessão de login
                    justification: justification,
                    changes: "Atualização de dados do processo" // Podemos detalhar mais futuramente
                };
                updatedHistory.push(newHistoryEntry);
            }

            const processToSave: Process = {
                ...(process?.id ? { id: process.id } : {}),
                name: formData.name || '',
                sector: formData.sector || '',
                manager: formData.manager || '',
                legalBasis: formData.legalBasis?.trim() || '',
                responsibleServers: formData.responsibleServers || [],
                systemsUsed: formData.systemsUsed || [],
                stakeholders: formData.stakeholders || [],
                history: updatedHistory,
            } as Process;

            await onSave(processToSave);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar o processo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="p-name" className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Nome do Processo *
                    </label>
                    <input
                        id="p-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={formInputStyle}
                    />
                </div>
                <div>
                    <label htmlFor="p-sector" className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Setor *
                    </label>
                    <select
                        id="p-sector"
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        required
                        className={formInputStyle}
                    >
                        <option value="" disabled>Selecione o setor</option>
                        {SECTORS.map((sector) => (
                            <option key={sector} value={sector}>
                                {sector}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="p-manager" className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Gestor *
                    </label>
                    <input
                        id="p-manager"
                        type="text"
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                        required
                        className={formInputStyle}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Servidores Responsáveis (separados por vírgula)
                    </label>
                    <input
                        type="text"
                        value={formData.responsibleServers?.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'responsibleServers')}
                        className={formInputStyle}
                        placeholder="Ex: João Silva, Maria Santos"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Sistemas Utilizados (separados por vírgula)
                    </label>
                    <input
                        type="text"
                        value={formData.systemsUsed?.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'systemsUsed')}
                        className={formInputStyle}
                        placeholder="Ex: SAP, SIGES, Oracle"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                        Stakeholders (separados por vírgula)
                    </label>
                    <input
                        type="text"
                        value={formData.stakeholders?.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'stakeholders')}
                        className={formInputStyle}
                        placeholder="Ex: Diretoria, TI, Financeiro"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="p-legalBasis" className="block text-sm font-medium mb-1 dark:text-gray-200">
                    Base Legal (opcional)
                </label>
                <textarea
                    id="p-legalBasis"
                    name="legalBasis"
                    value={formData.legalBasis}
                    onChange={handleChange}
                    rows={3}
                    className={formInputStyle}
                    placeholder="Ex: Lei 13.709/2018 (LGPD), Decreto 9.637/2018..."
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Informe as leis, decretos ou normas que regulamentam este processo
                </p>
            </div>

            {process?.id && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-700">
                    <label htmlFor="p-justification" className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-200">
                        Justificativa da Alteração *
                    </label>
                    <textarea
                        id="p-justification"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        rows={2}
                        className={formInputStyle}
                        placeholder="Descreva o motivo desta alteração..."
                        required
                    ></textarea>
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-gray-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Processo'}
                </button>
            </div>
        </form>
    );
}
