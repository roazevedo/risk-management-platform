export const getInherentRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 3) return { level: 'Muito Baixo', color: 'bg-green-500' };
    if (score <= 7) return { level: 'Baixo', color: 'bg-lime-500' };
    if (score <= 10) return { level: 'Médio', color: 'bg-yellow-500' };
    if (score <= 15) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Crítico', color: 'bg-red-500' };
};

export const getResidualRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 3) return { level: 'Muito Baixo', color: 'bg-green-500' };
    if (score <= 7) return { level: 'Baixo', color: 'bg-lime-500' };
    if (score <= 10) return { level: 'Médio', color: 'bg-yellow-500' };
    if (score <= 15) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Crítico', color: 'bg-red-500' };
};
