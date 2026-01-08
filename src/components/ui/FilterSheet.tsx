"use client";

import React, { useEffect } from 'react';
import { X, Filter } from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void; // Botão para aplicar filtros
  onClear: () => void; // Botão para limpar
  children: React.ReactNode; // Aqui entrarão os Acordeões
}

export function FilterSheet({ isOpen, onClose, onApply, onClear, children }: FilterSheetProps) {
  // Fecha ao apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Escuro (Clica fora para fechar) */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3">
            <button
                onClick={() => { onClear(); onClose(); }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
                Limpar
            </button>
            <button
                onClick={() => { onApply(); onClose(); }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
            >
                Ver Resultados
            </button>
        </div>
      </div>
    </div>
  );
}
