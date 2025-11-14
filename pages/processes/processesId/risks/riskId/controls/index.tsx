import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import ControlManagement from '../../../../../../components/ControlManagement';
import { useData } from '../../../../../../contexts/DataContext';

const ControlListPage: NextPage = () => {
    const router = useRouter();
    const { riskId } = router.query;
    const { risks } = useData();

    const selectedRisk = risks.find(r => r.id === riskId);

    if (router.isFallback || !selectedRisk) {
        return <div className="text-center p-8">Carregando ou risco não encontrado...</div>;
    }

    return <ControlManagement risk={selectedRisk} />;
};

export default ControlListPage;
