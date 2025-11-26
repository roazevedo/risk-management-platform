"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Process, Risk, RiskDimension } from '@/types';
import {
    PROBABILITY_IMPACT_SCALE,
    RISK_TYPES,
    RISK_ASSOCIATIONS,
    RISK_DIMENSIONS,
    RISK_RESPONSES
} from '@/constants';
import { getInherentRiskLevel, getResidualRiskLevel } from '@/lib/risk-utils';

interface RiskFormProps {
    process: Process;
    risk?: Risk;
    onSave: (risk: Risk) => void;
    onCancel: () => void;
}

const initialRiskFormData: Omit<Risk, 'id' | 'processId' | 'history'> = {
    name: '',
    identificationDate: new Date().toISOString().split('T')[0],
    type: 'Operacional',
    association: 'Processo',
    causes: '',
    consequences: '',
    dimensions: [],
    probability: 1,
    probabilityJustification: '',
    impact: 1,
    impactJustification: '',
    inherentRisk: 1,
    controlsExist: false,
    isControlEffective: false,
    isControlProportional: false,
    isControlReasonable: false,
    isControlAdequate: false,
    fac: 1,
    residualRisk: 1,
    suggestedResponse: 'Reduzir',
    maxImplementationDate: '',
    isLgpdRelated: false
};

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";

