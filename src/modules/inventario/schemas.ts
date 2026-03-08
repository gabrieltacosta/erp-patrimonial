import { z } from "zod";

export const IniciarInventarioSchema = z.object({
  filialId: z.string().min(1, "Selecione a filial para auditoria."),
  responsavelId: z.string().min(1, "Selecione o responsável pelo inventário."),
});

export const AuditarItemSchema = z.object({
  inventarioId: z.uuid(),
  bemId: z.uuid(),
  statusEncontrado: z.enum([
    "ATIVO",
    "EM_MANUTENCAO",
    "BAIXADO",
    "EM_TRANSFERENCIA",
  ]),
  observacao: z.string().max(255).optional(),
});

export type IniciarInventarioData = z.infer<typeof IniciarInventarioSchema>;
export type AuditarItemData = z.infer<typeof AuditarItemSchema>;
