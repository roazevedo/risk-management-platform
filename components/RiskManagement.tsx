
import React, { useState, useMemo, useEffect } from 'react';
import type { Process, Risk, RiskDimension, HistoryEntry } from '../types';
import { PROBABILITY_IMPACT_SCALE, RISK_TYPES, RISK_ASSOCIATIONS, RISK_DIMENSIONS, RISK_RESPONSES } from '../constants';
import { getInherentRiskLevel, getResidualRiskLevel } from '@/lib/risk-utils';
import { Modal } from './Modal';
import { EyeIcon, SearchIcon, ChevronLeftIcon } from './icons';
import { RiskDetails } from './RiskDetails';
import { JustificationModal } from './JustificationModal';
import { generateChangeLog } from '@/lib/utils';

interface RiskManagementProps {
    process: Process;
    risks: Risk[];
    setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
    onSelectRisk: (id: string) => void;
    onBack: () => void;
}

const initialRiskFormData: Omit<Risk, 'id' | 'processId' | 'history'> = {
    name: '', identificationDate: new Date().toISOString().split('T')[0], type: 'Operacional', association: 'Processo', causes: '', consequences: '', dimensions: [], probability: 1, probabilityJustification: '', impact: 1, impactJustification: '', inherentRisk: 1, controlsExist: false, isControlEffective: false, isControlProportional: false, isControlReasonable: false, isControlAdequate: false, fac: 1, residualRisk: 1, suggestedResponse: 'Reduzir', maxImplementationDate: '', isLgpdRelated: false
};
const riskLabels: Record<keyof Risk, string> = {
    id: "ID",
    processId: "ID do Processo",
    name: "Nome",
    identificationDate: "Data de Identificação",
    type: "Tipo",
    association: "Associação",
    causes: "Causas",
    consequences: "Consequências",
    dimensions: "Dimensões",
    probability: "Probabilidade",
    probabilityJustification: "Justificativa da Probabilidade",
    impact: "Impacto",
    impactJustification: "Justificativa do Impacto",
    inherentRisk: "Risco Inerente",
    controlsExist: "Controles Existem",
    isControlEffective: "Controle Eficaz",
    isControlProportional: "Controle Proporcional",
    isControlReasonable: "Controle Razoável",
    isControlAdequate: "Controle Adequado",
    fac: "FAC",
    residualRisk: "Risco Residual",
    suggestedResponse: "Resposta Sugerida",
    maxImplementationDate: "Data Máxima de Implantação",
    isLgpdRelated: "Relação com LGPD",
    history: "Histórico"
};
const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:border-gray-600";

