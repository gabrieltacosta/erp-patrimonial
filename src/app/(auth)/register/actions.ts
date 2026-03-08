"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SetupTenantParams {
  nomeEmpresa: string;
  cnpj: string;
}

export async function setupEmpresaAction(data: SetupTenantParams) {
  // O TRY COMEÇA AQUI EM CIMA! Blinda a Action inteira contra Crash 500.
  try {
    // 1. Validar a Sessão
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Sessão inválida. Falha na autenticação inicial." };
    }

    const usuarioId = session.user.id;

    // 2. HIGIENIZAÇÃO (Remove tudo que não for número)
    const cnpjLimpo = data.cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      return { error: "CNPJ inválido. Verifique os números digitados." };
    }

    // 3. Verifica se o CNPJ já existe
    const cnpjExistente = await prisma.empresa.findUnique({
      where: { cnpj: cnpjLimpo },
    });

    if (cnpjExistente) {
      return { error: "Este CNPJ já está registrado no nosso sistema." };
    }

    // 4. Transação Atômica (Cria tudo junto)
    await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nome: data.nomeEmpresa,
          cnpj: cnpjLimpo, 
        },
      });

      const matriz = await tx.filial.create({
        data: {
          nome: `Matriz - ${data.nomeEmpresa}`,
          empresaId: empresa.id,
          isMatriz: true,
        },
      });

      // Atualiza o Usuário
      await tx.user.update({
        where: { id: usuarioId },
        data: {
          role: "SUPER_ADMIN",
          filialId: matriz.id,
          empresaId: empresa.id, 
        },
      });
    });

    return { success: true };
    
  } catch (error: any) {
    // 5. O SEGREDO DO DEBUGGING
    // Se der erro, este log vai aparecer no TERMINAL DO VSCODE (fundo preto), não no Chrome!
    console.error(">>> ERRO FATAL NO SETUP DA EMPRESA:", error.message || error);
    
    // Retornamos um JSON com erro, evitando o "Unexpected response"
    return {
      error: "Falha interna no servidor ao criar empresa. Verifique o console.",
    };
  }
}