"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ProcessManagement from '@/components/ProcessManagement';
import { useData } from '@/contexts/DataContext';

const ProcessesPage = () => {
  const { processes, setProcesses } = useData();
  const router = useRouter();

  const handleSelectProcess = (id: string) => {
    router.push(`/processes/${id}/risks`);
  };

  if (!processes) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <ProcessManagement
      processes={processes}
      setProcesses={setProcesses}
      onSelectProcess={handleSelectProcess}
    />
  );
};

export default ProcessesPage;