const RiskForm: React.FC<{ process: Process, risk?: Risk; onSave: (risk: Risk) => void; onCancel: () => void }> = ({ process, risk, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Risk, 'id' | 'processId' | 'history'>>(risk || initialRiskFormData);

    useEffect(() => {
        const inherentRisk = formData.probability * formData.impact;
        const isEffective = formData.isControlEffective;
        let fac = 1.0;
        if (isEffective) {
            fac -= 0.2; // Effective
            if (formData.isControlProportional) fac -= 0.2;
            if (formData.isControlReasonable) fac -= 0.2;
            if (formData.isControlAdequate) fac -= 0.2;
        }
        fac = Math.max(0.2, Math.round(fac * 10) / 10);

        const residualRisk = inherentRisk * fac;
        const residualRiskLevel = getResidualRiskLevel(residualRisk).level;
        let maxImplementationDate = '';
        const identificationDate = new Date(formData.identificationDate + 'T00:00:00'); // Prevent timezone issues
        if (['Alto', 'Crítico'].includes(residualRiskLevel)) {
            identificationDate.setMonth(identificationDate.getMonth() + 6);
            maxImplementationDate = identificationDate.toISOString().split('T')[0];
        } else if (residualRiskLevel === 'Médio') {
            identificationDate.setMonth(identificationDate.getMonth() + 12);
            maxImplementationDate = identificationDate.toISOString().split('T')[0];
        } else if (residualRiskLevel === 'Baixo') {
            identificationDate.setMonth(identificationDate.getMonth() + 36);
            maxImplementationDate = identificationDate.toISOString().split('T')[0];
        }

        setFormData(prev => ({ ...prev, inherentRisk, fac, residualRisk, maxImplementationDate }));
    }, [formData.probability, formData.impact, formData.isControlEffective, formData.isControlProportional, formData.isControlReasonable, formData.isControlAdequate, formData.identificationDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'range' ? parseInt(value) : value) }));
    };

    const handleDimensionChange = (dimension: RiskDimension) => {
        setFormData(prev => ({ ...prev, dimensions: prev.dimensions.includes(dimension) ? prev.dimensions.filter(d => d !== dimension) : [...prev.dimensions, dimension]}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: risk?.id || `r${Date.now()}`, processId: process.id, ...formData, history: risk?.history || [] });
    };

    const inherentRiskDetails = useMemo(() => getInherentRiskLevel(formData.inherentRisk), [formData.inherentRisk]);
    const residualRiskDetails = useMemo(() => getResidualRiskLevel(formData.residualRisk), [formData.residualRisk]);

    return (
         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="r-name" className="block text-sm font-medium mb-1">Nome do Risco</label>
                    <input id="r-name" type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="r-identificationDate" className="block text-sm font-medium mb-1">Data de Identificação</label>
                    <input id="r-identificationDate" type="date" name="identificationDate" value={formData.identificationDate} onChange={handleChange} className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="r-type" className="block text-sm font-medium mb-1">Tipo</label>
                    <select id="r-type" name="type" value={formData.type} onChange={handleChange} className={formInputStyle}>{RISK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="r-association" className="block text-sm font-medium mb-1">Associação</label>
                    <select id="r-association" name="association" value={formData.association} onChange={handleChange} className={formInputStyle}>{RISK_ASSOCIATIONS.map(a => <option key={a} value={a}>{a}</option>)}</select>
                </div>
            </div>

             {/* Causes & Consequences */}
            <div>
                 <label className="block text-sm font-medium mb-1">Causas do Risco</label>
                 <textarea name="causes" value={formData.causes} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>
            <div>
                 <label className="block text-sm font-medium mb-1">Consequências do Risco</label>
                 <textarea name="consequences" value={formData.consequences} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>

            {/* Dimensions */}
            <div>
                <label className="block text-sm font-medium mb-2">Dimensões do Risco</label>
                <div className="flex flex-wrap gap-2">
                    {RISK_DIMENSIONS.map(d => (
                        <button key={d} type="button" onClick={() => handleDimensionChange(d)} className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.dimensions.includes(d) ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>{d}</button>
                    ))}
                </div>
            </div>

            {/* Probability & Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div>
                        <label htmlFor="r-probability" className="block text-sm font-medium">Probabilidade: {PROBABILITY_IMPACT_SCALE.find(s=>s.value === formData.probability)?.label}</label>
                        <input id="r-probability" type="range" name="probability" min="1" max="5" value={formData.probability} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1" />
                    </div>
                    <div>
                        <label htmlFor="r-probabilityJustification" className="block text-sm font-medium">Justificativa da Probabilidade</label>
                        <textarea id="r-probabilityJustification" name="probabilityJustification" value={formData.probabilityJustification} onChange={handleChange} rows={2} className={`${formInputStyle} mt-1`}></textarea>
                    </div>
                </div>
                 <div className="space-y-2">
                    <div>
                        <label htmlFor="r-impact" className="block text-sm font-medium">Impacto: {PROBABILITY_IMPACT_SCALE.find(s=>s.value === formData.impact)?.label}</label>
                        <input id="r-impact" type="range" name="impact" min="1" max="5" value={formData.impact} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1" />
                    </div>
                    <div>
                        <label htmlFor="r-impactJustification" className="block text-sm font-medium">Justificativa do Impacto</label>
                        <textarea id="r-impactJustification" name="impactJustification" value={formData.impactJustification} onChange={handleChange} rows={2} className={`${formInputStyle} mt-1`}></textarea>
                    </div>
                </div>
            </div>

            {/* Inherent Risk Calculation Display */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risco Inerente</p>
                    <p className="text-2xl font-bold">{formData.inherentRisk}</p>
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${inherentRiskDetails.color}`}>{inherentRiskDetails.level}</span>
                </div>
            </div>

            {/* Control Evaluation */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
                 <h4 className="font-semibold">Avaliação de Controles</h4>
                 <div className="flex items-center gap-2"><input type="checkbox" id="isControlEffective" name="isControlEffective" checked={formData.isControlEffective} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="isControlEffective">O Controle é Eficaz?</label></div>
                 <div className="flex items-center gap-2"><input type="checkbox" id="isControlProportional" name="isControlProportional" checked={formData.isControlProportional} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="isControlProportional" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : ''}>O Controle é Proporcional?</label></div>
                 <div className="flex items-center gap-2"><input type="checkbox" id="isControlReasonable" name="isControlReasonable" checked={formData.isControlReasonable} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="isControlReasonable" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : ''}>O Controle é Razoável?</label></div>
                 <div className="flex items-center gap-2"><input type="checkbox" id="isControlAdequate" name="isControlAdequate" checked={formData.isControlAdequate} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="isControlAdequate" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : ''}>O Controle é Adequado?</label></div>
                 <p className="text-sm pt-2">Fator de Avaliação (FAC): <strong>{formData.fac}</strong></p>
            </div>

            {/* Residual Risk Calculation Display */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risco Residual</p>
                    <p className="text-2xl font-bold">{formData.residualRisk.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${residualRiskDetails.color}`}>{residualRiskDetails.level}</span>
                </div>
            </div>

            {/* Final fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="r-suggestedResponse" className="block text-sm font-medium mb-1">Resposta Sugerida</label>
                    <select id="r-suggestedResponse" name="suggestedResponse" value={formData.suggestedResponse} onChange={handleChange} className={formInputStyle}>
                        {RISK_RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="maxImplementationDate" className="block text-sm font-medium">Data Máxima para Implantação</label>
                    <input type="date" name="maxImplementationDate" value={formData.maxImplementationDate} readOnly className={`${formInputStyle} bg-gray-100 dark:bg-gray-600 cursor-not-allowed`} />
                </div>
                 <div className="flex items-center gap-2 mt-2"><input type="checkbox" name="isLgpdRelated" id="isLgpdRelated" checked={formData.isLgpdRelated} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="isLgpdRelated">Relação com LGPD?</label></div>
            </div>

            <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
            </div>
        </form>
    )
};

// FIX: Updated component signature to accept props from App.tsx. Renamed `risks` prop to `processRisks` for clarity.
export default function RiskManagement({ process, risks: processRisks, setRisks, onSelectRisk, onBack }: RiskManagementProps) {
    // const { risks, setRisks } = useData(); // Data now comes from props.
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | undefined>(undefined);
    const [viewingRisk, setViewingRisk] = useState<Risk | null>(null);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [pendingRiskData, setPendingRiskData] = useState<Risk | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // FIX: Removed useMemo hook as the `risks` prop is already filtered by the parent component.
    // const processRisks = useMemo(() => {
    //     return risks.filter(r => r.processId === process.id)
    // }, [risks, process.id]);

    const handleSave = (risk: Risk) => {
        if (editingRisk) {
            setPendingRiskData(risk);
            setIsJustificationModalOpen(true);
        } else {
            setRisks(prev => [...prev, risk]);
            setIsFormVisible(false);
        }
    };

    const handleConfirmSave = (justification: string) => {
        if (!pendingRiskData || !editingRisk) return;

        const changes = generateChangeLog(editingRisk, pendingRiskData, riskLabels);

        const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin', // Mock user
            justification,
            changes
        };

        const updatedRisk = {
            ...pendingRiskData,
            history: [...pendingRiskData.history, historyEntry]
        };

        setRisks(prev => prev.map(r => r.id === updatedRisk.id ? updatedRisk : r));

        setIsJustificationModalOpen(false);
        setPendingRiskData(null);
        setIsFormVisible(false);
        setEditingRisk(undefined);
    };

    const handleEdit = (risk: Risk) => {
        setEditingRisk(risk);
        setIsFormVisible(true);
    };

    const handleAddNew = () => {
        setEditingRisk(undefined);
        setIsFormVisible(true);
    };

    const handleViewDetails = (risk: Risk) => {
        setViewingRisk(risk);
    };

    const filteredRisks = processRisks.filter(risk =>
        risk.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                    {/* FIX: Replaced Next.js Link with a button that uses the onBack prop. */}
                    <button onClick={onBack} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 font-medium">
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        Voltar para Processos
                    </button>
                    <h2 className="text-2xl font-bold">Gestão de Riscos</h2>
                    <p className="text-gray-500">Processo: {process.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar risco..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap">Adicionar Risco</button>
                </div>
            </div>


            <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)} title={editingRisk ? 'Editar Risco' : 'Novo Risco'}>
                <RiskForm process={process} risk={editingRisk} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />
            </Modal>

            {isJustificationModalOpen && <JustificationModal onClose={() => setIsJustificationModalOpen(false)} onConfirm={handleConfirmSave} />}

            {viewingRisk && <RiskDetails risk={viewingRisk} onClose={() => setViewingRisk(null)} />}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Risco</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco Inerente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco Residual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRisks.map(risk => {
                            const inherentRiskDetails = getInherentRiskLevel(risk.inherentRisk);
                            const residualRiskDetails = getResidualRiskLevel(risk.residualRisk);
                            return (
                                <tr key={risk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{risk.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${inherentRiskDetails.color}`}>{inherentRiskDetails.level} ({risk.inherentRisk})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                         <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${residualRiskDetails.color}`}>{residualRiskDetails.level} ({risk.residualRisk.toFixed(2)})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleViewDetails(risk)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-full"><EyeIcon className="w-5 h-5" /></button>
                                        {/* FIX: Replaced Next.js Link with a button that uses the onSelectRisk prop. */}
                                        <button onClick={() => onSelectRisk(risk.id)} className="text-green-600 hover:text-green-900">Ver Controles</button>
                                        <button onClick={() => handleEdit(risk)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
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
