"use client";

import React from 'react';
import { Risk } from '@/types';
import {
    AlertTriangle,
    Shield,
    Clock,
    Activity,
    Target,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { getResidualRiskLevel } from '@/src/lib/domain/risk-classification';

interface RiskDetailsProps {
    risk: Risk;
    onClose: () => void;
}

export default function RiskDetails({ risk, onClose }: RiskDetailsProps) {

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const residualRiskLevel = getResidualRiskLevel(risk.residualRisk);

    // Mapear cores do domain para classes Tailwind completas
    const getRiskColorClasses = (color: string) => {
        const colorMap: Record<string, string> = {
            'bg-red-600': 'text-red-600 bg-red-100 border-red-200',
            'bg-orange-500': 'text-orange-600 bg-orange-100 border-orange-200',
            'bg-yellow-500': 'text-yellow-600 bg-yellow-100 border-yellow-200',
            'bg-green-500': 'text-green-600 bg-green-100 border-green-200',
            'bg-green-400': 'text-green-600 bg-green-100 border-green-200',
            'bg-gray-400': 'text-gray-600 bg-gray-100 border-gray-200',
        };
        return colorMap[color] || 'text-gray-600 bg-gray-100 border-gray-200';
    };

    const BooleanStatus = ({ label, value }: { label: string, value: boolean }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                {value ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Sim
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Não
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className={`p-3 rounded-full ${getRiskColorClasses(residualRiskLevel.color)} bg-opacity-20`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{risk.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-600 border rounded text-gray-600 dark:text-gray-300">
                            Tipo: {risk.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-600 border rounded text-gray-600 dark:text-gray-300">
                            Associação: {risk.association}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-600 border rounded text-gray-600 dark:text-gray-300">
                            Identificado em: {formatDate(risk.identificationDate)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-100 dark:border-blue-800">
                    <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Probabilidade</span>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{risk.probability}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-100 dark:border-blue-800">
                    <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Impacto</span>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{risk.impact}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Risco Inerente</span>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{risk.inherentRisk}</p>
                </div>
                <div className={`p-3 rounded-lg text-center border ${getRiskColorClasses(residualRiskLevel.color)} bg-opacity-10 border-opacity-50`}>
                    <span className="text-xs uppercase font-bold opacity-80">Risco Residual</span>
                    <p className="text-2xl font-bold">{risk.residualRisk}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Causas
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 min-h-[80px]">
                        {risk.causes || "Não informadas."}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Consequências
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 min-h-[80px]">
                        {risk.consequences || "Não informadas."}
                    </p>
                </div>
            </div>

            {/* Exibindo Dimensões */}
            {risk.dimensions && risk.dimensions.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dimensões Afetadas</h4>
                    <div className="flex flex-wrap gap-2">
                        {risk.dimensions.map((dim) => (
                            <span key={dim} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                {dim}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Avaliação dos Controles
                    </h4>
                    <BooleanStatus label="Controles Existem?" value={risk.controlsExist} />
                    <BooleanStatus label="São Eficazes?" value={risk.isControlEffective} />
                    <BooleanStatus label="São Proporcionais?" value={risk.isControlProportional} />
                    <BooleanStatus label="São Razoáveis?" value={risk.isControlReasonable} />
                    <BooleanStatus label="São Adequados?" value={risk.isControlAdequate} />

                    <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Fator de Avaliação (FAC):</span>
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{risk.fac}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Justificativas</h4>
                        <div className="space-y-2">
                            <div className="text-xs">
                                <span className="font-bold text-gray-600 dark:text-gray-400">Probabilidade:</span>
                                <p className="text-gray-500 dark:text-gray-500 italic mt-1 pl-2 border-l-2 border-gray-200">
                                    {risk.probabilityJustification || "Sem justificativa."}
                                </p>
                            </div>
                            <div className="text-xs">
                                <span className="font-bold text-gray-600 dark:text-gray-400">Impacto:</span>
                                <p className="text-gray-500 dark:text-gray-500 italic mt-1 pl-2 border-l-2 border-gray-200">
                                    {risk.impactJustification || "Sem justificativa."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2">Resposta ao Risco</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Ação Sugerida:</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">{risk.suggestedResponse}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Prazo Limite:</span>
                            <span className="text-sm text-gray-300 font-bold">{formatDate(risk.maxImplementationDate)}</span>
                        </div>
                    </div>

                    {risk.isLgpdRelated && (
                        <div className="p-2 bg-purple-50 border border-purple-200 rounded text-center text-purple-700 text-xs font-bold">
                            ⚠️ Risco Relacionado à LGPD
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Histórico de Alterações
                </h4>

                {risk.history && risk.history.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
                        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Data</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Usuário</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Justificativa</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                {risk.history.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')} {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {entry.user}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={entry.justification}>
                                            {entry.justification}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                            {entry.changes}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">Nenhum histórico registrado.</p>
                )}
            </div>
        </div>
    );
}
