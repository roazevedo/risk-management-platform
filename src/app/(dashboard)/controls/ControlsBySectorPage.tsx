"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { SECTORS } from '@/src/constants/constants';
import Sidebar from '@/src/components/ui/Sidebar';

interface ControlWithSector {
  id: string;
  name: string;
  implemented: boolean;
  status: string;
  plannedEndDate?: string | null;
  sector: string;
  processName: string;
  riskName: string;
  riskId: string;
}

interface ControlsBySectorPageProps {
  controls: ControlWithSector[];
}

// Função para calcular status do prazo
function getDeadlineStatus(control: ControlWithSector) {
  if (control.implemented) {
    return {
      label: "Implementado",
      status: "implemented",
      className: "bg-indigo-100 text-indigo-700 border-indigo-300",
      icon: <CheckCircle className="w-4 h-4" />
    };
  }

  if (!control.plannedEndDate) {
    return {
      label: "Sem prazo",
      status: "on-time",
      className: "bg-gray-100 text-gray-600 border-gray-300",
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
      status: "overdue",
      className: "bg-red-100 text-red-700 border-red-300",
      icon: <XCircle className="w-4 h-4" />
    };
  }

  if (diffDays <= 30) {
    return {
      label: `${diffDays} dias restantes`,
      status: "near-due",
      className: "bg-yellow-100 text-yellow-700 border-yellow-300",
      icon: <AlertCircle className="w-4 h-4" />
    };
  }

  return {
    label: `${diffDays} dias restantes`,
    status: "on-time",
    className: "bg-green-100 text-green-700 border-green-300",
    icon: <Clock className="w-4 h-4" />
  };
}

export default function ControlsBySectorPage({ controls }: ControlsBySectorPageProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set(SECTORS));
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Agrupar controles por setor
  const controlsBySector = React.useMemo(() => {
    const grouped: Record<string, ControlWithSector[]> = {};

    // Inicializar todos os setores
    SECTORS.forEach(sector => {
      grouped[sector] = [];
    });
    grouped['Sem Setor'] = [];

    // Distribuir controles
    controls.forEach(control => {
      const sector = control.sector || 'Sem Setor';
      if (grouped[sector]) {
        grouped[sector].push(control);
      } else {
        grouped['Sem Setor'].push(control);
      }
    });

    return grouped;
  }, [controls]);

  // Filtrar controles por status
  const filteredControlsBySector = React.useMemo(() => {
    if (statusFilter === 'all') return controlsBySector;

    const filtered: Record<string, ControlWithSector[]> = {};
    Object.entries(controlsBySector).forEach(([sector, sectorControls]) => {
      filtered[sector] = sectorControls.filter(control => {
        const deadline = getDeadlineStatus(control);
        return deadline.status === statusFilter;
      });
    });
    return filtered;
  }, [controlsBySector, statusFilter]);

  // Contar totais por status
  const statusCounts = React.useMemo(() => {
    const counts = { total: 0, implemented: 0, 'on-time': 0, 'near-due': 0, overdue: 0 };
    controls.forEach(control => {
      counts.total++;
      const status = getDeadlineStatus(control).status;
      counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [controls]);

  const toggleSector = (sector: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sector)) {
        newSet.delete(sector);
      } else {
        newSet.add(sector);
      }
      return newSet;
    });
  };

  const expandAll = () => setExpandedSectors(new Set([...SECTORS, 'Sem Setor']));
  const collapseAll = () => setExpandedSectors(new Set());

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "-";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Controles por Setor
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Visualização de todos os controles agrupados por setor
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === 'all'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{statusCounts.total}</p>
          </button>

          <button
            onClick={() => setStatusFilter('implemented')}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === 'implemented'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-indigo-600 dark:text-indigo-400">Implementados</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{statusCounts.implemented}</p>
          </button>

          <button
            onClick={() => setStatusFilter('on-time')}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === 'on-time'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-green-600 dark:text-green-400">Em Dia</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts['on-time']}</p>
          </button>

          <button
            onClick={() => setStatusFilter('near-due')}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === 'near-due'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Venc. Próximo</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts['near-due']}</p>
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === 'overdue'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-red-600 dark:text-red-400">Atrasados</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.overdue}</p>
          </button>
        </div>

        {/* Botões de expandir/colapsar */}
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Expandir Todos
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Colapsar Todos
          </button>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
            >
              Limpar Filtro
            </button>
          )}
        </div>

        {/* Lista de setores */}
        <div className="space-y-4">
          {[...SECTORS, 'Sem Setor'].map(sector => {
            const sectorControls = filteredControlsBySector[sector] || [];
            const isExpanded = expandedSectors.has(sector);

            // Contar por status no setor
            const sectorCounts = {
              implemented: sectorControls.filter(c => getDeadlineStatus(c).status === 'implemented').length,
              'on-time': sectorControls.filter(c => getDeadlineStatus(c).status === 'on-time').length,
              'near-due': sectorControls.filter(c => getDeadlineStatus(c).status === 'near-due').length,
              overdue: sectorControls.filter(c => getDeadlineStatus(c).status === 'overdue').length,
            };

            return (
              <div key={sector} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header do setor */}
                <button
                  onClick={() => toggleSector(sector)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {sector}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({sectorControls.length} controles)
                    </span>
                  </div>

                  {/* Mini badges de status */}
                  <div className="flex gap-2">
                    {sectorCounts.implemented > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {sectorCounts.implemented} impl.
                      </span>
                    )}
                    {sectorCounts['on-time'] > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {sectorCounts['on-time']} em dia
                      </span>
                    )}
                    {sectorCounts['near-due'] > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                        {sectorCounts['near-due']} próx.
                      </span>
                    )}
                    {sectorCounts.overdue > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        {sectorCounts.overdue} atras.
                      </span>
                    )}
                  </div>
                </button>

                {/* Lista de controles do setor */}
                {isExpanded && (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sectorControls.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                        Nenhum controle {statusFilter !== 'all' ? 'com este status ' : ''}neste setor
                      </div>
                    ) : (
                      sectorControls.map(control => {
                        const deadline = getDeadlineStatus(control);

                        return (
                          <div
                            key={control.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {control.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {control.processName} → {control.riskName}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 ml-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(control.plannedEndDate)}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${deadline.className}`}>
                                  {deadline.icon}
                                  {deadline.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
