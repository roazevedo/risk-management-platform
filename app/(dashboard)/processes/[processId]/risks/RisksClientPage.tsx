// app/(dashboard)/processes/[processId]/risks/RisksClientPage.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RiskManagement from '@/components/RiskManagement';
import { useData } from '@/contexts/DataContext';
import { Risk } from '@/types';

interface RisksClientPageProps {
    currentProcessId: string;
}

export default function RisksClientPage({ currentProcessId }: RisksClientPageProps) {
    const router = useRouter();
    const { processes, risks, setRisks } = useData();
    const safeProcesses = processes || [];
    const safeRisks = risks || [];

    // Verificação de Contexto
    if (!currentProcessId) {
        router.replace('/processes');
        return null;
    }

    const selectedProcess = safeProcesses.find(p => p.id === currentProcessId);

    if (!selectedProcess) {
        router.replace('/processes');
        return null;
    }

    // Filtra os riscos apenas pelo ID do processo
    const risksForProcess: Risk[] = safeRisks.filter(risk => risk.processId === currentProcessId);

    // Funções de navegação
    const handleSelectRisk = (riskId: string) => {
        router.push(`/processes/${currentProcessId}/risks/${riskId}/controls`);
    };

    const handleBackToProcesses = () => {
        router.push('/processes');
    };

    // Se o seu RiskManagement já tem o botão de adicionar, ele provavelmente lida com o modal internamente
    // ou espera uma prop 'onAddRisk'. Se ele lida internamente, não precisamos fazer nada aqui.

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                Riscos: {selectedProcess.name}
            </h1>

            {/* --- CÓDIGO REMOVIDO: Inputs de Busca e Botão Adicionar --- */}

            {/* Renderiza o componente de Gestão que já tem a tabela e os botões */}
            <RiskManagement
                process={selectedProcess}
                risks={risksForProcess}
                setRisks={setRisks}
                onSelectRisk={handleSelectRisk}
                onBack={handleBackToProcesses}
            />
        </div>
    );
}
