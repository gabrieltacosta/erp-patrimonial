"use server"

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UsuarioFormData } from "./schemas"; // O schema que criamos na etapa anterior

// 1. AÇÃO: Alternar Status (Soft Delete / Reativar)
export async function alternarStatusUsuarioAction(usuarioId: string, statusAtual: boolean) {
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
      data: { ativo: novoStatus }
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
    const emailExiste = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExiste) return { error: "E-mail já registado." };

    // Aqui você integraria com a API de Admin do Better Auth para gerar a senha/hash.
    // Como estamos a gerir o User via Prisma diretamente para o Tenant:
    await prisma.user.create({
      data: {
        name: data.nome,
        email: data.email,
        role: data.role as any,
        filialId: data.filialId,
        empresaId: adminLogado.empresaId,
        ativo: true, // Novo utilizador nasce ativo
      }
    });

    revalidatePath("/usuarios");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao registar utilizador." };
  }
}