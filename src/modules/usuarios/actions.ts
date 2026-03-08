"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UsuarioFormData } from "./schemas"; // O schema que criamos na etapa anterior

// 1. AÇÃO: Alternar Status (Soft Delete / Reativar)
export async function alternarStatusUsuarioAction(
  usuarioId: string,
  statusAtual: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) return { error: "Não autorizado." };

  const adminLogado = session.user as any;

  // Proteção: O utilizador não pode desativar a si próprio
  if (adminLogado.id === usuarioId) {
    return { error: "Não é possível desativar a sua própria conta." };
  }

  try {
    // Inverte o status atual
    const novoStatus = !statusAtual;

    await prisma.user.update({
      where: { id: usuarioId },
      data: { ativo: novoStatus },
    });

    revalidatePath("/usuarios");
    return { success: true, ativo: novoStatus };
  } catch (error) {
    return { error: "Falha ao alterar o status do utilizador." };
  }
}

// 2. AÇÃO: Criar Utilizador
export async function criarUsuarioAction(data: UsuarioFormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) return { error: "Não autorizado." };

  const adminLogado = session.user as any;

  try {
    const emailExiste = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExiste) return { error: "E-mail já registado no sistema." };

    // A MÁGICA ATUALIZADA:
    // Passamos todos os campos diretamente no body.
    // Usamos "as any" apenas porque o TypeScript do Better Auth espera
    // obrigatoriamente uma string no filialId, mas nós precisamos passar null
    // caso seja um SUPER_ADMIN (para não dar erro de Foreign Key no Prisma).
    const novoAuth = await auth.api.signUpEmail({
      headers: new Headers(),
      body: {
        email: data.email,
        password: data.password,
        name: data.nome,
        role: data.role,
        empresaId: adminLogado.empresaId,
        filialId: data.filialId === "" ? null : data.filialId,
        ativo: true, // Se adicionou o ativo nos additionalFields, pode passar aqui também
      } as any,
    });

    if (!novoAuth || !novoAuth.user) {
      return { error: "Falha ao gerar credenciais de acesso." };
    }

    // REMOVEMOS o prisma.user.update! O Better Auth já fez o INSERT completo.

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao registrar utilizador:", error.message || error);
    return { error: "Falha interna ao registar o utilizador." };
  }
}