export default function RiskForm({ process, risk, onSave, onCancel }: RiskFormProps) {
    // Se vier um risco (edição), usa os dados dele. Se não, usa o inicial.
    // Importante: removemos id, processId e history do estado local do form para evitar conflitos
    const [formData, setFormData] = useState<Omit<Risk, 'id' | 'processId' | 'history'>>(
        risk ? { ...risk } : initialRiskFormData
    );

    // Lógica de Cálculo Automático (FAC e Risco Residual)
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

        // Cálculo da Data Máxima
        let maxImplementationDate = '';
        const identificationDate = new Date(formData.identificationDate + 'T00:00:00');

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
    }, [
        formData.probability,
        formData.impact,
        formData.isControlEffective,
        formData.isControlProportional,
        formData.isControlReasonable,
        formData.isControlAdequate,
        formData.identificationDate
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'range' ? parseInt(value) : value)
        }));
    };

    const handleDimensionChange = (dimension: RiskDimension) => {
        setFormData(prev => ({
            ...prev,
            dimensions: prev.dimensions.includes(dimension)
                ? prev.dimensions.filter(d => d !== dimension)
                : [...prev.dimensions, dimension]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Reconstrói o objeto completo Risk ao salvar
        onSave({
            id: risk?.id || `r${Date.now()}`,
            processId: process.id,
            ...formData,
            history: risk?.history || []
        });
    };

    const inherentRiskDetails = useMemo(() => getInherentRiskLevel(formData.inherentRisk), [formData.inherentRisk]);
    const residualRiskDetails = useMemo(() => getResidualRiskLevel(formData.residualRisk), [formData.residualRisk]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2 custom-scrollbar">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="r-name" className="block text-sm font-medium mb-1 dark:text-gray-200">Nome do Risco</label>
                    <input id="r-name" type="text" name="name" value={formData.name} onChange={handleChange} required className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="r-identificationDate" className="block text-sm font-medium mb-1 dark:text-gray-200">Data de Identificação</label>
                    <input id="r-identificationDate" type="date" name="identificationDate" value={formData.identificationDate} onChange={handleChange} className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="r-type" className="block text-sm font-medium mb-1 dark:text-gray-200">Tipo</label>
                    <select id="r-type" name="type" value={formData.type} onChange={handleChange} className={formInputStyle}>
                        {RISK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="r-association" className="block text-sm font-medium mb-1 dark:text-gray-200">Associação</label>
                    <select id="r-association" name="association" value={formData.association} onChange={handleChange} className={formInputStyle}>
                        {RISK_ASSOCIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* Causas e Consequências */}
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Causas do Risco</label>
                <textarea name="causes" value={formData.causes} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Consequências do Risco</label>
                <textarea name="consequences" value={formData.consequences} onChange={handleChange} rows={3} className={formInputStyle}></textarea>
            </div>

            {/* Dimensões */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Dimensões do Risco</label>
                <div className="flex flex-wrap gap-2">
                    {RISK_DIMENSIONS.map(d => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => handleDimensionChange(d)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.dimensions.includes(d) ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Probabilidade e Impacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div>
                        <label htmlFor="r-probability" className="block text-sm font-medium dark:text-gray-200">Probabilidade: {PROBABILITY_IMPACT_SCALE.find(s=>s.value === formData.probability)?.label}</label>
                        <input id="r-probability" type="range" name="probability" min="1" max="5" value={formData.probability} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 mt-1" />
                    </div>
                    <div>
                        <label htmlFor="r-probabilityJustification" className="block text-sm font-medium dark:text-gray-200">Justificativa da Probabilidade</label>
                        <textarea id="r-probabilityJustification" name="probabilityJustification" value={formData.probabilityJustification} onChange={handleChange} rows={2} className={`${formInputStyle} mt-1`}></textarea>
                    </div>
                </div>
                <div className="space-y-2">
                    <div>
                        <label htmlFor="r-impact" className="block text-sm font-medium dark:text-gray-200">Impacto: {PROBABILITY_IMPACT_SCALE.find(s=>s.value === formData.impact)?.label}</label>
                        <input id="r-impact" type="range" name="impact" min="1" max="5" value={formData.impact} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 mt-1" />
                    </div>
                    <div>
                        <label htmlFor="r-impactJustification" className="block text-sm font-medium dark:text-gray-200">Justificativa do Impacto</label>
                        <textarea id="r-impactJustification" name="impactJustification" value={formData.impactJustification} onChange={handleChange} rows={2} className={`${formInputStyle} mt-1`}></textarea>
                    </div>
                </div>
            </div>

            {/* Display Risco Inerente */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risco Inerente</p>
                    <p className="text-2xl font-bold dark:text-white">{formData.inherentRisk}</p>
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${inherentRiskDetails.color}`}>{inherentRiskDetails.level}</span>
                </div>
            </div>

            {/* Avaliação de Controles */}
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
                <h4 className="font-semibold dark:text-gray-200">Avaliação de Controles</h4>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isControlEffective" name="isControlEffective" checked={formData.isControlEffective} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="isControlEffective" className="dark:text-gray-300">O Controle é Eficaz?</label>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isControlProportional" name="isControlProportional" checked={formData.isControlProportional} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                    <label htmlFor="isControlProportional" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : 'dark:text-gray-300'}>O Controle é Proporcional?</label>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isControlReasonable" name="isControlReasonable" checked={formData.isControlReasonable} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                    <label htmlFor="isControlReasonable" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : 'dark:text-gray-300'}>O Controle é Razoável?</label>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isControlAdequate" name="isControlAdequate" checked={formData.isControlAdequate} onChange={handleChange} disabled={!formData.isControlEffective} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                    <label htmlFor="isControlAdequate" className={!formData.isControlEffective ? 'text-gray-400 dark:text-gray-500' : 'dark:text-gray-300'}>O Controle é Adequado?</label>
                </div>

                <p className="text-sm pt-2 dark:text-gray-400">Fator de Avaliação (FAC): <strong>{formData.fac}</strong></p>
            </div>

            {/* Display Risco Residual */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risco Residual</p>
                    <p className="text-2xl font-bold dark:text-white">{formData.residualRisk.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${residualRiskDetails.color}`}>{residualRiskDetails.level}</span>
                </div>
            </div>

            {/* Campos Finais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="r-suggestedResponse" className="block text-sm font-medium mb-1 dark:text-gray-200">Resposta Sugerida</label>
                    <select id="r-suggestedResponse" name="suggestedResponse" value={formData.suggestedResponse} onChange={handleChange} className={formInputStyle}>
                        {RISK_RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="maxImplementationDate" className="block text-sm font-medium dark:text-gray-200">Data Máxima para Implantação</label>
                    <input type="date" name="maxImplementationDate" value={formData.maxImplementationDate || ''} readOnly className={`${formInputStyle} bg-gray-100 dark:bg-gray-600 cursor-not-allowed`} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" name="isLgpdRelated" id="isLgpdRelated" checked={formData.isLgpdRelated} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="isLgpdRelated" className="dark:text-gray-300">Relação com LGPD?</label>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
            </div>
        </form>
    );
}
