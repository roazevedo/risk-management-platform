"use client";

import React, { useState } from "react";
import { Risk } from "@/types";
import {
  Plus,
  Search,
  Eye,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  FolderOpen,
  Filter
} from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";
import RiskForm from "@/src/components/features/risk/RiskForm";
import RiskDetails from "@/src/components/features/risk/RiskDetails";
import FilterSidebar from "@/src/components/ui/FilterSidebar";
import { useRouter } from "next/navigation";

import {
  RISK_TYPES,
  RISK_ASSOCIATIONS,
  RISK_DIMENSIONS,
  RISK_RESPONSES,
  RISK_RESIDUAL_LEVELS,
  RISK_RESIDUAL_LABELS
} from "@/src/constants/constants";

interface RiskManagementProps {
  processId: string;
  risks: Risk[];
  superSalvar: (risk: Risk) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {children}
    </span>
  );
}

function getResidualRiskInfo(score: number) {
  const value = Math.round(score * 10) / 10;

  if (value > 15)
    return {
      label: "Crítico",
      level: "critical",
      className: "bg-red-100 text-red-700 border-red-300",
    };

  if (value > 10)
    return {
      label: "Alto",
      level: "high",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    };

  if (value > 7)
    return {
      label: "Médio",
      level: "medium",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };

  if (value > 3)
    return {
      label: "Baixo",
      level: "low",
      className: "bg-green-100 text-green-700 border-green-300",
    };

  return {
    label: "Muito Baixo",
    level: "very-low",
    className: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };
}

function getFacInfo(fac: number) {
  if (fac === 1.0)
    return {
      label: "Ineficaz",
      className: "bg-red-100 text-red-700 border-red-300",
    };

  if (fac === 0.8)
    return {
      label: "Fraco",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    };

  if (fac === 0.6)
    return {
      label: "Mediano",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };

  if (fac === 0.4)
    return {
      label: "Satisfatório",
      className: "bg-green-100 text-green-700 border-green-300",
    };

  if (fac <= 0.2)
    return {
      label: "Forte",
      className: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };

  return {
    label: "-",
    className: "bg-gray-100 text-gray-600 border-gray-300",
  };
}

function getDeadlineStatus(date?: string | null) {
  if (!date)
    return {
      label: "Sem prazo",
      className: "bg-gray-100 text-gray-600 border-gray-300",
    };

  const deadline = new Date(date);
  const today = new Date();
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0)
    return {
      label: `Atrasado (${Math.abs(diffDays)}d)`,
      className: "bg-red-100 text-red-700 border-red-300",
      icon: <AlertCircle className="w-3 h-3" />,
    };

  return {
    label: `${diffDays} dias restantes`,
    className:
      diffDays <= 60
        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
        : "bg-green-100 text-green-700 border-green-300",
    icon: <Calendar className="w-3 h-3" />,
  };
}

