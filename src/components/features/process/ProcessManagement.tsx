"use client";

import React, { useState } from 'react';
import { Process } from '@/types';
import { Plus, Search, Eye, FolderOpen, Filter, Pencil, Trash2, X } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import ProcessForm from '@/src/components/features/process/ProcessForm';
import ProcessDetails from '@/src/components/features/process/ProcessDetails';
import { SECTORS } from '@/src/constants/constants';

interface ProcessManagementProps {
  processes: Process[];
  setProcesses?: React.Dispatch<React.SetStateAction<Process[]>>;
  onSelectProcess: (id: string) => void;
  onSave: (process: Process) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface ProcessFilters {
  sector: string;
}

const initialFilters: ProcessFilters = {
  sector: '',
};

export default function ProcessManagement({
  processes,
  onSelectProcess,
  onSave,
  onDelete
}: ProcessManagementProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const [viewingProcess, setViewingProcess] = useState<Process | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Estados do filtro
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProcessFilters>(initialFilters);

  const handleAddNew = () => {
    setEditingProcess(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

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

  // Funções do filtro
  const handleFilterChange = (key: keyof ProcessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // Filtrar processos
  const filteredProcesses = processes.filter(p => {
    // Filtro de busca
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manager?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de setor
    const matchesSector = !filters.sector || p.sector === filters.sector;

    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`relative flex items-center gap-2 px-3 py-2 border rounded-md transition-colors ${
              isFilterOpen || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtro
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Processo
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filtrar por:
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-indigo-600 hover:text-indigo-300 hover:font-bold dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Filtro de Setor */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Setor
              </label>
              <select
                value={filters.sector}
                onChange={(e) => handleFilterChange('sector', e.target.value)}
                className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos os setores</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumo dos filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exibindo <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredProcesses.length}</span> de{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{processes.length}</span> processos
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">

          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Setor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Responsável
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

            {filteredProcesses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    {activeFiltersCount > 0 || searchTerm ? (
                      <>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                          Nenhum processo encontrado
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Tente ajustar os filtros ou a busca
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        Nenhum processo cadastrado
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProcesses.map((process) => (
                <tr
                  key={process.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {process.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {process.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    {process.manager}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">

                    <button
                      onClick={() => handleViewDetails(process)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 cursor-pointer"
                      title="Ver Detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleEdit(process)}
                      className="text-gray-400 hover:text-blue-500 ml-2 cursor-pointer"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteInternal(process.id)}
                      className="text-gray-400 hover:text-red-500 ml-2 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => onSelectProcess(process.id)}
                      className="text-green-400 hover:text-green-600 font-medium transition text-sm cursor-pointer"
                    >
                      Riscos
                    </button>

                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

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
