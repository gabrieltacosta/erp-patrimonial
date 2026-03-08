import { z } from "zod";

export const MovimentacaoSchema = z.object({
  bemId: z.string().uuid("Selecione um bem válido."),
  filialDestinoId: z.uuid("Selecione a filial de destino."),
  tipo: z.enum(
    ["TRANSFERENCIA", "MANUTENCAO", "BAIXA", "AJUSTE"],
    "Selecione um tipo de movimentação válido.",
  ),
  observacao: z
    .string()
    .max(255, "A observação não pode exceder 255 caracteres.")
    .optional(),
});

export type MovimentacaoFormData = z.infer<typeof MovimentacaoSchema>;
