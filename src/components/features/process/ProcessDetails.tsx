import React from 'react';
import { Process } from '@/types';
import { Clock, User, FileText, Share2, Server, Users } from 'lucide-react';

interface ProcessDetailsProps {
    process: Process;
}

export default function ProcessDetails({ process }: ProcessDetailsProps) {

    // Helper para exibir listas ou "Nenhum"
    const renderList = (list?: string[]) => {
        if (!list || list.length === 0) return <span className="text-gray-400 italic">Nenhum registrado</span>;
        return list.join(', ');
    };

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2 custom-scrollbar">

            {/* Cabeçalho com Ícone */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{process.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {process.id}</p>
                </div>
            </div>

            {/* Grid de Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Setor</label>
                    <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-gray-400" /> {process.sector}
                    </p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestor Responsável</label>
                    <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" /> {process.manager}
                    </p>
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Listas Detalhadas */}
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Servidores Envolvidos
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        {renderList(process.responsibleServers)}
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Sistemas Utilizados
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        {renderList(process.systemsUsed)}
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Stakeholders
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        {renderList(process.stakeholders)}
                    </p>
                </div>

                <div>
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Legal</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {process.legalBasis || "Não informada."}
                     </p>
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Histórico de Alterações */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Histórico de Alterações
                </h4>

                {process.history && process.history.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
                        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Data</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Usuário</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Justificativa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                {process.history.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')} {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                            {entry.user}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                            {entry.justification}
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
