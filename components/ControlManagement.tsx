"use client";

import React, { useState } from 'react';
import { Control, Risk } from '@/types';
import { Plus, Search, Eye, FolderOpen, CheckCircle, XCircle, Clock, AlertCircle, Filter, X } from 'lucide-react';
import { Modal } from '@/components/Modal';
import ControlForm from '@/components/ControlForm';
import FilterSidebar from '@/components/FilterSidebar';
import { CONTROL_TYPES, CONTROL_NATURES, CONTROL_RELATIONS } from '@/constants';

interface ControlManagementProps {
  risk: Risk;
  controls: Control[];
  onSave: (control: Control) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ControlManagement({ risk, controls, onSave, onDelete }: ControlManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do filtro sidebar
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNatures, setSelectedNatures] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showImplementedOnly, setShowImplementedOnly] = useState(false);

  const handleAddNew = () => {
    setEditingControl(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (control: Control) => {
    setEditingControl(control);
    setIsModalOpen(true);
  };

  const handleSaveInternal = async (controlData: Control) => {
    await onSave(controlData);
    setIsModalOpen(false);
    setEditingControl(undefined);
  };

  const handleDeleteInternal = async (id: string) => {
    await onDelete(id);
  };

  // Função para obter badge de status
  const getStatusBadge = (control: Control) => {
    if (control.implemented) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Implementado',
        className: 'bg-green-100 text-green-700 border-green-300',
        status: 'on-time'
      };
    }

    if (!control.plannedEndDate) {
      return {
        icon: <Clock className="w-4 h-4" />,
        label: 'Pendente',
        className: 'bg-gray-100 text-gray-600 border-gray-300',
        status: 'on-time'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(control.plannedEndDate);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        icon: <XCircle className="w-4 h-4" />,
        label: `Atrasado (${Math.abs(diffDays)}d)`,
        className: 'bg-red-100 text-red-700 border-red-300',
        status: 'overdue'
      };
    } else if (diffDays <= 30) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        label: `${diffDays} dias restantes`,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        status: 'near-due'
      };
    }

    return {
      icon: <Clock className="w-4 h-4" />,
      label: `${diffDays} dias restantes`,
      className: 'bg-blue-100 text-blue-700 border-blue-300',
      status: 'on-time'
    };
  };

  // Formatar data
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedNatures([]);
    setSelectedStatuses([]);
    setShowImplementedOnly(false);
  };

  // Contar filtros ativos
  const activeFiltersCount = selectedTypes.length + selectedNatures.length + selectedStatuses.length + (showImplementedOnly ? 1 : 0);

  // Configuração dos grupos de filtros para a sidebar
  const filterGroups = [
    {
      id: 'types',
      label: 'Tipo de Controle',
      options: CONTROL_TYPES,
      selected: selectedTypes,
      onChange: setSelectedTypes
    },
    {
      id: 'natures',
      label: 'Natureza',
      options: CONTROL_NATURES,
      selected: selectedNatures,
      onChange: setSelectedNatures
    },
    {
      id: 'statuses',
      label: 'Status',
      options: ['Em Dia', 'Vencimento Próximo', 'Atrasado'],
      selected: selectedStatuses.map(s => {
        if (s === 'on-time') return 'Em Dia';
        if (s === 'near-due') return 'Vencimento Próximo';
        if (s === 'overdue') return 'Atrasado';
        return s;
      }),
      onChange: (values) => {
        const mapped = values.map(v => {
          if (v === 'Em Dia') return 'on-time';
          if (v === 'Vencimento Próximo') return 'near-due';
          if (v === 'Atrasado') return 'overdue';
          return v;
        });
        setSelectedStatuses(mapped);
      }
    }
  ];

  const booleanFilters = [
    {
      id: 'implemented',
      label: 'Apenas Implementados',
      checked: showImplementedOnly,
      onChange: setShowImplementedOnly
    }
  ];

  // Filtro completo
  const safeControls = controls || [];
  const filteredControls = safeControls.filter(control => {
    const statusBadge = getStatusBadge(control);

    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(control.type);
    const matchesNature = selectedNatures.length === 0 || selectedNatures.includes(control.nature);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusBadge.status);
    const matchesImplemented = !showImplementedOnly || control.implemented;

    return matchesSearch && matchesType && matchesNature && matchesStatus && matchesImplemented;
  });

  return (
    <div className="space-y-6 relative">
      {/* Barra de Busca e Filtro */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar controle por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium relative"
        >
          <Filter className="w-5 h-5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar de Filtros Reutilizável */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros"
        filterGroups={filterGroups}
        booleanFilters={booleanFilters}
        onClearAll={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Tabela de Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Controle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Natureza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo Previsto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredControls.length > 0 ? (
                filteredControls.map((control) => {
                  const statusBadge = getStatusBadge(control);

                  return (
                    <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {control.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {control.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {control.nature}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {control.responsible || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(control.plannedEndDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(control)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteInternal(control.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                        <FolderOpen className="w-8 h-8" />
                      </div>
                      {searchTerm || activeFiltersCount > 0 ? (
                        <>
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            Nenhum controle encontrado
                          </p>
                          <p className="text-sm mt-1">
                            Tente ajustar sua busca ou filtros.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            Nenhum controle cadastrado
                          </p>
                          <p className="text-sm mt-1">
                            Este risco ainda não possui controles associados.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingControl ? "Editar Controle" : "Novo Controle"}
      >
        <ControlForm
          risk={risk}
          control={editingControl}
          onSave={handleSaveInternal}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
