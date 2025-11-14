

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Process, Risk, Control } from '../types';
import { getInherentRiskLevel, getResidualRiskLevel } from '../constants';
import { RiskIcon, ProcessIcon, ControlIcon } from './icons';

interface DashboardProps {
    processes: Process[];
    risks: Risk[];
    controls: Control[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-700 text-white rounded-md border border-gray-600">
                <p className="font-bold">{`${label}`}</p>
                <p>{`Total de Riscos: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

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

const getInherentRiskBucketValue = (score: number): number => {
    if (score > 15) return 25;
    if (score > 10) return 15;
    if (score > 7) return 10;
    if (score > 3) return 7;
    return 3;
};


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
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Matriz de Risco Residual por Contagem</h3>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Nível de Risco Inerente vs. Fator de Avaliação de Controles</p>
            <div className="grid grid-cols-[auto_repeat(5,minmax(80px,1fr))] gap-px bg-gray-300 dark:bg-gray-600 border border-gray-300 dark:border-gray-600">
                
                {/* Header Row */}
                <div className="p-1 bg-gray-50 dark:bg-gray-700"></div> {/* Top-left empty cell */}
                {controlFactors.map(factor => (
                    <div key={factor.label} className="p-1 bg-gray-50 dark:bg-gray-700 text-center text-xs font-semibold flex flex-col justify-center min-h-[50px]">
                        <div>{factor.label}</div>
                        <div className="font-normal">{factor.value.toLocaleString('pt-BR')}</div>
                    </div>
                ))}

                {/* Data Rows */}
                {inherentRiskLevels.flatMap(riskLevel => [
                    <div key={`${riskLevel.label}-header`} className="p-1 bg-gray-50 dark:bg-gray-700 text-center text-xs font-semibold flex items-center justify-center">
                        {riskLevel.label} <span className="font-normal ml-1">({riskLevel.value})</span>
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
                                title={`${count} risco(s) nesta categoria. Risco Residual da Célula: ${residualRiskValue.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`}
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


export default function Dashboard({ processes, risks, controls }: DashboardProps) {

    const riskLevelData = risks.reduce((acc, risk) => {
        const { level } = getInherentRiskLevel(risk.inherentRisk);
        const existing = acc.find(item => item.name === level);
        if (existing) {
            existing.riscos++;
        } else {
            acc.push({ name: level, riscos: 1 });
        }
        return acc;
    }, [] as { name: string; riscos: number }[]);

    const controlStatusData = controls.reduce((acc, control) => {
        const status = control.implemented ? 'Implementado' : 'Não Implementado';
        const existing = acc.find(item => item.name === status);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: status, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]);
    
    const COLORS = ['#4ade80', '#facc15']; // Green, Yellow

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dashboard de Gestão de Riscos</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full"><ProcessIcon className="h-8 w-8 text-blue-500" /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Processos</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{processes.length}</p>
                    </div>
                </div>
                 <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full"><RiskIcon className="h-8 w-8 text-red-500" /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Riscos</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{risks.length}</p>
                    </div>
                </div>
                 <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full"><ControlIcon className="h-8 w-8 text-green-500" /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Controles</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{controls.length}</p>
                    </div>
                </div>
            </div>

            <ResidualRiskMatrix risks={risks} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Riscos por Nível</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={riskLevelData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="riscos" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Status dos Controles</h3>
                     <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                             <Pie
                                 data={controlStatusData}
                                 cx="50%"
                                 cy="50%"
                                 labelLine={false}
                                 outerRadius={80}
                                 fill="#8884d8"
                                 dataKey="value"
                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                             >
                                 {controlStatusData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                             </Pie>
                             <Tooltip />
                         </PieChart>
                     </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}