"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { FilialSchema, FilialFormData } from "./schemas";
// import { getSession } from "@/lib/auth"; // Em produção: verificar se é SUPER_ADMIN

export async function criarFilial(data: FilialFormData) {
  const result = FilialSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos", details: result.error.flatten };
  }

  const { nome, empresaId, isMatriz } = result.data;

  try {
    // Se a nova filial for marcada como Matriz, garantimos que não haja conflito
    // (Dependendo da regra de negócio, pode haver apenas 1 matriz por empresa)
    if (isMatriz) {
      const matrizExistente = await prisma.filial.findFirst({
        where: { empresaId, isMatriz: true },
      });
      if (matrizExistente) {
        return { error: "Já existe uma Matriz registada para esta empresa." };
      }
    }

    await prisma.filial.create({
      data: { nome, empresaId, isMatriz },
    });

    revalidatePath("/filiais");
  } catch (error) {
    console.error("Erro ao criar filial:", error);
    return { error: "Falha ao registrar a filial no banco de dados." };
  }

  redirect("/filiais");
}
