import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import RiskManagement from '../../../../components/RiskManagement';
import { useData } from '../../../../contexts/DataContext';

const RiskListPage: NextPage = () => {
    const router = useRouter();
    const { processId } = router.query;
    const { processes } = useData();

    const selectedProcess = processes.find(p => p.id === processId);

    if (router.isFallback || !selectedProcess) {
        return <div className="text-center p-8">Carregando ou processo não encontrado...</div>;
    }

    return <RiskManagement process={selectedProcess} />;
};

export default RiskListPage;
