import React from 'react';
import { getProcesses } from '@/app/actions/process.actions';
// Importamos o arquivo que acabamos de criar acima
import ProcessesClientPage from './ProcessesClientPage';

export default async function ProcessesPage() {
  // 1. Busca no Banco de Dados (Server Side)
  const processes = await getProcesses();

  // 2. Renderiza a tela passando os dados
  return (
    <ProcessesClientPage initialProcesses={processes as any} />
  );
}
