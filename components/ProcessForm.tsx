"use client";

import React, { useState } from 'react';
import { Process } from '@/types';

interface ProcessFormProps {
  process?: Process;
  onSave: (process: Process) => Promise<void>;
  onCancel: () => void;
}

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

export default function ProcessForm({ process, onSave, onCancel }: ProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado local do formulário
  const [formData, setFormData] = useState<Partial<Process>>({
    name: process?.name || '',
    sector: process?.sector || '',
    manager: process?.manager || '',
    legalBasis: process?.legalBasis || '',
    // Para arrays, convertemos para string na exibição (join) e voltamos para array ao salvar (split)
    responsibleServers: process?.responsibleServers || [],
    systemsUsed: process?.systemsUsed || [],
    stakeholders: process?.stakeholders || [],
    history: process?.history || []
  });

  // Inputs de Texto Simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Inputs de Array (separados por vírgula)
  // Ex: O usuário digita "Sistema A, Sistema B" -> vira ["Sistema A", "Sistema B"]
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Process) => {
    const { value } = e.target;
    // Guardamos temporariamente como array para o estado,
    // mas na interface usamos .join(', ') no value do input
    const arrayValue = value.split(',').map(item => item.trim()); // Remove espaços extras
    setFormData(prev => ({ ...prev, [field]: arrayValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Reconstrói o objeto Process completo
      const processToSave: Process = {
        id: process?.id || '', // ID vazio indica novo (o backend trata isso)
        name: formData.name || '',
        sector: formData.sector || '',
        manager: formData.manager || '',
        legalBasis: formData.legalBasis || '',
        responsibleServers: formData.responsibleServers || [],
        systemsUsed: formData.systemsUsed || [],
        stakeholders: formData.stakeholders || [],
        history: formData.history || [],
      };

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

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="p-name" className="block text-sm font-medium mb-1 dark:text-gray-200">Nome do Processo *</label>
              <input
                id="p-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={formInputStyle}
                placeholder="Ex: Folha de Pagamento"
              />
            </div>

            <div>
              <label htmlFor="p-sector" className="block text-sm font-medium mb-1 dark:text-gray-200">Setor/Departamento *</label>
              <input
                id="p-sector"
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                required
                className={formInputStyle}
                placeholder="Ex: Recursos Humanos"
              />
            </div>

            <div>
              <label htmlFor="p-manager" className="block text-sm font-medium mb-1 dark:text-gray-200">Gestor Responsável *</label>
              <input
                id="p-manager"
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                required
                className={formInputStyle}
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          {/* Arrays e Listas */}
          <div className="space-y-4">
            <div>
              <label htmlFor="p-responsibleServers" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Servidores Envolvidos (separados por vírgula)
              </label>
              <input
                id="p-responsibleServers"
                type="text"
                // Exibimos como string unida por vírgulas
                value={formData.responsibleServers?.join(', ')}
                onChange={(e) => handleArrayChange(e, 'responsibleServers')}
                className={formInputStyle}
                placeholder="Ex: Maria, Pedro, Ana"
              />
            </div>

            <div>
              <label htmlFor="p-systemsUsed" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Sistemas Utilizados (separados por vírgula)
              </label>
              <input
                id="p-systemsUsed"
                type="text"
                value={formData.systemsUsed?.join(', ')}
                onChange={(e) => handleArrayChange(e, 'systemsUsed')}
                className={formInputStyle}
                placeholder="Ex: SAP, Excel, Sistema Interno"
              />
            </div>

            <div>
              <label htmlFor="p-stakeholders" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Partes Interessadas / Stakeholders
              </label>
              <input
                id="p-stakeholders"
                type="text"
                value={formData.stakeholders?.join(', ')}
                onChange={(e) => handleArrayChange(e, 'stakeholders')}
                className={formInputStyle}
                placeholder="Ex: Diretoria, Clientes, Auditoria"
              />
            </div>
          </div>

          {/* Base Legal */}
          <div>
            <label htmlFor="p-legalBasis" className="block text-sm font-medium mb-1 dark:text-gray-200">Base Legal / Normativa</label>
            <textarea
                id="p-legalBasis"
                name="legalBasis"
                value={formData.legalBasis}
                onChange={handleChange}
                rows={3}
                className={formInputStyle}
                placeholder="Leis, decretos ou normas que regem este processo..."
            ></textarea>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                  Cancelar
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                  {isSubmitting ? 'Salvando...' : 'Salvar Processo'}
              </button>
          </div>
      </form>
  );
}
