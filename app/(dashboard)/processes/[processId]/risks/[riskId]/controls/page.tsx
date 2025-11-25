import ControlsClientPage from './ControlsClientPage';

interface ControlsPageProps {
  params: {
    processId: string;
    riskId: string;
  };
}

// Componente Assíncrono para acesso seguro aos params
export default async function ControlsPage({ params }: ControlsPageProps) {

  // 💡 AWAIT OBRIGATÓRIO: Desestruturação segura dos parâmetros
  const { processId, riskId } = await params;

  return (
    <ControlsClientPage
      currentProcessId={processId}
      currentRiskId={riskId}
    />
  );
}
