
import React, { useState, useMemo } from 'react';
// FIX: Removed unused import for Next.js Link component.
// import Link from 'next/link';
import type { Risk, Control, ControlStatus, HistoryEntry } from '../types';
import { CONTROL_TYPES, CONTROL_NATURES, CONTROL_RELATIONS } from '../constants';
import { Modal } from './Modal';
import { EyeIcon, SearchIcon, ChevronLeftIcon } from './icons';
import { ControlDetails } from './ControlDetails';
import { JustificationModal } from './JustificationModal';
import { generateChangeLog } from '../utils';
// FIX: Removed unused import for DataContext hook. Data is now passed via props.
// import { useData } from '../contexts/DataContext';

// FIX: Extended props interface to accept all necessary data and handlers from the parent component.
interface ControlManagementProps {
    risk: Risk;
    controls: Control[];
    setControls: React.Dispatch<React.SetStateAction<Control[]>>;
    onBack: () => void;
}

const getStatus = (plannedEndDate: string, implemented: boolean, actualEndDate: string): { status: ControlStatus, label: string, color: string } => {
    if (implemented) {
        return { status: 'on-time', label: 'Implementado', color: 'bg-green-500' };
    }
    if (!plannedEndDate) {
        return { status: 'on-time', label: 'Pendente', color: 'bg-gray-500' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(plannedEndDate + 'T00:00:00');
    const timeDiff = endDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) {
        return { status: 'overdue', label: 'Atrasado', color: 'bg-red-500' };
    }
    if (dayDiff <= 30) {
        return { status: 'near-due', label: 'Vencimento Próximo', color: 'bg-yellow-500' };
    }
    return { status: 'on-time', label: 'Em Dia', color: 'bg-blue-500' };
};

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600";
const controlLabels: Record<keyof Control, string> = {
    id: "ID",
    riskId: "ID do Risco",
    name: "Nome",
    implemented: "Implementado",
    status: "Status",
    newOrModified: "Novo ou Modificado",
    type: "Tipo",
    nature: "Natureza",
    relationToRisk: "Relação com Risco",
    responsible: "Responsável",
    implementationMethod: "Método de Implantação",
    macroSteps: "Macroetapas",
    plannedStartDate: "Data de Início Prevista",
    plannedEndDate: "Data de Fim Prevista",
    actualEndDate: "Data de Fim Real",
    involvedSectors: "Setores Envolvidos",
    adequacyAnalysis: "Análise de Adequação",
    history: "Histórico"
};

const ControlForm: React.FC<{ risk: Risk; control?: Control; onSave: (control: Control) => void; onCancel: () => void }> = ({ risk, control, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Control, 'id' | 'riskId' | 'history' | 'status'>>({
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
        setFormData(prev => ({ ...prev, involvedSectors: value.split(',').map(item => item.trim()) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const status = getStatus(formData.plannedEndDate, formData.implemented, formData.actualEndDate).status;
        onSave({ id: control?.id || `c${Date.now()}`, riskId: risk.id, ...formData, status, history: control?.history || [] });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="c-name" className="block text-sm font-medium mb-1">Nome do Controle</label>
                    <input id="c-name" type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="c-type" className="block text-sm font-medium mb-1">Tipo</label>
                    <select id="c-type" name="type" value={formData.type} onChange={handleChange} className={formInputStyle}>{CONTROL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="c-nature" className="block text-sm font-medium mb-1">Natureza</label>
                    <select id="c-nature" name="nature" value={formData.nature} onChange={handleChange} className={formInputStyle}>{CONTROL_NATURES.map(n => <option key={n} value={n}>{n}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="c-relationToRisk" className="block text-sm font-medium mb-1">Relação com o Risco</label>
                    <select id="c-relationToRisk" name="relationToRisk" value={formData.relationToRisk} onChange={handleChange} className={formInputStyle}>{CONTROL_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="c-responsible" className="block text-sm font-medium mb-1">Responsável pela Ação</label>
                    <input id="c-responsible" type="text" name="responsible" value={formData.responsible} onChange={handleChange} className={formInputStyle} />
                </div>
                <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="implemented" name="implemented" checked={formData.implemented} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="implemented">Controle já implementado?</label>
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Início Previsto</label><input type="date" name="plannedStartDate" value={formData.plannedStartDate} onChange={handleChange} className={formInputStyle} /></div>
                <div><label className="text-sm font-medium">Conclusão Prevista</label><input type="date" name="plannedEndDate" value={formData.plannedEndDate} onChange={handleChange} className={formInputStyle} /></div>
                <div><label className="text-sm font-medium">Conclusão Real</label><input type="date" name="actualEndDate" value={formData.actualEndDate} onChange={handleChange} className={formInputStyle} /></div>
             </div>
            <div>
                <label htmlFor="c-implementationMethod" className="block text-sm font-medium mb-1">Como implantar o controle?</label>
                <textarea id="c-implementationMethod" name="implementationMethod" value={formData.implementationMethod} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>
            <div>
                <label htmlFor="c-adequacyAnalysis" className="block text-sm font-medium mb-1">Análise EGR de Adequação</label>
                <textarea id="c-adequacyAnalysis" name="adequacyAnalysis" value={formData.adequacyAnalysis} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>
            <div>
                <label htmlFor="c-involvedSectors" className="block text-sm font-medium mb-1">Órgãos/Setores Envolvidos (separados por vírgula)</label>
                <input id="c-involvedSectors" type="text" value={formData.involvedSectors.join(', ')} onChange={handleArrayChange} className={formInputStyle} />
            </div>
             <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
            </div>
        </form>
    );
};

// FIX: Updated component signature to accept props from App.tsx. Renamed `controls` prop to `riskControls` for clarity.
export default function ControlManagement({ risk, controls: riskControls, setControls, onBack }: ControlManagementProps) {
    // const { controls, setControls } = useData(); // Data now comes from props.
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingControl, setEditingControl] = useState<Control | undefined>(undefined);
    const [viewingControl, setViewingControl] = useState<Control | null>(null);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [pendingControlData, setPendingControlData] = useState<Control | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // FIX: Removed useMemo hook as the `controls` prop is already filtered by the parent component.
    // const riskControls = useMemo(() => {
    //     return controls.filter(c => c.riskId === risk.id)
    // }, [controls, risk.id]);

    const handleSave = (control: Control) => {
        if (editingControl) {
            setPendingControlData(control);
            setIsJustificationModalOpen(true);
        } else {
            setControls(prev => [...prev, control]);
            setIsFormVisible(false);
        }
    };
    
    const handleConfirmSave = (justification: string) => {
        if (!pendingControlData || !editingControl) return;

        const changes = generateChangeLog(editingControl, pendingControlData, controlLabels);
        
        const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin', // Mock user
            justification,
            changes
        };
        
        const updatedControl = {
            ...pendingControlData,
            history: [...pendingControlData.history, historyEntry]
        };

        setControls(prev => prev.map(c => c.id === updatedControl.id ? updatedControl : c));

        setIsJustificationModalOpen(false);
        setPendingControlData(null);
        setIsFormVisible(false);
        setEditingControl(undefined);
    };

    const handleEdit = (control: Control) => {
        setEditingControl(control);
        setIsFormVisible(true);
    };

    const handleAddNew = () => {
        setEditingControl(undefined);
        setIsFormVisible(true);
    };

    const handleViewDetails = (control: Control) => {
        setViewingControl(control);
    };

    const filteredControls = riskControls.filter(control =>
        control.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                 <div>
                    {/* FIX: Replaced Next.js Link with a button that uses the onBack prop. */}
                    <button onClick={onBack} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 font-medium">
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        Voltar para Riscos
                    </button>
                    <h2 className="text-2xl font-bold">Gestão de Controles</h2>
                    <p className="text-gray-500">Risco: {risk.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar controle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap">Adicionar Controle</button>
                </div>
            </div>

            <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)} title={editingControl ? 'Editar Controle' : 'Novo Controle'}>
                <ControlForm risk={risk} control={editingControl} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />
            </Modal>

            {isJustificationModalOpen && <JustificationModal onClose={() => setIsJustificationModalOpen(false)} onConfirm={handleConfirmSave} />}

            {viewingControl && <ControlDetails control={viewingControl} onClose={() => setViewingControl(null)} />}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Controle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conclusão Prevista</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredControls.map(control => {
                            const statusInfo = getStatus(control.plannedEndDate, control.implemented, control.actualEndDate);
                            return (
                                <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{control.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{control.responsible}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{control.plannedEndDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleViewDetails(control)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-full"><EyeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleEdit(control)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}