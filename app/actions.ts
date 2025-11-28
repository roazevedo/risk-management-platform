"use server";

import { prisma } from "@/app/prisma/prisma";
import { revalidatePath } from "next/cache";
import { Process, Risk, Control } from "@/types";

// --- PROCESSOS ---

// 1. Buscar todos os Processos
export async function getProcesses() {
  try {
    const processes = await prisma.process.findMany({
      orderBy: { createdAt: 'desc' },
      // Opcional: Se quiser saber quantos riscos cada processo tem na listagem
      include: {
        _count: {
          select: { risks: true }
        }
      }
    });
    return processes;
  } catch (error) {
    console.error("Erro ao buscar processos:", error);
    return [];
  }
}

// 2. Salvar Processo (Criar ou Atualizar)
export async function saveProcess(data: Process) {
  try {
    const { id, history, ...rest } = data;

    // Lógica para detectar se é novo (ID vazio ou ID temporário de mock 'p...')
    const isNew = !id || id.startsWith('p');

    if (isNew) {
      await prisma.process.create({
        data: {
          ...rest,
          // Garante que arrays sejam arrays de strings, não undefined
          responsibleServers: rest.responsibleServers || [],
          systemsUsed: rest.systemsUsed || [],
          stakeholders: rest.stakeholders || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    } else {
      await prisma.process.update({
        where: { id },
        data: {
          ...rest,
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    }

    revalidatePath('/processes'); // Atualiza a lista na tela
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar processo:", error);
    return { success: false, error };
  }
}

// 3. Deletar Processo
export async function deleteProcess(id: string) {
  try {
    await prisma.process.delete({ where: { id } });
    revalidatePath('/processes');
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar processo:", error);
    return { success: false, error };
  }
}

// --- RISCOS ---

// 1. Buscar Riscos de um Processo
export async function getRisksByProcessId(processId: string) {
  try {
    const risks = await prisma.risk.findMany({
      where: { processId },
      orderBy: { createdAt: 'desc' },
      include: { controls: true } // Já traz os controles juntos se quiser
    });
    return risks;
  } catch (error) {
    console.error("Erro ao buscar riscos:", error);
    return [];
  }
}

// 2. Criar ou Atualizar Risco
export async function saveRisk(data: Risk) {
  try {
    // Removemos o ID temporário se for criação nova, o Prisma gera o UUID
    const { id, history, ...rest } = data;

    // Pequena limpeza: Se o ID começar com 'r' (do mock r123...), consideramos novo
    const isNew = !id || id.startsWith('r');

    if (isNew) {
      await prisma.risk.create({
        data: {
          ...rest,
          history: history ? JSON.parse(JSON.stringify(history)) : [], // Garante formato JSON
        }
      });
    } else {
      await prisma.risk.update({
        where: { id },
        data: {
          ...rest,
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    }

    // Atualiza a tela automaticamente
    revalidatePath(`/processes/${data.processId}/risks`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar risco:", error);
    return { success: false, error };
  }
}

// 3. Deletar Risco
export async function deleteRisk(riskId: string, processId: string) {
  try {
    await prisma.risk.delete({ where: { id: riskId } });
    revalidatePath(`/processes/${processId}/risks`);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
