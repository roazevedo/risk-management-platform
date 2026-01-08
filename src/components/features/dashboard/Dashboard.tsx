"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Process, Risk, Control } from '../../../../types';
import { getResidualRiskLevel, getInherentRiskBucketValue } from '@/src/lib/domain/risk-classification';
import { calculateDashboardMetrics, DASHBOARD_CHART_COLORS } from '@/src/lib/domain/dashboard-metrics';
import { RiskIcon, ProcessIcon, ControlIcon } from '../../ui/icons';

interface DashboardProps {
    processes: Process[];
    risks: Risk[];
    controls: Control[];
}

// Cores para os gráficos
const RISK_LEVEL_COLORS: Record<string, string> = {
    'Crítico': '#ef4444',
    'Alto': '#f97316',
    'Médio': '#eab308',
    'Baixo': '#22c55e',
    'Muito Baixo': '#10b981',
};

const CONTROL_STATUS_COLORS: Record<string, string> = {
    'Em Dia': '#22c55e',
    'Vencimento Próximo': '#eab308',
    'Atrasado': '#ef4444',
    'Implementado': '#6366f1',
};

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600">
        <p className="font-bold">{payload[0].name}</p>
        <p>{`Quantidade: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Configurações da matriz de risco
const inherentRiskLevels = [
  { label: 'CRÍTICO', value: 25 },
  { label: 'ALTO', value: 15 },
  { label: 'MÉDIO', value: 10 },
  { label: 'BAIXO', value: 7 },
  { label: 'MUITO BAIXO', value: 3 },
];

const controlFactors = [
  { label: 'FORTE', value: 0.2 },
  { label: 'SATISFATÓRIO', value: 0.4 },
  { label: 'MEDIANO', value: 0.6 },
  { label: 'FRACO', value: 0.8 },
  { label: 'INEFICAZ', value: 1.0 },
];

// Componente da Matriz de Risco Residual
const ResidualRiskMatrix: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  const riskCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    risks.forEach(risk => {
      const inherentBucket = getInherentRiskBucketValue(risk.inherentRisk);
      const factorBucket = risk.fac;
      const key = `${inherentBucket}-${factorBucket}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [risks]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Matriz de Risco Residual</h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Nível de Risco Inerente vs. Fator de Avaliação de Controles</p>
        <div className="grid grid-cols-[auto_repeat(5,minmax(80px,1fr))] gap-px bg-gray-300 dark:bg-gray-600 border border-gray-300 dark:border-gray-600">

          <div className="p-1 bg-gray-50 dark:bg-gray-700"></div>
            {controlFactors.map(factor => (
              <div key={factor.label} className="p-1 bg-gray-50 dark:bg-gray-700 text-center text-xs font-semibold flex flex-col justify-center min-h-[50px]">
                <div className="font-normal text-white">{factor.label}</div>
                <div className="font-normal text-white">{factor.value.toLocaleString('pt-BR')}</div>
              </div>
            ))}

            {inherentRiskLevels.flatMap(riskLevel => [
              <div key={`${riskLevel.label}-header`} className="p-1 bg-gray-50 dark:bg-gray-700 text-center text-xs text-white font-semibold flex items-center justify-center">
                {riskLevel.label} <span className="font-normal ml-1 text-white">({riskLevel.value})</span>
              </div>,
              ...controlFactors.map(factor => {
                const residualRiskValue = riskLevel.value * factor.value;
                const { color } = getResidualRiskLevel(residualRiskValue);
                const key = `${riskLevel.value}-${factor.value}`;
                const count = riskCounts.get(key) || 0;

                return (
                  <div
                    key={`${riskLevel.label}-${factor.label}`}
                    className={`p-1 min-h-[60px] flex flex-col justify-center items-center text-white text-center ${color}`}
                    title={`${count} risco(s) nesta categoria. Risco Residual: ${residualRiskValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`}
                  >
                    <span className={count > 0 ? 'text-2xl font-bold' : 'text-xl font-semibold text-white/70'}>
                      {count}
                    </span>
                  </div>
                );
              })
            ])}
        </div>
    </div>
  );
};

