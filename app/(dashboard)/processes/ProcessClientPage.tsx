"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Process } from '@/types';
import { saveProcess, deleteProcess } from '@/app/actions'; // Importe as actions

// Importe seus componentes visuais
// Se você ainda não extraiu o ProcessForm e ProcessList,
// o ProcessManagement precisará ser adaptado, mas vamos focar na lógica da página primeiro.
import ProcessManagement from '@/components/ProcessManagement';

interface ProcessesClientPageProps {
  initialProcesses: Process[];
}

export default function ProcessesClientPage({ initialProcesses }: ProcessesClientPageProps) {
  const router = useRouter();

  // O estado inicial vem do Banco de Dados via props
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);

  // Mantém a lista atualizada se o servidor mandar dados novos
  useEffect(() => {
    setProcesses(initialProcesses);
  }, [initialProcesses]);

  // Navegação para a página de Riscos
  const handleSelectProcess = (id: string) => {
    router.push(`/processes/${id}/risks`);
  };

  // --- INTERAÇÃO COM O BANCO DE DADOS ---

  // Essa função deve ser passada para o seu formulário de criação/edição
  const handleSave = async (processData: Process) => {
    try {
      const result = await saveProcess(processData);

      if (result.success) {
        // O router.refresh() faz o Next.js recarregar os dados do servidor (page.tsx)
        // sem recarregar a página inteira do navegador.
        router.refresh();

        // Se estiver usando Modal controlado aqui, feche-o:
        // setIsModalOpen(false);
      } else {
        alert("Erro ao salvar processo.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro inesperado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza? Isso apagará todos os riscos vinculados.")) {
      const result = await deleteProcess(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <ProcessManagement
      processes={processes}
      // Se o seu ProcessManagement antigo esperava 'setProcesses', isso funciona temporariamente,
      // mas o ideal é passar onSave e onDelete para ele.
      setProcesses={setProcesses}
      onSelectProcess={handleSelectProcess}

      // Passe as novas funções para que o componente filho possa chamar o banco
      // Você precisará ajustar o ProcessManagement para aceitar essas props se ele ainda não aceita
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
