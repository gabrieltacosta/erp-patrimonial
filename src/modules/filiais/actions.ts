"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { FilialSchema, FilialFormData } from "./schemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function criarFilial(data: FilialFormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) return { error: "Não autorizado" };

  const result = FilialSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos", details: result.error.flatten };
  }

  const { nome } = result.data;

  try {
    await prisma.filial.create({
      data: { nome, empresaId: session?.user.empresaId, isMatriz: false },
    });

    revalidatePath("/filiais");
  } catch (error) {
    console.error("Erro ao criar filial:", error);
    return { error: "Falha ao registrar a filial no banco de dados." };
  }

  redirect("/filiais");
}