// Função para calcular dados do gráfico de riscos por nível
function calculateRiskLevelData(risks: Risk[]) {
  const levels = {
    'Crítico': 0,
    'Alto': 0,
    'Médio': 0,
    'Baixo': 0,
    'Muito Baixo': 0,
  };

  risks.forEach(risk => {
    const value = risk.residualRisk;
    if (value > 15) levels['Crítico']++;
    else if (value > 10) levels['Alto']++;
    else if (value > 7) levels['Médio']++;
    else if (value > 3) levels['Baixo']++;
    else levels['Muito Baixo']++;
  });

  return Object.entries(levels)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: RISK_LEVEL_COLORS[name],
    }));
}

// Função para calcular dados do gráfico de prazos de controles pendentes
function calculateControlDeadlineData(controls: Control[]) {
  const pendingControls = controls.filter(c => !c.implemented);

  const statuses = {
    'Em Dia': 0,
    'Vencimento Próximo': 0,
    'Atrasado': 0,
  };

  pendingControls.forEach(control => {
    if (!control.plannedEndDate) {
      statuses['Em Dia']++;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(control.plannedEndDate);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      statuses['Atrasado']++;
    } else if (diffDays <= 30) {
      statuses['Vencimento Próximo']++;
    } else {
      statuses['Em Dia']++;
    }
  });

  return Object.entries(statuses).map(([name, value]) => ({
    name,
    value,
    color: CONTROL_STATUS_COLORS[name],
  }));
}

// Label customizada para os gráficos de pizza
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#9ca3af"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value}`}
    </text>
  );
};

export default function Dashboard({ processes, risks, controls }: DashboardProps) {
    const router = useRouter();

    // Calcular métricas usando lib/domain
    const metrics = calculateDashboardMetrics(processes, risks, controls);
    const { controlStatusData } = metrics;

    // Dados para gráfico de rosca de riscos
    const riskLevelDonutData = calculateRiskLevelData(risks);

    // Dados para gráfico de prazos de controles
    const controlDeadlineData = calculateControlDeadlineData(controls);

    const COLORS = DASHBOARD_CHART_COLORS.PRIMARY;

    // Função para navegar para página de controles
    const handleControlChartClick = () => {
        router.push('/controls');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard de Gestão de Riscos</h1>

            {/* Cards de contagem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <ProcessIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Processos</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{processes?.length ?? 0}</p>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                        <RiskIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Riscos</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{risks?.length ?? 0}</p>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                        <ControlIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Controles</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{controls?.length ?? 0}</p>
                    </div>
                </div>
            </div>

            {/* Matriz de Risco Residual */}
            <ResidualRiskMatrix risks={risks} />

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Rosca - Riscos por Nível */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Riscos por Nível</h3>
                    {riskLevelDonutData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <Pie
                                    data={riskLevelDonutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={renderCustomLabel}
                                    labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                                >
                                    {riskLevelDonutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            Nenhum risco cadastrado
                        </div>
                    )}
                </div>

                {/* Gráfico - Status dos Controles (Implementados vs Pendentes) */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Status dos Controles</h3>
                    {controlStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <Pie
                                    data={controlStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={renderCustomLabel}
                                    labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                                >
                                    {controlStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            Nenhum controle cadastrado
                        </div>
                    )}
                </div>

                {/* Gráfico - Prazos dos Controles Pendentes (Clicável) */}
                <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={handleControlChartClick}
                    title="Clique para ver detalhes dos controles por setor"
                >
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">Prazos dos Controles Pendentes</h3>
                    <p className="text-xs text-indigo-500 mb-2">Clique para ver detalhes →</p>
                    {controlDeadlineData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart margin={{ top: 20, right: 30, bottom: 10, left: 30 }}>
                                <Pie
                                    data={controlDeadlineData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={renderCustomLabel}
                                    labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                                >
                                    {controlDeadlineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[260px] flex items-center justify-center text-gray-400">
                            Nenhum controle pendente
                        </div>
                    )}
                    {/* Legenda */}
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                        {controlDeadlineData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {item.name} ({item.value})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
