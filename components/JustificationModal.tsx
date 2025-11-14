import React, { useState } from 'react';

interface JustificationModalProps {
    onClose: () => void;
    onConfirm: (justification: string) => void;
}

export const JustificationModal: React.FC<JustificationModalProps> = ({ onClose, onConfirm }) => {
    const [justification, setJustification] = useState('');

    const handleConfirm = () => {
        if (justification.trim()) {
            onConfirm(justification);
        } else {
            alert('Por favor, forneça uma justificativa.');
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Justificar Alteração</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Por favor, descreva o motivo da alteração que você está realizando.
                </p>
                <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    className="w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Sua justificativa aqui..."
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Confirmar Alteração
                    </button>
                </div>
            </div>
        </div>
    );
};
