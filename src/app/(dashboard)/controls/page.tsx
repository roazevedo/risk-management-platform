// src/app/(dashboard)/controls/page.tsx

import React from 'react';
import ControlsBySectorPage from './ControlsBySectorPage';
import { prisma } from '@/src/app/prisma/prisma';

export default async function ControlsPage() {
  try {
    // Buscar todos os controles com informações do risco e processo
    const controls = await prisma.control.findMany({
      include: {
        risk: {
          include: {
            process: {
              select: {
                id: true,
                name: true,
                sector: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transformar dados para incluir setor
    const controlsWithSector = controls.map(control => ({
      ...control,
      sector: control.risk?.process?.sector || 'Sem Setor',
      processName: control.risk?.process?.name || 'Sem Processo',
      riskName: control.risk?.name || 'Sem Risco',
    }));

    return (
      <ControlsBySectorPage
        controls={controlsWithSector as any}
      />
    );
  } catch (error) {
    console.error('[CONTROLS PAGE] Erro:', error);
    throw error;
  }
}
