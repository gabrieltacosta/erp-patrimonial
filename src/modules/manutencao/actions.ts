"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ManutencaoSchema, ManutencaoFormData } from "./schemas";

export async function registrarManutencao(data: ManutencaoFormData) {
  const result = ManutencaoSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos", details: result.error.flatten };
  }

  const { bemId, tipo, descricao, custo, data: dataManutencao } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cria o registo de manutenção
      await tx.manutencao.create({
        data: {
          bemId,
          tipo,
          descricao,
          custo, // Já em cêntimos
          data: dataManutencao,
          status: "EM_ANDAMENTO",
        },
      });

      // 2. Altera o status do Bem para refletir a indisponibilidade física
      await tx.bem.update({
        where: { id: bemId },
        data: { status: "EM_MANUTENCAO" },
      });

      // Aqui entraria o AuditLog (omitido para brevidade)
    });

    revalidatePath("/manutencoes");
    revalidatePath("/patrimonio");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Erro ao registrar manutenção:", error);
    return { error: "Falha ao processar a manutenção no banco de dados." };
  }

  redirect("/manutencoes");
}

export async function concluirManutencao(manutencaoId: string, bemId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.manutencao.update({
        where: { id: manutencaoId },
        data: { status: "CONCLUIDA" },
      });

      await tx.bem.update({
        where: { id: bemId },
        data: { status: "ATIVO" },
      });
    });

    revalidatePath("/manutencoes");
    revalidatePath("/patrimonio");
    revalidatePath("/dashboard");
  } catch (error) {
    return { error: "Erro ao concluir a manutenção." };
  }
}
