import React from 'react';
import type { Control, ControlStatus } from '../types';
import { Modal } from './Modal';
import { DetailsSection, DetailItem } from './DetailsDisplay';
import { calculateControlStatus } from '@/lib/domain/control-status';

interface ControlDetailsProps {
    control: Control;
    onClose: () => void;
}

const formatDateForDetails = (dateString: string) => dateString ? new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
const formatTimestamp = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');


export const ControlDetails: React.FC<ControlDetailsProps> = ({ control, onClose }) => {
    const statusInfo = calculateControlStatus(control.plannedEndDate, control.implemented, control.actualEndDate);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Detalhes do Controle: ${control.name}`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <DetailsSection title="Informações Gerais">
                    <DetailItem label="Nome do Controle" value={control.name} />
                    <DetailItem label="Status" value={<span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>} />
                    <DetailItem label="Novo ou Modificado?" value={control.newOrModified} />
                    <DetailItem label="Responsável" value={control.responsible} />
                </DetailsSection>

                <DetailsSection title="Classificação do Controle">
                    <DetailItem label="Quanto ao Tipo" value={control.type} />
                    <DetailItem label="Quanto à Natureza" value={control.nature} />
                    <DetailItem label="Quanto à Relação com o Risco" value={control.relationToRisk} />
                </DetailsSection>

                <DetailsSection title="Implementação">
                    <DetailItem label="Como Implantar" value={<p className="whitespace-pre-wrap">{control.implementationMethod}</p>} fullWidth />
                    <DetailItem label="Macroetapas" value={<p className="whitespace-pre-wrap">{control.macroSteps}</p>} fullWidth />
                    <DetailItem label="Início Previsto" value={formatDateForDetails(control.plannedStartDate)} />
                    <DetailItem label="Conclusão Prevista" value={formatDateForDetails(control.plannedEndDate)} />
                    <DetailItem label="Conclusão Real" value={formatDateForDetails(control.actualEndDate)} />
                    <DetailItem label="Órgãos/Setores Envolvidos" value={control.involvedSectors.join(', ')} />
                </DetailsSection>

                <DetailsSection title="Análise de Adequação">
                    <DetailItem label="Análise EGR de Adequação dos Controles" value={<p className="whitespace-pre-wrap">{control.adequacyAnalysis}</p>} fullWidth />
                </DetailsSection>

                {control.history && control.history.length > 0 && (
                    <DetailsSection title="Histórico de Modificações">
                       <div className="col-span-1 md:col-span-2 space-y-4">
                            {control.history.slice().reverse().map((entry, index) => (
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
