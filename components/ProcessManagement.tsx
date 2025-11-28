"use client";

import React, { useState, Dispatch, SetStateAction } from 'react';
import { Process } from '@/types';
import { Plus, Search, Filter } from 'lucide-react'; // Ajuste os ícones conforme seu projeto
import { Modal } from '@/components/Modal';
// Se você já extraiu o ProcessForm, importe ele. Se não, mantenha o form interno aqui por enquanto.
import ProcessForm from '@/components/ProcessForm';

interface ProcessManagementProps {
  processes: Process[];
  // Tornamos setProcesses opcional (?) pois quem gerencia a lista agora é o servidor
  setProcesses?: Dispatch<SetStateAction<Process[]>>;
  onSelectProcess: (id: string) => void;

  // NOVAS PROPS OBRIGATÓRIAS
  onSave: (process: Process) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ProcessManagement({
  processes,
  onSelectProcess,
  onSave,
  onDelete
}: ProcessManagementProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // --- MANIPULAÇÃO DO MODAL ---
  const handleAddNew = () => {
    setEditingProcess(undefined);
    setIsModalOpen(true);
  };

    const handleEdit = (process: Process) => {
      setEditingProcess(process);
      setIsModalOpen(true);
    };

  // --- SALVAR (Conecta com a Server Action do pai) ---
  const handleSaveInternal = async (processData: Process) => {
    // Chama a função do pai (que chama o Prisma)
    await onSave(processData);
    // Fecha o modal após salvar
    setIsModalOpen(false);
    setEditingProcess(undefined);
  };

  // --- DELETAR ---
  const handleDeleteInternal = async (id: string) => {
    // Chama a função do pai
    await onDelete(id);
  };

  // Filtro simples local para a tabela
  const filteredProcesses = processes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestão de Processos</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
      </div>

    {/* TABELA DE PROCESSOS */}
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
                  <button
                    onClick={() => onSelectProcess(process.id)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    Riscos
                  </button>
                  <button
                    onClick={() => handleEdit(process)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteInternal(process.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {filteredProcesses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Nenhum processo encontrado.
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>

      {/* MODAL COM FORMULÁRIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProcess ? 'Editar Processo' : 'Novo Processo'}
      >
        {/* Aqui assumo que você tem o componente ProcessForm.
          Se não tiver, coloque o formulário direto aqui dentro. */}
        <ProcessForm
          process={editingProcess}
          onSave={handleSaveInternal} // Passamos nossa função wrapper
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
