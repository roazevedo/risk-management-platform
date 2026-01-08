"use client";

import React, { useState } from "react";
import { Control, Risk } from "@/types";
import {
  Plus,
  Search,
  Eye,
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Pencil,
  Trash2
} from "lucide-react";

import { Modal } from "@/src/components/ui/Modal";
import ControlForm from "@/src/components/features/control/ControlForm";
import { ControlDetails } from "@/src/components/features/control/ControlDetails";
import FilterSidebar from "@/src/components/ui/FilterSidebar";

import {
  CONTROL_TYPES,
  CONTROL_NATURES,
  CONTROL_RELATIONS,
  CONTROL_NEW_MODIFIED,
  CONTROL_STATUS,
  CONTROL_STATUS_LABELS
} from "@/src/constants/constants";

interface ControlManagementProps {
  risk: Risk;
  controls: Control[];
  onSave: (control: Control) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ControlManagement({
  risk,
  controls,
  onSave,
  onDelete
}: ControlManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingControl, setViewingControl] = useState<Control | undefined>();

  // Estados dos filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNatures, setSelectedNatures] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);
  const [selectedNewOrModified, setSelectedNewOrModified] = useState<string[]>([]);
  const [showImplementedOnly, setShowImplementedOnly] = useState(false);
  const [showNotImplementedOnly, setShowNotImplementedOnly] = useState(false);

  // DEBUG - remova depois de testar
  console.log("=== DEBUG ControlManagement ===");
  console.log("searchTerm:", searchTerm);
  console.log("controls recebidos:", controls);

  const getStatusBadge = (control: Control) => {
    if (control.implemented) {
      return {
        label: "Implementado",
        className: "bg-green-100 text-green-700 border-green-300",
        status: "on-time",
        icon: <CheckCircle className="w-4 h-4" />
      };
    }

    if (!control.plannedEndDate) {
      return {
        label: "Pendente",
        className: "bg-gray-100 text-gray-600 border-gray-300",
        status: "on-time",
        icon: <Clock className="w-4 h-4" />
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(control.plannedEndDate);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        label: `Atrasado (${Math.abs(diffDays)}d)`,
        className: "bg-red-100 text-red-700 border-red-300",
        status: "overdue",
        icon: <XCircle className="w-4 h-4" />
      };
    }

    if (diffDays <= 30) {
      return {
        label: `${diffDays} dias`,
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        status: "near-due",
        icon: <AlertCircle className="w-4 h-4" />
      };
    }

    return {
      label: `${diffDays} dias`,
      className: "bg-blue-100 text-blue-700 border-blue-300",
      status: "on-time",
      icon: <Clock className="w-4 h-4" />
    };
  };

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "-";

  // Contagem de filtros ativos
  const activeFiltersCount =
    selectedTypes.length +
    selectedNatures.length +
    selectedStatuses.length +
    selectedRelations.length +
    selectedNewOrModified.length +
    (showImplementedOnly ? 1 : 0) +
    (showNotImplementedOnly ? 1 : 0);

  // Aplicação dos filtros
  const filteredControls = (controls || []).filter(control => {
    const badge = getStatusBadge(control);

    // Filtro de busca por palavra (em múltiplos campos)
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      control.name.toLowerCase().includes(searchLower) ||
      control.type.toLowerCase().includes(searchLower) ||
      control.nature.toLowerCase().includes(searchLower) ||
      control.relationToRisk.toLowerCase().includes(searchLower) ||
      control.newOrModified.toLowerCase().includes(searchLower) ||
      (control.responsible?.toLowerCase().includes(searchLower) ?? false) ||
      (control.implementationMethod?.toLowerCase().includes(searchLower) ?? false) ||
      (control.macroSteps?.toLowerCase().includes(searchLower) ?? false) ||
      (control.adequacyAnalysis?.toLowerCase().includes(searchLower) ?? false) ||
      (control.involvedSectors?.some(sector => sector.toLowerCase().includes(searchLower)) ?? false);

    // Filtro por tipo
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(control.type);

    // Filtro por natureza
    const matchesNature = selectedNatures.length === 0 || selectedNatures.includes(control.nature);

    // Filtro por status
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(badge.status);

    // Filtro por relação com o risco
    const matchesRelation = selectedRelations.length === 0 || selectedRelations.includes(control.relationToRisk);

    // Filtro por novo/modificado
    const matchesNewOrModified = selectedNewOrModified.length === 0 || selectedNewOrModified.includes(control.newOrModified);

    // Filtro por implementado
    const matchesImplemented =
      (!showImplementedOnly && !showNotImplementedOnly) ||
      (showImplementedOnly && control.implemented) ||
      (showNotImplementedOnly && !control.implemented);

    return (
      matchesSearch &&
      matchesType &&
      matchesNature &&
      matchesStatus &&
      matchesRelation &&
      matchesNewOrModified &&
      matchesImplemented
    );
  });

