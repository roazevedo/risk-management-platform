import React from 'react';
import type { Process } from '../types';
import { Modal } from './Modal';
import { DetailsSection, DetailItem } from './DetailsDisplay';

interface ProcessDetailsProps {
    process: Process;
    onClose: () => void;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

export const ProcessDetails: React.FC<ProcessDetailsProps> = ({ process, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title={`Detalhes do Processo: ${process.name}`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <DetailsSection title="Informações Gerais">
                    <DetailItem label="Nome do Processo" value={process.name} />
                    <DetailItem label="Setor" value={process.sector} />
                    <DetailItem label="Gestor do Processo" value={process.manager} />
                    <DetailItem label="Embasamento Legal" value={process.legalBasis} />
                </DetailsSection>

                <DetailsSection title="Recursos e Partes Interessadas">
                    <DetailItem label="Servidores Responsáveis" value={process.responsibleServers.join(', ')} fullWidth />
                    <DetailItem label="Sistemas Utilizados" value={process.systemsUsed.join(', ')} fullWidth />
                    <DetailItem label="Partes Interessadas" value={process.stakeholders.join(', ')} fullWidth />
                </DetailsSection>

                {process.history && process.history.length > 0 && (
                    <DetailsSection title="Histórico de Modificações">
                       <div className="col-span-1 md:col-span-2 space-y-4">
                            {process.history.slice().reverse().map((entry, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold">{formatDate(entry.timestamp)} por {entry.user}</p>
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
