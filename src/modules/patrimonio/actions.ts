"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { BemSchema, BemFormInput } from "./schemas";
import { Prisma } from "@/generated/prisma/client"; // Importação correta para o servidor
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { canWrite } from "@/lib/permissions";

export async function criarBem(data: BemFormInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) return { error: "Não autorizado" };

  if (!canWrite(session.user.role)) {
    return { error: "O seu perfil tem permissão apenas para visualização" };
  }
  // 1. Validação com Zod (O transform já converte para centavos aqui)
  const result = BemSchema.safeParse(data);

  if (!result.success) {
    return { error: "Dados inválidos", details: result.error.flatten };
  }

  const {
    nome,
    categoria,
    valorAquisicao, // Já em centavos (Int)
    vidaUtilMeses,
    valorResidual, // Já em centavos (Int)
    filialId,
  } = result.data;

  try {
    const novoBem = await prisma.$transaction(async (tx) => {
      // 2. Lógica de Sequencial Robusta dentro da Transação
      const dataAtual = new Date();
      const anoMes =
        dataAtual.getFullYear() +
        (dataAtual.getMonth() + 1).toString().padStart(2, "0");
      const prefixo = `PAT-${anoMes}-`;

      // Busca o maior número sequencial do mês atual
      const ultimoBem = await tx.bem.findFirst({
        where: { numeroPatrimonio: { startsWith: prefixo } },
        orderBy: { numeroPatrimonio: "desc" },
        select: { numeroPatrimonio: true },
      });

      let proximoNumero = 1;
      if (ultimoBem) {
        const partes = ultimoBem.numeroPatrimonio.split("-");
        const ultimoSequencial = parseInt(partes[partes.length - 1]);
        proximoNumero = ultimoSequencial + 1;
      }

      const numeroPatrimonio = `${prefixo}${proximoNumero.toString().padStart(4, "0")}`;

      // 3. Criação do Bem
      const bem = await tx.bem.create({
        data: {
          numeroPatrimonio,
          nome,
          categoria,
          valorAquisicao,
          dataAquisicao: dataAtual,
          vidaUtilMeses,
          valorResidual,
          estadoConservacao: "NOVO",
          status: "ATIVO",
          filialId,
        },
      });

      // 4. Cálculo da Depreciação Mensal (em centavos)
      // Usamos .toFixed(2) para garantir que dízimas virem Decimais válidos
      const valorDepreciavel = valorAquisicao - valorResidual;
      const taxaMensalCalculada = valorDepreciavel / vidaUtilMeses;

      await tx.depreciacao.create({
        data: {
          bemId: bem.id,
          taxaMensal: new Prisma.Decimal(taxaMensalCalculada.toFixed(2)),
          valorDepreciado: 0,
        },
      });

      return bem;
    });

    revalidatePath("/patrimonio");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Erro ao criar bem:", error);
    // Verifica se o erro ainda é de duplicidade (raro dentro da tx, mas possível)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Conflito de numeração. Tente salvar novamente." };
    }
    return { error: "Falha ao registrar o patrimônio no banco de dados." };
  }

  redirect("/patrimonio");
}
