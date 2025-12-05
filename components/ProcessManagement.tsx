"use client";

import React, { useState } from 'react';
import { Process } from '@/types';
import { Plus, Search, Eye } from 'lucide-react';
import { Modal } from '@/components/Modal';
import ProcessForm from '@/components/ProcessForm';
import ProcessDetails from '@/components/ProcessDetails';

interface ProcessManagementProps {
  processes: Process[];
  setProcesses?: React.Dispatch<React.SetStateAction<Process[]>>;
  onSelectProcess: (id: string) => void;
  onSave: (process: Process) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ProcessManagement({
  processes,
  onSelectProcess,
  onSave,
  onDelete
}: ProcessManagementProps) {

    // Estados existentes
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    // 2. NOVO ESTADO PARA VISUALIZAÇÃO
    const [viewingProcess, setViewingProcess] = useState<Process | undefined>(undefined);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // --- MANIPULAÇÃO DO MODAL DE EDIÇÃO ---
    const handleAddNew = () => {
        setEditingProcess(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (process: Process) => {
        setEditingProcess(process);
        setIsModalOpen(true);
    };

    // 3. NOVA FUNÇÃO PARA VISUALIZAR
    const handleViewDetails = (process: Process) => {
        setViewingProcess(process);
        setIsViewModalOpen(true);
    };

    const handleSaveInternal = async (processData: Process) => {
      await onSave(processData);
      setIsModalOpen(false);
      setEditingProcess(undefined);
    };

    const handleDeleteInternal = async (id: string) => {
      await onDelete(id);
    };

    const filteredProcesses = processes.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar processo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Processo
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Setor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProcesses.map((process) => (
                            <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {process.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {process.sector}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {process.manager}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">

                                    {/* 4. BOTÃO DE VISUALIZAR (OLHO) */}
                                    <button
                                        onClick={() => handleViewDetails(process)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium p-1"
                                        title="Ver Detalhes"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>

                                    <button
                                      onClick={() => onSelectProcess(process.id)} // A função aqui está correta
                                      className="text-indigo-600 hover:text-indigo-900 font-medium ml-2"
                                    >
                                        Riscos
                                    </button>
                                    <button
                                        onClick={() => handleEdit(process)}
                                        className="text-blue-600 hover:text-blue-900 font-medium ml-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteInternal(process.id)}
                                        className="text-red-600 hover:text-red-900 font-medium ml-2"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulário (Edição/Criação) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProcess ? 'Editar Processo' : 'Novo Processo'}
            >
                <ProcessForm
                    process={editingProcess}
                    onSave={handleSaveInternal}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* 5. NOVO MODAL DE DETALHES (READ-ONLY) */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalhes do Processo"
            >
                {viewingProcess && <ProcessDetails process={viewingProcess} />}
            </Modal>
        </div>
    );
}
