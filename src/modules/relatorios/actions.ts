"use server";

import prisma from "@/lib/db";
import { formatCentsToBRL } from "@/lib/currency";
import { format } from "date-fns";
// Importe a sua função real de sessão do Better Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function obterRelatorioGeralBens() {
  // 1. Obter a sessão do usuário logado
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Não autorizado");

  // MOCK PARA EXEMPLO (Substitua pela sessão real acima)
  // const session = {
  //   user: { role: "GESTOR_FILIAL", filialId: "id-da-filial-do-usuario" },
  // };

  // 2. Construir o filtro dinâmico de segurança (RBAC)
  let filtroSeguranca = {};

  if (
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "GESTOR_FILIAL" ||
    session.user.role === "USUARIO"
  ) {
    // Isola os dados: o banco só vai retornar bens desta filial específica
    filtroSeguranca = { filialId: session.user.filialId };
  }

  // 3. Buscar no banco de dados aplicando o filtro
  const bens = await prisma.bem.findMany({
    where: filtroSeguranca,
    include: {
      filial: { select: { nome: true } },
    },
    orderBy: { filial: { nome: "asc" } },
  });

  return bens.map((bem) => ({
    "Nº Patrimônio": bem.numeroPatrimonio,
    "Nome/Descrição": bem.nome,
    Categoria: bem.categoria.replace("_", " "),
    "Filial Alocada": bem.filial.nome,
    "Status Físico": bem.status,
    "Estado Conservação": bem.estadoConservacao,
    "Valor Aquisição": formatCentsToBRL(bem.valorAquisicao),
    "Valor Residual": formatCentsToBRL(bem.valorResidual),
    "Data Aquisição": format(new Date(bem.dataAquisicao), "dd/MM/yyyy"),
  }));
}

export async function obterRelatorioManutencoes() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Não autorizado");

  // MOCK PARA EXEMPLO (Substitua pela sessão real acima)
  // const session = {
  //   user: { role: "GESTOR_FILIAL", filialId: "id-da-filial-do-usuario" },
  // };

  // 2. Construir o filtro dinâmico de segurança (RBAC)
  let filtroSeguranca = {};

  if (
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "GESTOR_FILIAL" ||
    session.user.role === "USUARIO"
  ) {
    // Isola os dados: o banco só vai retornar bens desta filial específica
    filtroSeguranca = { filialId: session.user.filialId };
  }

  const manutencoes = await prisma.manutencao.findMany({
    where: filtroSeguranca,
    include: {
      bem: {
        select: {
          numeroPatrimonio: true,
          nome: true,
          filial: { select: { nome: true } },
        },
      },
    },
    orderBy: { data: "desc" },
  });

  return manutencoes.map((manut) => ({
    "Data Serviço": format(new Date(manut.data), "dd/MM/yyyy"),
    "Nº Patrimônio": manut.bem.numeroPatrimonio,
    Ativo: manut.bem.nome,
    Filial: manut.bem.filial.nome,
    Tipo: manut.tipo,
    Descrição: manut.descricao,
    Custo: formatCentsToBRL(manut.custo),
    Status: manut.status,
  }));
}
