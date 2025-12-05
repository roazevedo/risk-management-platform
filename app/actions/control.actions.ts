"use server";

/**
 * Server Actions para Controles
 *
 * SEGURANÇA:
 * - Validação server-side com Zod
 * - Cálculo automático de status
 * - Erros sanitizados
 */

import { prisma } from "@/app/prisma/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import { Control } from "@/types";
import { controlSchema } from "@/lib/validation/control.schema";
import { getControlStatus } from "@/lib/domain/control-status";
import { z } from "zod";

// --- FUNÇÕES PURAS DE BUSCA (não exportadas) ---

const fetchControlsByRiskId = async (riskId: string) => {
  try {
    const controls = await prisma.control.findMany({
      where: { riskId },
      orderBy: { createdAt: 'desc' },
    });
    return controls;
  } catch (error) {
    console.error("[SERVER] Erro ao buscar controles:", error);
    return [];
  }
};

// --- GETTERS COM CACHE (exportadas) ---

/**
 * Busca controles de um risco com cache
 * Cache tag: 'controls-for-{riskId}'
 */
export async function getControlsByRiskId(riskId: string) {
  const cachedGetter = unstable_cache(
    fetchControlsByRiskId,
    [`controls-fetch-${riskId}`],
    { tags: [`controls-for-${riskId}`] }
  );
  return cachedGetter(riskId);
}

// --- MUTAÇÕES COM VALIDAÇÃO (exportadas) ---

/**
 * Salva um controle (cria novo ou atualiza existente)
 *
 * SEGURANÇA:
 * - Validação Zod server-side
 * - Cálculo automático de status (não confiar no cliente)
 * - Sanitização de erros
 *
 * @param controlData - Dados do controle
 * @param processId - ID do processo (para revalidação de cache)
 * @returns { success: boolean, error?: string, id?: string }
 */
export async function saveControl(controlData: Control, processId: string) {
  try {
    // 1. Calcular status automaticamente (FONTE ÚNICA DA VERDADE)
    const calculatedStatus = getControlStatus(
      controlData.plannedEndDate,
      controlData.implemented,
      controlData.actualEndDate
    );

    const dataWithStatus = {
      ...controlData,
      status: calculatedStatus, // Substituir pelo calculado
    };

    // 2. Validação Zod (CRÍTICO para segurança)
    const validatedData = controlSchema.parse(dataWithStatus);

    const { id, riskId, history, ...rest } = validatedData;
    const isNew = !id || id.startsWith('c'); // IDs temporários começam com 'c'

    let result;

    if (isNew) {
      // Criar novo controle
      result = await prisma.control.create({
        data: {
          ...rest,
          riskId,
          involvedSectors: rest.involvedSectors || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    } else {
      // Atualizar controle existente
      result = await prisma.control.update({
        where: { id },
        data: {
          ...rest,
          involvedSectors: rest.involvedSectors || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    }

    // 3. Revalidar caches relevantes
    revalidateTag(`controls-for-${riskId}`, '');
    revalidateTag(`risks-for-${processId}`, '');

    return { success: true, id: result.id };
  } catch (error) {
    // 4. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao salvar controle:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `Dados inválidos: ${firstError.message}`
      };
    }

    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return {
          success: false,
          error: 'Risco associado não encontrado'
        };
      }
    }

    return {
      success: false,
      error: 'Erro ao salvar controle. Tente novamente.'
    };
  }
}

/**
 * Deleta um controle
 *
 * SEGURANÇA:
 * - Validação de UUID
 * - Revalidação de múltiplos caches
 *
 * @param controlId - ID do controle
 * @param riskId - ID do risco (para revalidação de cache)
 * @param processId - ID do processo (para revalidação de cache)
 * @returns { success: boolean, error?: string }
 */
export async function deleteControl(
  controlId: string,
  riskId: string,
  processId: string
) {
  try {
    // 1. Validação básica
    if (!controlId || typeof controlId !== 'string' || controlId.length < 32) {
      return {
        success: false,
        error: 'ID de controle inválido'
      };
    }

    // 2. Deletar controle
    await prisma.control.delete({ where: { id: controlId } });

    // 3. Revalidar caches
    revalidateTag(`controls-for-${riskId}`, '');
    revalidateTag(`risks-for-${processId}`, '');

    return { success: true };
  } catch (error) {
    // 4. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao deletar controle:", error);

    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return {
          success: false,
          error: 'Controle não encontrado'
        };
      }
    }

    return {
      success: false,
      error: 'Erro ao deletar controle. Tente novamente.'
    };
  }
}
