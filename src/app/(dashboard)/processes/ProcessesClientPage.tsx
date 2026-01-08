"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Process } from '@/types';
import { saveProcess, deleteProcess } from '@/src/app/actions/process.actions';
import ProcessManagement from '@/src/components/features/process/ProcessManagement';
import Sidebar from '@/src/components/ui/Sidebar';

interface ProcessesClientPageProps {
  initialProcesses: Process[];
}

export default function ProcessesClientPage({ initialProcesses }: ProcessesClientPageProps) {
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<Process | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSelectProcess = (id: string) => {
    router.push(`/processes/${id}/risks`);
  };

  const handleSave = async (data: Process) => {
    try {
      const result = await saveProcess(data);
      if (result.success) {
        router.refresh();
        setIsModalOpen(false);
        setCurrentProcess(undefined);
      } else {
        alert("Erro ao salvar processo: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro crítico:", error);
      alert("Erro crítico ao salvar: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProcess(id);
    if (result.success) {
      router.refresh();
    } else {
      alert("Erro ao deletar processo.");
    }
  };

  React.useEffect(() => {
    setProcesses(initialProcesses);
  }, [initialProcesses]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 ">

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gestão de Processos
          </h1>
        </div>

        <ProcessManagement
          processes={processes}
          onSelectProcess={handleSelectProcess}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
