import React from 'react';
import type { Risk } from '../types';
import { Modal } from './Modal';
import { DetailsSection, DetailItem } from './DetailsDisplay';
import { getInherentRiskLevel, getResidualRiskLevel } from '../constants';

interface RiskDetailsProps {
    risk: Risk;
    onClose: () => void;
}

const formatDateForDetails = (dateString: string) => dateString ? new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
const formatTimestamp = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');


export const RiskDetails: React.FC<RiskDetailsProps> = ({ risk, onClose }) => {
    const inherentRiskDetails = getInherentRiskLevel(risk.inherentRisk);
    const residualRiskDetails = getResidualRiskLevel(risk.residualRisk);
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`Detalhes do Risco: ${risk.name}`}>
             <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <DetailsSection title="Identificação do Risco">
                    <DetailItem label="Nome do Risco" value={risk.name} />
                    <DetailItem label="Data de Identificação" value={formatDateForDetails(risk.identificationDate)} />
                    <DetailItem label="Tipo de Risco" value={risk.type} />
                    <DetailItem label="Associação do Risco" value={risk.association} />
                    <DetailItem label="Causas" value={<p className="whitespace-pre-wrap">{risk.causes}</p>} fullWidth />
                    <DetailItem label="Consequências" value={<p className="whitespace-pre-wrap">{risk.consequences}</p>} fullWidth />
                    <DetailItem label="Dimensões do Risco" value={
                        <div className="flex flex-wrap gap-2">
                            {risk.dimensions.map(d => <span key={d} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">{d}</span>)}
                        </div>
                    } fullWidth />
                </DetailsSection>

                <DetailsSection title="Análise de Risco Inerente">
                    <DetailItem label="Probabilidade" value={`${risk.probability} - ${risk.probabilityJustification}`} />
                    <DetailItem label="Impacto" value={`${risk.impact} - ${risk.impactJustification}`} />
                    <DetailItem label="Risco Inerente" value={
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{risk.inherentRisk}</span>
                            <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${inherentRiskDetails.color}`}>{inherentRiskDetails.level}</span>
                        </div>
                    } />
                </DetailsSection>
                
                <DetailsSection title="Avaliação de Controles">
                    <DetailItem label="O Controle é Eficaz?" value={risk.isControlEffective ? 'Sim' : 'Não'} />
                    <DetailItem label="O Controle é Proporcional?" value={risk.isControlProportional ? 'Sim' : 'Não'} />
                    <DetailItem label="O Controle é Razoável?" value={risk.isControlReasonable ? 'Sim' : 'Não'} />
                    <DetailItem label="O Controle é Adequado?" value={risk.isControlAdequate ? 'Sim' : 'Não'} />
                    <DetailItem label="Fator de Avaliação (FAC)" value={<span className="font-bold">{risk.fac}</span>} />
                </DetailsSection>

                <DetailsSection title="Risco Residual e Resposta">
                     <DetailItem label="Risco Residual" value={
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{risk.residualRisk.toFixed(2)}</span>
                            <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${residualRiskDetails.color}`}>{residualRiskDetails.level}</span>
                        </div>
                    } />
                    <DetailItem label="Resposta Sugerida" value={risk.suggestedResponse} />
                    <DetailItem label="Data Máxima para Implantação" value={formatDateForDetails(risk.maxImplementationDate)} />
                    <DetailItem label="Relação com LGPD?" value={risk.isLgpdRelated ? 'Sim' : 'Não'} />
                </DetailsSection>

                {risk.history && risk.history.length > 0 && (
                    <DetailsSection title="Histórico de Modificações">
                       <div className="col-span-1 md:col-span-2 space-y-4">
                            {risk.history.slice().reverse().map((entry, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold">{formatTimestamp(entry.timestamp)} por {entry.user}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><strong>Justificativa:</strong> {entry.justification}</p>
                                    <pre className="mt-2 text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-sans bg-gray-100 dark:bg-gray-700 p-2 rounded">{entry.changes}</pre>
                                </div>
                            ))}
                       </div>
                    </DetailsSection>
                )}
            </div>
        </Modal>
    );
};