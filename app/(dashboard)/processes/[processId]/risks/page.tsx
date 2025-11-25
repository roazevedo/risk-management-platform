// app/processes/[processId]/risks/page.tsx (SERVER COMPONENT)

import RisksClientPage from './RisksClientPage';

interface RisksPageProps {
  params: {
    processId: string;
  };
}

export default async function RisksPage({ params }: RisksPageProps) {

    // 💡 SOLUÇÃO FINAL: Use 'await' para desestruturar 'params'
    // Isso satisfaz o compilador que trata 'params' como uma Promise.
    const { processId } = await params;

    // Passa o ID como prop simples (string) para o componente Cliente
    return (
        <RisksClientPage currentProcessId={processId} />
    );
}
