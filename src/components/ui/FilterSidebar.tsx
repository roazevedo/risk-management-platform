"use client";

import React from 'react';
import { X } from 'lucide-react';

export interface FilterGroup {
  id: string;
  label: string;
  options: readonly string[] | string[];
  optionLabels?: Record<string, string>; // Labels customizados para as opções
  selected: string[];
  onChange: (selected: string[]) => void;
}

export interface BooleanFilter {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  filterGroups?: FilterGroup[];
  booleanFilters?: BooleanFilter[];
  onClearAll?: () => void;
  activeFiltersCount?: number;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  title = "Filtros",
  filterGroups = [],
  booleanFilters = [],
  onClearAll,
  activeFiltersCount = 0
}: FilterSidebarProps) {

  if (!isOpen) return null;

  const toggleFilter = (value: string, group: FilterGroup) => {
    if (group.selected.includes(value)) {
      group.onChange(group.selected.filter(item => item !== value));
    } else {
      group.onChange([...group.selected, value]);
    }
  };

  // Função para obter o label de exibição
  const getOptionLabel = (option: string, group: FilterGroup): string => {
    if (group.optionLabels && group.optionLabels[option]) {
      return group.optionLabels[option];
    }
    return option;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transform transition-transform">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Groups */}
          {filterGroups.map((group) => (
            <div key={group.id}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={group.selected.includes(option)}
                      onChange={() => toggleFilter(option, group)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {getOptionLabel(option, group)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Boolean Filters */}
          {booleanFilters.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Implementação
              </h4>
              <div className="space-y-3">
                {booleanFilters.map((filter) => (
                  <label key={filter.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filter.checked}
                      onChange={(e) => filter.onChange(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {filter.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {onClearAll && activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Limpar Todos os Filtros
            </button>
          )}
        </div>
      </div>
    </>
  );
}
