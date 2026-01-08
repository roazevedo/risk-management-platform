"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Process, Risk, Control } from '../../types';

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

interface DataContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    processes: Process[];
    setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
    risks: Risk[];
    setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
    controls: Control[];
    setControls: React.Dispatch<React.SetStateAction<Control[]>>;
    login: () => void;
    logout: () => void;
}

const initialContextValue: DataContextType = {
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    processes: [],
    setProcesses: () => {},
    risks: [],
    setRisks: () => {},
    controls: [],
    setControls: () => {},
    login: () => {},
    logout: () => {},
};

const DataContext = createContext<DataContextType>(initialContextValue);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    // ✅ Verifica se o usuário está logado no localStorage
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('isLoggedIn');
            return stored === 'true';
        }
        return false;
    });

    const [processes, setProcesses] = useState<Process[]>(initialProcesses);
    const [risks, setRisks] = useState<Risk[]>(initialRisks);
    const [controls, setControls] = useState<Control[]>(initialControls);

    // ✅ Persiste o estado de login no localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', String(isLoggedIn));
        }
    }, [isLoggedIn]);

    // ✅ Funções auxiliares de login/logout
    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
        }
    };

    const value = {
        isLoggedIn,
        setIsLoggedIn,
        processes,
        setProcesses,
        risks,
        setRisks,
        controls,
        setControls,
        login,
        logout,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    return context;
};
