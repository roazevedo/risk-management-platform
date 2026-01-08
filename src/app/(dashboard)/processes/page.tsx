import React from 'react';
import { getProcesses } from '@/src/app/actions/process.actions';
import ProcessesClientPage from './ProcessesClientPage';

export default async function ProcessesPage() {

  const processes = await getProcesses();

  return (
    <ProcessesClientPage initialProcesses={processes as any} />
  );
}
