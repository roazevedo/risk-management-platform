"use server";

/**
 * Server Actions para Riscos
 *
 * SEGURANÇA:
 * - Validação server-side com Zod
 * - Cálculos automáticos (inherentRisk, fac, residualRisk)
 * - Erros sanitizados
 */

import { prisma } from "@/app/prisma/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import { Risk } from "@/types";
import { riskSchema } from "@/lib/validation/risk.schema";
import { calculateRiskValues } from "@/lib/hooks/useRiskCalculations";
import { z } from "zod";

// --- FUNÇÕES PURAS DE BUSCA (não exportadas) ---

const fetchRisksByProcessId = async (processId: string) => {
  try {
    const risks = await prisma.risk.findMany({
      where: { processId },
      orderBy: { createdAt: 'desc' },
      include: { controls: true }
    });
    return risks;
  } catch (error) {
    console.error("[SERVER] Erro ao buscar riscos:", error);
    return [];
  }
};

// --- GETTERS COM CACHE (exportadas) ---

/**
 * Busca riscos de um processo com cache
 * Cache tag: 'risks-for-{processId}'
 */
export async function getRisksByProcessId(processId: string) {
  const cachedGetter = unstable_cache(
    fetchRisksByProcessId,
    [`risks-fetch-${processId}`],
    { tags: [`risks-for-${processId}`] }
  );
  return cachedGetter(processId);
}

// --- MUTAÇÕES COM VALIDAÇÃO (exportadas) ---

/**
 * Salva um risco (cria novo ou atualiza existente)
 *
 * SEGURANÇA:
 * - Validação Zod server-side
 * - Recalcula valores automaticamente (inherentRisk, fac, residualRisk)
 * - Sanitização de erros
 *
 * @param data - Dados do risco
 * @returns { success: boolean, error?: string, id?: string }
 */
export async function saveRisk(data: Risk) {
  try {
    // 1. Recalcular valores automaticamente (não confiar no cliente)
    const calculations = calculateRiskValues(data);
    const dataWithCalculations = {
      ...data,
      inherentRisk: calculations.inherentRisk,
      fac: calculations.fac,
      residualRisk: calculations.residualRisk,
      maxImplementationDate: calculations.maxImplementationDate,
      suggestedResponse: calculations.suggestedResponse,
    };

    // 2. Validação Zod (CRÍTICO para segurança)
    const validatedData = riskSchema.parse(dataWithCalculations);

    const { id, processId, history, ...rest } = validatedData;
    const isNew = !id || id.startsWith('r'); // IDs temporários começam com 'r'

    let result;

    if (isNew) {
      // Criar novo risco
      result = await prisma.risk.create({
        data: {
          ...rest,
          processId,
          dimensions: rest.dimensions || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    } else {
      // Atualizar risco existente
      result = await prisma.risk.update({
        where: { id },
        data: {
          ...rest,
          dimensions: rest.dimensions || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    }

    // 3. Revalidar caches relevantes
    revalidateTag(`risks-for-${processId}`, '');
    revalidateTag('process-list', ''); // Atualizar contagem de riscos

    return { success: true, id: result.id };
  } catch (error) {
    // 4. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao salvar risco:", error);

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
          error: 'Processo associado não encontrado'
        };
      }
    }

    return {
      success: false,
      error: 'Erro ao salvar risco. Tente novamente.'
    };
  }
}

/**
 * Deleta um risco
 *
 * SEGURANÇA:
 * - Validação de UUID
 * - Revalidação de múltiplos caches
 * - Cascade delete (controles são deletados automaticamente)
 *
 * @param riskId - ID do risco
 * @param processId - ID do processo (para revalidação de cache)
 * @returns { success: boolean, error?: string }
 */
export async function deleteRisk(riskId: string, processId: string) {
  try {
    // 1. Validação básica
    if (!riskId || typeof riskId !== 'string' || riskId.length < 32) {
      return {
        success: false,
        error: 'ID de risco inválido'
      };
    }

    // 2. Deletar risco (cascade deleta controles)
    await prisma.risk.delete({ where: { id: riskId } });

    // 3. Revalidar caches
    revalidateTag(`risks-for-${processId}`, '');
    revalidateTag('process-list', '');

    return { success: true };
  } catch (error) {
    // 4. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao deletar risco:", error);

    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return {
          success: false,
          error: 'Risco não encontrado'
        };
      }
    }

    return {
      success: false,
      error: 'Erro ao deletar risco. Tente novamente.'
    };
  }
}
