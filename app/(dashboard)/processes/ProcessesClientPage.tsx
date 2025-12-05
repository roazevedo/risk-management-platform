"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Process } from '@/types';
import { saveProcess, deleteProcess } from '@/app/actions/process.actions';
import ProcessManagement from '@/components/ProcessManagement'; // Assumindo que este é o nome

interface ProcessesClientPageProps {
 initialProcesses: Process[];
}

export default function ProcessesClientPage({ initialProcesses }: ProcessesClientPageProps) {
 const router = useRouter();
 const [processes, setProcesses] = useState<Process[]>(initialProcesses);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [currentProcess, setCurrentProcess] = useState<Process | undefined>(undefined);

 // 💡 FUNÇÃO CORRIGIDA: Navegação para a rota de riscos aninhada
 const handleSelectProcess = (id: string) => {
  // O caminho deve incluir a rota aninhada /risks
  router.push(`/processes/${id}/risks`);
 };

 const handleSave = async (data: Process) => {
  try {
   const result = await saveProcess(data);
   if (result.success) {
    // Força o Server Component ProcessesPage a buscar os dados novamente
    router.refresh();
    setIsModalOpen(false);
    setCurrentProcess(undefined);
   } else {
    alert("Erro ao salvar processo.");
   }
  } catch (error) {
   console.error(error);
   alert("Erro crítico ao salvar.");
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

 // Sincroniza o estado local quando os dados iniciais do servidor mudam
 React.useEffect(() => {
  setProcesses(initialProcesses);
 }, [initialProcesses]);


  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Gerenciamento de Processos</h1>

      <ProcessManagement
        processes={processes}
        onSelectProcess={handleSelectProcess}
        onSave={handleSave}
        onDelete={handleDelete}
        />
    </div>
  );
}
