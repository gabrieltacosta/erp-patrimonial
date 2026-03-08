"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SetupTenantParams {
  nomeEmpresa: string;
  cnpj: string;
}

export async function setupEmpresaAction(data: SetupTenantParams) {
  // 1. Validar a Sessão
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Sessão inválida. Falha na autenticação inicial." };
  }

  const usuarioId = session.user.id;

  // 2. HIGIENIZAÇÃO (A diferença de um sistema amador para um Enterprise)
  // Remove tudo que não for número (pontos, barras, traços)
  const cnpjLimpo = data.cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return { error: "CNPJ inválido. Verifique os números digitados." };
  }

  try {
    // 3. Verifica se o CNPJ já existe usando o número limpo
    const cnpjExistente = await prisma.empresa.findUnique({
      where: { cnpj: cnpjLimpo },
    });

    if (cnpjExistente) {
      return { error: "Este CNPJ já está registrado no nosso sistema." };
    }

    // 4. Transação Atômica
    await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nome: data.nomeEmpresa,
          cnpj: cnpjLimpo, // Salva limpo no banco!
        },
      });

      const matriz = await tx.filial.create({
        data: {
          nome: `Matriz - ${data.nomeEmpresa}`,
          empresaId: empresa.id,
          isMatriz: true,
        },
      });

      // ATENÇÃO: Dependendo de como você nomeou o Model de usuário no Prisma
      // para o Better Auth, isso pode ser tx.user ou tx.usuario.
      await tx.user.update({
        where: { id: usuarioId },
        data: {
          role: "SUPER_ADMIN",
          filialId: matriz.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Erro no setup do Tenant:", error);

    // Fallback de segurança avançado:
    // Se a criação da empresa falhar, o usuário já foi criado pelo Better Auth no passo anterior.
    // Em um sistema robusto, você poderia deletar o usuário aqui para não deixar "contas zumbis" no banco.
    // await prisma.user.delete({ where: { id: usuarioId } }).catch(() => {});

    return {
      error: "Falha ao criar a estrutura corporativa. Tente novamente.",
    };
  }
}
