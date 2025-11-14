import React, { useState } from 'react';
import type { Process, Risk, Control } from './types';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProcessManagement from './components/ProcessManagement';
import RiskManagement from './components/RiskManagement';
import ControlManagement from './components/ControlManagement';
import { ShieldIcon } from './components/icons';

// Mock Data
const initialProcesses: Process[] = [
    { id: 'p1', name: 'Onboarding de Clientes', sector: 'Operações', manager: 'Alice', responsibleServers: ['Bob', 'Charlie'], legalBasis: 'KYC Norms', systemsUsed: ['CRM', 'Core Banking'], stakeholders: ['Clientes', 'Compliance'], history: [] },
    { id: 'p2', name: 'Desenvolvimento de Software', sector: 'Tecnologia', manager: 'David', responsibleServers: ['Eve', 'Frank'], legalBasis: 'LGPD', systemsUsed: ['Jira', 'Gitlab'], stakeholders: ['Equipe de Produto', 'Usuários'], history: [] },
];

const initialRisks: Risk[] = [
    { id: 'r1', processId: 'p1', name: 'Falha na verificação de documentos', identificationDate: '2023-10-01', type: 'Operacional', association: 'Processo', causes: 'Documentos falsificados', consequences: 'Fraude financeira', dimensions: ['Operacional', 'Conformidade', 'Imagem'], probability: 4, probabilityJustification: 'Alta incidência histórica', impact: 5, impactJustification: 'Perdas financeiras significativas e dano à reputação', inherentRisk: 20, controlsExist: true, isControlEffective: true, isControlProportional: true, isControlReasonable: false, isControlAdequate: true, fac: 0.4, residualRisk: 8, suggestedResponse: 'Reduzir', maxImplementationDate: '2024-04-01', isLgpdRelated: false, history: [] },
    { id: 'r2', processId: 'p2', name: 'Vazamento de dados de usuários', identificationDate: '2023-11-15', type: 'Suporte', association: 'Processo', causes: 'Vulnerabilidade de segurança no sistema', consequences: 'Exposição de dados sensíveis, multas regulatórias', dimensions: ['Privacidade', 'Sancionatório', 'Imagem', 'Conformidade'], probability: 3, probabilityJustification: 'Ataques cibernéticos são comuns', impact: 5, impactJustification: 'Violação da LGPD e perda de confiança do cliente', inherentRisk: 15, controlsExist: true, isControlEffective: true, isControlProportional: true, isControlReasonable: true, isControlAdequate: true, fac: 0.2, residualRisk: 3, suggestedResponse: 'Reduzir', maxImplementationDate: '2024-05-15', isLgpdRelated: true, history: [] }
];

const initialControls: Control[] = [
    { id: 'c1', riskId: 'r1', name: 'Implementar verificação biométrica', implemented: true, status: 'on-time', newOrModified: 'Novo', type: 'Preventivo', nature: 'Automatizado', relationToRisk: 'Direto', responsible: 'Equipe de Segurança', implementationMethod: 'Integrar com API de parceiro', macroSteps: 'Contratar fornecedor; Integrar API; Testar', plannedStartDate: '2023-11-01', plannedEndDate: '2024-01-31', actualEndDate: '2024-01-25', involvedSectors: ['TI', 'Operações'], adequacyAnalysis: 'Controle altamente eficaz para mitigar fraudes de identidade.', history: [] },
    { id: 'c2', riskId: 'r2', name: 'Revisão de código com foco em segurança', implemented: false, status: 'near-due', newOrModified: 'Modificado', type: 'Preventivo', nature: 'Manual', relationToRisk: 'Direto', responsible: 'Líder Técnico', implementationMethod: 'Adicionar etapa de peer review de segurança no CI/CD', macroSteps: 'Configurar pipeline; Treinar equipe; Monitorar', plannedStartDate: '2023-12-01', plannedEndDate: '2024-05-01', actualEndDate: '', involvedSectors: ['Desenvolvimento', 'DevOps'], adequacyAnalysis: 'Essencial para identificar vulnerabilidades antes do deploy.', history: [] }
];


export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [processes, setProcesses] = useState<Process[]>(initialProcesses);
    const [risks, setRisks] = useState<Risk[]>(initialRisks);
    const [controls, setControls] = useState<Control[]>(initialControls);

    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
    const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

    const handleSetView = (view: View, processId?: string, riskId?: string) => {
        setCurrentView(view);
        if (processId) setSelectedProcessId(processId);
        if (riskId) setSelectedRiskId(riskId);
    };

    const renderContent = () => {
        switch (currentView) {
            case View.DASHBOARD:
                return <Dashboard processes={processes} risks={risks} controls={controls} />;
            case View.PROCESSES:
                return <ProcessManagement processes={processes} setProcesses={setProcesses} onSelectProcess={(id) => handleSetView(View.RISKS, id)} />;
            case View.RISKS:
                if (!selectedProcessId) return <div className="text-center p-8">Selecione um processo para ver os riscos.</div>;
                const selectedProcess = processes.find(p => p.id === selectedProcessId);
                return <RiskManagement
                    process={selectedProcess!}
                    risks={risks.filter(r => r.processId === selectedProcessId)}
                    setRisks={setRisks}
                    onSelectRisk={(id) => handleSetView(View.CONTROLS, selectedProcessId, id)}
                    onBack={() => handleSetView(View.PROCESSES)}
                />;
            case View.CONTROLS:
                 if (!selectedRiskId) return <div className="text-center p-8">Selecione um risco para ver os controles.</div>;
                 const selectedRisk = risks.find(r => r.id === selectedRiskId);
                 return <ControlManagement
                    risk={selectedRisk!}
                    controls={controls.filter(c => c.riskId === selectedRiskId)}
                    setControls={setControls}
                    onBack={() => handleSetView(View.RISKS, selectedRisk!.processId)}
                 />;
            default:
                return <Dashboard processes={processes} risks={risks} controls={controls} />;
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl dark:bg-gray-800">
                    <div className="flex flex-col items-center space-y-4">
                        <ShieldIcon className="w-16 h-16 text-indigo-500" />
                        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Risk Management Platform</h1>
                        <p className="text-center text-gray-600 dark:text-gray-400">Faça login para continuar</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input id="email-address" name="email" type="email" required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" defaultValue="usuario@exemplo.com" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                                <input id="password" name="password" type="password" required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" defaultValue="senha" />
                            </div>
                        </div>
                        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar
                currentView={currentView}
                setView={setCurrentView}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
                {renderContent()}
            </main>
        </div>
    );
}
