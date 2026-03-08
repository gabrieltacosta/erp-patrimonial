"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import {
  IniciarInventarioSchema,
  IniciarInventarioData,
  AuditarItemData,
  AuditarItemSchema,
} from "./schemas";

export async function abrirInventario(data: IniciarInventarioData) {
  const result = IniciarInventarioSchema.safeParse(data);
  if (!result.success) return { error: "Dados inválidos." };

  const { filialId, responsavelId } = result.data;

  try {
    // Verifica se já existe um inventário aberto para esta filial
    const inventarioAberto = await prisma.inventario.findFirst({
      where: { filialId, status: { in: ["ABERTO", "EM_ANDAMENTO"] } },
    });

    if (inventarioAberto) {
      return {
        error: "Já existe um inventário em andamento para esta filial.",
      };
    }

    // Busca todos os bens esperados nesta filial (Snapshot)
    const bensEsperados = await prisma.bem.findMany({
      where: { filialId, status: { not: "BAIXADO" } },
      select: { id: true, status: true },
    });

    const novoInventario = await prisma.$transaction(async (tx) => {
      const inventario = await tx.inventario.create({
        data: {
          filialId,
          responsavelId,
          status: "ABERTO",
        },
      });

      // Preenche os itens do inventário com os bens esperados
      if (bensEsperados.length > 0) {
        await tx.inventarioItem.createMany({
          data: bensEsperados.map((bem) => ({
            inventarioId: inventario.id,
            bemId: bem.id,
            statusEncontrado: bem.status, // Status padrão é o que consta no sistema
            observacao: "Pendente de auditoria física",
          })),
        });
      }

      return inventario;
    });

    revalidatePath("/inventario");
    return { success: true, inventarioId: novoInventario.id };
  } catch (error) {
    console.error("Erro ao abrir inventário:", error);
    return { error: "Falha ao iniciar o processo de inventário." };
  }
}

export async function registrarAuditoriaItem(data: AuditarItemData) {
  const result = AuditarItemSchema.safeParse(data);
  if (!result.success) return { error: "Dados de auditoria inválidos." };

  try {
    await prisma.$transaction(async (tx) => {
      // Atualiza o item no inventário
      await tx.inventarioItem.update({
        where: {
          inventarioId_bemId: {
            inventarioId: result.data.inventarioId,
            bemId: result.data.bemId,
          },
        },
        data: {
          statusEncontrado: result.data.statusEncontrado,
          observacao: result.data.observacao,
          auditadoEm: new Date(),
        },
      });

      // Muda o status do inventário para EM_ANDAMENTO
      await tx.inventario.update({
        where: { id: result.data.inventarioId },
        data: { status: "EM_ANDAMENTO" },
      });
    });

    revalidatePath(`/inventario/${result.data.inventarioId}`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao salvar item auditado." };
  }
}

export async function finalizarInventario(inventarioId: string) {
  try {
    await prisma.inventario.update({
      where: { id: inventarioId },
      data: { status: "CONCLUIDO", dataFim: new Date() },
    });
    revalidatePath("/inventario");
    revalidatePath(`/inventario/${inventarioId}`);
  } catch (error) {
    return { error: "Erro ao finalizar inventário." };
  }
  redirect("/inventario");
}