export default function RiskManagement({
  processId,
  risks,
  superSalvar,
  onDelete,
}: RiskManagementProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRisk, setViewingRisk] = useState<Risk | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  // Estados dos filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAssociations, setSelectedAssociations] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);
  const [selectedResidualLevels, setSelectedResidualLevels] = useState<string[]>([]);
  const [showLgpdOnly, setShowLgpdOnly] = useState(false);
  const [showNonLgpdOnly, setShowNonLgpdOnly] = useState(false);

  // Contagem de filtros ativos
  const activeFiltersCount =
    selectedTypes.length +
    selectedAssociations.length +
    selectedDimensions.length +
    selectedResponses.length +
    selectedResidualLevels.length +
    (showLgpdOnly ? 1 : 0) +
    (showNonLgpdOnly ? 1 : 0);

  // Aplicação dos filtros
  const filteredRisks = (risks || []).filter((risk) => {
    const residualInfo = getResidualRiskInfo(risk.residualRisk);

    // Filtro de busca por palavra
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      risk.name.toLowerCase().includes(searchLower) ||
      risk.type.toLowerCase().includes(searchLower) ||
      risk.association.toLowerCase().includes(searchLower) ||
      risk.suggestedResponse.toLowerCase().includes(searchLower) ||
      (risk.causes?.toLowerCase().includes(searchLower) ?? false) ||
      (risk.consequences?.toLowerCase().includes(searchLower) ?? false);

    // Filtro por tipo
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(risk.type);

    // Filtro por associação
    const matchesAssociation = selectedAssociations.length === 0 || selectedAssociations.includes(risk.association);

    // Filtro por dimensões (risco pode ter múltiplas dimensões)
    const matchesDimensions =
      selectedDimensions.length === 0 ||
      (risk.dimensions && risk.dimensions.some((dim) => selectedDimensions.includes(dim)));

    // Filtro por resposta sugerida
    const matchesResponse = selectedResponses.length === 0 || selectedResponses.includes(risk.suggestedResponse);

    // Filtro por nível de risco residual
    const matchesResidualLevel =
      selectedResidualLevels.length === 0 || selectedResidualLevels.includes(residualInfo.level);

    // Filtro por LGPD
    const matchesLgpd =
      (!showLgpdOnly && !showNonLgpdOnly) ||
      (showLgpdOnly && risk.isLgpdRelated) ||
      (showNonLgpdOnly && !risk.isLgpdRelated);

    return (
      matchesSearch &&
      matchesType &&
      matchesAssociation &&
      matchesDimensions &&
      matchesResponse &&
      matchesResidualLevel &&
      matchesLgpd
    );
  });

  // Função para limpar todos os filtros
  const handleClearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedAssociations([]);
    setSelectedDimensions([]);
    setSelectedResponses([]);
    setSelectedResidualLevels([]);
    setShowLgpdOnly(false);
    setShowNonLgpdOnly(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar risco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              setEditingRisk(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Novo Risco
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700 text-slate-300 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Risco</th>
              <th className="px-6 py-3 text-center">Risco Residual</th>
              <th className="px-6 py-3 text-center">FAC</th>
              <th className="px-6 py-3 text-left">Resposta</th>
              <th className="px-6 py-3 text-left">Prazo</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="bg-slate-800">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                      Nenhum risco encontrado
                    </p>
                    <p className="text-sm mt-1">
                      {searchTerm || activeFiltersCount > 0
                        ? "Tente ajustar os filtros ou a busca."
                        : "Este processo ainda não possui riscos cadastrados."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRisks.map((risk) => {
                const residual = getResidualRiskInfo(risk.residualRisk);
                const fac = getFacInfo(risk.fac);
                const deadline = getDeadlineStatus(risk.maxImplementationDate);

                return (
                  <tr key={risk.id} className="border-t border-slate-700">
                    <td className="px-6 py-4 font-semibold text-white">
                      {risk.name}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge className={residual.className}>
                        {risk.residualRisk.toFixed(1)} • {residual.label}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Badge className={fac.className}>
                        {risk.fac.toFixed(2)} • {fac.label}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-white">
                      {risk.suggestedResponse}
                    </td>

                    <td className="px-6 py-4">
                      <Badge className={deadline.className}>
                        {deadline.icon}
                        {deadline.label}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setViewingRisk(risk);
                            setIsViewModalOpen(true);
                          }}
                          title="Visualizar risco"
                          className="text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingRisk(risk);
                            setIsModalOpen(true);
                          }}
                          title="Editar risco"
                          className="text-gray-400 hover:text-blue-500 transition cursor-pointer"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Deseja realmente excluir este risco?")) {
                              onDelete(risk.id);
                            }
                          }}
                          title="Excluir risco"
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/processes/${processId}/risks/${risk.id}/controls`
                            )
                          }
                          title="Gerenciar controles"
                          className="text-green-400 hover:text-green-600 font-medium transition text-sm cursor-pointer"
                        >
                          Controles
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRisk ? "Editar Risco" : "Novo Risco"}
      >
        <RiskForm
          risk={editingRisk}
          processId={processId}
          onSave={async (risk) => {
            await superSalvar(risk);
            setIsModalOpen(false);
            setEditingRisk(undefined);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Risco"
      >
        {viewingRisk && (
          <RiskDetails
            risk={viewingRisk}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

      {/* Sidebar de Filtros */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Riscos"
        filterGroups={[
          {
            id: "type",
            label: "Tipo",
            options: [...RISK_TYPES],
            selected: selectedTypes,
            onChange: setSelectedTypes
          },
          {
            id: "association",
            label: "Associação",
            options: [...RISK_ASSOCIATIONS],
            selected: selectedAssociations,
            onChange: setSelectedAssociations
          },
          {
            id: "dimensions",
            label: "Dimensões",
            options: [...RISK_DIMENSIONS],
            selected: selectedDimensions,
            onChange: setSelectedDimensions
          },
          {
            id: "response",
            label: "Resposta Sugerida",
            options: [...RISK_RESPONSES],
            selected: selectedResponses,
            onChange: setSelectedResponses
          },
          {
            id: "residualLevel",
            label: "Nível de Risco Residual",
            options: [...RISK_RESIDUAL_LEVELS],
            optionLabels: RISK_RESIDUAL_LABELS,
            selected: selectedResidualLevels,
            onChange: setSelectedResidualLevels
          }
        ]}
        booleanFilters={[
          {
            id: "lgpdOnly",
            label: "Apenas com Relação LGPD",
            checked: showLgpdOnly,
            onChange: (checked) => {
              setShowLgpdOnly(checked);
              if (checked) setShowNonLgpdOnly(false);
            }
          },
          {
            id: "nonLgpdOnly",
            label: "Apenas sem Relação LGPD",
            checked: showNonLgpdOnly,
            onChange: (checked) => {
              setShowNonLgpdOnly(checked);
              if (checked) setShowLgpdOnly(false);
            }
          }
        ]}
        onClearAll={handleClearAllFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
