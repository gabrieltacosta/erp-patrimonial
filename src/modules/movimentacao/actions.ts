"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { MovimentacaoSchema, MovimentacaoFormData } from "./schemas";
import { auth } from "@/lib/auth"; // Para produção
import { headers } from "next/headers";

export async function registarMovimentacao(data: MovimentacaoFormData) {
  const result = MovimentacaoSchema.safeParse(data);

  if (!result.success) {
    return { error: "Dados inválidos", details: result.error.flatten };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const usuarioId = session?.user.id as string;

  const { bemId, filialDestinoId, tipo, observacao } = result.data;

  try {
    // 1. Obter o estado atual do bem para saber a origem
    const bemAtual = await prisma.bem.findUnique({
      where: { id: bemId },
      select: { filialId: true, status: true, id: true },
    });

    if (!bemAtual) return { error: "Bem não encontrado." };
    if (bemAtual.filialId === filialDestinoId && tipo === "TRANSFERENCIA") {
      return { error: "O bem já se encontra nesta filial." };
    }

    // 2. Executar a transferência e o registo histórico numa única transação
    await prisma.$transaction(async (tx) => {
      // Cria o registo de movimentação
      const movimentacao = await tx.movimentacao.create({
        data: {
          bemId,
          tipo,
          filialOrigemId: bemAtual.filialId,
          filialDestinoId,
          usuarioId,
          observacao,
        },
      });

      // Atualiza a localização do bem
      await tx.bem.update({
        where: { id: bemId },
        data: {
          filialId: filialDestinoId,
          // Se for baixa ou manutenção, atualizamos o status. Caso contrário, mantém.
          status:
            tipo === "BAIXA"
              ? "BAIXADO"
              : tipo === "MANUTENCAO"
                ? "EM_MANUTENCAO"
                : "ATIVO",
        },
      });

      // Registo de Auditoria (Audit Log)
      await tx.auditLog.create({
        data: {
          usuarioId,
          acao: "Atualização de Transferência",
          entidade: "BEM",
          entidadeId: bemId,
          dadosAntes: { filialId: bemAtual.filialId, status: bemAtual.status },
          dadosDepois: { filialId: filialDestinoId, status: "ATIVO" },
        },
      });

      return movimentacao;
    });

    revalidatePath("/movimentacoes");
    revalidatePath("/patrimonio");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Erro ao movimentar bem:", error);
    return { error: "Falha ao processar a movimentação no banco de dados." };
  }

  redirect("/movimentacoes");
}
