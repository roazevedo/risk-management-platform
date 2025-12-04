"use client";

import React, { useState } from 'react';
import { Risk, Control, ControlStatus } from '@/types';
import { CONTROL_TYPES, CONTROL_NATURES, CONTROL_RELATIONS, CONTROL_NEW_MODIFIED } from '@/constants';

interface ControlFormProps {
  risk: Risk;
  control?: Control;
  onSave: (control: Control) => void;
  onCancel: () => void;
}

// Função auxiliar (pode mover para utils.ts depois)
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

const formInputStyle = "w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

export default function ControlForm({ risk, control, onSave, onCancel }: ControlFormProps) {
  const [formData, setFormData] = useState<Omit<Control, 'id' | 'riskId' | 'history' | 'status' | 'createdAt' | 'updatedAt'>>({
    name: control?.name || '',
    implemented: control?.implemented || false,
    newOrModified: control?.newOrModified || 'Novo',
    type: control?.type || 'Preventivo',
    nature: control?.nature || 'Manual',
    relationToRisk: control?.relationToRisk || 'Direto',
    responsible: control?.responsible || '',
    implementationMethod: control?.implementationMethod || '',
    macroSteps: control?.macroSteps || '',
    plannedStartDate: control?.plannedStartDate || '',
    plannedEndDate: control?.plannedEndDate || '',
    actualEndDate: control?.actualEndDate || '',
    involvedSectors: control?.involvedSectors || [],
    adequacyAnalysis: control?.adequacyAnalysis || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      involvedSectors: value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const status = getStatus(
      formData.plannedEndDate,
      formData.implemented,
      formData.actualEndDate
    ).status;

    onSave({
      id: control?.id || `c${Date.now()}`,
      riskId: risk.id,
      ...formData,
      status,
      history: control?.history || [],
      createdAt: control?.createdAt,
      updatedAt: control?.updatedAt
    });
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto bg-gray-50 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          1. Identificação do Controle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="c-name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Nome do Controle *
            </label>
            <input
              id="c-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={formInputStyle}
            />
          </div>

          <div>
            <label htmlFor="c-newOrModified" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Novo ou Modificado
            </label>
            <select
              id="c-newOrModified"
              name="newOrModified"
              value={formData.newOrModified}
              onChange={handleChange}
              className={formInputStyle}
            >
              {CONTROL_NEW_MODIFIED.map(nm => <option key={nm} value={nm}>{nm}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="c-type" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Tipo
            </label>
            <select
              id="c-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={formInputStyle}
            >
              {CONTROL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="c-nature" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Natureza
            </label>
            <select
              id="c-nature"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              className={formInputStyle}
            >
              {CONTROL_NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="c-relationToRisk" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Relação com o Risco
            </label>
            <select
              id="c-relationToRisk"
              name="relationToRisk"
              value={formData.relationToRisk}
              onChange={handleChange}
              className={formInputStyle}
            >
              {CONTROL_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="c-responsible" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Responsável pela Ação
            </label>
            <input
              id="c-responsible"
              type="text"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              className={formInputStyle}
            />
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="implemented"
              name="implemented"
              checked={formData.implemented}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="implemented" className="ml-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Controle já implementado?
            </label>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 mt-6">
          2. Cronograma
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="c-plannedStartDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Início Previsto
            </label>
            <input
              id="c-plannedStartDate"
              type="date"
              name="plannedStartDate"
              value={formData.plannedStartDate}
              onChange={handleChange}
              className={formInputStyle}
            />
          </div>
          <div>
            <label htmlFor="c-plannedEndDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Conclusão Prevista
            </label>
            <input
              id="c-plannedEndDate"
              type="date"
              name="plannedEndDate"
              value={formData.plannedEndDate}
              onChange={handleChange}
              className={formInputStyle}
            />
          </div>
          <div>
            <label htmlFor="c-actualEndDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Conclusão Real
            </label>
            <input
              id="c-actualEndDate"
              type="date"
              name="actualEndDate"
              value={formData.actualEndDate}
              onChange={handleChange}
              className={formInputStyle}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 mt-6">
          3. Detalhamento
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="c-implementationMethod" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Como implantar o controle?
            </label>
            <textarea
              id="c-implementationMethod"
              name="implementationMethod"
              value={formData.implementationMethod}
              onChange={handleChange}
              rows={3}
              className={formInputStyle}
            ></textarea>
          </div>

          <div>
            <label htmlFor="c-macroSteps" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Macro Etapas
            </label>
            <textarea
              id="c-macroSteps"
              name="macroSteps"
              value={formData.macroSteps}
              onChange={handleChange}
              rows={3}
              className={formInputStyle}
            ></textarea>
          </div>

          <div>
            <label htmlFor="c-adequacyAnalysis" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Análise EGR de Adequação
            </label>
            <textarea
              id="c-adequacyAnalysis"
              name="adequacyAnalysis"
              value={formData.adequacyAnalysis}
              onChange={handleChange}
              rows={3}
              className={formInputStyle}
            ></textarea>
          </div>

          <div>
            <label htmlFor="c-involvedSectors" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
              Órgãos/Setores Envolvidos (separados por vírgula)
            </label>
            <input
              id="c-involvedSectors"
              type="text"
              value={formData.involvedSectors.join(', ')}
              onChange={handleArrayChange}
              className={formInputStyle}
              placeholder="Ex: TI, Operações, RH"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
