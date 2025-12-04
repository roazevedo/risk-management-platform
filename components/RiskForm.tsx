"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Risk, RiskDimension, RiskType, RiskAssociation, RiskResponse } from '@/types';
import {
    RISK_TYPES,
    RISK_ASSOCIATIONS,
    RISK_DIMENSIONS,
    RISK_RESPONSES,
    PROBABILITY_IMPACT_SCALE
} from '@/constants';

interface RiskFormProps {
    risk?: Risk;
    processId: string;
    onSave: (risk: Risk) => Promise<void>;
    onCancel: () => void;
}

const formInputStyle = "w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:cursor-not-allowed";
const sectionTitleStyle = "text-lg font-bold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4 mt-6";

const calculateMaxDate = (startDateString: string, months: number): string => {
    if (!startDateString || months === 0) return '';
    const date = new Date(startDateString + 'T00:00:00');
    date.setMonth(date.getMonth() + months);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- NOVA LÓGICA DE CLASSIFICAÇÃO DE RISCO ---
const getRiskLevel = (score: number, isResidual: boolean) => {
    // Se o score for 0 (estado inicial), retorna N/A
    if (score === 0) return { label: 'N/A', color: 'bg-gray-400' };

    // Escala do Risco Inerente (1-25, valores inteiros)
    if (!isResidual) {
        if (score >= 16) return { label: 'Crítico', color: 'bg-red-600' };
        if (score >= 11) return { label: 'Alto', color: 'bg-orange-500' };
        if (score >= 8) return { label: 'Médio', color: 'bg-yellow-500' };
        if (score >= 4) return { label: 'Baixo', color: 'bg-green-500' };
        if (score >= 1) return { label: 'Muito Baixo', color: 'bg-green-400' };
        return { label: 'N/A', color: 'bg-gray-400' };
    }

    // Escala do Risco Residual (0-25, valores float, usando Math.round para precisão do .1)
    const floatScore = Math.round(score * 10) / 10;

    if (floatScore > 15.0) return { label: 'Crítico', color: 'bg-red-600' };
    if (floatScore > 10.0) return { label: 'Alto', color: 'bg-orange-500' };
    if (floatScore > 7.0) return { label: 'Médio', color: 'bg-yellow-500' };
    if (floatScore > 3.0) return { label: 'Baixo', color: 'bg-green-500' };
    if (floatScore >= 0) return { label: 'Muito Baixo', color: 'bg-green-400' };
    return { label: 'N/A', color: 'bg-gray-400' };
};

export default function RiskForm({ risk, processId, onSave, onCancel }: RiskFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [justification, setJustification] = useState('');

    const [formData, setFormData] = useState<Partial<Risk>>({
        name: risk?.name || '',
        type: risk?.type || (RISK_TYPES[0] as RiskType),
        association: risk?.association || (RISK_ASSOCIATIONS[0] as RiskAssociation),
        identificationDate: risk?.identificationDate || new Date().toISOString().split('T')[0],
        isLgpdRelated: risk?.isLgpdRelated || false,
        causes: risk?.causes || '',
        consequences: risk?.consequences || '',
        dimensions: risk?.dimensions || [],

        probability: risk?.probability || 0,
        impact: risk?.impact || 0,
        inherentRisk: risk?.inherentRisk || 0,

        controlsExist: risk?.controlsExist || false,
        isControlEffective: risk?.isControlEffective || false,
        isControlProportional: risk?.isControlProportional || false,
        isControlReasonable: risk?.isControlReasonable || false,
        isControlAdequate: risk?.isControlAdequate || false,
        fac: risk?.fac || 1.0,

        residualRisk: risk?.residualRisk || 0,
        suggestedResponse: risk?.suggestedResponse || (RISK_RESPONSES.find(r => r === 'Aceitar') || RISK_RESPONSES[0] as RiskResponse),
        maxImplementationDate: risk?.maxImplementationDate || '',
        history: risk?.history || [],
    });

    const getFacLabel = useCallback((fac: number) => {
        if (fac === 1.0) return "Ineficaz";
        if (fac === 0.8) return "Fraco";
        if (fac === 0.6) return "Mediano";
        if (fac === 0.4) return "Satisfatório";
        if (fac <= 0.2) return "Forte";
        return "-";
    }, []);

    useEffect(() => {
        const prob = Number(formData.probability) || 0;
        const imp = Number(formData.impact) || 0;

        const inherent = prob * imp;

        let calculatedFac = 1.0;

        if (formData.controlsExist) {
            if (formData.isControlEffective) {
                let reduction = 0.2;
                if (formData.isControlAdequate) reduction += 0.2;
                if (formData.isControlProportional) reduction += 0.2;
                if (formData.isControlReasonable) reduction += 0.2;
                calculatedFac = 1.0 - reduction;
            } else {
                calculatedFac = 1.0;
            }
        } else {
            calculatedFac = 1.0;
        }

        calculatedFac = Math.round(calculatedFac * 10) / 10;
        if (calculatedFac < 0.2) calculatedFac = 0.2;
        if (calculatedFac > 1.0) calculatedFac = 1.0;

        const residual = Number((inherent * calculatedFac).toFixed(2));

        // --- LÓGICA DE CÁLCULO DA DATA MÁXIMA DE IMPLEMENTAÇÃO ---
        let requiredMonths = 0;
        const currentResidualRisk = Number(residual);
        const identificationDate = formData.identificationDate;
        let newMaxImplementationDate = '';
        let newSuggestedResponse = formData.suggestedResponse;

        const isCurrentlyMonitoringOnly = currentResidualRisk < 4;

        if (currentResidualRisk >= 15.1) {
            requiredMonths = 6;
        } else if (currentResidualRisk >= 8) {
            requiredMonths = 12;
        } else if (currentResidualRisk >= 4) {
            requiredMonths = 36;
        } else {
            requiredMonths = 0;
            // Bloqueio Lógico: Se for monitorar, sugerimos 'Aceitar'
            newSuggestedResponse = (RISK_RESPONSES.find(r => r === 'Aceitar') || formData.suggestedResponse) as RiskResponse;
        }

        if (requiredMonths > 0 && identificationDate) {
            newMaxImplementationDate = calculateMaxDate(identificationDate, requiredMonths);
        }
        // --- FIM DA LÓGICA DE DATA ---


        setFormData(prev => ({
            ...prev,
            inherentRisk: inherent,
            fac: calculatedFac,
            residualRisk: residual,
            maxImplementationDate: newMaxImplementationDate,
            suggestedResponse: newSuggestedResponse // Atualiza a resposta sugerida
        }));

    }, [
        formData.probability,
        formData.impact,
        formData.controlsExist,
        formData.isControlEffective,
        formData.isControlAdequate,
        formData.isControlProportional,
        formData.isControlReasonable,
        formData.identificationDate,
        RISK_RESPONSES
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => {
                const newData = { ...prev, [name]: checked };
                if (name === 'isControlEffective' && !checked) {
                    newData.isControlAdequate = false;
                    newData.isControlProportional = false;
                    newData.isControlReasonable = false;
                }
                if (name === 'controlsExist' && !checked) {
                    newData.isControlEffective = false;
                    newData.isControlAdequate = false;
                    newData.isControlProportional = false;
                    newData.isControlReasonable = false;
                }
                return newData;
            });
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDimensionChange = (dimension: RiskDimension) => {
        setFormData(prev => {
            const currentDimensions = (prev.dimensions as RiskDimension[]) || [];
            if (currentDimensions.includes(dimension)) {
                return { ...prev, dimensions: currentDimensions.filter(d => d !== dimension) };
            } else {
                return { ...prev, dimensions: [...currentDimensions, dimension] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isMonitoringOnly = (formData.residualRisk || 0) < 4;
        const isAssessmentStarted = (formData.probability > 0 || formData.impact > 0);

        if (isAssessmentStarted && !isMonitoringOnly && !formData.maxImplementationDate) {
             alert("A Data Máxima de Implantação não foi calculada. Verifique a Data de Identificação.");
             return;
        }

        if (risk?.id && !justification.trim()) {
            alert("A justificativa é obrigatória para salvar alterações.");
            return;
        }

        setIsSubmitting(true);
        try {
            let updatedHistory = [...(formData.history || [])];
            if (risk?.id) {
                updatedHistory.push({
                    timestamp: new Date().toISOString(),
                    user: "Usuário Atual",
                    justification: justification,
                    changes: "Edição de risco"
                });
            }

            const riskToSave: Risk = {
                ...formData as Risk,
                id: risk?.id || '',
                processId: processId,
                history: updatedHistory,
                probability: Number(formData.probability),
                impact: Number(formData.impact),
                inherentRisk: Number(formData.inherentRisk),
                fac: Number(formData.fac),
                residualRisk: Number(formData.residualRisk),
                maxImplementationDate: formData.maxImplementationDate || '',
            };

            await onSave(riskToSave);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isMonitoringOnly = (formData.residualRisk || 0) < 4;
    const isAssessmentStarted = (formData.probability > 0 || formData.impact > 0);

    // Nível e Cor para Inerente
    const inherentLevel = getRiskLevel(formData.inherentRisk || 0, false);
    // Nível e Cor para Residual
    const residualLevel = getRiskLevel(formData.residualRisk || 0, true);

    // Condição para bloquear a Resposta Sugerida
    const shouldDisableSuggestedResponse = isMonitoringOnly && isAssessmentStarted;


    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <h3 className={sectionTitleStyle}>1. Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome do Risco *</label>
            <input name="name" value={formData.name} onChange={handleChange} required className={formInputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Tipo</label>
            <select name="type" value={formData.type} onChange={handleChange} className={formInputStyle}>
              {RISK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Associação</label>
            <select name="association" value={formData.association} onChange={handleChange} className={formInputStyle}>
              {RISK_ASSOCIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Data de Identificação</label>
            <input type="date" name="identificationDate" value={formData.identificationDate} onChange={handleChange} required className={formInputStyle} />
          </div>
          <div className="flex items-center mt-6">
            <input id="lgpd" type="checkbox" name="isLgpdRelated" checked={formData.isLgpdRelated} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
            <label htmlFor="lgpd" className="ml-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">Relação com LGPD?</label>
          </div>
        </div>

        <h3 className={sectionTitleStyle}>2. Detalhamento</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Causas</label>
              <textarea name="causes" value={formData.causes} onChange={handleChange} rows={3} className={formInputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Consequências</label>
              <textarea name="consequences" value={formData.consequences} onChange={handleChange} rows={3} className={formInputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Dimensões</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
              {RISK_DIMENSIONS.map(dim => (
                <label key={dim} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.dimensions as RiskDimension[] || []).includes(dim)}
                    onChange={() => handleDimensionChange(dim)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{dim}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <h3 className={sectionTitleStyle}>3. Análise Quantitativa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Probabilidade</label>
              <select name="probability" value={formData.probability} onChange={handleChange} className={formInputStyle}>
                <option value={0} disabled>Selecione</option>
                {PROBABILITY_IMPACT_SCALE.map(scale => <option key={scale.value} value={scale.value}>{scale.value} - {scale.label}</option>)}
              </select>
              <textarea name="probabilityJustification" value={formData.probabilityJustification} onChange={handleChange} placeholder="Justifique..." rows={2} className="w-full text-xs p-2 border rounded" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Impacto</label>
              <select name="impact" value={formData.impact} onChange={handleChange} className={formInputStyle}>
                <option value={0} disabled>Selecione</option>
                {PROBABILITY_IMPACT_SCALE.map(scale => <option key={scale.value} value={scale.value}>{scale.value} - {scale.label}</option>)}
              </select>
              <textarea name="impactJustification" value={formData.impactJustification} onChange={handleChange} placeholder="Justifique..." rows={2} className="w-full text-xs p-2 border rounded" />
            </div>
            <div className="md:col-span-2 flex justify-center mt-2">
              <div className="bg-white dark:bg-gray-700 px-6 py-2 rounded shadow border border-gray-200 dark:border-gray-600 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold">Risco Inerente</span>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex flex-col items-center">
                  {formData.inherentRisk}
                  {/* EXIBIÇÃO DO NÍVEL INERENTE */}
                  {(isAssessmentStarted && formData.inherentRisk !== 0) && (
                    <span className={`mt-1 text-xs px-2 py-0.5 rounded-full text-white font-semibold ${inherentLevel.color}`}>
                      {inherentLevel.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h3 className={sectionTitleStyle}>4. Avaliação de Controles (FAC)</h3>
          <div className="space-y-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200 mb-2">
              <label className="font-bold text-gray-800 dark:text-gray-100">Existem controles implementados?</label>
              <input type="checkbox" name="controlsExist" checked={formData.controlsExist} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
            </div>
            {formData.controlsExist && (
              <div className="pl-2 space-y-3">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">1. O controle é EFICAZ?</label>
                  <input type="checkbox" name="isControlEffective" checked={formData.isControlEffective} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                </div>
                <div className={`space-y-2 pl-4 border-l-2 ${formData.isControlEffective ? 'border-indigo-400 opacity-100' : 'border-gray-300 opacity-50 grayscale'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600 dark:text-gray-300">2. O controle é Adequado?</label>
                    <input type="checkbox" name="isControlAdequate" checked={formData.isControlAdequate} onChange={handleChange} disabled={!formData.isControlEffective} className="w-4 h-4 text-indigo-600 rounded disabled:cursor-not-allowed" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600 dark:text-gray-300">3. O controle é Proporcional?</label>
                    <input type="checkbox" name="isControlProportional" checked={formData.isControlProportional} onChange={handleChange} disabled={!formData.isControlEffective} className="w-4 h-4 text-indigo-600 rounded disabled:cursor-not-allowed" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600 dark:text-gray-300">4. O controle é Razoável?</label>
                    <input type="checkbox" name="isControlReasonable" checked={formData.isControlReasonable} onChange={handleChange} disabled={!formData.isControlEffective} className="w-4 h-4 text-indigo-600 rounded disabled:cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-indigo-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-sm text-gray-700 dark:text-gray-200 block">Fator de Avaliação (FAC):</span>
                <span className="text-xs text-gray-500">{getFacLabel(formData.fac || 1.0)}</span>
              </div>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded font-mono font-bold text-lg">{formData.fac}</span>
            </div>
          </div>

          <h3 className={sectionTitleStyle}>5. Avaliação Residual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-center border-2 border-gray-300 dark:border-gray-600">
              <span className="text-sm uppercase font-bold text-gray-500">Risco Residual</span>
              <div className="text-4xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400 flex flex-col items-center">
                {formData.residualRisk}
                {/* EXIBIÇÃO DO NÍVEL RESIDUAL */}
                {(isAssessmentStarted && formData.residualRisk !== 0) && (
                  <span className={`mt-1 text-xs px-2 py-0.5 rounded-full text-white font-semibold ${residualLevel.color}`}>
                    {residualLevel.label}
                  </span>
                )}
              </div>
            </div>
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Resposta Sugerida</label>
                    <select
                      name="suggestedResponse"
                      value={formData.suggestedResponse}
                      onChange={handleChange}
                      // BLOQUEIO QUANDO É MONITORAMENTO
                      disabled={shouldDisableSuggestedResponse}
                      className={formInputStyle}
                    >
                      {RISK_RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {shouldDisableSuggestedResponse && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        Bloqueado: Risco Muito Baixo exige monitoramento (Aceitar).
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Prazo de Implantação (Calculado)</label>

                    {(isMonitoringOnly && isAssessmentStarted) ? (
                      <div className="text-center py-2 px-3 rounded-md font-extrabold text-sm bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
                        MONITORAR
                      </div>
                    ) : (
                      <input
                        type="date"
                        name="maxImplementationDate"
                        value={formData.maxImplementationDate || ''}
                        onChange={handleChange}
                        className={formInputStyle}
                        disabled
                      />
                    )}
                  </div>
              </div>
          </div>

        {risk?.id && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-700">
            <label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-200">Justificativa da Edição *</label>
            <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={2} className={formInputStyle.replace('disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:cursor-not-allowed', '')} required placeholder="Motivo da alteração..." />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{isSubmitting ? 'Salvando...' : 'Salvar Risco'}</button>
        </div>
    </form>
  );
}
