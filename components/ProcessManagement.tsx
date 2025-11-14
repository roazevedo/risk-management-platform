
import React, { useState } from 'react';
// FIX: Removed unused import for Next.js Link component.
// import Link from 'next/link';
import type { Process, HistoryEntry } from '../types';
import { Modal } from './Modal';
import { EyeIcon, SearchIcon } from './icons';
import { ProcessDetails } from './ProcessDetails';
import { JustificationModal } from './JustificationModal';
import { generateChangeLog } from '../utils';
// FIX: Removed unused import for DataContext hook. Data is now passed via props.
// import { useData } from '../contexts/DataContext';

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600";
const processLabels: Record<keyof Process, string> = {
    id: "ID",
    name: "Nome",
    sector: "Setor",
    manager: "Gestor",
    responsibleServers: "Servidores Responsáveis",
    legalBasis: "Base Legal",
    systemsUsed: "Sistemas Utilizados",
    stakeholders: "Partes Interessadas",
    history: "Histórico",
};

// FIX: Define props interface for ProcessManagement to accept data and handlers from parent.
interface ProcessManagementProps {
    processes: Process[];
    setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
    onSelectProcess: (id: string) => void;
}

const ProcessForm: React.FC<{ process?: Process; onSave: (process: Process) => void; onCancel: () => void }> = ({ process, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Process, 'id' | 'history'>>({
        name: process?.name || '',
        sector: process?.sector || '',
        manager: process?.manager || '',
        responsibleServers: process?.responsibleServers || [],
        legalBasis: process?.legalBasis || '',
        systemsUsed: process?.systemsUsed || [],
        stakeholders: process?.stakeholders || []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<Process, 'id' | 'name' | 'sector' | 'manager' | 'legalBasis' | 'history'>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value.split(',').map(item => item.trim()) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: process?.id || `p${Date.now()}`, ...formData, history: process?.history || [] });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="p-name" className="block text-sm font-medium mb-1">Nome do Processo</label>
                    <input id="p-name" type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyle} />
                </div>
                 <div>
                    <label htmlFor="p-sector" className="block text-sm font-medium mb-1">Setor</label>
                    <input id="p-sector" type="text" name="sector" value={formData.sector} onChange={handleChange} required className={formInputStyle} />
                </div>
                 <div>
                    <label htmlFor="p-manager" className="block text-sm font-medium mb-1">Gestor do Processo</label>
                    <input id="p-manager" type="text" name="manager" value={formData.manager} onChange={handleChange} required className={formInputStyle} />
                </div>
                 <div>
                    <label htmlFor="p-legalBasis" className="block text-sm font-medium mb-1">Embasamento Legal</label>
                    <input id="p-legalBasis" type="text" name="legalBasis" value={formData.legalBasis} onChange={handleChange} className={formInputStyle} />
                </div>
                 <div>
                    <label htmlFor="p-responsibleServers" className="block text-sm font-medium mb-1">Servidores Responsáveis (separados por vírgula)</label>
                    <input id="p-responsibleServers" type="text" value={formData.responsibleServers.join(', ')} onChange={e => handleArrayChange(e, 'responsibleServers')} className={formInputStyle} />
                </div>
                 <div>
                    <label htmlFor="p-systemsUsed" className="block text-sm font-medium mb-1">Sistemas Utilizados (separados por vírgula)</label>
                    <input id="p-systemsUsed" type="text" value={formData.systemsUsed.join(', ')} onChange={e => handleArrayChange(e, 'systemsUsed')} className={formInputStyle} />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="p-stakeholders" className="block text-sm font-medium mb-1">Partes Interessadas (separadas por vírgula)</label>
                    <input id="p-stakeholders" type="text" value={formData.stakeholders.join(', ')} onChange={e => handleArrayChange(e, 'stakeholders')} className={formInputStyle} />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
            </div>
        </form>
    );
};

// FIX: Updated component signature to accept props instead of using `useData`.
export default function ProcessManagement({ processes, setProcesses, onSelectProcess }: ProcessManagementProps) {
    // const { processes, setProcesses } = useData(); // Data now comes from props.
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | undefined>(undefined);
    const [viewingProcess, setViewingProcess] = useState<Process | null>(null);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [pendingProcessData, setPendingProcessData] = useState<Process | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = (process: Process) => {
        if (editingProcess) {
            setPendingProcessData(process);
            setIsJustificationModalOpen(true);
        } else {
            setProcesses(prev => [...prev, process]);
            setIsFormVisible(false);
        }
    };
    
    const handleConfirmSave = (justification: string) => {
        if (!pendingProcessData || !editingProcess) return;

        const changes = generateChangeLog(editingProcess, pendingProcessData, processLabels);
        
        const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin', // Mock user
            justification,
            changes
        };
        
        const updatedProcess = {
            ...pendingProcessData,
            history: [...pendingProcessData.history, historyEntry]
        };

        setProcesses(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));

        setIsJustificationModalOpen(false);
        setPendingProcessData(null);
        setIsFormVisible(false);
        setEditingProcess(undefined);
    };

    const handleEdit = (process: Process) => {
        setEditingProcess(process);
        setIsFormVisible(true);
    };

    const handleAddNew = () => {
        setEditingProcess(undefined);
        setIsFormVisible(true);
    };

    const handleViewDetails = (process: Process) => {
        setViewingProcess(process);
    };

    const filteredProcesses = processes.filter(process =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <h2 className="text-2xl font-bold">Gestão de Processos</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar processo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap">Adicionar Processo</button>
                </div>
            </div>


            <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)} title={editingProcess ? 'Editar Processo' : 'Novo Processo'}>
                <ProcessForm process={editingProcess} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />
            </Modal>
            
            {isJustificationModalOpen && <JustificationModal onClose={() => setIsJustificationModalOpen(false)} onConfirm={handleConfirmSave} />}

            {viewingProcess && <ProcessDetails process={viewingProcess} onClose={() => setViewingProcess(null)} />}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProcesses.map(process => (
                            <tr key={process.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{process.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{process.sector}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{process.manager}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleViewDetails(process)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-full"><EyeIcon className="w-5 h-5" /></button>
                                    {/* FIX: Replaced Next.js Link with a button that uses the onSelectProcess prop. */}
                                    <button onClick={() => onSelectProcess(process.id)} className="text-green-600 hover:text-green-900">Ver Riscos</button>
                                    <button onClick={() => handleEdit(process)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}