  // DEBUG - remova depois de testar
  console.log("filteredControls:", filteredControls);

  // Função para limpar todos os filtros
  const handleClearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedNatures([]);
    setSelectedStatuses([]);
    setSelectedRelations([]);
    setSelectedNewOrModified([]);
    setShowImplementedOnly(false);
    setShowNotImplementedOnly(false);
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar controle..."
            value={searchTerm}
            onChange={(e) => {
              console.log("Input onChange:", e.target.value); // DEBUG
              setSearchTerm(e.target.value);
            }}
            className="pl-9 pr-4 py-2 w-full rounded-md bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-500 dark:hover:bg-gray-700 text-white"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-indigo-600 text-white rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingControl(undefined);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Novo Controle
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-white">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Controle</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Natureza</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Prazo</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredControls.length > 0 ? (
                filteredControls.map(control => {
                  const badge = getStatusBadge(control);

                  return (
                    <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium">{control.name}</td>
                      <td className="px-4 py-3">{control.type}</td>
                      <td className="px-4 py-3">{control.nature}</td>
                      <td className="px-4 py-3">{formatDate(control.plannedEndDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${badge.className}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setViewingControl(control);
                              setIsViewModalOpen(true);
                            }}
                            title="Visualizar"
                            className="text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingControl(control);
                              setIsFormModalOpen(true);
                            }}
                            title="Editar"
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onDelete(control.id)}
                            title="Excluir"
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                    Nenhum controle encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      {isFormModalOpen && (
        <Modal
          isOpen
          onClose={() => setIsFormModalOpen(false)}
          title={editingControl ? "Editar Controle" : "Novo Controle"}
        >
          <ControlForm
            risk={risk}
            control={editingControl}
            onSave={async (c) => {
              await onSave(c);
              setIsFormModalOpen(false);
              setEditingControl(undefined);
            }}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </Modal>
      )}

      {/* Modal de Detalhes */}
      {isViewModalOpen && viewingControl && (
        <ControlDetails
          control={viewingControl}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {/* Sidebar de Filtros */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Controles"
        filterGroups={[
          {
            id: "type",
            label: "Tipo",
            options: [...CONTROL_TYPES],
            selected: selectedTypes,
            onChange: setSelectedTypes
          },
          {
            id: "nature",
            label: "Natureza",
            options: [...CONTROL_NATURES],
            selected: selectedNatures,
            onChange: setSelectedNatures
          },
          {
            id: "status",
            label: "Status",
            options: [...CONTROL_STATUS],
            optionLabels: CONTROL_STATUS_LABELS,
            selected: selectedStatuses,
            onChange: setSelectedStatuses
          },
          {
            id: "relationToRisk",
            label: "Relação com o Risco",
            options: [...CONTROL_RELATIONS],
            selected: selectedRelations,
            onChange: setSelectedRelations
          },
          {
            id: "newOrModified",
            label: "Novo ou Modificado",
            options: [...CONTROL_NEW_MODIFIED],
            selected: selectedNewOrModified,
            onChange: setSelectedNewOrModified
          }
        ]}
        booleanFilters={[
          {
            id: "implemented",
            label: "Apenas Implementados",
            checked: showImplementedOnly,
            onChange: (checked) => {
              setShowImplementedOnly(checked);
              if (checked) setShowNotImplementedOnly(false);
            }
          },
          {
            id: "notImplemented",
            label: "Apenas Não Implementados",
            checked: showNotImplementedOnly,
            onChange: (checked) => {
              setShowNotImplementedOnly(checked);
              if (checked) setShowImplementedOnly(false);
            }
          }
        ]}
        onClearAll={handleClearAllFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
