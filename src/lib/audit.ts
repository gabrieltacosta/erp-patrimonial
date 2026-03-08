import prisma from "@/lib/db";

export async function logAudit(
  usuarioId: string,
  acao: string,
  entidade: string,
  entidadeId: string,
  dadosAntes: any,
  dadosDepois: any,
  ip?: string,
) {
  await prisma.auditLog.create({
    data: {
      usuarioId,
      acao,
      entidade,
      entidadeId,
      dadosAntes,
      dadosDepois,
      ip,
    },
  });
}
