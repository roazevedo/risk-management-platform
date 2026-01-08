"use server";

/**
 * Server Actions para Processos
 *
 * SEGURANÇA:
 * - Validação server-side com Zod em TODAS as mutations
 * - Erros são sanitizados (não vazam informações sensíveis ao cliente)
 * - Logs detalhados ficam apenas no servidor
 */

import { prisma } from "@/src/app/prisma/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import { Process } from "@/types";
import { processSchema } from "@/src/lib/validation/process.schema";
import { z } from "zod";

// --- FUNÇÕES PURAS DE BUSCA (não exportadas) ---

const fetchProcesses = async () => {
  try {
    const processes = await prisma.process.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { risks: true }
        }
      }
    });
    return processes;
  } catch (error) {
    console.error("[SERVER] Erro ao buscar processos:", error);
    return [];
  }
};

// --- GETTERS COM CACHE (exportadas) ---

/**
 * Busca todos os processos com cache
 * Cache tag: 'process-list'
 */
export const getProcesses = unstable_cache(
  fetchProcesses,
  ['all-processes-key'],
  { tags: ['process-list'] }
);

// --- MUTAÇÕES COM VALIDAÇÃO (exportadas) ---

/**
 * Salva um processo (cria novo ou atualiza existente)
 *
 * SEGURANÇA:
 * - Validação Zod server-side
 * - Sanitização de erros
 * - Revalidação de cache
 *
 * @param data - Dados do processo
 * @returns { success: boolean, error?: string, id?: string }
 */
export async function saveProcess(data: Process) {
  try {
    // 1. Validação Zod (CRÍTICO para segurança)
    const validatedData = processSchema.parse(data);

    const { id, history, ...rest } = validatedData;
    const isNew = !id || id === '' || id.startsWith('p'); // IDs temporários começam com 'p' ou string vazia

    let result;

    if (isNew) {
      // Criar novo processo
      result = await prisma.process.create({
        data: {
          ...rest,
          responsibleServers: rest.responsibleServers || [],
          systemsUsed: rest.systemsUsed || [],
          stakeholders: rest.stakeholders || [],
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    } else {
      // Atualizar processo existente
      result = await prisma.process.update({
        where: { id },
        data: {
          ...rest,
          history: history ? JSON.parse(JSON.stringify(history)) : [],
        }
      });
    }

    // 2. Revalidar cache
    revalidateTag('process-list', '');

    return { success: true, id: result.id };
  } catch (error) {
    // 3. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao salvar processo:", error);

    // Zod errors são sanitizados
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `Dados inválidos: ${firstError.message}`
      };
    }

    // Prisma errors são sanitizados
    if (error instanceof Error) {
      // NÃO retornar error.message completo (pode vazar info do banco)
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: 'Já existe um processo com este nome'
        };
      }
    }

    // Erro genérico (NUNCA retornar o erro completo!)
    return {
      success: false,
      error: 'Erro ao salvar processo. Tente novamente.'
    };
  }
}

/**
 * Deleta um processo
 *
 * SEGURANÇA:
 * - Validação de UUID
 * - Sanitização de erros
 * - Cascade delete (riscos e controles são deletados automaticamente pelo Prisma)
 *
 * @param id - ID do processo (UUID)
 * @returns { success: boolean, error?: string }
 */
export async function deleteProcess(id: string) {
  try {
    // 1. Validação básica de UUID
    if (!id || typeof id !== 'string' || id.length < 32) {
      return {
        success: false,
        error: 'ID de processo inválido'
      };
    }

    // 2. Deletar processo (cascade deleta riscos e controles)
    await prisma.process.delete({ where: { id } });

    // 3. Revalidar cache
    revalidateTag('process-list', '');

    return { success: true };
  } catch (error) {
    // 4. Tratamento SEGURO de erros
    console.error("[SERVER] Erro ao deletar processo:", error);

    if (error instanceof Error) {
      // Erro de "não encontrado"
      if (error.message.includes('Record to delete does not exist')) {
        return {
          success: false,
          error: 'Processo não encontrado'
        };
      }
    }

    // Erro genérico
    return {
      success: false,
      error: 'Erro ao deletar processo. Tente novamente.'
    };
  }
}
